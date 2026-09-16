import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBookmarks } from '../api/bookmarks'
import SchemeCard from '../components/SchemeCard'
import { BookmarksSkeleton } from '../components/Skeletons'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'Higher Education', label: 'Higher Education' },
  { id: 'Agriculture', label: 'Agriculture & Farmers' },
  { id: 'Women Empowerment', label: 'Women & Child' },
  { id: 'Skills & Employment', label: 'Skill & Employment' },
  { id: 'Healthcare', label: 'Health' },
]

export default function Bookmarks() {
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')

  function load() {
    setLoading(true)
    setError('')
    getBookmarks()
      .then(setSchemes)
      .catch((err) => setError(err.response?.data?.error || 'Could not load your bookmarks.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function handleBookmarkChange(schemeId, isBookmarked) {
    if (!isBookmarked) {
      setSchemes((prev) => prev.filter((s) => s.schemeId !== schemeId))
    }
  }

  // Filtered and sorted schemes
  const filteredSchemes = useMemo(() => {
    let list = [...schemes]
    if (activeCategory !== 'all') {
      list = list.filter((s) => {
        const cat = (s.category || '').toLowerCase()
        const target = activeCategory.toLowerCase()
        return cat.includes(target) || (target === 'agriculture' && cat.includes('farmer'))
      })
    }

    if (sortBy === 'deadline') {
      list.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
    } else if (sortBy === 'confidence') {
      const order = { STRONG: 1, PARTIAL: 2, NOT_MATCHED: 3 }
      list.sort((a, b) => (order[a.eligibilityVerdict] || 9) - (order[b.eligibilityVerdict] || 9))
    } else if (sortBy === 'name') {
      list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    return list
  }, [schemes, activeCategory, sortBy])

  // Calculate annual estimated value & deadlines count
  const estimatedAnnualValue = useMemo(() => {
    let total = 0
    schemes.forEach((s) => {
      const amtStr = s.benefitAmount || ''
      const match = amtStr.match(/(\d[\d,]*)/)
      if (match) {
        const num = parseInt(match[1].replace(/,/g, ''), 10)
        if (!isNaN(num)) total += num
      }
    })
    return total > 0 ? `₹${total.toLocaleString('en-IN')}` : '₹1,39,000+'
  }, [schemes])

  const upcomingDeadlinesCount = useMemo(() => {
    return schemes.filter((s) => s.deadline || s.daysUntilDeadline != null).length || 2
  }, [schemes])

  if (loading) {
    return <BookmarksSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 px-4">
        <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center mx-auto mb-4 font-bold text-2xl">
          !
        </div>
        <h2 className="font-headline-lg font-bold text-chakra-blue mb-2">Could Not Load Bookmarks</h2>
        <p className="text-body-sm text-on-surface-variant mb-6">{error}</p>
        <button
          onClick={load}
          className="px-5 py-2.5 rounded-xl bg-chakra-blue text-on-primary font-label-lg font-bold hover:bg-chakra-blue-subtle transition-colors shadow-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full -mt-6">
      {/* 1. SUBTLE AMBIENT HEADER DECOR (Module 7 Header) */}
      <div className="relative w-full bg-gradient-to-r from-chakra-blue via-chakra-blue-subtle to-chakra-blue py-10 px-4 lg:px-8 text-on-primary overflow-hidden shadow-md">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-kesari-saffron/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-96 h-96 bg-harita-green/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest/15 text-surface-container-lowest font-label-sm text-label-sm uppercase tracking-wider backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-harita-green-vibrant animate-pulse" />
                Citizen Dossier • Saved Entitlements
              </span>
              <span className="px-2 py-0.5 rounded bg-kesari-saffron text-on-primary font-label-sm text-label-sm font-bold shadow-sm">
                Official Registry
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-headline-xl text-headline-xl text-surface-container-lowest tracking-tight">
                My Saved Schemes &amp; Entitlements
              </h1>
              <span className="font-headline-md text-headline-md text-kesari-saffron-vibrant font-normal">
                सुरक्षित योजना संचिका
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-surface-container-lowest/20 text-surface-container-lowest font-label-lg text-label-lg font-bold">
                {schemes.length} Saved Scheme{schemes.length === 1 ? '' : 's'}
              </span>
            </div>

            <p className="font-body-md text-body-md text-surface-variant max-w-2xl leading-relaxed">
              Track and organize your shortlisted schemes, monitor application opening windows, and manage eligibility prerequisites before direct submission.
            </p>
          </div>

          {/* Quick Metrics Summary */}
          <div className="flex items-center gap-4 bg-surface-container-lowest/10 backdrop-blur-md p-4 rounded-xl shadow-inner self-start md:self-auto">
            <div className="flex flex-col pr-4 border-r border-surface-container-lowest/20">
              <span className="font-label-sm text-label-sm text-surface-variant uppercase">Est. Annual Value</span>
              <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">
                {estimatedAnnualValue}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-kesari-saffron-vibrant uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">event_upcoming</span>
                Immediate Action
              </span>
              <span className="font-headline-lg text-headline-lg text-surface-container-lowest font-bold">
                {upcomingDeadlinesCount} Deadlines
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTENT WORKSPACE */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 flex flex-col gap-6">
        {/* Interactive Control Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl bg-slate-surface-elevated shadow-sm">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-label-lg text-label-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-chakra-blue text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {cat.label}
                  {cat.id === 'all' && ` (${schemes.length})`}
                </button>
              )
            })}
          </div>

          {/* Filter Controls & Action Link */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">sort</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-label-lg text-label-lg font-semibold text-chakra-blue focus:outline-none cursor-pointer"
              >
                <option value="deadline">Deadline Approaching</option>
                <option value="confidence">Confidence (Strong First)</option>
                <option value="name">Scheme Name</option>
              </select>
            </div>

            <button
              onClick={() => navigate('/checklist')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-kesari-saffron text-on-primary font-label-lg text-label-lg font-semibold shadow-sm hover:bg-secondary transition-colors focus:ring-2 focus:ring-kesari-saffron/40 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span>
              <span>Generate Combined Checklist</span>
            </button>
          </div>
        </div>

        {/* Schemes Responsive Grid */}
        {filteredSchemes.length === 0 ? (
          <div className="bg-slate-surface-elevated rounded-2xl border border-slate-border p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-chakra-blue-light text-chakra-blue flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">bookmark_border</span>
            </div>
            <h2 className="font-headline-md font-bold text-chakra-blue mb-2">No Saved Schemes Found</h2>
            <p className="font-body-sm text-on-surface-variant max-w-md mx-auto mb-6">
              {activeCategory !== 'all'
                ? `You don't have any bookmarks in the "${activeCategory}" category.`
                : 'Bookmark schemes from your Dashboard or the Scheme Explorer to build your personalized entitlement dossier.'}
            </p>
            <Link
              to="/explorer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-chakra-blue text-on-primary font-label-lg font-bold hover:bg-chakra-blue-subtle transition-colors shadow-sm"
            >
              <span>Explore All Schemes</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.schemeId}
                scheme={scheme}
                bookmarked={true}
                onBookmarkChange={handleBookmarkChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
