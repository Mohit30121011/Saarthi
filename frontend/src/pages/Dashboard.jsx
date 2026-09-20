import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { getMyMatches, refreshMatches } from '../api/match'
import { getProfile } from '../api/profile'
import { getBookmarks } from '../api/bookmarks'
import { getChecklist } from '../api/checklist'
import { searchSchemes } from '../api/schemes'
import { getRatingSummaries } from '../api/reviews'
import SchemeCard from '../components/SchemeCard'
import WhatIfSimulator from '../components/WhatIfSimulator'
import { DashboardSkeleton, SchemeCardSkeleton } from '../components/Skeletons'
import { exportSummaryPdf, generateSummaryDossierHtml } from '../utils/exportSummaryPdf'
import TrendingSeasonalBanner from '../components/TrendingSeasonalBanner'

const CATEGORIES = [
  { id: 'all', label: 'All Schemes', icon: 'tune' },
  { id: 'agriculture', label: 'Agriculture & Farmers', icon: 'agriculture' },
  { id: 'education', label: 'Higher Education & Scholarships', icon: 'school' },
  { id: 'healthcare', label: 'Healthcare & Ayushman', icon: 'local_hospital' },
  { id: 'housing', label: 'Housing & Urban', icon: 'home' },
  { id: 'skills', label: 'Skill & Entrepreneurship', icon: 'engineering' },
]

