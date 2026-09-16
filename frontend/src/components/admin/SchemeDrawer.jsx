import { useEffect, useRef, useState } from 'react'
import * as adminApi from '../../api/admin'

const CATEGORIES = [
  { id: 1, name: 'Higher & Technical Education' },
  { id: 2, name: 'Healthcare & Medical Aid' },
  { id: 3, name: 'Housing & Urban Development' },
  { id: 4, name: 'Financial Assistance & Subsidies' },
  { id: 5, name: 'Agriculture & Rural Welfare' },
  { id: 6, name: 'Skill & Employment Training' },
]

const RULE_ATTRIBUTES = [
  'age',
  'annual_income',
  'gender',
  'category',
  'state',
  'district',
  'occupation',
  'education_level',
  'disability_status',
  'is_bpl',
  'is_minority',
]
const RULE_OPERATORS = ['=', '!=', '>=', '<=', '>', '<', 'IN']

const EMPTY_SCHEME = {
  name: '',
  description: '',
  ministry: '',
  categoryId: 1,
  state: '',
  benefitSummary: '',
  benefitAmount: '',
  applicationUrl: '',
  officialPortal: '',
  isActive: true,
  deadline: '',
  sourceUrl: '',
  verifiedAt: '',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

let draftKeySeq = 0

export default function SchemeDrawer({ schemeId, onClose, onSaved }) {
  const isNew = schemeId == null
  const [currentId, setCurrentId] = useState(schemeId)
  const [scheme, setScheme] = useState(EMPTY_SCHEME)
  const [rules, setRules] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const drawerRef = useRef(null)

  useEffect(() => {
    if (isNew) return
    let cancelled = false
    adminApi
      .getSchemeDetail(schemeId)
      .then((detail) => {
        if (cancelled) return
        setScheme({
          name: detail.scheme.name || '',
          description: detail.scheme.description || '',
          ministry: detail.scheme.ministry || '',
          categoryId: detail.scheme.categoryId || 1,
          state: detail.scheme.state || '',
          benefitSummary: detail.scheme.benefitSummary || '',
          benefitAmount: detail.scheme.benefitAmount || '',
          applicationUrl: detail.scheme.applicationUrl || '',
          officialPortal: detail.scheme.officialPortal || '',
          isActive: detail.scheme.isActive,
          deadline: detail.scheme.deadline || '',
          sourceUrl: detail.scheme.sourceUrl || '',
          verifiedAt: detail.scheme.verifiedAt || '',
        })
        setRules(detail.rules || [])
        setDocuments(detail.documents || [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load scheme details.')
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [schemeId, isNew])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function updateField(key, value) {
    setScheme((s) => ({ ...s, [key]: value }))
  }

  function notify(msg) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  async function handleSaveScheme() {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        ...scheme,
        deadline: scheme.deadline || null,
        verifiedAt: scheme.verifiedAt || null,
      }
      if (currentId == null) {
        const created = await adminApi.createScheme(payload)
        setCurrentId(created.schemeId)
        notify('✓ Scheme created successfully! Now define eligibility rules & documents.')
        onSaved()
      } else {
        await adminApi.updateScheme(currentId, payload)
        notify('✓ Scheme master record saved!')
        onSaved()
      }
    } catch {
      setError('Save failed. Please review required fields.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate() {
    if (currentId == null) return
    if (!window.confirm('Deactivate this scheme? It will cease being matched to citizens.')) return
    await adminApi.deactivateScheme(currentId)
    onSaved()
    onClose()
  }

  // Rules handlers
  function addBlankRule() {
    setRules((r) => [
      ...r,
      {
        ruleId: null,
        draftKey: `d${draftKeySeq++}`,
        attributeName: RULE_ATTRIBUTES[0],
        operator: '=',
        value: '',
      },
    ])
  }

  async function saveRule(rule) {
    if (!rule.value?.trim()) return
    try {
      if (rule.ruleId == null) {
        const created = await adminApi.addRule(currentId, rule)
        setRules((rs) => rs.map((r) => (r === rule || r.draftKey === rule.draftKey ? created : r)))
        notify('✓ Rule condition added to deterministic engine')
      } else {
        const updated = await adminApi.updateRule(rule.ruleId, rule)
        setRules((rs) => rs.map((r) => (r.ruleId === rule.ruleId ? updated : r)))
        notify('✓ Rule condition updated')
      }
    } catch {
      setError('Failed to save rule condition.')
    }
  }

  async function removeRule(rule) {
    if (rule.ruleId == null) {
      setRules((rs) => rs.filter((r) => r.draftKey !== rule.draftKey))
      return
    }
    await adminApi.deleteRule(rule.ruleId)
    setRules((rs) => rs.filter((r) => r.ruleId !== rule.ruleId))
    notify('Rule condition removed')
  }

  function updateLocalRule(rule, key, value) {
    setRules((rs) => rs.map((r) => (r === rule ? { ...r, [key]: value } : r)))
  }

  // Documents handlers
  function addBlankDocument() {
    setDocuments((d) => [
      ...d,
      {
        docId: null,
        draftKey: `d${draftKeySeq++}`,
        documentName: '',
        documentCategory: 'ID Proof',
        mandatory: true,
      },
    ])
  }

  async function saveDocument(doc) {
    if (!doc.documentName?.trim()) return
    try {
      if (doc.docId == null) {
        const created = await adminApi.addDocument(currentId, doc)
        setDocuments((ds) => ds.map((d) => (d === doc || d.draftKey === doc.draftKey ? created : d)))
        notify('✓ Document mapped to scheme checklist')
      } else {
        const updated = await adminApi.updateDocument(doc.docId, doc)
        setDocuments((ds) => ds.map((d) => (d.docId === doc.docId ? updated : d)))
        notify('✓ Document requirement updated')
      }
    } catch {
      setError('Failed to save document requirement.')
    }
  }

  async function removeDocument(doc) {
    if (doc.docId == null) {
      setDocuments((ds) => ds.filter((d) => d.draftKey !== doc.draftKey))
      return
    }
    await adminApi.deleteDocument(doc.docId)
    setDocuments((ds) => ds.filter((d) => d.docId !== doc.docId))
    notify('Document requirement removed')
  }

  function updateLocalDocument(doc, key, value) {
    setDocuments((ds) => ds.map((d) => (d === doc ? { ...d, [key]: value } : d)))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-6xl max-h-[92vh] bg-slate-surface-elevated rounded-2xl shadow-2xl border border-slate-border flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Top Bar */}
        <div className="bg-chakra-blue text-on-primary px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-surface-container-lowest/15 flex items-center justify-center font-bold text-kesari-saffron-vibrant">
              <span className="material-symbols-outlined text-[22px]">policy</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline-sm font-bold text-on-primary">
                  {isNew ? 'Create New Welfare Scheme Master Record' : `Configure Scheme: ${scheme.name || `ID #${currentId}`}`}
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-kesari-saffron text-on-primary">
                  Rule Engine Config
                </span>
              </div>
              <span className="font-label-sm text-surface-variant">
                Eligibility Engine Rulebook &amp; Verification Document Matrix
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveScheme}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-kesari-saffron hover:bg-kesari-saffron-vibrant text-on-primary font-label-lg font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>{saving ? 'Saving…' : 'Save Scheme'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-surface-variant hover:text-on-primary hover:bg-surface-container-lowest/10 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Two-Column Layout */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-surface space-y-6">
          {toastMsg && (
            <div className="p-3 rounded-xl bg-harita-green-soft text-harita-green font-label-md font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{toastMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-error-container text-error font-label-md font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-20 text-center text-on-surface-variant font-label-lg">
              Loading scheme master configuration…
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Master Metadata & Statutory Details (5 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="bg-slate-surface-elevated rounded-xl p-5 shadow-sm border border-slate-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-border">
                    <span className="font-label-sm uppercase tracking-wider text-kesari-saffron font-bold">
                      Scheme Master Record
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="font-label-sm font-semibold text-on-surface-variant">
                        {scheme.isActive ? 'Active in Matching' : 'Deactivated'}
                      </span>
                      <input
                        type="checkbox"
                        checked={scheme.isActive}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                        className="w-5 h-5 rounded text-harita-green accent-harita-green cursor-pointer"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                      Statutory Scheme Title *
                    </label>
                    <input
                      type="text"
                      value={scheme.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                      placeholder="e.g. Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                        Category Classification
                      </label>
                      <select
                        value={scheme.categoryId}
                        onChange={(e) => updateField('categoryId', Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                        State (blank = Central)
                      </label>
                      <input
                        type="text"
                        value={scheme.state}
                        onChange={(e) => updateField('state', e.target.value)}
                        placeholder="Maharashtra"
                        className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                      Issuing Administrative Ministry / Department
                    </label>
                    <input
                      type="text"
                      value={scheme.ministry}
                      onChange={(e) => updateField('ministry', e.target.value)}
                      placeholder="e.g. Dept of Higher & Technical Education, Maharashtra"
                      className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                        Benefit Amount Display
                      </label>
                      <input
                        type="text"
                        value={scheme.benefitAmount}
                        onChange={(e) => updateField('benefitAmount', e.target.value)}
                        placeholder="e.g. ₹85,000 / year"
                        className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                        Application Filing Deadline
                      </label>
                      <input
                        type="date"
                        value={scheme.deadline || ''}
                        onChange={(e) => updateField('deadline', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                      Benefit &amp; Entitlement Summary
                    </label>
                    <textarea
                      rows={2}
                      value={scheme.benefitSummary}
                      onChange={(e) => updateField('benefitSummary', e.target.value)}
                      placeholder="Direct benefit transfer, full tuition fee reimbursement, etc."
                      className="w-full p-3 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm font-semibold text-chakra-blue mb-1">
                      Statutory Description
                    </label>
                    <textarea
                      rows={3}
                      value={scheme.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Comprehensive scheme objectives and gazette background."
                      className="w-full p-3 bg-slate-surface rounded-lg font-body-sm text-on-surface border border-slate-border focus:ring-2 focus:ring-chakra-blue outline-none"
                    />
                  </div>

                  {/* Gazette Provenance Anchor */}
                  <div className="bg-kesari-saffron-soft rounded-lg p-3.5 space-y-2 border border-kesari-saffron/20">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm uppercase tracking-wider text-kesari-saffron font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                        Gazette Provenance Anchor
                      </span>
                      <button
                        type="button"
                        onClick={() => updateField('verifiedAt', todayIso())}
                        className="text-xs font-bold text-chakra-blue hover:underline"
                      >
                        Audit Verify Today
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                      <div>
                        <span className="font-semibold text-on-surface-variant block mb-1">Portal URL</span>
                        <input
                          type="text"
                          value={scheme.applicationUrl}
                          onChange={(e) => updateField('applicationUrl', e.target.value)}
                          placeholder="https://mahadbt.maharashtra.gov.in"
                          className="w-full px-2.5 py-1.5 bg-slate-surface-elevated rounded border border-slate-border text-xs"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-on-surface-variant block mb-1">Gazette Source GR URL</span>
                        <input
                          type="text"
                          value={scheme.sourceUrl}
                          onChange={(e) => updateField('sourceUrl', e.target.value)}
                          placeholder="https://gr.maharashtra.gov.in/..."
                          className="w-full px-2.5 py-1.5 bg-slate-surface-elevated rounded border border-slate-border text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Documents Matrix */}
                <div className="bg-slate-surface-elevated rounded-xl p-5 shadow-sm border border-slate-border space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-border">
                    <div>
                      <span className="font-label-sm uppercase tracking-wider text-chakra-blue font-bold">
                        Required Documents Matrix
                      </span>
                      <h4 className="font-headline-sm font-bold text-chakra-blue mt-0.5">
                        Dossier Verification Mapping
                      </h4>
                    </div>
                    {currentId != null && (
                      <button
                        type="button"
                        onClick={addBlankDocument}
                        className="px-3 py-1.5 rounded-lg bg-chakra-blue-light text-chakra-blue font-label-md font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_circle</span>
                        <span>Map Document</span>
                      </button>
                    )}
                  </div>

                  {currentId == null ? (
                    <p className="font-body-sm text-on-surface-variant italic py-3 text-center">
                      Save this scheme first to map required documents into citizen checklists.
                    </p>
                  ) : documents.length === 0 ? (
                    <p className="font-body-sm text-on-surface-variant text-center py-4">
                      No documents mapped yet. Click "Map Document" above.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {documents.map((doc) => (
                        <div
                          key={doc.docId ?? doc.draftKey}
                          className="p-3 bg-surface-container-low rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-border/40"
                        >
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={doc.documentName}
                              onChange={(e) => updateLocalDocument(doc, 'documentName', e.target.value)}
                              placeholder="Document Name (e.g. State Domicile Certificate)"
                              className="w-full px-2.5 py-1 rounded bg-slate-surface-elevated font-body-sm font-semibold text-chakra-blue border border-slate-border"
                            />
                            <div className="flex items-center gap-2 pt-1 text-xs">
                              <select
                                value={doc.documentCategory || 'ID Proof'}
                                onChange={(e) => updateLocalDocument(doc, 'documentCategory', e.target.value)}
                                className="px-2 py-1 rounded bg-slate-surface-elevated border border-slate-border text-on-surface-variant"
                              >
                                <option value="ID Proof">ID Proof</option>
                                <option value="Income Proof">Income Proof</option>
                                <option value="Address Proof">Address Proof</option>
                                <option value="Bank Details">Bank Details</option>
                                <option value="Educational Certificate">Educational Certificate</option>
                                <option value="Photograph">Photograph</option>
                                <option value="Other">Other Category</option>
                              </select>
                              <label className="flex items-center gap-1 text-on-surface font-medium cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={doc.mandatory}
                                  onChange={(e) => updateLocalDocument(doc, 'mandatory', e.target.checked)}
                                  className="w-4 h-4 text-harita-green rounded accent-harita-green"
                                />
                                <span>Mandatory</span>
                              </label>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => saveDocument(doc)}
                              className="px-3 py-1 rounded bg-chakra-blue text-on-primary font-label-sm font-bold hover:bg-chakra-blue-subtle transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => removeDocument(doc)}
                              className="p-1 text-error hover:bg-error-container/40 rounded transition-colors cursor-pointer"
                              title="Delete requirement"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Structured Rule Evaluation Matrix (6 cols) */}
              <div className="lg:col-span-6 flex flex-col gap-6">
                <div className="bg-slate-surface-elevated rounded-xl p-5 shadow-sm border border-slate-border space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-sm uppercase tracking-wider text-chakra-blue font-bold">
                          Rule Evaluation Parsing
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-label-sm bg-chakra-blue-light text-chakra-blue font-mono font-bold">
                          EligibilityService Core
                        </span>
                      </div>
                      <h4 className="font-headline-sm font-bold text-chakra-blue mt-0.5">
                        Structured Rule Evaluation Matrix
                      </h4>
                    </div>

                    {currentId != null && (
                      <button
                        type="button"
                        onClick={addBlankRule}
                        className="px-3 py-1.5 rounded-lg bg-chakra-blue text-on-primary font-label-md font-bold hover:bg-chakra-blue-subtle transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Add Expression Rule</span>
                      </button>
                    )}
                  </div>

                  <p className="font-body-sm text-on-surface-variant">
                    Atomic rule conditions evaluate citizen profile snapshots deterministically (Section 5.1). All criteria must be satisfied for a Strong 100% match.
                  </p>

                  {currentId == null ? (
                    <p className="font-body-sm text-on-surface-variant italic py-6 text-center">
                      Save this scheme first to build structured rule evaluation logic.
                    </p>
                  ) : rules.length === 0 ? (
                    <div className="py-8 text-center text-on-surface-variant font-body-sm">
                      <span className="material-symbols-outlined text-[32px] text-chakra-blue mb-1 block">
                        rule
                      </span>
                      No eligibility rules configured yet. Click "Add Expression Rule" to define criteria.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rules.map((rule, idx) => (
                        <div
                          key={rule.ruleId ?? rule.draftKey}
                          className="p-3.5 bg-surface-container-low rounded-xl flex flex-col gap-2.5 shadow-sm border border-slate-border/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-chakra-blue text-on-primary flex items-center justify-center font-label-sm text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-label-md font-bold text-chakra-blue">
                                Predicate Condition
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => saveRule(rule)}
                                className="px-2.5 py-1 rounded bg-chakra-blue text-on-primary font-label-sm font-bold hover:bg-chakra-blue-subtle transition-colors cursor-pointer"
                              >
                                Save Rule
                              </button>
                              <button
                                type="button"
                                onClick={() => removeRule(rule)}
                                className="p-1 text-error hover:bg-error-container/40 rounded transition-colors cursor-pointer"
                                title="Delete Rule"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                            <div className="md:col-span-5">
                              <span className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5">
                                Attribute Name
                              </span>
                              <select
                                value={rule.attributeName}
                                onChange={(e) => updateLocalRule(rule, 'attributeName', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-surface-elevated rounded-lg font-mono text-xs text-chakra-blue font-bold border border-slate-border"
                              >
                                {RULE_ATTRIBUTES.map((attr) => (
                                  <option key={attr} value={attr}>
                                    {attr}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-3">
                              <span className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5 text-center">
                                Operator
                              </span>
                              <select
                                value={rule.operator}
                                onChange={(e) => updateLocalRule(rule, 'operator', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-surface-elevated rounded-lg font-mono text-xs text-kesari-saffron font-bold border border-slate-border text-center"
                              >
                                {RULE_OPERATORS.map((op) => (
                                  <option key={op} value={op}>
                                    {op}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="md:col-span-4">
                              <span className="block font-label-sm text-[11px] text-on-surface-variant mb-0.5">
                                Target Value
                              </span>
                              <input
                                type="text"
                                value={rule.value}
                                onChange={(e) => updateLocalRule(rule, 'value', e.target.value)}
                                placeholder="e.g. 800000 or 'MH'"
                                className="w-full px-2.5 py-1.5 bg-slate-surface-elevated rounded-lg font-mono text-xs text-on-surface font-semibold border border-slate-border"
                              />
                            </div>
                          </div>

                          <div className="text-[11px] font-label-sm text-on-surface-variant flex items-center gap-1 italic">
                            <span className="material-symbols-outlined text-[13px] text-kesari-saffron">
                              source
                            </span>
                            <span>
                              Evaluated in EligibilityService matching loop against citizen snapshot.
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {!isNew && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleDeactivate}
                      className="px-4 py-2 rounded-lg border border-error/40 text-error font-label-md font-bold hover:bg-error-container/20 transition-colors cursor-pointer"
                    >
                      Deactivate Scheme from Production
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
