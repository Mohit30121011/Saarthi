import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addBookmark, removeBookmark } from '../api/bookmarks'

const CATEGORY_ICONS = {
  Education: '🎓',
  Healthcare: '🩺',
  Housing: '🏠',
  'Financial Aid': '💰',
  Agriculture: '🌾',
  Employment: '💼',
}

function ConfidenceTag({ confidence }) {
  if (!confidence) return null
  if (confidence === 'STRONG') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-saarthi-green text-white text-[11px] font-semibold">
        <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
          <path fillRule="evenodd" clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
        </svg>
        Strong
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-saarthi-saffron text-saarthi-ink text-[11px] font-semibold">
      <span className="w-2 h-2 rounded-full border border-saarthi-saffron" />
      Partial
    </span>
  )
}

export default function SchemeCard({ scheme, confidence, missingFields, bookmarked: initialBookmarked, onBookmarkChange }) {
  const [bookmarked, setBookmarked] = useState(!!initialBookmarked)
  const [busy, setBusy] = useState(false)

  async function toggleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (bookmarked) {
        await removeBookmark(scheme.schemeId)
        setBookmarked(false)
        onBookmarkChange?.(scheme.schemeId, false)
      } else {
        await addBookmark(scheme.schemeId)
        setBookmarked(true)
        onBookmarkChange?.(scheme.schemeId, true)
      }
    } catch {
      // best-effort — leave state unchanged on failure
    } finally {
      setBusy(false)
    }
  }

  return (
    <Link
      to={`/schemes/${scheme.schemeId}`}
      className="relative block bg-white rounded-[20px] border border-saarthi-border p-5 hover:shadow-saarthi-card transition-shadow group"
    >
      <button
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this scheme'}
        onClick={toggleBookmark}
        className={`absolute -top-3 left-4 w-8 h-8 rounded-full bg-white border border-saarthi-border flex items-center justify-center shadow-sm transition-transform active:scale-90 ${
          bookmarked ? 'text-saarthi-green' : 'text-saarthi-muted'
        }`}
      >
        <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#E8F2EC] flex items-center justify-center text-xs">
            {CATEGORY_ICONS[scheme.categoryName] || '📋'}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wide text-saarthi-muted">
            {scheme.categoryName}
          </span>
        </div>
        <ConfidenceTag confidence={confidence} />
      </div>

      <h3 className="font-fraunces font-semibold text-lg text-saarthi-ink leading-snug line-clamp-2">
        {scheme.name}
      </h3>
      <p className="text-[13px] text-saarthi-muted mt-1">{scheme.ministry}</p>
      <p className="text-sm text-saarthi-body mt-2 line-clamp-2">{scheme.benefitSummary}</p>

      {missingFields?.length > 0 && (
        <p className="text-[11px] text-saarthi-saffron mt-2">
          Add {missingFields.join(', ')} to confirm eligibility
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-saarthi-border">
        <span className="text-sm font-medium text-saarthi-green group-hover:underline">View details →</span>
        {scheme.deadline && <span className="text-[11px] text-saarthi-muted">Deadline: {scheme.deadline}</span>}
      </div>
    </Link>
  )
}
