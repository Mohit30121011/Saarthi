import { useEffect, useState } from 'react'
import { getMyMatches, refreshMatches } from '../api/match'
import { getBookmarks } from '../api/bookmarks'
import CategoryChips from '../components/CategoryChips'
import SchemeCard from '../components/SchemeCard'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [matches, bookmarks] = await Promise.all([getMyMatches(), getBookmarks()])
      setData(matches)
      setBookmarkedIds(new Set(bookmarks.map((b) => b.schemeId)))
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load your dashboard. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      const matches = await refreshMatches()
      setData(matches)
    } catch {
      // keep showing stale data on failure
    } finally {
      setRefreshing(false)
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

  if (loading) {
    return <div className="text-center py-24 text-saarthi-muted">Loading your matches…</div>
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto text-center py-24">
        <p className="text-saarthi-error">{error}</p>
        <button onClick={load} className="mt-4 px-5 h-10 rounded-full bg-saarthi-green text-white text-sm font-medium">
          Try again
        </button>
      </div>
    )
  }

  const counts = Object.fromEntries(Object.entries(data.byCategory).map(([cat, items]) => [cat, items.length]))
  const categoriesToShow = activeCategory === 'All' ? Object.keys(data.byCategory) : [activeCategory]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink">Your matched schemes</h1>
          <p className="text-saarthi-body mt-1">
            <span className="font-semibold text-saarthi-green">{data.totalMatches}</span> schemes you may qualify for
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="self-start sm:self-auto px-5 h-11 rounded-full border border-saarthi-border text-sm font-medium text-saarthi-ink hover:border-saarthi-green/50 transition-colors disabled:opacity-60"
        >
          {refreshing ? 'Refreshing…' : 'Refresh matches'}
        </button>
      </div>

      <div className="mb-8">
        <CategoryChips counts={counts} active={activeCategory} onChange={setActiveCategory} />
      </div>

      {data.totalMatches === 0 ? (
        <div className="text-center py-24">
          <p className="text-saarthi-body">No matches yet — complete your profile to see personalized schemes.</p>
        </div>
      ) : (
        categoriesToShow.map((category) => {
          const items = data.byCategory[category]
          if (!items?.length) return null
          return (
            <section key={category} className="mb-10">
              <h2 className="font-fraunces text-xl font-semibold text-saarthi-ink mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <SchemeCard
                    key={item.scheme.schemeId}
                    scheme={item.scheme}
                    confidence={item.confidence}
                    missingFields={item.missingFields}
                    bookmarked={bookmarkedIds.has(item.scheme.schemeId)}
                    onBookmarkChange={handleBookmarkChange}
                  />
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
