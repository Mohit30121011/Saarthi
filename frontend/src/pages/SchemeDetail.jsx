import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSchemeDetail } from '../api/schemes'
import { addBookmark, removeBookmark, getBookmarks } from '../api/bookmarks'
import { useAuth } from '../context/AuthContext'

const TABS = ['Overview', 'Eligibility', 'Documents', 'How to Apply']

const OPERATOR_LABELS = {
  '=': 'is', '!=': 'is not', '>=': 'at least', '<=': 'at most', '>': 'more than', '<': 'less than', IN: 'is one of',
}

const ATTRIBUTE_LABELS = {
  age: 'Age', annual_income: 'Annual income', gender: 'Gender', category: 'Social category', state: 'State',
  occupation: 'Occupation', education_level: 'Education level', disability_status: 'Disability status',
  is_bpl: 'BPL status', is_minority: 'Minority status',
}

export default function SchemeDetail() {
  const { schemeId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('Overview')
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    getSchemeDetail(schemeId)
      .then(setDetail)
      .catch((err) => setError(err.response?.data?.error || 'Could not load this scheme.'))
      .finally(() => setLoading(false))

    if (isAuthenticated) {
      getBookmarks()
        .then((bookmarks) => setBookmarked(bookmarks.some((b) => b.schemeId === Number(schemeId))))
        .catch(() => {})
    }
  }, [schemeId, isAuthenticated])

  async function toggleBookmark() {
    if (bookmarked) {
      await removeBookmark(schemeId)
      setBookmarked(false)
    } else {
      await addBookmark(Number(schemeId))
      setBookmarked(true)
    }
  }

  if (loading) return <div className="text-center py-24 text-saarthi-muted">Loading…</div>
  if (error) return <div className="text-center py-24 text-saarthi-error">{error}</div>
  if (!detail) return null

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-[#156f45] hover:underline flex items-center gap-1.5 mb-3"
      >
        <span>←</span> <span>Back</span>
      </button>

      <div className="flex items-start justify-between gap-4 mt-4 mb-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wide text-saarthi-muted">{detail.categoryName}</span>
          <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink mt-1">{detail.name}</h1>
          <p className="text-sm text-saarthi-muted mt-1">{detail.ministry}{detail.state ? ` · ${detail.state}` : ' · Central Scheme'}</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={toggleBookmark}
            className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${
              bookmarked ? 'bg-saarthi-green border-saarthi-green text-white' : 'border-saarthi-border text-saarthi-muted'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this scheme'}
          >
            <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21l-7.682-8.318a4.5 4.5 0 010-6.364z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-saarthi-border p-5 my-5">
        <p className="text-[13px] text-saarthi-muted">Benefit</p>
        <p className="text-lg font-semibold text-saarthi-ink mt-0.5">{detail.benefitAmount || detail.benefitSummary}</p>
        {detail.deadline && <p className="text-sm text-saarthi-saffron mt-2">Deadline: {detail.deadline}</p>}
      </div>

      <div className="flex gap-6 border-b border-saarthi-border mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? 'text-saarthi-ink border-saarthi-green' : 'text-saarthi-muted border-transparent hover:text-saarthi-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-4">
          <p className="text-saarthi-body leading-relaxed">{detail.description}</p>
          {detail.sourceUrl && (
            <p className="text-xs text-saarthi-muted">
              Verified {detail.verifiedAt} against{' '}
              <a href={detail.sourceUrl} target="_blank" rel="noreferrer" className="text-saarthi-green hover:underline">
                the official source
              </a>
            </p>
          )}
        </div>
      )}

      {tab === 'Eligibility' && (
        <div className="space-y-3">
          {detail.rules.length === 0 && <p className="text-saarthi-muted text-sm">No structured eligibility rules for this scheme — see Overview for the full description.</p>}
          {detail.rules.map((rule, i) => (
            <div key={i} className="bg-white rounded-xl border border-saarthi-border p-4">
              <p className="text-sm text-saarthi-ink">
                <span className="font-medium">{ATTRIBUTE_LABELS[rule.attributeName] || rule.attributeName}</span>{' '}
                {OPERATOR_LABELS[rule.operator] || rule.operator}{' '}
                <span className="font-medium">{rule.value}</span>
              </p>
              {rule.ruleDescription && <p className="text-[13px] text-saarthi-muted mt-1">{rule.ruleDescription}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'Documents' && (
        <div className="space-y-2">
          {detail.documents.length === 0 && <p className="text-saarthi-muted text-sm">No document list available for this scheme.</p>}
          {detail.documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-saarthi-border px-4 py-3">
              <span className="text-sm text-saarthi-ink">{doc.documentName}</span>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${doc.mandatory ? 'bg-saarthi-error/10 text-saarthi-error' : 'bg-saarthi-border text-saarthi-muted'}`}>
                {doc.mandatory ? 'Mandatory' : 'Optional'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'How to Apply' && (
        <div className="space-y-4">
          <p className="text-saarthi-body">Apply directly through the official government portal.</p>
          <div className="flex gap-3">
            {detail.applicationUrl && (
              <a href={detail.applicationUrl} target="_blank" rel="noreferrer" className="px-5 h-11 rounded-full bg-saarthi-green text-white text-sm font-medium flex items-center shadow-saarthi-btn">
                Apply now →
              </a>
            )}
            {detail.officialPortal && (
              <a href={detail.officialPortal} target="_blank" rel="noreferrer" className="px-5 h-11 rounded-full border border-saarthi-border text-sm font-medium flex items-center text-saarthi-ink">
                Official portal
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
