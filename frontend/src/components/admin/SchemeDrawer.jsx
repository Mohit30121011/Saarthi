import { useEffect, useRef, useState } from 'react'
import * as adminApi from '../../api/admin'

const CATEGORIES = [
  { id: 1, name: 'Education' },
  { id: 2, name: 'Healthcare' },
  { id: 3, name: 'Housing' },
  { id: 4, name: 'Financial Aid' },
  { id: 5, name: 'Agriculture' },
  { id: 6, name: 'Employment' },
]

const RULE_ATTRIBUTES = [
  'age', 'annual_income', 'gender', 'category', 'state',
  'occupation', 'education_level', 'disability_status', 'is_bpl', 'is_minority',
]
const RULE_OPERATORS = ['=', '!=', '>=', '<=', '>', '<', 'IN']

const EMPTY_SCHEME = {
  name: '', description: '', ministry: '', categoryId: 1, state: '',
  benefitSummary: '', benefitAmount: '', applicationUrl: '', officialPortal: '',
  isActive: true, deadline: '', sourceUrl: '', verifiedAt: '',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function field(label, children) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-saarthi-muted mb-1">{label}</span>
      {children}
    </label>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-saarthi-border saarthi-input-focus bg-white'

export default function SchemeDrawer({ schemeId, onClose, onSaved }) {
  const isNew = schemeId == null
  const [currentId, setCurrentId] = useState(schemeId)
  const [scheme, setScheme] = useState(EMPTY_SCHEME)
  const [rules, setRules] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const drawerRef = useRef(null)

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    adminApi.getSchemeDetail(schemeId).then((detail) => {
      if (cancelled) return
      setScheme({
        name: detail.scheme.name || '', description: detail.scheme.description || '',
        ministry: detail.scheme.ministry || '', categoryId: detail.scheme.categoryId || 1,
        state: detail.scheme.state || '', benefitSummary: detail.scheme.benefitSummary || '',
        benefitAmount: detail.scheme.benefitAmount || '', applicationUrl: detail.scheme.applicationUrl || '',
        officialPortal: detail.scheme.officialPortal || '', isActive: detail.scheme.isActive,
        deadline: detail.scheme.deadline || '', sourceUrl: detail.scheme.sourceUrl || '',
        verifiedAt: detail.scheme.verifiedAt || '',
      })
      setRules(detail.rules)
      setDocuments(detail.documents)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) { setError('Failed to load scheme.'); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [schemeId, isNew])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    drawerRef.current?.querySelector('input,textarea,select')?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function updateField(key, value) {
    setScheme((s) => ({ ...s, [key]: value }))
  }

  async function handleSaveScheme() {
    setSaving(true)
    setError(null)
    try {
      const payload = { ...scheme, deadline: scheme.deadline || null, verifiedAt: scheme.verifiedAt || null }
      if (currentId == null) {
        const created = await adminApi.createScheme(payload)
        setCurrentId(created.schemeId)
        onSaved()
      } else {
        await adminApi.updateScheme(currentId, payload)
        onSaved()
        onClose()
      }
    } catch {
      setError('Save failed. Check required fields.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    if (currentId == null) return
    if (!window.confirm('Deactivate this scheme? It will stop being matched to citizens.')) return
    await adminApi.deactivateScheme(currentId)
    onSaved()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className="relative w-[480px] max-w-full h-full bg-white shadow-2xl overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-saarthi-border px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-fraunces text-lg text-saarthi-ink">{isNew ? 'Add Scheme' : 'Edit Scheme'}</h2>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center text-saarthi-muted hover:text-saarthi-ink">
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          {loading ? (
            <p className="text-sm text-saarthi-muted">Loading…</p>
          ) : (
            <>
              {error && <p className="text-sm text-saarthi-error mb-3">{error}</p>}

              {field('Name', <input className={inputCls} value={scheme.name} onChange={(e) => updateField('name', e.target.value)} />)}
              {field('Description', <textarea className={inputCls} rows={3} value={scheme.description} onChange={(e) => updateField('description', e.target.value)} />)}
              {field('Ministry', <input className={inputCls} value={scheme.ministry} onChange={(e) => updateField('ministry', e.target.value)} />)}
              {field('Category', (
                <select className={inputCls} value={scheme.categoryId} onChange={(e) => updateField('categoryId', Number(e.target.value))}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ))}
              {field('State (blank = Central)', <input className={inputCls} value={scheme.state} onChange={(e) => updateField('state', e.target.value)} />)}
              {field('Benefit Summary', <textarea className={inputCls} rows={2} value={scheme.benefitSummary} onChange={(e) => updateField('benefitSummary', e.target.value)} />)}
              {field('Benefit Amount', <input className={inputCls} value={scheme.benefitAmount} onChange={(e) => updateField('benefitAmount', e.target.value)} />)}
              {field('Application URL', <input className={inputCls} value={scheme.applicationUrl} onChange={(e) => updateField('applicationUrl', e.target.value)} />)}
              {field('Official Portal', <input className={inputCls} value={scheme.officialPortal} onChange={(e) => updateField('officialPortal', e.target.value)} />)}
              {field('Deadline', <input type="date" className={inputCls} value={scheme.deadline || ''} onChange={(e) => updateField('deadline', e.target.value)} />)}
              {field('Status', (
                <select className={inputCls} value={scheme.isActive ? '1' : '0'} onChange={(e) => updateField('isActive', e.target.value === '1')}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              ))}

              <div className="mt-5 mb-4 pt-4 border-t border-saarthi-border bg-saarthi-alert-bg -mx-5 px-5 pb-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-saarthi-ink mb-3">Verification</p>
                {field('Source URL', <input className={inputCls} value={scheme.sourceUrl} onChange={(e) => updateField('sourceUrl', e.target.value)} />)}
                {field('Verified At', <input type="date" className={inputCls} value={scheme.verifiedAt || ''} onChange={(e) => updateField('verifiedAt', e.target.value)} />)}
                <button
                  onClick={() => updateField('verifiedAt', todayIso())}
                  className="text-xs font-medium text-saarthi-green hover:underline"
                >
                  Mark as verified today
                </button>
              </div>

              <div className="flex gap-2 mb-6">
                <button
                  onClick={handleSaveScheme}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-saarthi-green text-white text-sm font-medium hover:bg-saarthi-green-hover transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={onClose} className="px-4 py-2 rounded-lg border border-saarthi-border text-sm font-medium text-saarthi-body hover:bg-saarthi-bg">
                  Cancel
                </button>
                {!isNew && (
                  <button onClick={handleDeactivate} className="ml-auto px-4 py-2 rounded-lg border border-saarthi-error/40 text-sm font-medium text-saarthi-error hover:bg-saarthi-error/5">
                    Deactivate
                  </button>
                )}
              </div>

              {currentId != null && (
                <>
                  <RulesEditor schemeId={currentId} rules={rules} setRules={setRules} />
                  <DocumentsEditor schemeId={currentId} documents={documents} setDocuments={setDocuments} />
                </>
              )}
              {currentId == null && (
                <p className="text-xs text-saarthi-muted italic">Save the scheme first to add eligibility rules and required documents.</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

let draftKeySeq = 0

function RulesEditor({ schemeId, rules, setRules }) {
  function addBlank() {
    setRules((r) => [...r, { ruleId: null, draftKey: `d${draftKeySeq++}`, attributeName: RULE_ATTRIBUTES[0], operator: '=', value: '' }])
  }

  async function save(rule) {
    if (!rule.value.trim()) return
    if (rule.ruleId == null) {
      const created = await adminApi.addRule(schemeId, rule)
      setRules((rs) => rs.map((r) => (r === rule || r.draftKey === rule.draftKey ? created : r)))
    } else {
      const updated = await adminApi.updateRule(rule.ruleId, rule)
      setRules((rs) => rs.map((r) => (r.ruleId === rule.ruleId ? updated : r)))
    }
  }

  async function remove(rule) {
    if (rule.ruleId == null) {
      setRules((rs) => rs.filter((r) => r.draftKey !== rule.draftKey))
      return
    }
    await adminApi.deleteRule(rule.ruleId)
    setRules((rs) => rs.filter((r) => r.ruleId !== rule.ruleId))
  }

  function updateLocal(rule, key, value) {
    setRules((rs) => rs.map((r) => (r === rule ? { ...r, [key]: value } : r)))
  }

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-saarthi-ink mb-3">Eligibility Rules</p>
      {rules.map((rule) => (
        <div key={rule.ruleId ?? rule.draftKey} className="flex items-center gap-1.5 mb-2">
          <select className="text-xs px-2 py-1.5 rounded border border-saarthi-border" value={rule.attributeName} onChange={(e) => updateLocal(rule, 'attributeName', e.target.value)}>
            {RULE_ATTRIBUTES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="text-xs px-2 py-1.5 rounded border border-saarthi-border w-16" value={rule.operator} onChange={(e) => updateLocal(rule, 'operator', e.target.value)}>
            {RULE_OPERATORS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <input className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded border border-saarthi-border" placeholder="value" value={rule.value} onChange={(e) => updateLocal(rule, 'value', e.target.value)} />
          <button onClick={() => save(rule)} className="text-xs text-saarthi-green font-medium px-1.5">Save</button>
          <button onClick={() => remove(rule)} aria-label="Delete rule" className="text-xs text-saarthi-error px-1.5">✕</button>
        </div>
      ))}
      <button onClick={addBlank} className="text-xs font-medium text-saarthi-green hover:underline">+ Add rule</button>
    </div>
  )
}

function DocumentsEditor({ schemeId, documents, setDocuments }) {
  function addBlank() {
    setDocuments((d) => [...d, { docId: null, draftKey: `d${draftKeySeq++}`, documentName: '', documentCategory: '', mandatory: true }])
  }

  async function save(doc) {
    if (!doc.documentName.trim()) return
    if (doc.docId == null) {
      const created = await adminApi.addDocument(schemeId, doc)
      setDocuments((ds) => ds.map((d) => (d === doc || d.draftKey === doc.draftKey ? created : d)))
    } else {
      const updated = await adminApi.updateDocument(doc.docId, doc)
      setDocuments((ds) => ds.map((d) => (d.docId === doc.docId ? updated : d)))
    }
  }

  async function remove(doc) {
    if (doc.docId == null) {
      setDocuments((ds) => ds.filter((d) => d.draftKey !== doc.draftKey))
      return
    }
    await adminApi.deleteDocument(doc.docId)
    setDocuments((ds) => ds.filter((d) => d.docId !== doc.docId))
  }

  function updateLocal(doc, key, value) {
    setDocuments((ds) => ds.map((d) => (d === doc ? { ...d, [key]: value } : d)))
  }

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-saarthi-ink mb-3">Required Documents</p>
      {documents.map((doc) => (
        <div key={doc.docId ?? doc.draftKey} className="flex items-center gap-1.5 mb-2">
          <input className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded border border-saarthi-border" placeholder="Document name" value={doc.documentName} onChange={(e) => updateLocal(doc, 'documentName', e.target.value)} />
          <input className="w-24 text-xs px-2 py-1.5 rounded border border-saarthi-border" placeholder="Category" value={doc.documentCategory || ''} onChange={(e) => updateLocal(doc, 'documentCategory', e.target.value)} />
          <label className="flex items-center gap-1 text-xs text-saarthi-muted shrink-0">
            <input type="checkbox" checked={doc.mandatory} onChange={(e) => updateLocal(doc, 'mandatory', e.target.checked)} />
            Required
          </label>
          <button onClick={() => save(doc)} className="text-xs text-saarthi-green font-medium px-1.5">Save</button>
          <button onClick={() => remove(doc)} aria-label="Delete document" className="text-xs text-saarthi-error px-1.5">✕</button>
        </div>
      ))}
      <button onClick={addBlank} className="text-xs font-medium text-saarthi-green hover:underline">+ Add document</button>
    </div>
  )
}
