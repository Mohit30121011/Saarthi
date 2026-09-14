import { useEffect, useState } from 'react'
import { getChecklist, toggleChecklistItem } from '../api/checklist'

export default function Checklist() {
  const [checklist, setChecklist] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function load() {
    setLoading(true)
    setError('')
    getChecklist()
      .then(setChecklist)
      .catch((err) => setError(err.response?.data?.error || 'Could not load your checklist.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleToggle(documentName, currentlyChecked) {
    // optimistic update
    setChecklist((prev) => {
      const next = { ...prev }
      for (const category of Object.keys(next)) {
        next[category] = next[category].map((item) =>
          item.documentName === documentName ? { ...item, checked: !currentlyChecked } : item
        )
      }
      return next
    })
    try {
      const updated = await toggleChecklistItem(documentName, !currentlyChecked)
      setChecklist(updated)
    } catch {
      load() // revert to server truth on failure
    }
  }

  if (loading) return <div className="text-center py-24 text-saarthi-muted">Loading your checklist…</div>
  if (error) return <div className="text-center py-24 text-saarthi-error">{error}</div>

  const categories = Object.keys(checklist)
  const totalItems = categories.reduce((sum, c) => sum + checklist[c].length, 0)
  const checkedItems = categories.reduce((sum, c) => sum + checklist[c].filter((i) => i.checked).length, 0)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink mb-1">Document Checklist</h1>
      <p className="text-saarthi-body mb-6">
        Consolidated across your Strong-confidence matches —{' '}
        <span className="font-medium text-saarthi-green">{checkedItems} of {totalItems}</span> collected
      </p>

      {totalItems === 0 && (
        <p className="text-saarthi-muted text-center py-16">
          No documents yet — you'll see a checklist here once you have Strong-confidence scheme matches.
        </p>
      )}

      {categories.map((category) => (
        <section key={category} className="mb-8">
          <h2 className="font-fraunces text-lg font-semibold text-saarthi-ink mb-3">{category}</h2>
          <div className="bg-white rounded-2xl border border-saarthi-border divide-y divide-saarthi-border overflow-hidden">
            {checklist[category].map((item) => (
              <div key={item.documentName} className="flex items-start gap-3 px-4 py-3.5">
                <button
                  onClick={() => handleToggle(item.documentName, item.checked)}
                  aria-label={item.checked ? 'Mark as not collected' : 'Mark as collected'}
                  className={`mt-0.5 shrink-0 w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors ${
                    item.checked ? 'bg-saarthi-green border-saarthi-green' : 'border-saarthi-border'
                  }`}
                >
                  {item.checked && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${item.checked ? 'line-through text-saarthi-muted' : 'text-saarthi-ink'}`}>
                    {item.documentName}
                    {item.mandatory && <span className="text-saarthi-error ml-1">*</span>}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {item.contributingSchemes.slice(0, 3).map((s) => (
                      <span key={s.schemeId} className="text-[11px] px-2 py-0.5 rounded-full bg-saarthi-bg text-saarthi-muted">
                        {s.schemeName}
                      </span>
                    ))}
                    {item.contributingSchemes.length > 3 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-saarthi-bg text-saarthi-muted">
                        +{item.contributingSchemes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
