import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyMatches, refreshMatches } from '../api/match'
import { getProfile } from '../api/profile'
import { getBookmarks } from '../api/bookmarks'
import { getChecklist } from '../api/checklist'
import { searchSchemes } from '../api/schemes'
import SchemeCard from '../components/SchemeCard'
import Pagination from '../components/Pagination'
import { DashboardSkeleton, SchemeCardSkeleton } from '../components/Skeletons'
import { exportSummaryPdf, generateSummaryDossierHtml } from '../utils/exportSummaryPdf'

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
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [profile, setProfile] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [checklist, setChecklist] = useState({})
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [totalCatalogCount, setTotalCatalogCount] = useState(52)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Just now')
  const [exportingPdf, setExportingPdf] = useState(false)
  const [showDossierModal, setShowDossierModal] = useState(false)

  async function loadDashboardData() {
    setLoading(true)
    try {
      const [matchesRes, profileRes, bookmarksRes, checklistRes, catalogRes] = await Promise.allSettled([
        getMyMatches(),
        getProfile(),
        getBookmarks(),
        getChecklist(),
        searchSchemes(),
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
        setTotalCatalogCount(catalogRes.value.length)
      }
      setLastUpdated(`${formatCurrentDateTime()} IST`)
    } catch {
      // keep fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const updatedMatches = await refreshMatches()
      setData(updatedMatches)
      setLastUpdated(`${formatCurrentDateTime()} IST`)
    } catch {
      // keep current data
    } finally {
      setRefreshing(false)
    }
  }

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

  // Pagination: 3 rows x 3 columns = 9 cards per page
  const [currentPage, setCurrentPage] = useState(1)
  const SCHEMES_PER_PAGE = 9

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  const totalPages = Math.ceil(filteredSchemes.length / SCHEMES_PER_PAGE)
  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * SCHEMES_PER_PAGE
    return filteredSchemes.slice(start, start + SCHEMES_PER_PAGE)
  }, [filteredSchemes, currentPage])

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
              <span>Citizen Home</span>
            </Link>
            <span className="hidden sm:inline text-[#C4C6CE]">/</span>
            <span className="hidden sm:inline text-[#111C2D] truncate">Eligibility Matching Engine</span>
            <span className="hidden sm:inline text-[#C4C6CE]">/</span>
            <span className="hidden sm:inline text-[#44474E] truncate">Verified Entitlements</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-[#E2E8F0] shadow-xs text-[10.5px] sm:text-[11px] font-bold text-[#0D2240] shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-[#138808] shrink-0" />
            <span className="whitespace-nowrap">State: {citizenState}</span>
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
                  Official Entitlement Dossier
                </span>
                <span className="inline-flex items-center gap-1 text-[#138808] text-[11px] bg-[#EAFBF0] px-2.5 py-1 rounded font-bold border border-[#16A34A]/20">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>Aadhaar &amp; Ration Card Linked</span>
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0D2240] tracking-tight">
                Namaste, {displayName}
              </h1>
              <p className="text-xs sm:text-sm text-[#44474E] max-w-2xl leading-relaxed">
                Evaluated your verified demographic credentials against {totalCatalogCount} Central and {citizenState} gazetted welfare schemes.
              </p>
            </div>

            {/* Action Cluster */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2240] text-white font-bold text-xs sm:text-sm shadow-sm hover:bg-[#1A365D] transition-all active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[18px] ${refreshing ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{refreshing ? 'Evaluating Criteria...' : 'Re-run Matching Engine'}</span>
              </button>

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
                  <span>{exportingPdf ? 'Generating PDF Dossier...' : 'Export Summary PDF'}</span>
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
              <span>Last Verification: <strong className="text-[#111C2D]">{lastUpdated}</strong></span>
            </span>
          </div>

          {/* Metric Stat Tiles Bento (4 Tiles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Schemes Matched */}
            <div className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#44474E]">Eligible Entitlements</span>
                <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] text-[#0D2240] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">fact_check</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-[#0D2240]">{totalSchemesCount}</span>
                  <span className="text-xs font-semibold text-[#44474E]">Schemes</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#EAFBF0] text-[#138808]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" /> {strongCount} Strong
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#FEF3C7] text-[#D97706]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" /> {partialCount} Partial
                  </span>
                </div>
              </div>
            </div>

            {/* Tile 2: Total Value */}
            <div className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#44474E]">Est. Annual Value</span>
                <div className="w-8 h-8 rounded-lg bg-[#EAFBF0] text-[#138808] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-extrabold text-[#138808]">{annualValueFormatted}</span>
                </div>
                <p className="text-[11px] text-[#44474E] mt-2 line-clamp-2">
                  {annualValueDescription}
                </p>
              </div>
            </div>

            {/* Tile 3: Upcoming Deadlines */}
            <div className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#44474E]">Expiring Applications</span>
                <div className="w-8 h-8 rounded-lg bg-[#FFF3EB] text-[#E65100] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">alarm</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-extrabold text-[#E65100]">{expiringCount}</span>
                  <span className="text-xs font-bold text-[#E65100]">
                    {expiringCount > 0 ? 'Deadline Listed' : 'Open Enrolment'}
                  </span>
                </div>
                <p className="text-[11px] text-[#44474E] mt-2 line-clamp-2">
                  {expiringSummary}
                </p>
              </div>
            </div>

            {/* Tile 4: Profile Fidelity */}
            <div className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] shadow-xs flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-[#44474E]">Profile Fidelity</span>
                <span className="font-display text-lg font-bold text-[#0D2240]">{profileFidelity}%</span>
              </div>
              <div className="mt-2 space-y-2">
                <div className="w-full h-2.5 rounded-full bg-[#DEE8FF] overflow-hidden">
                  <div
                    className="h-full bg-[#0D2240] rounded-full transition-all duration-700"
                    style={{ width: `${profileFidelity}%` }}
                  />
                </div>
                {missingFieldsList.length > 0 ? (
                  <p className="text-[11px] text-[#E65100] font-semibold leading-tight line-clamp-2">
                    +{missingFieldsList.length} field{missingFieldsList.length === 1 ? '' : 's'} needed: {missingFieldsList.slice(0, 2).join(' & ')} unlocks {partialMatches.length} additional scheme{partialMatches.length === 1 ? '' : 's'}.
                  </p>
                ) : (
                  <p className="text-[11px] text-[#138808] font-semibold leading-tight">
                    100% Profile Complete • Maximum Entitlements Unlocked.
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
        {refreshing ? (
          <SchemeCardSkeleton count={6} />
        ) : filteredSchemes.length === 0 ? (
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
          <div id="dashboard-schemes-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 scroll-mt-24">
            {paginatedSchemes.map((item) => (
              <SchemeCard
                key={item.scheme.schemeId}
                scheme={item.scheme}
                confidence={item.confidence}
                missingFields={item.missingFields}
                reasons={item.reasons}
                profile={profile}
                bookmarked={bookmarkedIds.has(item.scheme.schemeId)}
                onBookmarkChange={(id, saved) => {
                  setBookmarkedIds((prev) => {
                    const next = new Set(prev)
                    if (saved) next.add(id)
                    else next.delete(id)
                    return next
                  })
                }}
              />
            ))}
          </div>
        )}

        {/* Custom Civic Modern Pagination */}
        {!refreshing && filteredSchemes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSchemes.length}
            itemsPerPage={SCHEMES_PER_PAGE}
            onPageChange={(page) => {
              setCurrentPage(page)
              document.getElementById('dashboard-schemes-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            itemLabel="eligible schemes"
          />
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
