import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchSchemes } from '../api/schemes'
import { getMyMatches } from '../api/match'
import { getBookmarks } from '../api/bookmarks'
import { getProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import SchemeCard from '../components/SchemeCard'
import SchemeCompareModal from '../components/SchemeCompareModal'
import Pagination from '../components/Pagination'
import { SchemeCardSkeleton } from '../components/Skeletons'
import TrendingSeasonalBanner from '../components/TrendingSeasonalBanner'
import CustomDropdown from '../components/CustomDropdown'
import { isSchemeTrending, isSchemeSeasonal } from '../data/curatedSchemes'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Agriculture', label: 'Agriculture & Farmers' },
  { value: 'Education', label: 'Education & Scholarships' },
  { value: 'Healthcare', label: 'Healthcare & Ayushman' },
  { value: 'Housing', label: 'Housing & Urban' },
  { value: 'Financial Aid', label: 'Financial Aid & Credit' },
  { value: 'Employment', label: 'Skill & Employment' },
]

const MINISTRY_OPTIONS = [
  { value: 'all', label: 'All Issuing Ministries / Depts' },
  { value: 'Agriculture', label: 'Ministry of Agriculture' },
  { value: 'Higher', label: 'Higher & Technical Education (MH)' },
  { value: 'Health', label: 'Ministry of Health & Family Welfare' },
  { value: 'Housing', label: 'Ministry of Housing & Urban Affairs' },
  { value: 'Skill', label: 'Ministry of Skill Development' },
]

const SORT_OPTIONS = [
  { value: 'verified', label: 'Sort by: Latest Verified' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'benefit', label: 'Max Financial Benefit' },
]

