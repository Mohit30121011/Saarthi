import { useState, useEffect, useMemo } from 'react'
import { simulateMatches } from '../api/match'
import SchemeCard from './SchemeCard'
import { SCHEME_INCOME_CEILINGS, getSimulationTag } from '../utils/simulationCeilings'

const PRESET_SCENARIOS = [
  {
    label: '₹1.0 Lakh',
    value: 100000,
    badge: 'BPL / Deep Welfare',
    desc: 'Unlocks MJPJAY Free Health Cover, Pre-Matric Minorities & BPL ration priority',
  },
  {
    label: '₹2.5 Lakh',
    value: 250000,
    badge: 'Scholarship Cap',
    desc: 'Unlocks PM YASASVI and SC Post-Matric Full Fee Reimbursements',
  },
  {
    label: '₹3.5 Lakh',
    value: 350000,
    badge: 'NMMS Merit Tier',
    desc: 'National Means-cum-Merit scholarship ceiling for secondary schoolers',
  },
  {
    label: '₹5.0 Lakh',
    value: 500000,
    badge: 'Middle Welfare (User Scenario)',
    desc: 'Comprehensive middle-class cover, expanded MJPJAY & Central Sector college aid',
  },
  {
    label: '₹8.0 Lakh',
    value: 800000,
    badge: 'EWS & AICTE Ceiling',
    desc: 'AICTE Pragati for Girls, Saksham for PwD & Maharashtra EBC professional tuition',
  },
  {
    label: '₹9.0 Lakh',
    value: 900000,
    badge: 'PMAY-U Housing',
    desc: 'Pradhan Mantri Awas Yojana Urban 2.0 housing interest subsidies',
  },
]

