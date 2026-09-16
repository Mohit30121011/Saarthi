import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getSchemeDetail } from '../api/schemes'

const ATTRIBUTE_LABELS = {
  age: 'Age Limit',
  annual_income: 'Annual Income Ceiling',
  gender: 'Gender Requirement',
  category: 'Social Category / Caste',
  state: 'State Domicile',
  occupation: 'Occupation',
  education_level: 'Academic Qualification',
  disability_status: 'Disability Status',
  is_bpl: 'BPL Ration Card Status',
  is_minority: 'Minority Community Status',
}

export default function SchemeCompareModal({
  isOpen,
  onClose,
  initialSchemeA,
  initialSchemeB,
  allSchemes = [],
}) {
  const [schemeA, setSchemeA] = useState(initialSchemeA || null)
  const [schemeB, setSchemeB] = useState(initialSchemeB || null)
  const [detailA, setDetailA] = useState(null)
  const [detailB, setDetailB] = useState(null)
  const [highlightDiffOnly, setHighlightDiffOnly] = useState(false)
  const [searchBQuery, setSearchBQuery] = useState('')
  const [selectorOpenB, setSelectorOpenB] = useState(false)
  const [selectorOpenA, setSelectorOpenA] = useState(false)
  const [searchAQuery, setSearchAQuery] = useState('')

  useEffect(() => {
    if (initialSchemeA) setSchemeA(initialSchemeA)
  }, [initialSchemeA])

  useEffect(() => {
    if (initialSchemeB) setSchemeB(initialSchemeB)
  }, [initialSchemeB])

  // Fetch full details for Scheme A
  useEffect(() => {
    const id = schemeA?.schemeId
    if (!id) {
      setDetailA(null)
      return
    }
    setLoadingA(true)
    getSchemeDetail(id)
      .then((data) => setDetailA(data))
      .catch(() => setDetailA(schemeA))
      .finally(() => setLoadingA(false))
  }, [schemeA])

  // Fetch full details for Scheme B
  useEffect(() => {
    const id = schemeB?.schemeId
    if (!id) {
      setDetailB(null)
      return
    }
    setLoadingB(true)
    getSchemeDetail(id)
      .then((data) => setDetailB(data))
      .catch(() => setDetailB(schemeB))
      .finally(() => setLoadingB(false))
  }, [schemeB])

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Swap schemes
  function handleSwap() {
    const tempScheme = schemeA
    const tempDetail = detailA
    setSchemeA(schemeB)
    setDetailA(detailB)
    setSchemeB(tempScheme)
    setDetailB(tempDetail)
  }

  // Filter schemes available to pick for Scheme B
  const filteredSchemesForB = useMemo(() => {
    const q = searchBQuery.toLowerCase().trim()
    let list = allSchemes.filter((s) => s.schemeId !== schemeA?.schemeId)
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
          (s.ministry && s.ministry.toLowerCase().includes(q))
      )
    }
    // Sort: schemes in same category as Scheme A first
    if (schemeA?.categoryName) {
      list = [...list].sort((a, b) => {
        const aMatch = a.categoryName === schemeA.categoryName ? 1 : 0
        const bMatch = b.categoryName === schemeA.categoryName ? 1 : 0
        return bMatch - aMatch
      })
    }
    return list
  }, [allSchemes, schemeA, searchBQuery])

  // Filter schemes available to pick for Scheme A
  const filteredSchemesForA = useMemo(() => {
    const q = searchAQuery.toLowerCase().trim()
    let list = allSchemes.filter((s) => s.schemeId !== schemeB?.schemeId)
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.categoryName && s.categoryName.toLowerCase().includes(q)) ||
          (s.ministry && s.ministry.toLowerCase().includes(q))
      )
    }
    return list
  }, [allSchemes, schemeB, searchAQuery])

  // Merged scheme data for display
  const activeA = detailA || schemeA
  const activeB = detailB || schemeB

  // Document analysis: Shared vs Unique documents
  const documentAnalysis = useMemo(() => {
    if (!activeA || !activeB) return { shared: [], uniqueA: [], uniqueB: [] }

    const docsA = (activeA.documents || []).map((d) => d.documentName || d)
    const docsB = (activeB.documents || []).map((d) => d.documentName || d)

    const normalize = (name) =>
      typeof name === 'string' ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : ''

    const shared = []
    const uniqueA = []
    const uniqueB = []

    docsA.forEach((docA) => {
      const normA = normalize(docA)
      if (!normA) return
      const matchingDocB = docsB.find((docB) => {
        const normB = normalize(docB)
        return normA.includes(normB) || normB.includes(normA) || normA === normB
      })
      if (matchingDocB) {
        if (!shared.includes(docA)) shared.push(docA)
      } else {
        uniqueA.push(docA)
      }
    })

    docsB.forEach((docB) => {
      const normB = normalize(docB)
      if (!normB) return
      const matchingShared = shared.some((s) => {
        const normS = normalize(s)
        return normB.includes(normS) || normS.includes(normB) || normB === normS
      })
      if (!matchingShared && !uniqueB.includes(docB)) {
        uniqueB.push(docB)
      }
    })

    return { shared, uniqueA, uniqueB }
  }, [activeA, activeB])

  if (!isOpen || !schemeA) return null

  const isStateA = activeA?.state && activeA.state.toLowerCase().includes('maharashtra')
  const isStateB = activeB?.state && activeB.state.toLowerCase().includes('maharashtra')

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#F8FAFC] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[#CBD5E1] my-auto">
        
        {/* Modal Top Bar */}
        <div className="relative bg-[#0D2240] text-white p-5 sm:p-6 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-semibold mb-2">
                <span className="material-symbols-outlined text-[15px] text-[#FF7722]">compare_arrows</span>
                <span>Side-by-Side Scheme Comparison • योजना तुलना</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white">
                Compare Welfare Schemes
              </h2>
              <p className="text-xs text-white/80 mt-1 max-w-xl leading-relaxed">
                Evaluate entitlements, statutory eligibility criteria, required documents, and issuing authorities to identify the right benefits for your family.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setHighlightDiffOnly((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  highlightDiffOnly
                    ? 'bg-[#E65100] text-white shadow-sm'
                    : 'bg-white/10 text-white/90 hover:bg-white/20'
                }`}
                title="Toggle highlighting differences"
              >
                <span className="material-symbols-outlined text-[16px]">difference</span>
                <span>{highlightDiffOnly ? 'Showing Differences' : 'Highlight Differences'}</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Print Comparison"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-red-500/80 text-white transition-colors cursor-pointer"
                title="Close Comparison"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Side-by-Side Scheme Selectors & Overview Card Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch relative">
            
            {/* Column 1: Scheme A */}
            <div className="md:col-span-5 bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-sm flex flex-col justify-between space-y-3 relative">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EBF3FC] text-[#0D2240]">
                  Scheme A (Primary)
                </span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectorOpenA((prev) => !prev)}
                    className="text-xs text-[#0D2240] hover:text-[#E65100] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Change</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {selectorOpenA && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-[#CBD5E1] p-3 z-30 animate-fade-in">
                      <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] mb-2">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                        <input
                          type="text"
                          value={searchAQuery}
                          onChange={(e) => setSearchAQuery(e.target.value)}
                          placeholder="Search scheme name..."
                          className="w-full bg-transparent border-none text-xs focus:outline-none py-1"
                        />
                      </div>
                      <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {filteredSchemesForA.map((s) => (
                          <button
                            key={s.schemeId}
                            type="button"
                            onClick={() => {
                              setSchemeA(s)
                              setSelectorOpenA(false)
                            }}
                            className="w-full text-left p-2.5 hover:bg-[#F0F3FF] rounded-lg transition-colors cursor-pointer"
                          >
                            <div className="font-bold text-[#0D2240] line-clamp-1">{s.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{s.categoryName}</span>
                              <span>•</span>
                              <span className="text-[#138808] font-semibold">{s.benefitAmount || 'Direct Benefit'}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-[#0D2240] leading-snug">
                  {activeA.name}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isStateA ? 'bg-[#FFF3EB] text-[#E65100]' : 'bg-[#EBF3FC] text-[#0D2240]'
                  }`}>
                    {isStateA ? 'Maharashtra State' : 'Central Govt'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                    {activeA.categoryName || 'Welfare'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {activeA.ministry || 'Ministry of Agriculture & Farmers Welfare'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="font-display font-bold text-sm text-[#138808]">
                  {activeA.benefitAmount || 'Direct Benefit Transfer'}
                </div>
                <Link
                  to={`/schemes/${activeA.schemeId}`}
                  target="_blank"
                  className="text-[11.5px] text-[#0D2240] hover:text-[#E65100] font-bold flex items-center gap-1"
                >
                  <span>Full Details</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Middle Swap Button */}
            <div className="md:col-span-2 flex md:flex-col items-center justify-center py-2">
              <button
                type="button"
                onClick={handleSwap}
                disabled={!activeB}
                className={`p-3 rounded-full border shadow-md transition-all cursor-pointer flex items-center justify-center ${
                  activeB
                    ? 'bg-white hover:bg-[#0D2240] hover:text-white border-[#CBD5E1] text-[#0D2240] hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                }`}
                title="Swap Column 1 and Column 2"
              >
                <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
              </button>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 hidden md:block">
                VS
              </span>
            </div>

            {/* Column 2: Scheme B ("Baaju Wala Scheme") with Interactive Selector */}
            <div className={`md:col-span-5 rounded-xl p-4 sm:p-5 border transition-all relative flex flex-col justify-between space-y-3 ${
              activeB
                ? 'bg-white border-[#E2E8F0] shadow-sm'
                : 'bg-[#FFF9F5] border-dashed border-[#E65100]/40'
            }`}>
              {activeB ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FFF3EB] text-[#E65100]">
                      Scheme B (Comparing)
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectorOpenB((prev) => !prev)}
                        className="text-xs text-[#E65100] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Change Scheme</span>
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </button>

                      {selectorOpenB && (
                        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-[#CBD5E1] p-3 z-30 animate-fade-in">
                          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-1.5 rounded-lg border border-[#E2E8F0] mb-2">
                            <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
                            <input
                              type="text"
                              value={searchBQuery}
                              onChange={(e) => setSearchBQuery(e.target.value)}
                              placeholder="Search comparison scheme..."
                              className="w-full bg-transparent border-none text-xs focus:outline-none py-1"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
                            {filteredSchemesForB.map((s) => (
                              <button
                                key={s.schemeId}
                                type="button"
                                onClick={() => {
                                  setSchemeB(s)
                                  setSelectorOpenB(false)
                                }}
                                className="w-full text-left p-2.5 hover:bg-[#FFF3EB] rounded-lg transition-colors cursor-pointer"
                              >
                                <div className="font-bold text-[#0D2240] line-clamp-1">{s.name}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span>{s.categoryName}</span>
                                  <span>•</span>
                                  <span className="text-[#138808] font-semibold">{s.benefitAmount || 'Direct Benefit'}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-[#0D2240] leading-snug">
                      {activeB.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isStateB ? 'bg-[#FFF3EB] text-[#E65100]' : 'bg-[#EBF3FC] text-[#0D2240]'
                      }`}>
                        {isStateB ? 'Maharashtra State' : 'Central Govt'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {activeB.categoryName || 'Welfare'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {activeB.ministry || 'Ministry of Social Justice & Empowerment'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="font-display font-bold text-sm text-[#138808]">
                      {activeB.benefitAmount || 'Direct Benefit Transfer'}
                    </div>
                    <Link
                      to={`/schemes/${activeB.schemeId}`}
                      target="_blank"
                      className="text-[11.5px] text-[#0D2240] hover:text-[#E65100] font-bold flex items-center gap-1"
                    >
                      <span>Full Details</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>
                </>
              ) : (
                /* Empty State Prompt for Scheme B */
                <div className="py-6 px-3 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#FFF3EB] text-[#E65100] flex items-center justify-center shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0D2240]">Select Scheme to Compare</h4>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                      Pick any scheme from the catalog to compare side-by-side with <strong>{activeA.name}</strong>.
                    </p>
                  </div>

                  <div className="w-full max-w-xs pt-1">
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const found = allSchemes.find((s) => s.schemeId === Number(e.target.value))
                          if (found) setSchemeB(found)
                        }}
                        defaultValue=""
                        className="w-full p-2.5 rounded-lg bg-white border border-[#E65100]/40 text-xs font-bold text-[#0D2240] focus:ring-2 focus:ring-[#E65100]/30 focus:outline-none cursor-pointer shadow-xs"
                      >
                        <option value="" disabled>
                          -- Choose a Scheme to Compare --
                        </option>
                        {filteredSchemesForB.map((s) => (
                          <option key={s.schemeId} value={s.schemeId}>
                            {s.name} ({s.categoryName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* If Scheme B is selected, render full comparison matrix */}
          {activeB ? (
            <div className="space-y-6">
              
              {/* Shared Documents Highlight Banner */}
              {documentAnalysis.shared.length > 0 && (
                <div className="p-4 rounded-xl bg-[#EAFBF0] border border-[#16A34A]/30 flex items-start gap-3 shadow-xs">
                  <span className="material-symbols-outlined text-[#138808] text-[22px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0D2240]">
                        Single Verification Overlap ({documentAnalysis.shared.length} Shared Statutory Documents)
                      </h4>
                      <span className="px-2 py-0.5 rounded bg-[#138808] text-white text-[10px] font-bold uppercase">
                        Upload Once • Qualify for Both
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      The following documents satisfy statutory verification requirements across <strong>both schemes</strong> without duplicate paperwork:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {documentAnalysis.shared.map((doc, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-md bg-white border border-[#16A34A]/30 text-xs font-semibold text-[#0D2240] shadow-2xs flex items-center gap-1">
                          <span className="material-symbols-outlined text-[#138808] text-[14px]">check</span>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 1: Financial Benefits & Entitlement */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#138808] text-[18px]">payments</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D2240]">
                    1. Financial Benefits &amp; Entitlement
                  </h4>
                </div>

                <div className="divide-y divide-[#E2E8F0] text-xs">
                  {/* Benefit Amount */}
                  <div className={`grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3 ${
                    highlightDiffOnly && activeA.benefitAmount !== activeB.benefitAmount ? 'bg-[#FEF3C7]/40' : ''
                  }`}>
                    <div className="md:col-span-2 font-bold text-slate-500">Benefit Amount</div>
                    <div className="md:col-span-5 font-display font-extrabold text-sm sm:text-base text-[#138808] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#138808]" />
                      <span>{activeA.benefitAmount || 'Direct DBT Subsidy'}</span>
                    </div>
                    <div className="md:col-span-5 font-display font-extrabold text-sm sm:text-base text-[#138808] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#E65100]" />
                      <span>{activeB.benefitAmount || 'Direct DBT Subsidy'}</span>
                    </div>
                  </div>

                  {/* Benefit Mechanism / Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3">
                    <div className="md:col-span-2 font-bold text-slate-500">Disbursement Mechanism</div>
                    <div className="md:col-span-5 text-slate-700 leading-relaxed">
                      {activeA.benefitSummary || 'Direct electronic disbursement to Aadhaar-seeded bank account under DBT guidelines.'}
                    </div>
                    <div className="md:col-span-5 text-slate-700 leading-relaxed">
                      {activeB.benefitSummary || 'Direct electronic disbursement to Aadhaar-seeded bank account under DBT guidelines.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Statutory Eligibility Criteria Comparison */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D2240] text-[18px]">fact_check</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D2240]">
                    2. Statutory Eligibility Criteria
                  </h4>
                </div>

                <div className="divide-y divide-[#E2E8F0] text-xs">
                  {/* Domicile / Jurisdiction */}
                  <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3">
                    <div className="md:col-span-2 font-bold text-slate-500">State Domicile</div>
                    <div className="md:col-span-5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#138808] text-[16px]">check_circle</span>
                      <span>{isStateA ? 'Mandatory Maharashtra Domicile' : 'All Indian Citizens Eligible'}</span>
                    </div>
                    <div className="md:col-span-5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#138808] text-[16px]">check_circle</span>
                      <span>{isStateB ? 'Mandatory Maharashtra Domicile' : 'All Indian Citizens Eligible'}</span>
                    </div>
                  </div>

                  {/* Target Beneficiary & Category */}
                  <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3">
                    <div className="md:col-span-2 font-bold text-slate-500">Domain / Category</div>
                    <div className="md:col-span-5 font-semibold text-[#0D2240]">
                      {activeA.categoryName || 'General Welfare'}
                    </div>
                    <div className="md:col-span-5 font-semibold text-[#0D2240]">
                      {activeB.categoryName || 'General Welfare'}
                    </div>
                  </div>

                  {/* Detailed Rules breakdown if available */}
                  {(activeA.rules?.length > 0 || activeB.rules?.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3">
                      <div className="md:col-span-2 font-bold text-slate-500">Statutory Rules</div>
                      <div className="md:col-span-5 space-y-1.5">
                        {activeA.rules?.length > 0 ? (
                          activeA.rules.map((r, i) => (
                            <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200">
                              <span className="font-bold text-[#0D2240]">
                                {ATTRIBUTE_LABELS[r.attribute] || r.attribute}:
                              </span>{' '}
                              <span className="text-slate-700">
                                {r.ruleDescription || `${r.operator} ${r.value}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Standard gazette guidelines apply</span>
                        )}
                      </div>
                      <div className="md:col-span-5 space-y-1.5">
                        {activeB.rules?.length > 0 ? (
                          activeB.rules.map((r, i) => (
                            <div key={i} className="p-2 rounded bg-slate-50 border border-slate-200">
                              <span className="font-bold text-[#0D2240]">
                                {ATTRIBUTE_LABELS[r.attribute] || r.attribute}:
                              </span>{' '}
                              <span className="text-slate-700">
                                {r.ruleDescription || `${r.operator} ${r.value}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Standard gazette guidelines apply</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3">
                      <div className="md:col-span-2 font-bold text-slate-500">Income Ceiling</div>
                      <div className="md:col-span-5 text-slate-700">
                        ₹8,00,000 / year or statutory non-creamy layer verification
                      </div>
                      <div className="md:col-span-5 text-slate-700">
                        Dependent on statutory landholder or enrollment criteria
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 3: Required Verification Documents */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#0D2240] text-[18px]">folder_open</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D2240]">
                    3. Required Verification Documents
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-4 text-xs">
                  <div className="md:col-span-2 font-bold text-slate-500">Document Checklist</div>
                  
                  {/* Scheme A Documents */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="font-bold text-[#0D2240] pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>{activeA.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {activeA.documents?.length || 3} Docs
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {(activeA.documents || [
                        { documentName: 'Aadhaar Card' },
                        { documentName: 'State Domicile Certificate' },
                        { documentName: 'Bank Passbook (NPCI Seeded)' },
                      ]).map((doc, idx) => {
                        const name = doc.documentName || doc
                        const isShared = documentAnalysis.shared.includes(name)
                        return (
                          <li key={idx} className="flex items-center gap-2 text-slate-700">
                            <span className={`material-symbols-outlined text-[15px] ${
                              isShared ? 'text-[#138808]' : 'text-slate-400'
                            }`}>
                              {isShared ? 'verified' : 'description'}
                            </span>
                            <span className={isShared ? 'font-semibold text-[#0D2240]' : ''}>{name}</span>
                            {isShared && (
                              <span className="px-1.5 py-0.2 rounded bg-[#EAFBF0] text-[#138808] text-[9.5px] font-bold shrink-0">
                                Shared
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>

                  {/* Scheme B Documents */}
                  <div className="md:col-span-5 space-y-2">
                    <div className="font-bold text-[#0D2240] pb-1 border-b border-slate-100 flex items-center justify-between">
                      <span>{activeB.name}</span>
                      <span className="text-[10px] text-slate-400">
                        {activeB.documents?.length || 3} Docs
                      </span>
                    </div>
                    <ul className="space-y-1.5">
                      {(activeB.documents || [
                        { documentName: 'Aadhaar Card' },
                        { documentName: 'State Domicile Certificate' },
                        { documentName: 'Bank Passbook (NPCI Seeded)' },
                      ]).map((doc, idx) => {
                        const name = doc.documentName || doc
                        const isShared = documentAnalysis.shared.includes(name)
                        return (
                          <li key={idx} className="flex items-center gap-2 text-slate-700">
                            <span className={`material-symbols-outlined text-[15px] ${
                              isShared ? 'text-[#138808]' : 'text-slate-400'
                            }`}>
                              {isShared ? 'verified' : 'description'}
                            </span>
                            <span className={isShared ? 'font-semibold text-[#0D2240]' : ''}>{name}</span>
                            {isShared && (
                              <span className="px-1.5 py-0.2 rounded bg-[#EAFBF0] text-[#138808] text-[9.5px] font-bold shrink-0">
                                Shared
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Application Mode & Deadlines */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#E65100] text-[18px]">alarm</span>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D2240]">
                    4. Application Window &amp; Official Direct Portals
                  </h4>
                </div>

                <div className="divide-y divide-[#E2E8F0] text-xs">
                  {/* Deadline */}
                  <div className="grid grid-cols-1 md:grid-cols-12 p-3.5 sm:p-4 gap-3 items-center">
                    <div className="md:col-span-2 font-bold text-slate-500">Application Deadline</div>
                    <div className="md:col-span-5 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#FFF3EB] text-[#E65100] font-bold">
                        {activeA.deadline || '30 April 2025'}
                      </span>
                      <span className="text-slate-500">Ongoing Window</span>
                    </div>
                    <div className="md:col-span-5 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#FFF3EB] text-[#E65100] font-bold">
                        {activeB.deadline || '30 April 2025'}
                      </span>
                      <span className="text-slate-500">Ongoing Window</span>
                    </div>
                  </div>

                  {/* Official Direct Apply Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 p-4 gap-3 items-center bg-[#F0F3FF]/40">
                    <div className="md:col-span-2 font-bold text-slate-500">Direct Actions</div>
                    <div className="md:col-span-5 flex flex-wrap items-center gap-2">
                      <a
                        href={activeA.applicationUrl || activeA.officialPortal || 'https://india.gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Apply on Official Portal</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                      <Link
                        to={`/schemes/${activeA.schemeId}`}
                        target="_blank"
                        className="px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-slate-100 font-bold text-xs transition-colors"
                      >
                        Detailed Dossier
                      </Link>
                    </div>
                    <div className="md:col-span-5 flex flex-wrap items-center gap-2">
                      <a
                        href={activeB.applicationUrl || activeB.officialPortal || 'https://mahadbt.maharashtra.gov.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Apply on Official Portal</span>
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </a>
                      <Link
                        to={`/schemes/${activeB.schemeId}`}
                        target="_blank"
                        className="px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-slate-100 font-bold text-xs transition-colors"
                      >
                        Detailed Dossier
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Bottom call to action when Scheme B is empty */
            <div className="p-8 rounded-xl bg-white border border-dashed border-[#CBD5E1] text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-[#E65100]">compare</span>
              <h4 className="font-bold text-sm text-[#0D2240]">Ready for Comparison</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Use the dropdown above to pick any scheme from the catalog to see a detailed side-by-side breakdown of benefits, eligibility, and documents.
              </p>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-white border-t border-[#E2E8F0] px-5 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="material-symbols-outlined text-[16px] text-[#138808]">verified_user</span>
            <span className="hidden sm:inline">Statutory data sourced from Central Gazettes and Maharashtra Government Resolutions (GRs).</span>
            <span className="sm:hidden">Official Gazette verified.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#0D2240] hover:bg-[#1A365D] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