function formatCurrentDateTime() {
  const now = new Date()
  const options = { hour: '2-digit', minute: '2-digit', hour12: true }
  return now.toLocaleTimeString('en-IN', options)
}

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [checklist, setChecklist] = useState({})
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [dashboardMode, setDashboardMode] = useState('dossier') // 'dossier' | 'whatif'
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [totalCatalogCount, setTotalCatalogCount] = useState(52)
  const [catalogSchemes, setCatalogSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState('Just now')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [showDossierModal, setShowDossierModal] = useState(false)
  const [ratingSummaries, setRatingSummaries] = useState({})

  async function loadDashboardData() {
    setLoading(true)
    const startTime = Date.now()
    let isSettled = false

    // Safety timeout: Guarantee skeleton drops after at most 1.8 seconds (under 2s cap)
    const maxSafetyTimer = setTimeout(() => {
      if (!isSettled) {
        setLoading(false)
      }
    }, 1800)

    try {
      const [matchesRes, profileRes, bookmarksRes, checklistRes, catalogRes, reviewsRes] = await Promise.allSettled([
        getMyMatches(),
        getProfile(),
        getBookmarks(),
        getChecklist(),
        searchSchemes(),
        getRatingSummaries(),
      ])

      if (matchesRes.status === 'fulfilled') {
        setData(matchesRes.value)
      }
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value)
      }
      if (bookmarksRes.status === 'fulfilled') {
        const bMarks = bookmarksRes.value || []
        setBookmarks(bMarks)
        setBookmarkedIds(new Set(bMarks.map((b) => b.schemeId)))
      }
      if (checklistRes.status === 'fulfilled') {
        setChecklist(checklistRes.value || {})
      }
      if (catalogRes.status === 'fulfilled' && Array.isArray(catalogRes.value)) {
        setCatalogSchemes(catalogRes.value)
        setTotalCatalogCount(catalogRes.value.length)
      }
      if (reviewsRes.status === 'fulfilled' && reviewsRes.value) {
        setRatingSummaries(reviewsRes.value)
      }
      setLastUpdated(`${formatCurrentDateTime()} IST`)
    } catch {
      // keep fallback
    } finally {
      // Ensure skeleton shows for 1-2 seconds (at least 1.0s, at most 1.8s)
      const elapsed = Date.now() - startTime
      const remainingMin = Math.max(0, 1000 - elapsed)
      setTimeout(() => {
        isSettled = true
        clearTimeout(maxSafetyTimer)
        setLoading(false)
      }, remainingMin)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Automatic background synchronization when citizen switches back to this tab
    function handleWindowFocus() {
      refreshMatches()
        .then((updatedMatches) => {
          if (updatedMatches) {
            setData(updatedMatches)
            setLastUpdated(`${formatCurrentDateTime()} IST`)
          }
        })
        .catch(() => {})
    }

    window.addEventListener('focus', handleWindowFocus)
    return () => window.removeEventListener('focus', handleWindowFocus)
  }, [])

  // Parse matches from backend response (either grouped byCategory or flat array)
  const allMatches = useMemo(() => {
    if (!data) return []
    if (data.byCategory && typeof data.byCategory === 'object') {
      return Object.values(data.byCategory).flat()
    }
    if (Array.isArray(data)) return data
    if (Array.isArray(data.matches)) return data.matches
    const strong = (data.strongMatches || []).map((m) => ({ ...m, confidence: 'STRONG' }))
    const partial = (data.partialMatches || []).map((m) => ({ ...m, confidence: 'PARTIAL' }))
    return [...strong, ...partial]
  }, [data])

  const strongMatches = useMemo(
    () => allMatches.filter((m) => m.confidence === 'STRONG'),
    [allMatches]
  )
  const partialMatches = useMemo(
    () => allMatches.filter((m) => m.confidence === 'PARTIAL'),
    [allMatches]
  )

  // Real Counts
  const totalSchemesCount = allMatches.length
  const strongCount = strongMatches.length
  const partialCount = partialMatches.length

  // Dynamically calculate estimated annual financial value from matched schemes
  const { annualValueFormatted, annualValueDescription } = useMemo(() => {
    let totalRupees = 0
    let quantifiedCount = 0

    allMatches.forEach((m) => {
      const text = `${m.scheme?.benefitAmount || ''} ${m.scheme?.benefitSummary || ''}`
      const numMatches = text.match(/(?:₹|Rs\.?\s*)(\d[\d,]*)/g)
      if (numMatches) {
        numMatches.forEach((str) => {
          const num = parseInt(str.replace(/[^\d]/g, ''), 10)
          if (!isNaN(num) && num >= 500 && num <= 10000000) {
            totalRupees += num
            quantifiedCount++
          }
        })
      }
    })

    if (totalRupees > 0) {
      return {
        annualValueFormatted: `₹${totalRupees.toLocaleString('en-IN')}`,
        annualValueDescription: `Direct cash transfer & subsidies across ${quantifiedCount} qualified schemes`,
      }
    }
    return {
      annualValueFormatted: 'Direct Aid',
      annualValueDescription: `Direct subsidies & welfare benefits across all qualified schemes`,
    }
  }, [allMatches])

  // Dynamically calculate expiring schemes
  const { expiringCount, expiringSummary } = useMemo(() => {
    const dated = allMatches.filter((m) => m.scheme?.deadline)
    if (dated.length > 0) {
      return {
        expiringCount: dated.length,
        expiringSummary: dated.slice(0, 3).map((m) => m.scheme?.name).join(', '),
      }
    }
    return {
      expiringCount: 0,
      expiringSummary: 'All eligible schemes have ongoing open enrolment',
    }
  }, [allMatches])

  // Profile fidelity calculation
  const profileFidelity = useMemo(() => {
    if (!profile) return 85
    let filled = 0
    const keys = ['fullName', 'dob', 'gender', 'state', 'category', 'annualIncome', 'occupation', 'educationLevel']
    keys.forEach((k) => {
      if (profile[k]) filled++
    })
    return Math.max(50, Math.round((filled / keys.length) * 100))
  }, [profile])

  // Real missing fields from partial matches
  const missingFieldsList = useMemo(() => {
    const fieldSet = new Set()
    partialMatches.forEach((m) => {
      if (Array.isArray(m.missingFields)) {
        m.missingFields.forEach((f) => {
          if (f) fieldSet.add(f.trim())
        })
      }
    })
    return Array.from(fieldSet)
  }, [partialMatches])

  // Filter schemes by category
  const filteredSchemes = useMemo(() => {
    if (selectedCategory === 'all') return allMatches
    return allMatches.filter((item) => {
      const cat = (item.scheme?.categoryName || '').toLowerCase()
      const name = (item.scheme?.name || '').toLowerCase()
      if (selectedCategory === 'agriculture') return cat.includes('agri') || name.includes('kisan') || name.includes('krishi')
      if (selectedCategory === 'education') return cat.includes('edu') || name.includes('scholarship') || name.includes('shikshan')
      if (selectedCategory === 'healthcare') return cat.includes('health') || name.includes('ayushman') || name.includes('arogya')
      if (selectedCategory === 'housing') return cat.includes('housing') || name.includes('awas') || name.includes('ghar')
      if (selectedCategory === 'skills') return cat.includes('skill') || cat.includes('employ') || name.includes('startup')
      return true
    })
  }, [allMatches, selectedCategory])

  // Pagination for official dossier: 2 rows of 3 columns = 6 schemes per page
  const DOSSIER_PER_PAGE = 6
  const [dossierPage, setDossierPage] = useState(1)

  useEffect(() => {
    setDossierPage(1)
  }, [selectedCategory, dashboardMode])

  const totalDossierPages = Math.ceil(filteredSchemes.length / DOSSIER_PER_PAGE) || 1
  const paginatedDossierSchemes = useMemo(() => {
    const start = (dossierPage - 1) * DOSSIER_PER_PAGE
    return filteredSchemes.slice(start, start + DOSSIER_PER_PAGE)
  }, [filteredSchemes, dossierPage])

  const displayName = user?.fullName || profile?.fullName || 'Mohit Gupta'
  const citizenState = profile?.state || user?.state || 'Maharashtra'

  const dossierPayload = useMemo(() => ({
    user,
    profile,
    allMatches,
    strongMatches,
    partialMatches,
    annualValueFormatted,
    annualValueDescription,
    expiringCount,
    expiringSummary,
    profileFidelity,
    missingFieldsList,
    citizenState,
    totalCatalogCount,
    lastUpdated,
    checklist,
  }), [
    user,
    profile,
    allMatches,
    strongMatches,
    partialMatches,
    annualValueFormatted,
    annualValueDescription,
    expiringCount,
    expiringSummary,
    profileFidelity,
    missingFieldsList,
    citizenState,
    totalCatalogCount,
    lastUpdated,
    checklist,
  ])

  function handleExportPdf() {
    setExportingPdf(true)
    try {
      exportSummaryPdf(dossierPayload)
    } catch (err) {
      console.error('Failed to export summary PDF:', err)
    } finally {
      setTimeout(() => setExportingPdf(false), 1200)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans text-[#111C2D]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pt-6 pb-36 space-y-6">
        
        {/* Breadcrumb & Context Bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 text-[#44474E] text-[11px] sm:text-xs font-semibold">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <Link to="/dashboard" className="hover:text-[#0D2240] transition-colors flex items-center gap-1 font-bold text-[#0D2240] shrink-0">
              <span className="material-symbols-outlined text-[16px]">account_balance</span>
              <span>{t('citizen_home', 'Citizen Home')}</span>
            </Link>
            <span className="hidden sm:inline text-[#C4C6CE]">/</span>
            <span className="hidden sm:inline text-[#111C2D] truncate">{t('eligibility_engine', 'Eligibility Matching Engine')}</span>
            <span className="hidden sm:inline text-[#C4C6CE]">/</span>
            <span className="hidden sm:inline text-[#44474E] truncate">{t('verified_entitlements', 'Verified Entitlements')}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs text-[10.5px] sm:text-[11px] font-bold text-[#0D2240] shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-[#138808] shrink-0" />
            <span className="whitespace-nowrap">{t('state_maharashtra', `State: ${citizenState}`)}</span>
          </div>
        </div>

        {/* Top Citizen Hero Banner & Metrics */}
        <section className="relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-md p-6 lg:p-8">
          {/* Decorative Tiranga Micro-Accent Strip */}
          <div className="absolute top-0 left-0 right-0 h-1.5 grid grid-cols-3">
            <div className="bg-[#E65100] h-full" />
            <div className="bg-white h-full" />
            <div className="bg-[#138808] h-full" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[#E2E8F0]">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-1 rounded bg-[#FFF3EB] text-[#E65100] text-[11px] font-bold tracking-wide uppercase">
                  {t('official_dossier', 'Official Entitlement Dossier')}
                </span>
                <span className="inline-flex items-center gap-1 text-[#138808] text-[11px] bg-[#EAFBF0] px-2.5 py-1 rounded font-bold border border-[#16A34A]/20">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>{t('aadhaar_linked', 'Aadhaar & Ration Card Linked')}</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D2240] tracking-tight">
                {t('namaste', 'Namaste')}, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-[#44474E] max-w-2xl leading-relaxed">
                {t('dashboard_subtitle', `Evaluated your verified demographic credentials against ${totalCatalogCount} Central and ${citizenState} gazetted welfare schemes.`)}
              </p>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAFBF0] border border-[#16A34A]/20 text-[#138808] text-xs font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
                <span>{t('auto_sync', 'Auto-Sync Active')}</span>
              </div>

              <div className="inline-flex items-center rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-[#0D2240] font-bold text-xs sm:text-sm hover:bg-[#F0F3FF] transition-colors cursor-pointer disabled:opacity-60"
                  title="Generate publication-grade Citizen Entitlement Dossier PDF"
                >
                  <span className={`material-symbols-outlined text-[18px] text-[#E65100] ${exportingPdf ? 'animate-spin' : ''}`}>
                    {exportingPdf ? 'sync' : 'picture_as_pdf'}
                  </span>
                  <span>{exportingPdf ? 'Generating PDF Dossier...' : t('export_pdf', 'Export Summary PDF')}</span>
                </button>
                <div className="w-[1px] h-6 bg-[#E2E8F0]" />
                <button
                  type="button"
                  onClick={() => setShowDossierModal(true)}
                  className="px-2.5 py-2.5 text-[#44474E] hover:text-[#0D2240] hover:bg-[#F0F3FF] transition-colors cursor-pointer"
                  title="Preview Full A4 Citizen Dossier on Screen"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>
          </div>

          {/* Verification Timestamp Readout */}
          <div className="pt-3 pb-6 flex flex-wrap items-center justify-between text-[#44474E] text-xs">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0D2240]">history</span>
              <span>{t('last_verification', 'Last Verification')}: <strong className="text-[#111C2D]">{lastUpdated}</strong></span>
            </span>
          </div>

          {/* Metric Stat Tiles Bento (4 Tiles with Big High-Contrast Numbers & Subtle Hover Animations) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Tile 1: Schemes Matched */}
            <div className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
              
              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    {t('eligible_entitlements', 'Eligible Entitlements')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0D2240] border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#0D2240] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-[22px]">fact_check</span>
                </div>
              </div>

              <div className="my-3.5 relative z-10">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-[#0D2240] tracking-tight group-hover:text-blue-950 transition-colors">
                    {totalSchemesCount}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    {t('schemes', 'Schemes')}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap relative z-10">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{strongCount} {t('strong_match', 'Strong')}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/70 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>{partialCount} {t('partial_match', 'Partial')}</span>
                </span>
              </div>
            </div>

            {/* Tile 2: Total Value */}
            <div className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {t('est_annual_value', 'Est. Annual Value')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-[22px]">currency_rupee</span>
                </div>
              </div>

              <div className="my-3.5 relative z-10">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl sm:text-4xl lg:text-[38px] font-black text-emerald-700 tracking-tight leading-none truncate group-hover:text-emerald-800 transition-colors">
                    {annualValueFormatted}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 relative z-10">
                <p className="text-[11.5px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {annualValueDescription}
                </p>
              </div>
            </div>

            {/* Tile 3: Upcoming Deadlines */}
            <div className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-orange-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E65100]" />
                    {t('expiring_applications', 'Expiring Applications')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#E65100] border border-orange-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#E65100] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-[22px]">alarm</span>
                </div>
              </div>

              <div className="my-3.5 relative z-10">
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-4xl sm:text-5xl font-black text-[#E65100] tracking-tight group-hover:text-orange-700 transition-colors">
                    {expiringCount}
                  </span>
                  <span className="inline-flex items-center text-[10.5px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-50 text-[#E65100] border border-orange-200/70">
                    {expiringCount > 0 ? t('deadline_listed', 'Deadlines Listed') : 'Open Enrolment'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 relative z-10">
                <p className="text-[11.5px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
                  {expiringSummary}
                </p>
              </div>
            </div>

            {/* Tile 4: Profile Fidelity */}
            <div className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

              <div className="flex items-start justify-between gap-3 relative z-10">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    {t('profile_fidelity', 'Profile Fidelity')}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-indigo-700 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <span className="material-symbols-outlined text-[22px]">speed</span>
                </div>
              </div>

              <div className="my-3.5 relative z-10 space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-4xl sm:text-5xl font-black text-[#0D2240] tracking-tight group-hover:text-indigo-950 transition-colors">
                    {profileFidelity}%
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {profileFidelity >= 100 ? 'Optimal' : `${100 - profileFidelity}% needed`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60 p-[1px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0D2240] via-indigo-600 to-emerald-500 transition-all duration-700"
                    style={{ width: `${profileFidelity}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 relative z-10">
                {missingFieldsList.length > 0 ? (
                  <p className="text-[11.5px] text-[#E65100] font-bold leading-relaxed line-clamp-2">
                    +{missingFieldsList.length} field{missingFieldsList.length === 1 ? '' : 's'} needed: {missingFieldsList.slice(0, 2).join(' & ')} unlocks {partialMatches.length} more schemes.
                  </p>
                ) : (
                  <p className="text-[11.5px] text-emerald-700 font-bold leading-relaxed flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    100% Profile Complete • All Entitlements Unlocked
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Profile Completeness Diagnostic Bar */}
        {partialMatches.length > 0 && (
          <div className="p-4 rounded-xl bg-[#FFF3EB] border border-[#E65100]/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E65100] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[22px]">lock_open</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#0D2240]">
                  Unlock {partialMatches.length} Additional High-Value Scheme{partialMatches.length === 1 ? '' : 's'}
                </div>
                <div className="text-xs text-[#44474E] mt-0.5">
                  {missingFieldsList.length > 0 ? (
                    <>
                      Verify <strong>{missingFieldsList.slice(0, 2).join(' & ')}</strong> in your citizen profile to complete 100% eligibility evaluation.
                    </>
                  ) : (
                    <>Update your citizen profile to qualify for additional Central and State welfare initiatives.</>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/profile"
              className="shrink-0 px-4 py-2 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white text-xs font-bold shadow-xs transition-all text-center"
            >
              Complete Profile Now →
            </Link>
          </div>
        )}

        {/* Featured Trending & Seasonal Showcase Carousel Banner */}
        <TrendingSeasonalBanner
          catalogSchemes={catalogSchemes.length > 0 ? catalogSchemes : allMatches.map((m) => m.scheme || m)}
          onSelectQuickFilter={(mode) => navigate(`/explorer?curation=${mode}`)}
        />

        {/* View Mode Switcher: Official Dossier vs What-If Simulator */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setDashboardMode('dossier')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                dashboardMode === 'dossier'
                  ? 'bg-[#0D2240] text-white shadow-sm'
                  : 'text-[#44474E] hover:bg-[#F0F3FF]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Official Matched Dossier ({totalSchemesCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardMode('whatif')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                dashboardMode === 'whatif'
                  ? 'bg-[#E65100] text-white shadow-sm'
                  : 'text-[#0D2240] hover:bg-[#FFF3EB] border border-[#E65100]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>"What-If" Entitlement Horizon (क्या अगर...?)</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                dashboardMode === 'whatif' ? 'bg-white/20 text-white' : 'bg-[#E65100] text-white'
              }`}>
                Try ₹5L Horizon
              </span>
            </button>
          </div>

          <div className="text-xs text-[#44474E] pr-2 hidden md:block">
            {dashboardMode === 'dossier' ? (
              <span>Grounded in your official verified profile</span>
            ) : (
              <span className="text-[#E65100] font-semibold">Simulating alternative scenarios without changing profile</span>
            )}
          </div>
        </div>

        {dashboardMode === 'whatif' ? (
          <WhatIfSimulator
            profile={profile}
            bookmarkedIds={bookmarkedIds}
            onBookmarkChange={(id, saved) => {
              setBookmarkedIds((prev) => {
                const next = new Set(prev)
                if (saved) next.add(id)
                else next.delete(id)
                return next
              })
            }}
          />
        ) : (
          <>
            {/* What-If Teaser Banner */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-r from-[#FFF8F1] via-[#FFF3E8] to-[#FFFBF5] border border-[#FED7AA] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Tricolor Micro-Accent on Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E65100] via-[#FDBA74] to-[#138808]" />

              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#E65100] to-[#FF7722] text-white flex items-center justify-center shrink-0 shadow-sm ring-4 ring-[#E65100]/10">
                  <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-[#0D2240]">
                      Curious what unlocks with a different income?
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E65100] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                      "What-If" Horizon
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                    What if your family income was ₹5,00,000 or ₹2,50,000 instead? Test alternative ceilings and discover newly unlocked central &amp; state schemes in real time.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDashboardMode('whatif')}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-[#E65100] hover:bg-[#D84315] text-white text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto group"
              >
                <span>Explore What-If Horizon</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
              </button>
            </div>

            {/* Category Filter Bar */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#0D2240] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D2240]">tune</span>
                  <span>Filter by Benefit Domain</span>
                </h2>
                <span className="text-xs text-[#44474E]">Sorted by: Highest Match Confidence &amp; Urgency</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
                        isActive
                          ? 'bg-[#0D2240] text-white shadow-sm'
                          : 'bg-white text-[#44474E] border border-[#E2E8F0] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Scheme Discovery Grid */}
            <div id="dossier-schemes-list" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-[#E2E8F0]">
                <div className="text-xs text-[#44474E]">
                  Showing <strong className="text-[#0D2240]">
                    {filteredSchemes.length > 0 ? (dossierPage - 1) * DOSSIER_PER_PAGE + 1 : 0}–{Math.min(dossierPage * DOSSIER_PER_PAGE, filteredSchemes.length)}
                  </strong> of{' '}
                  <strong className="text-[#0D2240]">{filteredSchemes.length}</strong> matched schemes (2 rows per page)
                </div>
                {totalDossierPages > 1 && (
                  <div className="text-xs text-[#44474E]">
                    Page <strong className="text-[#0D2240]">{dossierPage}</strong> of{' '}
                    <strong className="text-[#0D2240]">{totalDossierPages}</strong>
                  </div>
                )}
              </div>

              {filteredSchemes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
                  <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                  <h3 className="font-display font-bold text-lg text-[#0D2240]">No schemes found in this domain</h3>
                  <p className="text-xs text-[#44474E]">Try selecting another filter or view all schemes in the catalog.</p>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-2 px-4 py-2 bg-[#0D2240] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedDossierSchemes.map((item, idx) => {
                      const schemeObj = item?.scheme || item
                      if (!schemeObj) return null
                      const sId = schemeObj.schemeId ?? idx
                      return (
                        <SchemeCard
                          key={sId}
                          scheme={schemeObj}
                          confidence={item?.confidence || 'STRONG'}
                          missingFields={item?.missingFields}
                          reasons={item?.reasons}
                          profile={profile}
                          bookmarked={bookmarkedIds.has(sId)}
                          onBookmarkChange={(id, saved) => {
                            setBookmarkedIds((prev) => {
                              const next = new Set(prev)
                              if (saved) next.add(id)
                              else next.delete(id)
                              return next
                            })
                          }}
                          ratingSummary={ratingSummaries?.[sId]}
                        />
                      )
                    })}
                  </div>

                  {/* Dossier Pagination Controls */}
                  {totalDossierPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
                      <div className="text-xs text-[#44474E]">
                        Showing page <strong className="text-[#0D2240]">{dossierPage}</strong> of{' '}
                        <strong className="text-[#0D2240]">{totalDossierPages}</strong> (up to 2 rows of 3 schemes)
                      </div>

                      <div className="flex items-center gap-1.5 sm:mr-52 md:mr-64">
                        <button
                          type="button"
                          disabled={dossierPage === 1}
                          onClick={() => {
                            setDossierPage((p) => Math.max(1, p - 1))
                            document.getElementById('dossier-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            dossierPage === 1
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                              : 'bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-[#F0F3FF] shadow-xs'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                          <span>Previous</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalDossierPages }, (_, i) => i + 1).map((pageNum) => (
                            <button
                              key={pageNum}
                              type="button"
                              onClick={() => {
                                setDossierPage(pageNum)
                                document.getElementById('dossier-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                              }}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                                dossierPage === pageNum
                                  ? 'bg-[#0D2240] text-white shadow-xs scale-105'
                                  : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          disabled={dossierPage === totalDossierPages}
                          onClick={() => {
                            setDossierPage((p) => Math.min(totalDossierPages, p + 1))
                            document.getElementById('dossier-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            dossierPage === totalDossierPages
                              ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                              : 'bg-[#E65100] hover:bg-[#D84315] text-white font-bold shadow-xs'
                          }`}
                        >
                          <span>Next</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Citizen Welfare Entitlement Dossier Preview Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0D2240] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[20px] text-[#FF9933]">verified</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-[#0D2240]">
                    Official Citizen Entitlement Dossier (राजपत्र संचिका प्रारूप)
                  </h3>
                  <p className="text-[11px] text-[#44474E]">
                    Publication-grade summary formatted for official A4 print &amp; PDF submission
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D2240] text-white text-xs font-bold shadow-xs hover:bg-[#1A365D] transition-colors cursor-pointer disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#FF9933]">picture_as_pdf</span>
                  <span>{exportingPdf ? 'Exporting...' : 'Print / Save as PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDossierModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#44474E] hover:bg-[#E2E8F0] hover:text-[#0D2240] transition-colors cursor-pointer"
                  title="Close Preview"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body / Sandbox Preview */}
            <div className="flex-1 overflow-auto bg-[#E2E8F0] p-4 sm:p-6 flex justify-center">
              <div className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden min-h-[650px]">
                <iframe
                  title="Official Citizen Entitlement Summary Dossier Preview"
                  srcDoc={generateSummaryDossierHtml(dossierPayload)}
                  className="w-full h-[72vh] border-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