export default function WhatIfSimulator({
  profile,
  bookmarkedIds = new Set(),
  onBookmarkChange,
}) {
  const registeredIncome = useMemo(() => {
    return profile?.annualIncome ? Number(profile.annualIncome) : 300000
  }, [profile])

  // Default simulation: if profile exists, use it or fallback to 500000
  const [simIncome, setSimIncome] = useState(500000)
  const [simulationData, setSimulationData] = useState(null)
  const [loading, setLoading] = useState(false)
  // Default to 'all' so all qualified real schemes are displayed immediately on screen!
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'unlocked' | 'retained' | 'disqualified'

  useEffect(() => {
    let active = true
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const res = await simulateMatches({ annualIncome: simIncome })
        if (active) {
          setSimulationData(res)
        }
      } catch (err) {
        console.error('Simulation error:', err)
      } finally {
        if (active) setLoading(false)
      }
    }, 200)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [simIncome])

  const incomeDelta = simIncome - registeredIncome
  const deltaFormatted = Math.abs(incomeDelta).toLocaleString('en-IN')

  const newlyUnlocked = simulationData?.newlyUnlocked || []
  const allMatches = simulationData?.matches || []
  const retained = simulationData?.retained || []
  const lost = simulationData?.lost || []

  // Map newly unlocked schemes by schemeId for quick lookup
  const newlyUnlockedMap = useMemo(() => {
    const map = new Map()
    for (const item of newlyUnlocked) {
      const sId = item.match?.scheme?.schemeId
      if (sId) {
        map.set(sId, item)
      }
    }
    return map
  }, [newlyUnlocked])

  // List to display according to active tab - NEVER return empty if allMatches exists!
  const displayedSchemes = useMemo(() => {
    if (activeTab === 'disqualified') {
      return lost.map((m) => {
        const ceiling = SCHEME_INCOME_CEILINGS[m.scheme?.schemeId]
        const excess = ceiling && simIncome > ceiling ? simIncome - ceiling : null
        return {
          ...m,
          ceilingValue: ceiling,
          excessValue: excess,
          isDisqualified: true,
          isOpportunity: false,
        }
      })
    }
    if (activeTab === 'unlocked') {
      if (newlyUnlocked.length === 0) {
        return allMatches.map((m) => ({ ...m, isOpportunity: false }))
      }
      return newlyUnlocked.map((item) => ({
        ...item.match,
        ceilingRule: item.ceilingRule,
        ceilingValue: item.ceilingValue,
        isOpportunity: true,
      }))
    }
    if (activeTab === 'retained') {
      return retained.map((m) => {
        const ceiling = SCHEME_INCOME_CEILINGS[m.scheme?.schemeId]
        return {
          ...m,
          ceilingValue: ceiling,
          isOpportunity: false,
        }
      })
    }
    // 'all' tab: display all real schemes, flagging newly unlocked ones with isOpportunity: true
    return allMatches.map((m) => {
      const opp = newlyUnlockedMap.get(m.scheme?.schemeId)
      const ceiling = opp?.ceilingValue || SCHEME_INCOME_CEILINGS[m.scheme?.schemeId]
      if (opp) {
        return {
          ...m,
          ceilingRule: opp.ceilingRule,
          ceilingValue: ceiling,
          isOpportunity: true,
        }
      }
      return {
        ...m,
        ceilingValue: ceiling,
        isOpportunity: false,
      }
    })
  }, [activeTab, newlyUnlocked, retained, allMatches, lost, simIncome, newlyUnlockedMap])

  // Pagination: 2 rows of 3 columns = 6 items per page
  const ITEMS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

  // Reset to page 1 whenever active tab or simulated income changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, simIncome])

  const totalPages = Math.ceil(displayedSchemes.length / ITEMS_PER_PAGE) || 1
  const paginatedSchemes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return displayedSchemes.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [displayedSchemes, currentPage])

  return (
    <div className="w-full bg-slate-surface-elevated rounded-2xl border border-slate-border shadow-sm overflow-hidden">
      {/* Decorative Tricolor Accent Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

      {/* Header Banner */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-[#FFF8F1] via-[#FFFDF9] to-[#F8FAFC] text-[#0D2240] border-b border-[#FED7AA]/60 relative overflow-hidden">
        {/* Background Subtle Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <span className="material-symbols-outlined text-[180px] text-[#E65100]">tune</span>
        </div>

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E65100] text-white font-label-sm text-[11px] font-bold uppercase tracking-wider shadow-2xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              What-If Scenario Simulator
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FFF3EB] text-[#E65100] font-label-sm text-[11px] font-semibold border border-[#E65100]/20">
              अवसर एवं परिदृश्य सिमुलेटर
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAFBF0] text-[#138808] font-label-sm text-[11px] font-semibold border border-[#16A34A]/20">
              Read-Only Safe Simulation
            </span>
          </div>

          <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-[#0D2240]">
            Simulate Alternative Scenarios &amp; Broaden Your Entitlement Horizon
          </h2>

          <p className="text-sm text-[#475569] leading-relaxed font-sans">
            Ever wondered: <strong className="text-[#E65100]">"What if my reported annual income was ₹5 Lakh or ₹2.5 Lakh instead?"</strong> Adjust the slider or select quick policy thresholds below to discover newly unlocked benefits and explore schemes with higher or lower statutory income ceilings—without altering your official citizen dossier.
          </p>
        </div>
      </div>

      {/* Interactive Controls & Scenario Sliders */}
      <div className="p-6 md:p-8 space-y-6 bg-slate-surface border-b border-slate-border">
        {/* Scenario Presets Row */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-[#0D2240] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#E65100]">bolt</span>
              <span>Quick Statutory Ceilings &amp; Income Scenarios:</span>
            </label>
            <button
              onClick={() => setSimIncome(registeredIncome)}
              type="button"
              className="text-xs text-[#E65100] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              <span>Reset to Baseline (₹{registeredIncome.toLocaleString('en-IN')})</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PRESET_SCENARIOS.map((sc) => {
              const isSelected = simIncome === sc.value
              return (
                <button
                  key={sc.value}
                  type="button"
                  onClick={() => setSimIncome(sc.value)}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0D2240] text-white border-[#0D2240] shadow-md ring-2 ring-[#E65100]/30 scale-[1.02]'
                      : 'bg-white text-[#111C2D] border-slate-border hover:border-[#0D2240]/40 hover:bg-[#F0F3FF]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`font-display font-bold text-sm ${isSelected ? 'text-white' : 'text-[#0D2240]'}`}>
                        {sc.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold block mt-0.5 ${isSelected ? 'text-[#FF7722]' : 'text-[#E65100]'}`}>
                      {sc.badge}
                    </span>
                  </div>
                  <p className={`text-[10.5px] mt-2 line-clamp-2 leading-tight ${isSelected ? 'text-white/80' : 'text-[#44474E]'}`}>
                    {sc.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Custom Range Slider & Input Box */}
        <div className="bg-white p-5 rounded-xl border border-slate-border shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0D2240]">Simulated Annual Household Income:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#EBF3FC] text-[#0D2240] font-mono font-bold text-sm border border-[#DEE8FF]">
                  ₹{Number(simIncome).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs text-[#44474E] mt-0.5">
                Official Registered Income: <strong className="text-[#0D2240]">₹{registeredIncome.toLocaleString('en-IN')}</strong> / year
              </p>
            </div>

            {/* Direct Rupees Number Input */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#44474E] font-medium">Custom Amount:</span>
              <div className="relative flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2.5 h-9 focus-within:border-[#0D2240] focus-within:ring-2 focus-within:ring-[#0D2240]/10">
                <span className="font-bold text-xs text-[#44474E] mr-1">₹</span>
                <input
                  type="number"
                  min="0"
                  max="2000000"
                  step="10000"
                  value={simIncome}
                  onChange={(e) => setSimIncome(Number(e.target.value) || 0)}
                  className="w-28 bg-transparent text-xs text-[#0D2240] font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* Range Slider */}
          <div className="space-y-1.5 pt-1">
            <input
              type="range"
              min="50000"
              max="1200000"
              step="25000"
              value={simIncome}
              onChange={(e) => setSimIncome(Number(e.target.value))}
              className="w-full h-2 bg-[#DEE8FF] rounded-lg appearance-none cursor-pointer accent-[#E65100]"
            />
            <div className="flex justify-between text-[10.5px] font-bold text-[#44474E]">
              <span>₹50,000 (Low-Income)</span>
              <span>₹3,00,000</span>
              <span className="text-[#E65100]">₹5,00,000 (Current Simulation)</span>
              <span>₹8,00,000 (EWS Cap)</span>
              <span>₹12,00,000 (Upper Bracket)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Delta Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EBF3FC] text-[#0D2240] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#44474E] font-medium block truncate">Income Differential</span>
              <div className="font-bold text-sm text-[#0D2240] truncate">
                {incomeDelta === 0 ? (
                  <span>Exact Match</span>
                ) : incomeDelta > 0 ? (
                  <span className="text-[#138808]">+{deltaFormatted}</span>
                ) : (
                  <span className="text-[#E65100]">-{deltaFormatted}</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EAFBF0] text-[#138808] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">checklist</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#44474E] font-medium block truncate">Qualified Schemes</span>
              <span className="font-bold text-base text-[#0D2240]">
                {simulationData?.simulatedMatchesCount ?? allMatches.length} Schemes
              </span>
            </div>
          </div>

          {/* Disqualified Schemes Stat Card */}
          <div className={`p-3.5 sm:p-4 rounded-xl border shadow-xs flex items-center gap-3 transition-colors ${
            lost.length > 0
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-white border-slate-border'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              lost.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="material-symbols-outlined text-[20px]">block</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#44474E] font-medium block truncate">Disqualified (Lost)</span>
              <span className={`font-bold text-base ${lost.length > 0 ? 'text-rose-700' : 'text-[#0D2240]'}`}>
                {lost.length} Ineligible
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFF3EB] text-[#E65100] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">stars</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#44474E] font-medium block truncate">Newly Unlocked</span>
              <span className="font-bold text-base text-[#E65100]">
                {newlyUnlocked.length} Opportunity
              </span>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F3FF] text-[#0D2240] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
            <div className="min-w-0">
              <span className="text-[11px] text-[#44474E] font-medium block truncate">Retained Baseline</span>
              <span className="font-bold text-base text-[#0D2240]">
                {retained.length} Valid
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="p-4 sm:p-6 bg-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-border">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#0D2240] text-white shadow-xs'
                : 'text-[#0D2240] hover:bg-[#F0F3FF]'
            }`}
          >
            <span>All Valid Schemes (₹{Number(simIncome).toLocaleString('en-IN')})</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'all' ? 'bg-[#138808] text-white' : 'bg-[#DEE8FF] text-[#0D2240]'
            }`}>
              {allMatches.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('disqualified')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'disqualified'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">block</span>
            <span>Disqualified at this Income</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              lost.length > 0
                ? activeTab === 'disqualified'
                  ? 'bg-white/20 text-white'
                  : 'bg-rose-600 text-white animate-pulse'
                : activeTab === 'disqualified'
                ? 'bg-white/20 text-white'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {lost.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unlocked')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'unlocked'
                ? 'bg-[#0D2240] text-white shadow-xs'
                : 'text-[#0D2240] hover:bg-[#F0F3FF]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#E65100]">auto_awesome</span>
            <span>Newly Unlocked Horizon</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              newlyUnlocked.length > 0
                ? 'bg-[#E65100] text-white animate-pulse'
                : activeTab === 'unlocked'
                ? 'bg-white/20 text-white'
                : 'bg-[#EBF3FC] text-[#0D2240]'
            }`}>
              {newlyUnlocked.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retained')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'retained'
                ? 'bg-[#0D2240] text-white shadow-xs'
                : 'text-[#0D2240] hover:bg-[#F0F3FF]'
            }`}
          >
            <span>Retained Schemes</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'retained' ? 'bg-white/20 text-white' : 'bg-[#DEE8FF] text-[#0D2240]'
            }`}>
              {retained.length}
            </span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-xs text-[#E65100] font-bold animate-pulse">
            <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
            <span>Evaluating rules against ₹{simIncome.toLocaleString('en-IN')}…</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-[#138808] font-bold">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{displayedSchemes.length} Schemes Verified from Database</span>
          </div>
        )}
      </div>

      {/* Results Content Area */}
      <div className="p-6 md:p-8">
        {loading && !simulationData ? (
          <div className="py-12 text-center space-y-3">
            <span className="material-symbols-outlined text-[36px] text-[#0D2240] animate-spin">
              progress_activity
            </span>
            <p className="text-sm font-bold text-[#0D2240]">
              Simulating entitlement criteria against active welfare gazettes…
            </p>
          </div>
        ) : displayedSchemes.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-3 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-[#DEE8FF] text-[#0D2240] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[24px]">info</span>
            </div>
            <h3 className="font-display font-bold text-base text-[#0D2240]">
              {activeTab === 'disqualified'
                ? 'No Disqualified Schemes in this Bracket'
                : 'No Matching Schemes in this Specific Bracket'}
            </h3>
            <p className="text-xs text-[#44474E] leading-relaxed">
              {activeTab === 'disqualified'
                ? `At ₹${Number(simIncome).toLocaleString('en-IN')}, no previously matched schemes are disqualified by income ceilings.`
                : `At ₹${Number(simIncome).toLocaleString('en-IN')}, try selecting another preset (like ₹2.5 Lakh, ₹5.0 Lakh, or ₹8.0 Lakh) to view applicable welfare programs.`}
            </p>
            <button
              onClick={() => {
                setActiveTab('all')
                setSimIncome(registeredIncome || 500000)
              }}
              className="px-4 py-2 rounded-lg bg-[#0D2240] text-white text-xs font-bold hover:bg-[#1A365D] transition-all cursor-pointer"
            >
              Reset to Baseline (₹{registeredIncome.toLocaleString('en-IN')})
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Higher Income Disqualification Impact Alert */}
            {incomeDelta > 0 && lost.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-900 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0">
                    warning
                  </span>
                  <div>
                    <span className="font-bold text-rose-800 text-sm block mb-0.5">
                      Statutory Income Ceiling Impact: {lost.length} Scheme{lost.length === 1 ? '' : 's'} Exceed Limit at ₹{Number(simIncome).toLocaleString('en-IN')}
                    </span>
                    <span className="text-rose-900/80 leading-relaxed">
                      At this higher simulated income (+₹{deltaFormatted}), your household exceeds the statutory income ceilings for {lost.length} targeted schemes. <strong>{allMatches.length} schemes remain fully valid</strong> (including universal welfare programs with no income ceiling).
                    </span>
                  </div>
                </div>
                {activeTab !== 'disqualified' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('disqualified')}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-rose-700 text-white font-bold text-xs hover:bg-rose-800 cursor-pointer shadow-2xs flex items-center gap-1 self-start sm:self-auto whitespace-nowrap"
                  >
                    <span>View Disqualified Schemes ({lost.length})</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                )}
              </div>
            )}

            {/* Disqualified Tab Context Header */}
            {activeTab === 'disqualified' && (
              <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                <span className="material-symbols-outlined text-rose-600 text-[22px] shrink-0">
                  block
                </span>
                <div>
                  <span className="font-bold text-rose-900 text-sm block mb-0.5">
                    Showing {displayedSchemes.length} Schemes Disqualified at ₹{Number(simIncome).toLocaleString('en-IN')}
                  </span>
                  <span className="text-rose-800 leading-relaxed">
                    These schemes are restricted to lower income brackets by government gazettes. Each card below shows its official statutory ceiling and how much your simulated income exceeds it.
                  </span>
                </div>
              </div>
            )}

            {/* Contextual Guidance Banner for Newly Unlocked */}
            {activeTab !== 'disqualified' && newlyUnlocked.length > 0 ? (
              <div className="p-4 rounded-xl bg-[#FFF3EB] border border-[#E65100]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#0D2240] shadow-xs">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#E65100] text-[22px] shrink-0">
                    auto_awesome
                  </span>
                  <div>
                    <span className="font-bold text-[#E65100] text-sm block mb-0.5">
                      Horizon Discovery: {newlyUnlocked.length} New Opportunity Scheme{newlyUnlocked.length === 1 ? '' : 's'} Unlocked at ₹{Number(simIncome).toLocaleString('en-IN')}!
                    </span>
                    <span className="text-[#44474E]">
                      Under this simulated scenario, your household falls within lower statutory income ceilings, unlocking these additional high-impact scholarships and welfare benefits.
                    </span>
                  </div>
                </div>
                {activeTab !== 'unlocked' && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('unlocked')}
                    className="shrink-0 px-3.5 py-1.5 rounded-lg bg-[#E65100] text-white font-bold text-xs hover:bg-[#FF7722] cursor-pointer shadow-2xs flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View Newly Unlocked ({newlyUnlocked.length})</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                )}
              </div>
            ) : simIncome === registeredIncome && activeTab !== 'disqualified' ? (
              <div className="p-4 rounded-xl bg-[#EAFBF0] border border-[#16A34A]/30 flex items-start gap-3 text-xs text-[#0D2240] shadow-xs">
                <span className="material-symbols-outlined text-[#138808] text-[22px] shrink-0">
                  verified
                </span>
                <div>
                  <span className="font-bold text-[#138808] text-sm block mb-0.5">
                    Official Baseline Scenario Active: All {allMatches.length} Matched Schemes Displayed
                  </span>
                  <span className="text-[#44474E] leading-relaxed">
                    The simulated income (₹{Number(simIncome).toLocaleString('en-IN')}) matches your registered citizen profile. All <strong>{allMatches.length} verified schemes</strong> are listed below. Click the quick scenario presets above (e.g. <strong>₹2.5 Lakh</strong>, <strong>₹1.0 Lakh</strong>, or <strong>₹8.0 Lakh</strong>) or drag the slider to explore other statutory income brackets!
                  </span>
                </div>
              </div>
            ) : null}

            {/* List Header Strip */}
            <div id="whatif-schemes-list" className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-border">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  activeTab === 'disqualified' ? 'bg-rose-600' : 'bg-[#16A34A]'
                }`} />
                <span className="text-xs font-bold text-[#0D2240] uppercase tracking-wider">
                  {activeTab === 'disqualified'
                    ? `Disqualified Schemes (${displayedSchemes.length})`
                    : activeTab === 'unlocked' && newlyUnlocked.length > 0
                    ? `Newly Unlocked Schemes (${displayedSchemes.length})`
                    : activeTab === 'retained'
                    ? `Retained Schemes (${displayedSchemes.length})`
                    : `All Valid Schemes (${displayedSchemes.length})`}
                </span>
                <span className="text-[11px] text-[#44474E] hidden sm:inline">
                  • Evaluated Live from Saarthi Welfare Catalog
                </span>
              </div>
              <div className="text-xs text-[#44474E]">
                Showing <strong className="text-[#0D2240]">
                  {displayedSchemes.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, displayedSchemes.length)}
                </strong> of{' '}
                <strong className="text-[#0D2240]">{displayedSchemes.length}</strong> schemes (2 rows per page)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedSchemes.map((item) => {
                const simTag = getSimulationTag(item, simIncome, activeTab === 'disqualified')
                const ceiling = item.ceilingValue || SCHEME_INCOME_CEILINGS[item.scheme?.schemeId]
                return (
                  <SchemeCard
                    key={item.scheme.schemeId}
                    scheme={item.scheme}
                    confidence={item.confidence}
                    missingFields={item.missingFields}
                    profile={{ ...profile, annualIncome: simIncome }}
                    bookmarked={bookmarkedIds.has(item.scheme.schemeId)}
                    onBookmarkChange={onBookmarkChange}
                    simulationTag={simTag}
                    horizonBadge={
                      simTag.type === 'disqualified'
                        ? (ceiling
                            ? `Statutory Cap: ₹${Number(ceiling).toLocaleString('en-IN')}`
                            : 'Income Exceeded')
                        : ceiling
                        ? `Statutory Cap: ₹${Number(ceiling).toLocaleString('en-IN')}`
                        : 'Universal Access (No Cap)'
                    }
                    isOpportunity={item.isOpportunity}
                  />
                )
              })}
            </div>

            {/* Pagination Controls - Offset to never be blocked by floating AI assistant */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 pb-6 border-t border-slate-border">
                <div className="text-xs font-semibold text-[#44474E]">
                  Showing schemes <strong className="text-[#0D2240]">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, displayedSchemes.length)}
                  </strong> of <strong className="text-[#0D2240]">{displayedSchemes.length}</strong> • Page <strong className="text-[#0D2240]">{currentPage}</strong> of <strong className="text-[#0D2240]">{totalPages}</strong>
                </div>

                <div className="flex items-center gap-1.5 sm:mr-52 md:mr-64">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1))
                      document.getElementById('whatif-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                        : 'bg-white border border-[#E2E8F0] text-[#0D2240] hover:bg-[#F0F3FF] shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNum)
                          document.getElementById('whatif-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-[#0D2240] text-white shadow-xs scale-105'
                            : 'bg-white border border-[#E2E8F0] text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                      document.getElementById('whatif-schemes-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      currentPage === totalPages
                        ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border border-transparent'
                        : 'bg-[#E65100] hover:bg-[#D84315] text-white font-bold shadow-xs'
                    }`}
                  >
                    <span>Next</span>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