const ITEMS_PER_PAGE = 6 // Strict 2-row layout (2 rows of 3 schemes on desktop)

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function SchemeExplorer() {
  const { isAuthenticated } = useAuth()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [level, setLevel] = useState('all') // 'all', 'central', 'state'
  const [category, setCategory] = useState('all')
  const [ministry, setMinistry] = useState('all')
  const [sortBy, setSortBy] = useState('verified')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const initialCuration = searchParams.get('curation') || (searchParams.get('trending') === 'true' ? 'trending' : 'all')
  const [curationFilter, setCurationFilter] = useState(initialCuration)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [profile, setProfile] = useState(null)
  const [catalogSchemes, setCatalogSchemes] = useState([])
  const [matchedItems, setMatchedItems] = useState([])
  const [compareSchemeA, setCompareSchemeA] = useState(null)
  const [compareSchemeB, setCompareSchemeB] = useState(null)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  function handleToggleCompare(scheme) {
    if (!compareSchemeA) {
      setCompareSchemeA(scheme)
      setIsCompareModalOpen(true)
    } else if (compareSchemeA.schemeId === scheme.schemeId) {
      if (compareSchemeB) {
        setCompareSchemeA(compareSchemeB)
        setCompareSchemeB(null)
      } else {
        setCompareSchemeA(null)
      }
    } else if (!compareSchemeB) {
      setCompareSchemeB(scheme)
      setIsCompareModalOpen(true)
    } else if (compareSchemeB.schemeId === scheme.schemeId) {
      setCompareSchemeB(null)
    } else {
      setCompareSchemeB(scheme)
      setIsCompareModalOpen(true)
    }
  }

  function handleClearCompare() {
    setCompareSchemeA(null)
    setCompareSchemeB(null)
    setIsCompareModalOpen(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      getBookmarks().then((data) => setBookmarkedIds(new Set(data.map((b) => b.schemeId)))).catch(() => {})
      getProfile().then(setProfile).catch(() => {})
      getMyMatches().then((res) => {
        if (res?.byCategory) {
          const flattened = Object.values(res.byCategory).flat()
          setMatchedItems(flattened)
        }
      }).catch(() => {})
    }
  }, [isAuthenticated])

  useEffect(() => {
    const handle = setTimeout(loadSchemes, 250)
    return () => clearTimeout(handle)
  }, [query, category, level, ministry, sortBy])

  async function loadSchemes() {
    setLoading(true)
    try {
      const stateParam = level === 'state' ? 'Maharashtra' : undefined
      const categoryParam = category === 'all' ? undefined : category
      const results = await searchSchemes({
        q: query || undefined,
        category: categoryParam,
        state: stateParam,
      })
      setCatalogSchemes(results || [])
    } catch {
      setCatalogSchemes([])
    } finally {
      setLoading(false)
    }
  }

  // Filter schemes locally for instant ministry, sort & curation responsiveness
  const displayedSchemes = useMemo(() => {
    let list = [...catalogSchemes]

    if (curationFilter === 'trending') {
      list = list.filter((s) => isSchemeTrending(s))
    } else if (curationFilter === 'seasonal') {
      list = list.filter((s) => isSchemeSeasonal(s))
    }

    if (level === 'central') {
      list = list.filter((s) => !s.state)
    } else if (level === 'state') {
      list = list.filter((s) => s.state && s.state.toLowerCase() === 'maharashtra')
    }

    if (ministry !== 'all') {
      list = list.filter((s) => (s.ministry || '').toLowerCase().includes(ministry.toLowerCase()))
    }

    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }

    return list
  }, [catalogSchemes, curationFilter, level, ministry, sortBy])

  function clearFilters() {
    setQuery('')
    setLevel('all')
    setCategory('all')
    setMinistry('all')
    setSortBy('verified')
    setCurationFilter('all')
    setCurrentPage(1)
  }

  // Reset to page 1 whenever filters or query change
  useEffect(() => {
    setCurrentPage(1)
  }, [query, category, level, ministry, sortBy, curationFilter])

  const totalPages = Math.ceil(displayedSchemes.length / ITEMS_PER_PAGE) || 1

  // Clamp current page if scheme count shrinks
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  const paginatedSchemes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return displayedSchemes.slice(start, start + ITEMS_PER_PAGE)
  }, [displayedSchemes, currentPage])

  const pageNumbers = useMemo(() => {
    return getPageNumbers(currentPage, totalPages)
  }, [currentPage, totalPages])

  const centralCount = useMemo(() => catalogSchemes.filter((s) => !s.state).length, [catalogSchemes])
  const stateCount = useMemo(() => catalogSchemes.filter((s) => s.state).length, [catalogSchemes])

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans text-[#111C2D]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 space-y-8 pt-6 pb-36">
        
        {/* Top Stats & Search Bar Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0D2240] via-[#1A365D] to-[#0D2240] p-6 md:p-10 shadow-xl text-white">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#E65100]/15 blur-3xl pointer-events-none" />
          <div className="absolute right-36 -bottom-16 w-64 h-64 rounded-full bg-[#138808]/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                <span>Official Citizen Gateway • Verified Welfare Repository</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                All Central &amp; Maharashtra State Schemes
              </h1>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                Browsing <strong className="text-white">{catalogSchemes.length || 52} Official Government Welfare Schemes</strong>. Every eligibility requirement is cross-referenced with official central gazettes and Maharashtra Government Resolutions (GRs).
              </p>
            </div>

            {/* Live Metrics Pill Group */}
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl backdrop-blur-md shrink-0 self-start md:self-auto border border-white/10">
              <div className="px-3 py-1.5 rounded-lg bg-[#E65100]/25 text-center">
                <span className="block font-display text-lg font-bold text-[#FFF3EB]">{centralCount}</span>
                <span className="block text-[10px] text-white/80 uppercase font-bold tracking-wider">Central</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-[#138808]/25 text-center">
                <span className="block font-display text-lg font-bold text-[#EAFBF0]">{stateCount}</span>
                <span className="block text-[10px] text-white/80 uppercase font-bold tracking-wider">State (MH)</span>
              </div>
            </div>
          </div>

          {/* Search Input & Quick Controls */}
          <div className="relative z-10 space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-1.5 rounded-xl shadow-lg border border-[#E2E8F0]">
              <div className="flex items-center flex-1 px-3 gap-2">
                <span className="material-symbols-outlined text-[#0D2240] text-[22px]">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by scheme name, keywords (e.g. scholarship, solar pump, housing, startup)..."
                  className="w-full bg-transparent border-none text-[#0D2240] text-sm placeholder-slate-400 focus:outline-none py-2 font-medium"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-slate-400 hover:text-[#0D2240] p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={loadSchemes}
                className="px-6 py-2.5 bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Search Schemes</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Filter Select Bars (Level, Category, Ministry, Sort) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
              {/* Level Tabs */}
              <div className="bg-white rounded-lg p-1 flex items-center border border-[#E2E8F0] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setLevel('all')}
                  className={`flex-1 py-2 text-center rounded-md font-bold transition-colors cursor-pointer ${
                    level === 'all' ? 'bg-[#0D2240] text-white' : 'text-[#44474E] hover:text-[#0D2240]'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setLevel('central')}
                  className={`flex-1 py-2 text-center rounded-md font-bold transition-colors cursor-pointer ${
                    level === 'central' ? 'bg-[#0D2240] text-white' : 'text-[#44474E] hover:text-[#0D2240]'
                  }`}
                >
                  Central
                </button>
                <button
                  type="button"
                  onClick={() => setLevel('state')}
                  className={`flex-1 py-2 text-center rounded-md font-bold transition-colors cursor-pointer ${
                    level === 'state' ? 'bg-[#0D2240] text-white' : 'text-[#44474E] hover:text-[#0D2240]'
                  }`}
                >
                  Maharashtra
                </button>
              </div>

              {/* Category Dropdown */}
              <CustomDropdown
                value={category}
                onChange={setCategory}
                options={CATEGORY_OPTIONS}
                icon="category"
                variant="compact"
              />

              {/* Ministry Dropdown */}
              <CustomDropdown
                value={ministry}
                onChange={setMinistry}
                options={MINISTRY_OPTIONS}
                icon="account_balance"
                variant="compact"
              />

              {/* Sort Dropdown */}
              <CustomDropdown
                value={sortBy}
                onChange={setSortBy}
                options={SORT_OPTIONS}
                icon="swap_vert"
                variant="compact"
              />
            </div>
          </div>
        </div>

        {/* Featured Trending & Seasonal Showcase Carousel Banner */}
        <TrendingSeasonalBanner
          catalogSchemes={catalogSchemes}
          onSelectQuickFilter={(mode) => {
            setCurationFilter(mode)
            setCategory('all')
            const anchor = document.getElementById('schemes-section') || document.getElementById('explorer-results-anchor')
            if (anchor) anchor.scrollIntoView({ behavior: 'smooth' })
          }}
        />

        {/* Quick Discovery Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
          <button
            type="button"
            onClick={() => setCurationFilter('all')}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              curationFilter === 'all' && category === 'all'
                ? 'bg-[#0D2240] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:border-[#0D2240] hover:text-[#0D2240]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">apps</span>
            <span>All Schemes ({catalogSchemes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('trending')
              setCategory('all')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              curationFilter === 'trending'
                ? 'bg-gradient-to-r from-[#E65100] to-[#FF7722] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#E65100] hover:border-[#E65100] hover:bg-orange-50/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Trending Schemes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('seasonal')
              setCategory('all')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              curationFilter === 'seasonal'
                ? 'bg-gradient-to-r from-[#138808] to-[#16A34A] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#138808] hover:border-[#138808] hover:bg-emerald-50/50'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">event_available</span>
            <span>Seasonal &amp; Time-Sensitive</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('all')
              setCategory('Agriculture')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              category === 'Agriculture'
                ? 'bg-[#0D2240] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:border-[#0D2240]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">agriculture</span>
            <span>Agriculture &amp; Farmers</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('all')
              setCategory('Education')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              category === 'Education'
                ? 'bg-[#0D2240] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:border-[#0D2240]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">school</span>
            <span>Education &amp; Scholarships</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('all')
              setCategory('Healthcare')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              category === 'Healthcare'
                ? 'bg-[#0D2240] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:border-[#0D2240]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">local_hospital</span>
            <span>Healthcare</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurationFilter('all')
              setCategory('Employment')
            }}
            className={`px-3.5 py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              category === 'Employment'
                ? 'bg-[#0D2240] text-white shadow-md'
                : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:border-[#0D2240]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">work</span>
            <span>MSME &amp; Employment</span>
          </button>
        </div>

        {/* Active Filter Chips, Direct Search & View Mode Toggle */}
        <div id="schemes-section" className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white px-4 py-3 rounded-xl border border-[#E2E8F0] shadow-xs scroll-mt-24">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#44474E] font-bold mr-1">
              Active Filters:
            </span>
            {curationFilter === 'trending' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>Trending Schemes Only</span>
                <button onClick={() => setCurationFilter('all')} className="hover:text-orange-950 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}
            {curationFilter === 'seasonal' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">event_available</span>
                <span>Seasonal Windows Only</span>
                <button onClick={() => setCurationFilter('all')} className="hover:text-emerald-950 cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EBF3FC] text-[#0D2240] text-xs font-bold">
              <span>Level: {level === 'all' ? 'All (Central & State)' : level === 'central' ? 'Central' : 'Maharashtra'}</span>
              {level !== 'all' && (
                <button onClick={() => setLevel('all')} className="hover:text-[#E65100] cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              )}
            </span>
            {category !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFF3EB] text-[#E65100] text-xs font-bold">
                <span>Category: {category}</span>
                <button onClick={() => setCategory('all')} className="hover:text-[#FF7722] cursor-pointer">
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAFBF0] text-[#138808] text-xs font-bold">
              <span>Active Schemes Only</span>
            </span>
            {(level !== 'all' || category !== 'all' || query) && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs text-[#E65100] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct Quick Search Input right at filter toolbar */}
            <div className="relative flex items-center min-w-[190px] sm:min-w-[220px]">
              <span className="material-symbols-outlined text-[#0D2240] text-[18px] absolute left-2.5 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search schemes..."
                className="w-full bg-[#F8FAFC] hover:bg-[#F0F3FF] focus:bg-white text-xs text-[#0D2240] font-semibold pl-8 pr-7 py-1.5 rounded-lg border border-[#E2E8F0] focus:border-[#0D2240] focus:outline-none focus:ring-2 focus:ring-[#0D2240]/15 transition-all placeholder-slate-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-[#0D2240] cursor-pointer"
                  title="Clear search"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1 bg-[#F0F3FF] p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-[#0D2240] shadow-xs' : 'text-[#44474E] hover:text-[#0D2240]'
                }`}
                title="Detailed Cards"
              >
                <span className="material-symbols-outlined text-[18px]">view_agenda</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#0D2240] shadow-xs' : 'text-[#44474E] hover:text-[#0D2240]'
                }`}
                title="Compact Table"
              >
                <span className="material-symbols-outlined text-[18px]">table_rows</span>
              </button>
            </div>
            <div className="h-4 w-px bg-[#E2E8F0] hidden sm:block" />
            <span className="text-xs text-[#44474E] font-medium whitespace-nowrap">
              Showing <strong className="text-[#0D2240] font-bold">
                {displayedSchemes.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, displayedSchemes.length)}
              </strong> of <strong className="text-[#0D2240] font-bold">{displayedSchemes.length}</strong>
              {totalPages > 1 && (
                <span className="ml-1 text-slate-500 font-medium hidden md:inline">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Schemes Content (Cards vs Table) */}
        {loading ? (
          <SchemeCardSkeleton count={6} />
        ) : displayedSchemes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
            <h3 className="font-display font-bold text-lg text-[#0D2240]">No schemes matching your filters</h3>
            <p className="text-xs text-[#44474E]">Try resetting search keywords or category filters.</p>
            <button
              onClick={clearFilters}
              className="mt-2 px-4 py-2 bg-[#0D2240] text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedSchemes.map((scheme) => {
                const isMatched = matchedItems.find((m) => m.scheme?.schemeId === scheme.schemeId)
                return (
                  <SchemeCard
                    key={scheme.schemeId}
                    scheme={scheme}
                    confidence={isMatched ? isMatched.confidence : undefined}
                    missingFields={isMatched?.missingFields}
                    reasons={isMatched?.reasons}
                    profile={profile}
                    bookmarked={bookmarkedIds.has(scheme.schemeId)}
                    onBookmarkChange={(id, saved) => {
                      setBookmarkedIds((prev) => {
                        const next = new Set(prev)
                        if (saved) next.add(id)
                        else next.delete(id)
                        return next
                      })
                    }}
                    onCompare={handleToggleCompare}
                    isComparing={compareSchemeA?.schemeId === scheme.schemeId || compareSchemeB?.schemeId === scheme.schemeId}
                    showCompare={true}
                  />
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-[#E2E8F0]">
                <div className="text-xs text-[#44474E]">
                  Showing <strong className="text-[#0D2240]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayedSchemes.length)}</strong> of{' '}
                  <strong className="text-[#0D2240]">{displayedSchemes.length}</strong> schemes (2 rows per page)
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center sm:mr-52 md:mr-64">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1))
                      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                        : 'bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-[#F0F3FF] shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-7 text-center text-xs font-bold text-slate-400">...</span>
                      ) : (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum)
                            document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === pageNum
                              ? 'bg-[#0D2240] text-white shadow-xs scale-105'
                              : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === totalPages
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
          </div>
        ) : (
          /* Table View */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#0D2240]">
                    <th className="p-4">Scheme Name &amp; Code</th>
                    <th className="p-4">Authority &amp; Level</th>
                    <th className="p-4">Benefit</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] text-xs">
                  {paginatedSchemes.map((s) => (
                    <tr key={s.schemeId} className="hover:bg-[#F0F3FF]/50 transition-colors">
                      <td className="p-4">
                        <Link to={`/schemes/${s.schemeId}`} className="font-bold text-[#0D2240] hover:underline">
                          {s.name}
                        </Link>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">SCH-{s.schemeId.toString().padStart(3, '0')}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-[#44474E]">{s.ministry || 'Govt of India'}</span>
                        <p className="text-[10px] text-slate-400">{s.state || 'Central'}</p>
                      </td>
                      <td className="p-4 font-bold text-[#138808]">
                        {s.benefitAmount || 'Direct Benefit Transfer'}
                      </td>
                      <td className="p-4 text-[#44474E]">
                        {s.deadline || '30 Apr 2025'}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          to={`/schemes/${s.schemeId}`}
                          className="px-3 py-1.5 bg-[#0D2240] text-white font-bold rounded-lg hover:bg-[#1A365D] transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-2 border-t border-[#E2E8F0]">
                <div className="text-xs text-[#44474E]">
                  Showing <strong className="text-[#0D2240]">{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayedSchemes.length)}</strong> of{' '}
                  <strong className="text-[#0D2240]">{displayedSchemes.length}</strong> schemes (2 rows per page)
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center sm:mr-52 md:mr-64">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1))
                      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                        : 'bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-[#F0F3FF] shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                      pageNum === '...' ? (
                        <span key={`ellipsis-${idx}`} className="w-7 text-center text-xs font-bold text-slate-400">...</span>
                      ) : (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum)
                            document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                            currentPage === pageNum
                              ? 'bg-[#0D2240] text-white shadow-xs scale-105'
                              : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                      document.getElementById('schemes-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === totalPages
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
          </div>
        )}



        {/* Floating Compare Schemes Dock */}
        {compareSchemeA && (
          <aside aria-label="Compare Schemes Tray" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 bg-[#0D2240] text-white px-4 sm:px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4 max-w-2xl w-[94%] animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#FF7722] text-[20px]">compare_arrows</span>
              </div>
              <div className="min-w-0">
                <div className="text-[11px] uppercase font-bold text-white/70 tracking-wider">
                  Compare Schemes ({compareSchemeB ? '2 of 2 Selected' : '1 of 2 Selected'})
                </div>
                <div className="text-xs font-bold text-white truncate">
                  {compareSchemeA.name} {compareSchemeB ? `vs ${compareSchemeB.name}` : '(Select a 2nd scheme)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#E65100] hover:bg-[#FF7722] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{compareSchemeB ? 'View Comparison' : 'Open Compare Window'}</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </button>
              <button
                type="button"
                onClick={handleClearCompare}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Clear comparison selection"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </aside>
        )}

        {/* Compare Schemes Modal */}
        <SchemeCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          initialSchemeA={compareSchemeA}
          initialSchemeB={compareSchemeB}
          allSchemes={catalogSchemes}
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
      </div>
    </div>
  )
}
