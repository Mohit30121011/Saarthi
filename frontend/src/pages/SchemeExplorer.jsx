import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { searchSchemes } from '../api/schemes'
import { getMyMatches } from '../api/match'
import { getBookmarks } from '../api/bookmarks'
import { getProfile } from '../api/profile'
import { useAuth } from '../context/AuthContext'
import CategoryChips from '../components/CategoryChips'
import SchemeCard from '../components/SchemeCard'

const STATES = ['Maharashtra']

export default function SchemeExplorer() {
  const { isAuthenticated } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  // Active tab: 'matched' or 'all'
  const tabParam = searchParams.get('tab') || searchParams.get('filter') || (isAuthenticated ? 'matched' : 'all')
  const activeTab = tabParam.toLowerCase() === 'all' ? 'all' : 'matched'

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState('All')
  const [state, setState] = useState('')
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  // Data stores
  const [matchedItems, setMatchedItems] = useState([])
  const [allCatalogSchemes, setAllCatalogSchemes] = useState([])

  // Load bookmarks & profile
  useEffect(() => {
    if (isAuthenticated) {
      getBookmarks().then((data) => setBookmarkedIds(new Set(data.map((b) => b.schemeId)))).catch(() => {})
      getProfile().then(setProfile).catch(() => {})
    }
  }, [isAuthenticated])

  // Load matched schemes when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      getMyMatches()
        .then((res) => {
          if (res?.byCategory) {
            const flattened = Object.values(res.byCategory).flat()
            setMatchedItems(flattened)
          }
        })
        .catch(() => {
          setMatchedItems([])
        })
    }
  }, [isAuthenticated])

  // Load schemes based on filters
  useEffect(() => {
    const handle = setTimeout(loadCatalog, 300) // debounce
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, state, activeTab])

  async function loadCatalog() {
    setLoading(true)
    try {
      if (activeTab === 'all') {
        const results = await searchSchemes({
          category: category === 'All' ? undefined : category,
          state: state || undefined,
          q: query || undefined,
        })
        setAllCatalogSchemes(results)
      } else {
        // Matched schemes are already loaded or being loaded
      }
    } catch {
      setAllCatalogSchemes([])
    } finally {
      setLoading(false)
    }
  }

  function handleTabChange(newTab) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', newTab)
    setSearchParams(nextParams)
  }

  function handleBookmarkChange(schemeId, isBookmarked) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (isBookmarked) next.add(schemeId)
      else next.delete(schemeId)
      return next
    })
  }

  // Filter and sort matched items by relevance to citizen demographic profile
  const filteredMatched = useMemo(() => {
    const list = matchedItems.filter((item) => {
      const scheme = item.scheme || {}
      if (category !== 'All' && scheme.categoryName !== category) return false
      if (state && scheme.state && scheme.state !== state) return false
      if (query) {
        const q = query.toLowerCase()
        const matchName = scheme.name?.toLowerCase().includes(q)
        const matchSummary = scheme.benefitSummary?.toLowerCase().includes(q)
        const matchMinistry = scheme.ministry?.toLowerCase().includes(q)
        if (!matchName && !matchSummary && !matchMinistry) return false
      }
      return true
    })

    const occ = (profile?.occupation || '').toLowerCase()
    const socialCat = (profile?.category || '').toLowerCase()
    const userState = (profile?.state || '').toLowerCase()
    const gender = (profile?.gender || '').toLowerCase()

    return list.map((item) => {
      const scheme = item.scheme || {}
      const cat = (scheme.categoryName || '').toLowerCase()
      const name = (scheme.name || '').toLowerCase()
      const desc = (scheme.benefitSummary || '').toLowerCase()
      const schemeState = (scheme.state || '').toLowerCase()

      let score = 0
      if (item.confidence === 'STRONG') score += 50
      else score += 15

      if (occ.includes('student')) {
        if (cat.includes('education')) score += 70
        if (name.includes('scholarship') || desc.includes('scholarship') || desc.includes('tuition') || desc.includes('fee')) score += 40
        if (name.includes('shikshan') || name.includes('shishyavrutti') || name.includes('ebc')) score += 45
        if (cat.includes('skill') || desc.includes('skill') || name.includes('kaushal')) score += 25
        if (cat.includes('agriculture') || name.includes('kisan') || name.includes('livestock') || name.includes('tractor')) score -= 60
      } else if (occ.includes('farmer') || occ.includes('agricult')) {
        if (cat.includes('agriculture')) score += 70
        if (name.includes('kisan') || desc.includes('crop') || desc.includes('farm')) score += 40
        if (name.includes('fasal') || name.includes('livestock')) score += 35
        if (cat.includes('education')) score -= 25
      } else if (occ.includes('unemployed') || occ.includes('job seeker')) {
        if (cat.includes('employment') || cat.includes('skill')) score += 70
        if (name.includes('pmegp') || name.includes('kaushal') || name.includes('ncs') || name.includes('mudra')) score += 40
      } else if (occ.includes('business') || occ.includes('self employed') || occ.includes('entrepreneur')) {
        if (cat.includes('employment') || cat.includes('financial')) score += 70
        if (name.includes('mudra') || name.includes('stand-up') || name.includes('pmsvanidhi') || name.includes('svanidhi') || name.includes('seed fund')) score += 45
      }

      if (schemeState && userState && (schemeState === userState || userState.includes(schemeState))) {
        score += 40
      }

      if (socialCat && (socialCat.includes('ebc') || socialCat.includes('ews') || socialCat.includes('general'))) {
        if (name.includes('ebc') || desc.includes('economically backward') || name.includes('shikshan shulk') || name.includes('rajarshi')) {
          score += 35
        }
      } else if (socialCat && (socialCat.includes('sc') || socialCat.includes('st'))) {
        if (name.includes('sc') || name.includes('st') || name.includes('ramai') || name.includes('top class')) {
          score += 35
        }
      } else if (socialCat && socialCat.includes('obc')) {
        if (name.includes('obc') || name.includes('yasasvi') || desc.includes('obc')) {
          score += 35
        }
      }

      if (gender.includes('female') || gender.includes('woman') || gender.includes('girl')) {
        if (name.includes('pragati') || name.includes('matru') || name.includes('ujjwala') || name.includes('sukanya') || name.includes('women') || desc.includes('girl') || desc.includes('women')) {
          score += 35
        }
      }

      if (cat.includes('healthcare') || name.includes('ayushman') || name.includes('aarogya') || name.includes('jan arogya') || name.includes('manodhairya')) {
        score += 30
      }

      return { ...item, score }
    }).sort((a, b) => b.score - a.score)
  }, [matchedItems, category, state, query, profile])

  const totalMatchedCount = matchedItems.length
  const totalCatalogCount = allCatalogSchemes.length

  return (
    <div className="space-y-6">
      {/* Header Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink tracking-tight">Scheme Explorer</h1>
          <p className="text-saarthi-body mt-1 text-sm sm:text-base">
            {activeTab === 'matched'
              ? 'Schemes matched specifically against your official demographic profile.'
              : 'Browse every central & state government scheme in our catalog.'}
          </p>
        </div>

        {/* Tab Toggle Switcher */}
        <div className="inline-flex p-1 bg-white border border-[#E5EBE5] rounded-2xl shadow-xs self-start sm:self-auto">
          <button
            onClick={() => handleTabChange('matched')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-150 ${
              activeTab === 'matched'
                ? 'bg-[#156f45] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Matched Schemes</span>
            {totalMatchedCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
                activeTab === 'matched' ? 'bg-white/20 text-white' : 'bg-[#E8F5EE] text-[#156f45]'
              }`}>
                {totalMatchedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-150 ${
              activeTab === 'all'
                ? 'bg-[#156f45] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>All Schemes</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              52
            </span>
          </button>
        </div>
      </div>

      {/* Global Keyword Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-saarthi-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by scheme name, keyword, or benefit…"
          aria-label="Search schemes"
          className="w-full h-[52px] pl-12 pr-4 rounded-[16px] bg-white border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] saarthi-input-focus shadow-2xs"
        />
      </div>

      {/* Filters: Category Chips + State Select */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <CategoryChips active={category} onChange={setCategory} />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-10 px-4 rounded-full bg-white border border-saarthi-border text-sm text-saarthi-ink shrink-0 focus:outline-none focus:border-[#156f45]"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Result Count Banner */}
      <div className="flex items-center justify-between text-sm text-saarthi-muted">
        <p>
          {activeTab === 'matched' ? (
            `${filteredMatched.length} matched scheme${filteredMatched.length === 1 ? '' : 's'}`
          ) : loading ? (
            'Searching catalog…'
          ) : (
            `${allCatalogSchemes.length} scheme${allCatalogSchemes.length === 1 ? '' : 's'}`
          )}
        </p>

        {activeTab === 'matched' && (
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Showing only verified criteria matches
          </span>
        )}
      </div>

      {/* Empty State: Matched */}
      {activeTab === 'matched' && filteredMatched.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E5EBE5] p-8">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#156f45] mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-fraunces font-bold text-lg text-slate-900">No matched schemes for these filters</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
            Try resetting your category or search query, or update your profile to unlock additional schemes.
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => { setQuery(''); setCategory('All'); setState('') }}
              className="px-5 h-10 rounded-full border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear filters
            </button>
            <Link
              to="/profile"
              className="px-5 h-10 rounded-full bg-[#156f45] text-white text-sm font-semibold hover:bg-[#125e3a] flex items-center gap-1.5"
            >
              <span>Update Profile</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}

      {/* Empty State: All Schemes */}
      {activeTab === 'all' && !loading && allCatalogSchemes.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E5EBE5] p-8">
          <p className="text-saarthi-body text-base">No schemes match your search criteria.</p>
          <button
            onClick={() => { setQuery(''); setCategory('All'); setState('') }}
            className="mt-4 px-5 h-10 rounded-full border border-saarthi-border text-sm font-medium text-saarthi-ink hover:bg-slate-50"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Grid: Matched Schemes View */}
      {activeTab === 'matched' && filteredMatched.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMatched.map((item) => (
            <SchemeCard
              key={item.scheme.schemeId}
              scheme={item.scheme}
              confidence={item.confidence}
              missingFields={item.missingFields}
              profile={profile}
              bookmarked={bookmarkedIds.has(item.scheme.schemeId)}
              onBookmarkChange={handleBookmarkChange}
              showBookmark={isAuthenticated}
            />
          ))}
        </div>
      )}

      {/* Grid: All Catalog Schemes View */}
      {activeTab === 'all' && allCatalogSchemes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allCatalogSchemes.map((scheme) => (
            <SchemeCard
              key={scheme.schemeId}
              scheme={scheme}
              bookmarked={bookmarkedIds.has(scheme.schemeId)}
              onBookmarkChange={handleBookmarkChange}
              showBookmark={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  )
}
