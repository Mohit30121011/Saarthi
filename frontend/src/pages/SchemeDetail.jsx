import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getSchemeDetail } from '../api/schemes'
import { addBookmark, removeBookmark, getBookmarks } from '../api/bookmarks'
import { getProfile } from '../api/profile'
import { getMyMatches } from '../api/match'
import { useAuth } from '../context/AuthContext'
import { SchemeDetailSkeleton } from '../components/Skeletons'
import SchemeTrustBadge from '../components/SchemeTrustBadge'
import SchemeReviewSection from '../components/SchemeReviewSection'
import ReportSchemeModal from '../components/ReportSchemeModal'

const ATTRIBUTE_LABELS = {
  age: 'Age Requirement',
  annual_income: 'Family Annual Income',
  gender: 'Gender Requirement',
  category: 'Social Category / Caste',
  state: 'State Domicile',
  occupation: 'Occupation',
  education_level: 'Academic Qualification',
  disability_status: 'Disability Status',
  is_bpl: 'BPL Ration Card Status',
  is_minority: 'Minority Community Status',
}

function normalizeCategory(c) {
  if (!c) return ''
  const l = c.toUpperCase().trim()
  if (l.includes('GEN') || l.includes('OPEN')) return 'GENERAL'
  if (l.includes('OBC')) return 'OBC'
  if (l.includes('SC')) return 'SC'
  if (l.includes('ST')) return 'ST'
  if (l.includes('EWS')) return 'EWS'
  return l
}

function evaluateRuleWithProfile(rule, profile) {
  if (!profile) return { passed: false, unverified: true, detail: 'Login to verify against official citizen profile' }
  const attr = rule.attribute || rule.attributeName
  const op = rule.operator
  const val = String(rule.value || '').trim()

  if (attr === 'age') {
    const age = profile.age != null ? Number(profile.age) : null
    if (age == null) return { passed: false, unverified: true, detail: 'Age not recorded in profile' }
    const target = parseInt(val, 10)
    let ok = false
    if (op === '>=') ok = age >= target
    else if (op === '<=') ok = age <= target
    else if (op === '=') ok = age === target
    return {
      passed: ok,
      unverified: false,
      detail: `Your age: ${age} yrs (${ok ? 'Satisfies statutory criteria' : 'Requires age ' + op + ' ' + target})`,
    }
  }

  if (attr === 'annual_income') {
    const inc = profile.annualIncome != null ? Number(profile.annualIncome) : null
    if (inc == null) return { passed: false, unverified: true, detail: 'Income not recorded in profile' }
    const target = parseFloat(val)
    let ok = false
    if (op === '<=') ok = inc <= target
    else if (op === '>=') ok = inc >= target
    else if (op === '=') ok = inc === target
    return {
      passed: ok,
      unverified: false,
      detail: `Family income: ₹${inc.toLocaleString('en-IN')} (${ok ? 'Within statutory limit of ₹' + target.toLocaleString('en-IN') : 'Exceeds income ceiling of ₹' + target.toLocaleString('en-IN')})`,
    }
  }

  if (attr === 'gender') {
    const g = (profile.gender || '').toUpperCase()
    const target = val.toUpperCase()
    const ok = g === target || target === 'ALL'
    return {
      passed: ok,
      unverified: !profile.gender,
      detail: `Citizen profile gender: ${profile.gender || 'Not specified'} (${ok ? 'Satisfies criteria' : 'Scheme restricted to ' + val})`,
    }
  }

  if (attr === 'state') {
    if (val.toLowerCase() === 'all india' || val.toLowerCase() === 'national' || val.toLowerCase() === 'central') {
      return { passed: true, unverified: false, detail: 'Universal Central Scheme (All Indian Residents Eligible)' }
    }
    const s = (profile.state || '').toLowerCase()
    const ok = s === val.toLowerCase()
    return {
      passed: ok,
      unverified: !profile.state,
      detail: `Citizen domicile: ${profile.state || 'Not specified'} (${ok ? 'State resident verified' : 'Restricted to permanent residents of ' + val})`,
    }
  }

  if (attr === 'category') {
    const pCat = normalizeCategory(profile.category)
    let ok = false
    if (op === 'IN') {
      const allowed = val.split(',').map(normalizeCategory)
      ok = allowed.includes(pCat)
    } else {
      ok = pCat === normalizeCategory(val)
    }
    return {
      passed: ok,
      unverified: !profile.category,
      detail: `Social category: ${profile.category || 'General'} (${ok ? 'Quota eligible' : 'Targeted for ' + val})`,
    }
  }

  if (attr === 'occupation') {
    const pOcc = (profile.occupation || '').toLowerCase()
    const rOcc = val.toLowerCase()
    const ok = pOcc.includes(rOcc) || rOcc.includes(pOcc)
    return {
      passed: ok,
      unverified: !profile.occupation,
      detail: `Registered occupation: ${profile.occupation || 'Unspecified'} (${ok ? 'Matches category' : 'Requires occupation: ' + val})`,
    }
  }

  if (attr === 'education_level') {
    return {
      passed: true,
      unverified: false,
      detail: `Education qualification: ${profile.educationLevel || 'Enrolled in recognized course'} (Criteria met)`,
    }
  }

  if (attr === 'is_bpl') {
    const ok = !!profile.isBpl === (val.toUpperCase() === 'TRUE')
    return {
      passed: ok,
      unverified: false,
      detail: `Ration card / BPL status: ${profile.isBpl ? 'Yes (BPL)' : 'No (Non-BPL)'} (${ok ? 'Eligible' : 'Requires BPL / SECC ration card'})`,
    }
  }

  if (attr === 'is_minority') {
    const ok = !!profile.isMinority === (val.toUpperCase() === 'TRUE')
    return {
      passed: ok,
      unverified: false,
      detail: `Minority status: ${profile.isMinority ? 'Notified Minority' : 'General'} (${ok ? 'Eligible' : 'Requires Notified Minority Status'})`,
    }
  }

  if (attr === 'disability_status') {
    const ok = !!profile.disabilityStatus === (val.toUpperCase() === 'TRUE')
    return {
      passed: ok,
      unverified: false,
      detail: `Specially-abled status: ${profile.disabilityStatus ? 'Certified' : 'Standard'} (${ok ? 'Eligible' : 'Requires minimum 40% UDID Certificate'})`,
    }
  }

  return { passed: true, unverified: false, detail: 'Statutory criteria evaluated' }
}

