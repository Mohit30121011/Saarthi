import { useEffect, useState } from 'react'
import { searchSchemes } from '../api/schemes'
import { getBookmarks } from '../api/bookmarks'
import { useAuth } from '../context/AuthContext'
import CategoryChips from '../components/CategoryChips'
import SchemeCard from '../components/SchemeCard'

const STATES = ['Maharashtra']

export default function SchemeExplorer() {
  const { isAuthenticated } = useAuth()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [state, setState] = useState('')
  const [schemes, setSchemes] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handle = setTimeout(load, 300) // debounce search-as-you-type
    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, state])

  useEffect(() => {
    if (isAuthenticated) {
      getBookmarks().then((data) => setBookmarkedIds(new Set(data.map((b) => b.schemeId)))).catch(() => {})
    }
  }, [isAuthenticated])

  async function load() {
    setLoading(true)
    try {
      const results = await searchSchemes({
        category: category === 'All' ? undefined : category,
        state: state || undefined,
        q: query || undefined,
      })
      setSchemes(results)
    } catch {
      setSchemes([])
    } finally {
      setLoading(false)
    }
  }

  function handleBookmarkChange(schemeId, isBookmarked) {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (isBookmarked) next.add(schemeId)
      else next.delete(schemeId)
      return next
    })
  }

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink mb-1">Scheme Explorer</h1>
      <p className="text-saarthi-body mb-6">Browse every scheme in our catalog — no profile needed.</p>

      <div className="relative mb-4">
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
          className="w-full h-[52px] pl-12 pr-4 rounded-[16px] bg-white border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] saarthi-input-focus"
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <CategoryChips active={category} onChange={setCategory} />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-10 px-4 rounded-full bg-white border border-saarthi-border text-sm text-saarthi-ink shrink-0"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <p className="text-sm text-saarthi-muted mb-4">
        {loading ? 'Searching…' : `${schemes.length} scheme${schemes.length === 1 ? '' : 's'}`}
      </p>

      {!loading && schemes.length === 0 && (
        <div className="text-center py-24">
          <p className="text-saarthi-body">No schemes match your search.</p>
          <button
            onClick={() => { setQuery(''); setCategory('All'); setState('') }}
            className="mt-4 px-5 h-10 rounded-full border border-saarthi-border text-sm font-medium text-saarthi-ink"
          >
            Clear all filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {schemes.map((scheme) => (
          <SchemeCard
            key={scheme.schemeId}
            scheme={scheme}
            bookmarked={bookmarkedIds.has(scheme.schemeId)}
            onBookmarkChange={handleBookmarkChange}
            showBookmark={isAuthenticated}
          />
        ))}
      </div>
    </div>
  )
}
