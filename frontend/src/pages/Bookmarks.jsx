import { useEffect, useState } from 'react'
import { getBookmarks } from '../api/bookmarks'
import SchemeCard from '../components/SchemeCard'

export default function Bookmarks() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  if (loading) return <div className="text-center py-24 text-saarthi-muted">Loading your bookmarks…</div>
  if (error) return <div className="text-center py-24 text-saarthi-error">{error}</div>

  return (
    <div>
      <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink mb-1">Saved Schemes</h1>
      <p className="text-saarthi-body mb-6">{schemes.length} scheme{schemes.length === 1 ? '' : 's'} bookmarked</p>

      {schemes.length === 0 ? (
        <p className="text-saarthi-muted text-center py-16">No bookmarks yet — save schemes from your Dashboard or the Explorer.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <SchemeCard key={scheme.schemeId} scheme={scheme} bookmarked onBookmarkChange={handleBookmarkChange} />
          ))}
        </div>
      )}
    </div>
  )
}