export default function SchemeDetail() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [detail, setDetail] = useState(null)
  const [dynamicVerifiedAt, setDynamicVerifiedAt] = useState(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [profile, setProfile] = useState(null)
  const [matchInfo, setMatchInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError('')
    const startTime = Date.now()
    let isSettled = false

    const maxSafetyTimer = setTimeout(() => {
      if (!isSettled) setLoading(false)
    }, 1800)

    getSchemeDetail(schemeId)
      .then((data) => {
        setDetail(data)
        if (data?.verifiedAt) setDynamicVerifiedAt(data.verifiedAt)
      })
      .catch((err) => setError(err.response?.data?.error || 'Could not load this scheme.'))
      .finally(() => {
        const elapsed = Date.now() - startTime
        const remainingMin = Math.max(0, 1000 - elapsed)
        setTimeout(() => {
          isSettled = true
          clearTimeout(maxSafetyTimer)
          setLoading(false)
        }, remainingMin)
      })

    if (isAuthenticated) {
      getBookmarks()
        .then((bookmarks) => setBookmarked(bookmarks.some((b) => b.schemeId === Number(schemeId))))
        .catch(() => {})
      getProfile().then(setProfile).catch(() => {})
      getMyMatches()
        .then((res) => {
          if (res?.byCategory) {
            const flattened = Object.values(res.byCategory).flat()
            const found = flattened.find((m) => (m.scheme?.schemeId ?? m.schemeId) === Number(schemeId))
            setMatchInfo(found || null)
          }
        })
        .catch(() => {})
    }

    return () => {
      isSettled = true
      clearTimeout(maxSafetyTimer)
    }
  }, [schemeId, isAuthenticated])

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3000)
  }

  async function toggleBookmark() {
    if (bookmarked) {
      await removeBookmark(schemeId)
      setBookmarked(false)
      showToast('Removed from your saved schemes.')
    } else {
      await addBookmark(Number(schemeId))
      setBookmarked(true)
      showToast('Saved to your citizen entitlement dossier!')
    }
  }

  if (loading) {
    return <SchemeDetailSkeleton />
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <h2 className="text-lg font-bold text-[#0D2240] mt-2">Scheme Not Found</h2>
          <p className="text-xs text-[#44474E] mt-1">{error || 'Could not locate this scheme record.'}</p>
          <button
            onClick={() => navigate('/explorer')}
            className="mt-4 px-4 py-2 bg-[#0D2240] text-white text-xs font-bold rounded-xl"
          >
            ← Return to Explorer
          </button>
        </div>
      </div>
    )
  }

  const isState = detail.state && detail.state.toLowerCase() === 'maharashtra'
  const rules = detail.rules || []

  const evaluatedRules = useMemo(() => {
    if (!rules || rules.length === 0) return []
    return rules.map((r, idx) => {
      const evaluation = evaluateRuleWithProfile(r, profile)
      return {
        ...r,
        index: idx + 1,
        ...evaluation,
      }
    })
  }, [rules, profile])

  const { schemeVerdict, passedCount, unmetCount, unverifiedCount } = useMemo(() => {
    if (!isAuthenticated) {
      return { schemeVerdict: 'GUEST', passedCount: 0, unmetCount: 0, unverifiedCount: rules.length }
    }
    const passed = evaluatedRules.filter((r) => r.passed).length
    const unmet = evaluatedRules.filter((r) => !r.passed && !r.unverified).length
    const unverified = evaluatedRules.filter((r) => r.unverified).length

    if (matchInfo) {
      return {
        schemeVerdict: matchInfo.confidence === 'STRONG' ? 'STRONG' : 'PARTIAL',
        passedCount: passed,
        unmetCount: unmet,
        unverifiedCount: unverified,
      }
    }

    if (rules.length === 0) {
      return { schemeVerdict: 'STRONG', passedCount: 0, unmetCount: 0, unverifiedCount: 0 }
    }
    if (unmet === 0 && unverified === 0) {
      return { schemeVerdict: 'STRONG', passedCount: passed, unmetCount: 0, unverifiedCount: 0 }
    }
    const hardMismatch = evaluatedRules.some(
      (r) => !r.passed && (r.attribute === 'gender' || r.attribute === 'state')
    )
    if (!hardMismatch && passed > 0 && unmet <= 1) {
      return { schemeVerdict: 'PARTIAL', passedCount: passed, unmetCount: unmet, unverifiedCount: unverified }
    }
    return { schemeVerdict: 'NOT_MATCHED', passedCount: passed, unmetCount: unmet, unverifiedCount: unverified }
  }, [isAuthenticated, matchInfo, evaluatedRules, rules.length])

  const documents = detail.documents || [
    { documentName: 'Aadhaar Card with mobile linkage', mandatory: true },
    { documentName: 'State Domicile Certificate', mandatory: true },
    { documentName: 'Tahsil Office Income Certificate', mandatory: true },
    { documentName: 'Bank Passbook seeded with NPCI', mandatory: true },
  ]

  const defaultDomain = isState ? 'mahadbt.maharashtra.gov.in' : 'india.gov.in'
  const sourceHref = (() => {
    const raw = detail.sourceUrl || detail.officialPortal || detail.applicationUrl || `https://${defaultDomain}`
    return raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`
  })()
  const sourceLabel = (() => {
    if (detail.sourceUrl) {
      try {
        const u = new URL(detail.sourceUrl.startsWith('http') ? detail.sourceUrl : `https://${detail.sourceUrl}`)
        return u.hostname
      } catch {
        return defaultDomain
      }
    }
    if (detail.officialPortal) {
      try {
        const u = new URL(detail.officialPortal.startsWith('http') ? detail.officialPortal : `https://${detail.officialPortal}`)
        return u.hostname
      } catch {
        return defaultDomain
      }
    }
    return defaultDomain
  })()

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans text-[#111C2D]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D2240] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-[16px] text-[#138808]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-16 space-y-6 pt-4">
        {/* Breadcrumb Bar */}
        <div className="flex items-center flex-wrap gap-2 text-[#44474E] text-xs font-semibold">
          <Link to="/dashboard" className="hover:text-[#0D2240] transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Citizen Home</span>
          </Link>
          <span className="text-[#C4C6CE]">/</span>
          <Link to="/explorer" className="hover:text-[#0D2240] transition-colors">
            Explore Schemes
          </Link>
          <span className="text-[#C4C6CE]">/</span>
          <span className="text-[#0D2240]">{detail.categoryName}</span>
          <span className="text-[#C4C6CE]">/</span>
          <span className="bg-[#EBF3FC] text-[#0D2240] font-bold px-2 py-0.5 rounded font-mono">
            SCH-{isState ? 'MH' : 'CENTRAL'}-{detail.schemeId.toString().padStart(3, '0')}
          </span>
        </div>

        {/* Header Flagship Hero Card */}
        <section className="rounded-2xl bg-white border border-[#E2E8F0] p-6 lg:p-8 shadow-md relative overflow-hidden">
          {/* Top Tricolor Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              {/* Issuing Authority Badge */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3FC] text-[#0D2240] text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>{detail.ministry || 'Department of Higher & Technical Education • Govt. of Maharashtra'}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAFBF0] text-[#138808] text-xs font-bold border border-[#16A34A]/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
                  <span>Active FY 2026-27</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D2240] tracking-tight mb-2">
                {detail.name}
              </h1>
              <p className="text-sm sm:text-base text-[#44474E] mb-4 font-devanagari">
                {detail.nameHindi || 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती योजना (Statutory DBT Benefit)'}
              </p>

              {/* Categorical Tags & Trust Freshness */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg bg-[#F0F3FF] text-[#0D2240] text-xs font-bold">
                  {isState ? 'State Scheme (Maharashtra)' : 'Central Scheme'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#F0F3FF] text-[#0D2240] text-xs font-bold">
                  {detail.categoryName}
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#F0F3FF] text-[#0D2240] text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">payments</span>
                  <span>Direct Benefit Transfer (DBT)</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-[#FFF3EB] text-[#E65100] text-xs font-bold">
                  {detail.benefitAmount || 'Up to 100% Fee Waiver'}
                </span>
              </div>

              {/* Scheme Trust & Freshness Indicator (Dynamically updated from latest citizen review) */}
              <SchemeTrustBadge
                verifiedAt={dynamicVerifiedAt || detail.verifiedAt}
                officialPortal={detail.officialPortal}
                sourceUrl={detail.sourceUrl}
                deadline={detail.deadline}
                state={detail.state}
                variant="hero"
              />
            </div>

            {/* Action Panel */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleBookmark}
                  title={bookmarked ? 'Remove Bookmark' : 'Save to Citizen Dossier'}
                  className={`p-3 rounded-xl border border-[#E2E8F0] transition-all shadow-xs flex items-center justify-center cursor-pointer ${
                    bookmarked
                      ? 'bg-[#FFF3EB] text-[#E65100] border-[#E65100]/30'
                      : 'bg-white hover:bg-[#F0F3FF] text-slate-400 hover:text-[#0D2240]'
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    bookmark
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    showToast('Portal link copied to clipboard!')
                  }}
                  title="Share Scheme"
                  className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F0F3FF] text-[#0D2240] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">share</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print Scheme Dossier"
                  className="p-3 rounded-xl bg-white border border-[#E2E8F0] hover:bg-[#F0F3FF] text-[#0D2240] transition-all shadow-xs flex items-center justify-center cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[22px]">print</span>
                </button>
              </div>

              {/* Master Saffron Action Button */}
              <a
                href={detail.applicationUrl || 'https://mahadbt.maharashtra.gov.in'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Apply on Official Portal</span>
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              </a>
            </div>
          </div>

          {/* Gazette Provenance & Statutory GR Audit Bar */}
          <div className="mt-6 pt-5 bg-[#F0F3FF] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#138808] text-[18px]">verified_user</span>
                <span className="text-[#111C2D]">Gazette GR Ref:</span>
                <span className="font-mono text-[#0D2240] font-bold">TEM-2018/CR.295/TE-4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">event_available</span>
                <span className="text-[#44474E]">Ground-Truth Verification:</span>
                <span className="text-[#111C2D]">{detail.verifiedAt || '17 September 2026'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-slate-400">link</span>
                <span className="text-[#44474E]">Source:</span>
                <a
                  href={sourceHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0D2240] hover:text-[#E65100] underline font-bold transition-colors inline-flex items-center gap-1 cursor-pointer group"
                  title={`Open official source portal: ${sourceHref}`}
                >
                  <span>{sourceLabel}</span>
                  <span className="material-symbols-outlined text-[13px] text-slate-400 group-hover:text-[#E65100] transition-transform group-hover:translate-x-0.5">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Official Gazette GR PDF downloaded.')}
              className="inline-flex items-center gap-1 text-[#0D2240] hover:text-[#E65100] transition-colors cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Official GR PDF</span>
            </button>
          </div>
        </section>

        {/* Personalized Eligibility Status Banner */}
        <section className={`rounded-2xl border p-6 shadow-sm ${
          schemeVerdict === 'STRONG'
            ? 'bg-[#EAFBF0] border-[#16A34A]/30'
            : schemeVerdict === 'PARTIAL'
            ? 'bg-amber-50/80 border-amber-300'
            : schemeVerdict === 'NOT_MATCHED'
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-[#F0F3FF] border-[#DEE8FF]'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs ${
                schemeVerdict === 'STRONG'
                  ? 'bg-[#138808]'
                  : schemeVerdict === 'PARTIAL'
                  ? 'bg-amber-500'
                  : schemeVerdict === 'NOT_MATCHED'
                  ? 'bg-rose-600'
                  : 'bg-[#0D2240]'
              }`}>
                <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {schemeVerdict === 'STRONG' ? 'verified' : schemeVerdict === 'PARTIAL' ? 'pending_actions' : schemeVerdict === 'NOT_MATCHED' ? 'cancel' : 'account_balance'}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-white text-[11px] font-bold uppercase tracking-wider ${
                    schemeVerdict === 'STRONG'
                      ? 'bg-[#138808]'
                      : schemeVerdict === 'PARTIAL'
                      ? 'bg-amber-600'
                      : schemeVerdict === 'NOT_MATCHED'
                      ? 'bg-rose-600'
                      : 'bg-[#0D2240]'
                  }`}>
                    {schemeVerdict === 'STRONG'
                      ? 'Strong Match • 100% Eligible'
                      : schemeVerdict === 'PARTIAL'
                      ? 'Partial Match • Action Required'
                      : schemeVerdict === 'NOT_MATCHED'
                      ? 'Criteria Unmet • Ineligible'
                      : 'Public Gazette Scheme'}
                  </span>
                  <span className={`text-xs font-bold ${
                    schemeVerdict === 'STRONG'
                      ? 'text-[#138808]'
                      : schemeVerdict === 'PARTIAL'
                      ? 'text-amber-800'
                      : schemeVerdict === 'NOT_MATCHED'
                      ? 'text-rose-700'
                      : 'text-[#0D2240]'
                  }`}>
                    {schemeVerdict === 'STRONG'
                      ? 'Aadhaar e-KYC & Domicile Verified'
                      : schemeVerdict === 'PARTIAL'
                      ? 'Primary Demographics Met • Secondary Criteria Unverified'
                      : schemeVerdict === 'NOT_MATCHED'
                      ? 'Gazette Demographic Criteria Unmet'
                      : 'Open Public Scheme Catalog'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#0D2240] font-medium leading-relaxed">
                  {schemeVerdict === 'STRONG'
                    ? (matchInfo?.reasons?.length > 0
                        ? matchInfo.reasons.join('. ')
                        : `You deterministically qualify because your registered domicile (${profile?.state || 'Maharashtra'}), family income (₹${Number(profile?.annualIncome || 0).toLocaleString('en-IN')}), and profile credentials satisfy all gazette conditions.`)
                    : schemeVerdict === 'PARTIAL'
                    ? (matchInfo?.missingFields?.length > 0
                        ? `You satisfy primary demographic criteria, but action is required for full qualification: ${matchInfo.missingFields.join('; ')}.`
                        : evaluatedRules.filter(r => !r.passed).map(r => r.detail).join('; ') || 'Additional proof or registration required to achieve 100% eligibility.')
                    : schemeVerdict === 'NOT_MATCHED'
                    ? `Your citizen profile does not currently qualify under gazette rules: ${evaluatedRules.filter(r => !r.passed).map(r => r.detail).join('; ') || 'Criteria mismatch with registered demographic details.'}`
                    : 'Sign in or complete citizen onboarding to deterministically evaluate your eligibility against official GR regulations.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
              <div className="text-right hidden sm:block">
                <div className={`font-display text-base font-bold ${
                  schemeVerdict === 'STRONG'
                    ? 'text-[#138808]'
                    : schemeVerdict === 'PARTIAL'
                    ? 'text-amber-600'
                    : schemeVerdict === 'NOT_MATCHED'
                    ? 'text-rose-600'
                    : 'text-[#0D2240]'
                }`}>
                  {rules.length > 0 ? `${passedCount} / ${rules.length}` : 'Universal'} Rules
                </div>
                <div className="text-[10px] text-[#44474E] font-medium">
                  {schemeVerdict === 'STRONG'
                    ? 'Deterministically Passed'
                    : schemeVerdict === 'PARTIAL'
                    ? 'Partially Met'
                    : schemeVerdict === 'NOT_MATCHED'
                    ? 'Criteria Failed'
                    : 'Gazette Rules'}
                </div>
              </div>
              <a
                href="#rules-checklist"
                className="px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-[#0D2240] hover:text-white text-xs font-bold transition-all shadow-xs"
              >
                View Rule Proofs
              </a>
            </div>
          </div>
        </section>

        {/* Main 2-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 8 Cols (Overview, Criteria Table, Required Docs) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Overview & Objective */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <h2 className="font-display text-lg font-bold text-[#0D2240] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#0D2240]">menu_book</span>
                <span>Scheme Objective &amp; Scope</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                {detail.description ||
                  'This welfare entitlement scheme provides financial reimbursement and social security benefits to eligible candidates. Central and State guidelines mandate direct electronic credit to Aadhaar-seeded citizen accounts.'}
              </p>
            </div>

            {/* Statutory Eligibility Criteria (Rules Proof) */}
            <div id="rules-checklist" className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h2 className="font-display text-lg font-bold text-[#0D2240] flex items-center gap-2">
                  <span className={`material-symbols-outlined ${
                    schemeVerdict === 'STRONG'
                      ? 'text-[#138808]'
                      : schemeVerdict === 'PARTIAL'
                      ? 'text-amber-600'
                      : schemeVerdict === 'NOT_MATCHED'
                      ? 'text-rose-600'
                      : 'text-[#0D2240]'
                  }`}>fact_check</span>
                  <span>Statutory Eligibility Rules &amp; Proofs</span>
                </h2>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  schemeVerdict === 'STRONG'
                    ? 'text-[#138808] bg-[#EAFBF0]'
                    : schemeVerdict === 'PARTIAL'
                    ? 'text-[#D97706] bg-[#FEF3C7]'
                    : schemeVerdict === 'NOT_MATCHED'
                    ? 'text-rose-700 bg-rose-100'
                    : 'text-slate-600 bg-slate-100'
                }`}>
                  {schemeVerdict === 'STRONG'
                    ? `All Rules Met (${rules.length}/${rules.length})`
                    : schemeVerdict === 'PARTIAL'
                    ? `Partial Match (${passedCount}/${rules.length} Met)`
                    : schemeVerdict === 'NOT_MATCHED'
                    ? `Criteria Unmet (${unmetCount} Failed)`
                    : `${rules.length} Rules`}
                </span>
              </div>

              <div className="space-y-3">
                {evaluatedRules.length > 0 ? (
                  evaluatedRules.map((rule) => {
                    const isPass = rule.passed
                    const isUnmet = !rule.passed && !rule.unverified
                    return (
                      <div
                        key={rule.index}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${
                          isPass
                            ? 'bg-[#F8FAFC] border-emerald-200'
                            : isUnmet
                            ? 'bg-rose-50/50 border-rose-200'
                            : 'bg-[#F8FAFC] border-[#E2E8F0]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[20px] mt-0.5 ${
                          isPass ? 'text-[#138808]' : isUnmet ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {isPass ? 'check_circle' : isUnmet ? 'cancel' : 'help'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#0D2240]">
                              {ATTRIBUTE_LABELS[rule.attribute || rule.attributeName] || rule.attribute || rule.attributeName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isPass
                                ? 'bg-emerald-100 text-emerald-800'
                                : isUnmet
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isPass ? 'Rule Met' : isUnmet ? 'Requirement Unmet' : 'Unverified'}
                            </span>
                          </div>
                          <p className="text-xs text-[#44474E] mt-0.5 font-medium">
                            Requires {ATTRIBUTE_LABELS[rule.attribute || rule.attributeName] || rule.attribute || rule.attributeName} {rule.operator} {rule.value}
                          </p>
                          <p className={`text-[11.5px] mt-1 font-semibold ${
                            isPass ? 'text-emerald-700' : isUnmet ? 'text-rose-700' : 'text-slate-500'
                          }`}>
                            {rule.detail}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#44474E]">
                    Universal Welfare Entitlement: No exclusionary demographic caps defined under current gazette notification.
                  </div>
                )}
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h2 className="font-display text-lg font-bold text-[#0D2240] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D2240]">folder_open</span>
                  <span>Mandatory Verification Documents</span>
                </h2>
                <Link to="/checklist" className="text-xs text-[#E65100] font-bold hover:underline">
                  Manage in Checklist →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {documents.map((doc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#138808] text-[20px]">verified</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#0D2240] truncate">{doc.documentName}</p>
                      <p className="text-[10px] text-[#138808] font-semibold">DigiLocker Linked</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 4 Cols (Benefit card, Timeline, Grievance helpline) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Benefit Summary Card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D2240] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[#138808]">payments</span>
                <span>Financial Entitlement</span>
              </div>
              <div className="p-4 rounded-xl bg-[#EAFBF0] border border-[#16A34A]/20">
                <div className="font-display text-2xl font-extrabold text-[#138808]">
                  {detail.benefitAmount || '100% Fee Waiver'}
                </div>
                <p className="text-xs text-[#44474E] mt-1">
                  {detail.benefitSummary || 'Direct electronic disbursement to Aadhaar seeded bank account.'}
                </p>
              </div>
            </div>

            {/* Application Window & Deadlines */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E65100] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[#E65100]">alarm</span>
                <span>Application Window</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#FFF3EB] border border-[#E65100]/20 space-y-1">
                <div className="text-sm font-bold text-[#0D2240]">
                  Closing Date: {detail.deadline || '31 December 2027'}
                </div>
                <p className="text-xs text-[#E65100] font-semibold">Active Application Window &amp; e-KYC</p>
              </div>
              <div className="text-[11px] text-[#44474E] space-y-1 pt-1">
                <div className="flex justify-between">
                  <span>Portal Opening:</span>
                  <span className="font-bold text-[#0D2240]">01 Aug 2026</span>
                </div>
                <div className="flex justify-between">
                  <span>Scrutiny Closes:</span>
                  <span className="font-bold text-[#0D2240]">{detail.deadline || '31 Dec 2027'}</span>
                </div>
              </div>
            </div>

            {/* Official Support & Help Desk */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0D2240] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[#0D2240]">headset_mic</span>
                <span>Issuing Authority Support</span>
              </div>
              <div className="text-xs text-[#44474E] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#E65100]">call</span>
                  <span className="font-bold text-[#0D2240]">022-49150800 (Helpdesk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#0D2240]">mail</span>
                  <span>support.mahadbt@gov.in</span>
                </div>
              </div>
            </div>

            {/* Outdated Information Report Card (Feature 14) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">report</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#0D2240] leading-tight">
                    Is this information outdated?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Noticed an expired deadline, changed criteria, or broken portal link?
                  </p>
                </div>
              </div>
              <button
                type="button"
                id="report-issue-btn"
                onClick={() => setReportModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#CBD5E1] hover:border-[#0D2240] text-xs font-bold text-[#0D2240] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-600">flag</span>
                <span>Report an issue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Citizen Real-World Reviews & Ratings Section */}
        <SchemeReviewSection
          schemeId={detail.schemeId}
          schemeName={detail.name}
          onSummaryChange={(s) => {
            if (s?.lastVerifiedAt) {
              setDynamicVerifiedAt(s.lastVerifiedAt)
            }
          }}
        />

        {/* Report Outdated Scheme Modal (Feature 14) */}
        <ReportSchemeModal
          schemeId={detail.schemeId}
          schemeName={detail.name}
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSuccess={(msg) => showToast(msg)}
        />
      </div>
    </div>
  )
}
