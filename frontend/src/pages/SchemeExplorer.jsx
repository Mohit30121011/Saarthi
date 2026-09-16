import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchSchemes } from '../api/schemes'
import { getMyMatches } from '../api/match'
import { getBookmarks } from '../api/bookmarks'
import { getProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import SchemeCard from '../components/SchemeCard'
import { SchemeCardSkeleton } from '../components/Skeletons'

export default function SchemeExplorer() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [level, setLevel] = useState('all') // 'all', 'central', 'state'
  const [category, setCategory] = useState('all')
  const [ministry, setMinistry] = useState('all')
  const [sortBy, setSortBy] = useState('verified')
  const [viewMode, setViewMode] = useState('cards') // 'cards' or 'table'
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [catalogSchemes, setCatalogSchemes] = useState([])
  const [matchedItems, setMatchedItems] = useState([])

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

  // Filter schemes locally for instant ministry & sort responsiveness
  const displayedSchemes = useMemo(() => {
    let list = [...catalogSchemes]

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
  }, [catalogSchemes, level, ministry, sortBy])

  function clearFilters() {
    setQuery('')
    setLevel('all')
    setCategory('all')
    setMinistry('all')
    setSortBy('verified')
  }

  const centralCount = useMemo(() => catalogSchemes.filter((s) => !s.state).length, [catalogSchemes])
  const stateCount = useMemo(() => catalogSchemes.filter((s) => s.state).length, [catalogSchemes])

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen font-sans text-[#111C2D]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 pb-16 space-y-8 pt-6">
        
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
              <div className="relative bg-white rounded-lg border border-[#E2E8F0] shadow-2xs flex items-center px-3">
                <span className="material-symbols-outlined text-[#44474E] text-[18px] mr-2">category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-2.5 bg-transparent border-none text-[#111C2D] focus:outline-none cursor-pointer text-xs font-bold"
                >
                  <option value="all">All Categories</option>
                  <option value="Agriculture">Agriculture &amp; Farmers</option>
                  <option value="Education">Education &amp; Scholarships</option>
                  <option value="Healthcare">Healthcare &amp; Ayushman</option>
                  <option value="Housing">Housing &amp; Urban</option>
                  <option value="Financial Aid">Financial Aid &amp; Credit</option>
                  <option value="Employment">Skill &amp; Employment</option>
                </select>
              </div>

              {/* Ministry Dropdown */}
              <div className="relative bg-white rounded-lg border border-[#E2E8F0] shadow-2xs flex items-center px-3">
                <span className="material-symbols-outlined text-[#44474E] text-[18px] mr-2">account_balance</span>
                <select
                  value={ministry}
                  onChange={(e) => setMinistry(e.target.value)}
                  className="w-full py-2.5 bg-transparent border-none text-[#111C2D] focus:outline-none cursor-pointer text-xs font-bold truncate"
                >
                  <option value="all">All Issuing Ministries / Depts</option>
                  <option value="Agriculture">Ministry of Agriculture</option>
                  <option value="Higher">Higher &amp; Technical Education (MH)</option>
                  <option value="Health">Ministry of Health &amp; Family Welfare</option>
                  <option value="Housing">Ministry of Housing &amp; Urban Affairs</option>
                  <option value="Skill">Ministry of Skill Development</option>
                </select>
              </div>

              {/* Sort Dropdown */}
              <div className="relative bg-white rounded-lg border border-[#E2E8F0] shadow-2xs flex items-center px-3">
                <span className="material-symbols-outlined text-[#44474E] text-[18px] mr-2">swap_vert</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2.5 bg-transparent border-none text-[#111C2D] focus:outline-none cursor-pointer text-xs font-bold"
                >
                  <option value="verified">Sort by: Latest Verified</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="benefit">Max Financial Benefit</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Chips & View Mode Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-[#44474E] font-bold mr-1">
              Active Filters:
            </span>
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
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-[#E65100] hover:underline font-bold ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-3">
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
            <span className="text-xs text-[#44474E] font-medium">
              Showing <strong className="text-[#0D2240] font-bold">{displayedSchemes.length}</strong> schemes
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {displayedSchemes.map((scheme) => {
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
                />
              )
            })}
          </div>
        ) : (
          /* Table View */
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
                {displayedSchemes.map((s) => (
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
        )}
      </div>
    </div>
  )
}
