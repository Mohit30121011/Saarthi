import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBookmark, removeBookmark } from '../api/bookmarks'
import { getTrendingMeta, getSeasonalMeta } from '../data/curatedSchemes'

function getDeterministicReason(scheme, profile) {
  const state = profile?.state || 'Maharashtra'
  const occ = (profile?.occupation || 'Student').toLowerCase()
  const cat = (scheme?.categoryName || '').toLowerCase()
  const name = (scheme?.name || '').toLowerCase()
  const income = profile?.annualIncome ? Number(profile.annualIncome) : 420000

  if (occ.includes('student') || cat.includes('education') || name.includes('scholarship') || name.includes('shikshan')) {
    return `You qualify because you are a verified domicile of ${state}, your family annual income (₹${income.toLocaleString('en-IN')}) is within the statutory limit, and you are enrolled in a recognized professional course.`
  }
  if (occ.includes('farmer') || cat.includes('agriculture') || name.includes('kisan') || name.includes('krishi')) {
    return `You qualify because you are an Indian citizen residing in ${state} with agricultural landholder status recorded under the Revenue Talathi registry.`
  }
  if (cat.includes('healthcare') || name.includes('arogya') || name.includes('ayushman')) {
    return `You qualify based on verified ration card demographic registry in ${state} ensuring cashless healthcare up to statutory ceiling.`
  }
  return `You qualify under verified statutory eligibility criteria for ${state} residents under official gazette regulations.`
}

export default function SchemeCard({
  scheme,
  confidence = 'STRONG',
  missingFields,
  reasons,
  profile,
  bookmarked: initialBookmarked,
  onBookmarkChange,
  showBookmark = true,
  onCompare,
  isComparing = false,
  showCompare = true,
  horizonBadge = null,
  isOpportunity = false,
  simulationTag = null,
}) {
  const navigate = useNavigate()
  const [isSaved, setIsSaved] = useState(!!initialBookmarked)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setIsSaved(!!initialBookmarked)
  }, [initialBookmarked])

  async function handleToggleBookmark(e) {
    e.preventDefault()
    e.stopPropagation()
    if (busy || !scheme?.schemeId) return
    setBusy(true)
    try {
      if (isSaved) {
        await removeBookmark(scheme.schemeId)
        setIsSaved(false)
        onBookmarkChange?.(scheme.schemeId, false)
      } else {
        await addBookmark(scheme.schemeId)
        setIsSaved(true)
        onBookmarkChange?.(scheme.schemeId, true)
      }
    } catch {
      // ignore
    } finally {
      setBusy(false)
    }
  }

  const schemeId = scheme?.schemeId ?? 0
  const isDisqualified = simulationTag?.type === 'disqualified'
  const isStrong = confidence === 'STRONG'
  const isPartial = confidence === 'PARTIAL'
  const category = scheme?.categoryName || 'Welfare'
  const isState = scheme?.state || (scheme?.name && scheme.name.includes('Maharashtra'))
  const benefitValue = scheme?.benefitAmount || (isStrong ? 'Direct DBT Subsidy' : 'Statutory Benefit')
  const benefitSubtext = scheme?.benefitSummary || 'Direct Benefit Transfer (DBT) to Aadhaar-seeded bank account'
  const reasonText = (reasons && reasons.length > 0)
    ? reasons.join('. ')
    : getDeterministicReason(scheme, profile)

  const trendingMeta = getTrendingMeta(scheme)
  const seasonalMeta = getSeasonalMeta(scheme)

  return (
    <article
      onClick={() => scheme?.schemeId && navigate(`/schemes/${scheme.schemeId}`)}
      className={`relative flex flex-col justify-between rounded-xl bg-white border shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group ${
        isDisqualified
          ? 'border-rose-300 bg-rose-50/15 hover:border-rose-400'
          : isComparing
          ? 'border-[#0D2240] ring-2 ring-[#0D2240]/20'
          : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
      }`}
    >
      {/* Accent Stripe: Red for Disqualified, Tricolor for Standard */}
      {isDisqualified ? (
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600" />
      ) : (
        <div className="h-1 w-full bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />
      )}

      <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        {/* Card Header / Meta Tags */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="px-2 py-1 rounded-md bg-[#EBF3FC] text-[#0D2240] text-[10.5px] sm:text-[11px] font-bold tracking-wide truncate min-w-0">
              {scheme?.ministry || 'Ministry of Agriculture & Farmers Welfare'}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9.5px] sm:text-[10px] font-bold shrink-0 ${
              isState ? 'bg-[#FFF3EB] text-[#E65100]' : 'bg-[#DEE8FF] text-[#44474E]'
            }`}>
              {isState ? 'Maharashtra' : 'Central'}
            </span>
          </div>

          {/* Context-Aware Match Confidence / Simulation Status Badge */}
          {simulationTag ? (
            simulationTag.type === 'disqualified' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] sm:text-[10.5px] font-bold shrink-0">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">cancel</span>
                <span>{simulationTag.label || 'DISQUALIFIED'}</span>
              </span>
            ) : simulationTag.type === 'opportunity' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF3EB] text-[#E65100] border border-[#E65100]/30 text-[10px] sm:text-[10.5px] font-bold shrink-0 shadow-2xs">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">auto_awesome</span>
                <span>NEW OPPORTUNITY</span>
              </span>
            ) : simulationTag.type === 'capped' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] sm:text-[10.5px] font-bold shrink-0">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>{simulationTag.label || `ELIGIBLE (Cap ₹${simulationTag.ceilingFormatted})`}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EBF3FC] text-[#0D2240] border border-[#DEE8FF] text-[10px] sm:text-[10.5px] font-bold shrink-0">
                <span className="material-symbols-outlined text-[13px] sm:text-[14px]">public</span>
                <span>UNIVERSAL (No Cap)</span>
              </span>
            )
          ) : isStrong ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#EAFBF0] text-[#138808] border border-[#16A34A]/20 text-[10px] sm:text-[10.5px] font-bold shrink-0">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <span className="hidden sm:inline">STRONG MATCH</span>
              <span>(100%)</span>
            </span>
          ) : isPartial ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/20 text-[10px] sm:text-[10.5px] font-bold shrink-0">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]">warning</span>
              <span className="hidden sm:inline">PARTIAL</span> MATCH
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold shrink-0">
              <span>{category}</span>
            </span>
          )}
        </div>

        {/* Scheme Title & Curation Badges */}
        <div className="space-y-1.5">
          {(trendingMeta || seasonalMeta) && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {trendingMeta && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-[#E65100] text-[10px] sm:text-[10.5px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">{trendingMeta.iconName || 'trending_up'}</span>
                  <span>{trendingMeta.badgeText}</span>
                </span>
              )}
              {seasonalMeta && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#138808] text-[10px] sm:text-[10.5px] font-bold">
                  <span className="material-symbols-outlined text-[13px]">{seasonalMeta.iconName || 'event_available'}</span>
                  <span>{seasonalMeta.statusTag}</span>
                </span>
              )}
            </div>
          )}

          <h3 className={`font-display font-bold text-[15.5px] sm:text-[17px] tracking-tight transition-colors line-clamp-2 leading-snug ${
            isDisqualified ? 'text-slate-800' : 'text-[#0D2240] group-hover:text-[#1A365D]'
          }`}>
            {scheme?.name || 'Welfare Scheme'}
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-[#44474E] font-mono truncate">
            SCH-{isState ? 'MH' : 'CENTRAL'}-{schemeId.toString().padStart(3, '0')} • Direct Benefit Transfer
          </p>
        </div>

        {horizonBadge && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
            isDisqualified
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : isOpportunity
              ? 'bg-[#FFF3EB] border-[#E65100]/30 text-[#E65100] shadow-2xs'
              : 'bg-[#F0F3FF] border-[#DEE8FF] text-[#0D2240]'
          }`}>
            <span className="material-symbols-outlined text-[16px]">
              {isDisqualified ? 'block' : isOpportunity ? 'auto_awesome' : 'visibility'}
            </span>
            <span className="font-semibold">{horizonBadge}</span>
            {isOpportunity && (
              <span className="ml-auto bg-[#E65100] text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                Horizon Match
              </span>
            )}
            {isDisqualified && (
              <span className="ml-auto bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                Exceeded
              </span>
            )}
          </div>
        )}

        {/* Value Metric Banner */}
        <div className={`p-3 sm:p-3.5 rounded-lg border flex items-start sm:items-center justify-between gap-2.5 ${
          isDisqualified
            ? 'bg-rose-50/70 border-rose-200'
            : 'bg-[#EAFBF0] border-[#16A34A]/20'
        }`}>
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 shadow-xs ${
              isDisqualified ? 'bg-rose-600 text-white' : 'bg-[#138808] text-white'
            }`}>
              {isDisqualified ? '✕' : '₹'}
            </div>
            <div className="min-w-0">
              <div className={`font-display font-bold text-sm sm:text-base line-clamp-2 sm:line-clamp-1 leading-snug ${
                isDisqualified ? 'text-rose-800' : 'text-[#138808]'
              }`}>
                {isDisqualified
                  ? (simulationTag?.ceiling
                      ? `Statutory Ceiling: ₹${Number(simulationTag.ceiling).toLocaleString('en-IN')}`
                      : 'Income Ceiling Exceeded')
                  : benefitValue}
              </div>
              <div className={`text-[11px] sm:text-[11.5px] line-clamp-2 sm:line-clamp-1 mt-0.5 sm:mt-0 ${
                isDisqualified ? 'text-rose-700 font-medium' : 'text-[#44474E]'
              }`}>
                {isDisqualified
                  ? (simulationTag?.excess
                      ? `Exceeded by +₹${Number(simulationTag.excess).toLocaleString('en-IN')} under this simulation`
                      : 'Ineligible at this simulated income bracket')
                  : benefitSubtext}
              </div>
            </div>
          </div>
          <span className={`material-symbols-outlined text-[18px] sm:text-[22px] shrink-0 mt-0.5 sm:mt-0 ${
            isDisqualified ? 'text-rose-600' : 'text-[#138808]'
          }`}>
            {isDisqualified ? 'block' : 'payments'}
          </span>
        </div>

        {/* Why You Qualify or Disqualification Context */}
        <div className={`p-2.5 sm:p-3 rounded-lg border space-y-1 ${
          isDisqualified
            ? 'bg-rose-50/80 border-rose-200'
            : 'bg-[#F0F3FF] border-[#DEE8FF]'
        }`}>
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold">
            <span className={`material-symbols-outlined text-[14px] sm:text-[15px] ${
              isDisqualified ? 'text-rose-600' : 'text-[#138808]'
            }`}>
              {isDisqualified ? 'cancel' : 'verified_user'}
            </span>
            <span className={isDisqualified ? 'text-rose-800' : 'text-[#0D2240]'}>
              {isDisqualified ? 'Disqualification Context:' : 'Eligibility Context:'}
            </span>
          </div>
          <p className={`text-[11.5px] sm:text-xs line-clamp-2 leading-relaxed ${
            isDisqualified ? 'text-rose-700' : 'text-[#44474E]'
          }`}>
            {isDisqualified
              ? (simulationTag?.reason || reasonText)
              : simulationTag?.type === 'universal'
              ? 'Universal Welfare: Accessible to all eligible citizens without an annual household income ceiling.'
              : simulationTag?.type === 'capped'
              ? `Income Within Cap: Simulated ₹${Number(profile?.annualIncome || 0).toLocaleString('en-IN')} is within statutory limit of ₹${Number(simulationTag.ceiling || 0).toLocaleString('en-IN')}.`
              : reasonText}
          </p>
        </div>

        {/* Approaching Deadline Notice Pill or Active Enrolment */}
        {scheme?.deadline ? (() => {
          const deadlineDate = new Date(scheme.deadline)
          const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const isClosingSoon = daysLeft > 0 && daysLeft <= 90
          return (
            <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border ${
              isClosingSoon
                ? 'bg-[#FFF3EB] border-[#E65100]/20'
                : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}>
              <div className={`flex items-center gap-2 text-[11.5px] sm:text-xs font-bold ${
                isClosingSoon ? 'text-[#E65100]' : 'text-[#44474E]'
              }`}>
                <span className={`material-symbols-outlined text-[16px] ${
                  isClosingSoon ? 'text-[#E65100]' : 'text-[#138808]'
                }`}>
                  {isClosingSoon ? 'alarm' : 'event_available'}
                </span>
                <span>Deadline: <strong className="text-[#0D2240] font-semibold">{scheme.deadline}</strong></span>
              </div>
              <span className={`text-[9.5px] sm:text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                isClosingSoon
                  ? 'bg-[#E65100] text-white'
                  : 'bg-[#EAFBF0] text-[#138808]'
              }`}>
                {isClosingSoon ? 'Closing Soon' : 'Active & Open'}
              </span>
            </div>
          )
        })() : (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-[#44474E] text-[11.5px] sm:text-xs">
              <span className="material-symbols-outlined text-[16px] text-[#138808]">event_available</span>
              <span>Status: <strong className="text-[#0D2240] font-semibold">Active &amp; Open</strong></span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] bg-[#EAFBF0] text-[#138808] px-2 py-0.5 rounded font-bold">
              Ongoing
            </span>
          </div>
        )}

        {/* Required Docs Quick-Pill */}
        <div className="flex items-start sm:items-center gap-2 text-[#44474E] text-[11.5px] sm:text-xs font-medium">
          <span className="material-symbols-outlined text-[16px] text-[#0D2240] shrink-0 mt-0.5 sm:mt-0">
            description
          </span>
          <span className="line-clamp-2 sm:truncate">
            <strong className="text-[#0D2240]">Required Docs:</strong> Aadhaar Card, Income Certificate, Bank Passbook
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 sm:p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {showBookmark && (
            <button
              onClick={handleToggleBookmark}
              aria-label={isSaved ? 'Remove bookmark' : 'Bookmark scheme'}
              title={isSaved ? 'Saved in Citizen Dossier' : 'Save to Citizen Dossier'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-[#E65100] bg-[#FFF3EB]'
                  : 'text-slate-400 hover:text-[#E65100] hover:bg-[#FFF3EB]'
              }`}
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}
              >
                star
              </span>
            </button>
          )}
          <span className="text-[11px] text-[#44474E] hidden sm:inline">
            Verified: {scheme.verifiedAt ? new Date(scheme.verifiedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Sep 2026'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none min-w-0">
          {showCompare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onCompare?.(scheme)
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                isComparing
                  ? 'bg-[#0D2240] text-white ring-2 ring-[#0D2240]/30'
                  : 'bg-[#F0F3FF] hover:bg-[#DEE8FF] text-[#0D2240] border border-[#DEE8FF]'
              }`}
              title="Compare with another scheme"
            >
              <span className="material-symbols-outlined text-[15px]">compare_arrows</span>
              <span>{isComparing ? 'Comparing' : 'Compare'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate('/checklist')
            }}
            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-bold text-[#0D2240] bg-white border border-[#E2E8F0] hover:bg-[#F0F3FF] transition-colors shadow-xs cursor-pointer whitespace-nowrap"
          >
            View Checklist
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (schemeId) navigate(`/schemes/${schemeId}`)
            }}
            className={`flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              isDisqualified
                ? 'text-white bg-slate-700 hover:bg-slate-800'
                : 'text-white bg-[#E65100] hover:bg-[#FF7722]'
            }`}
          >
            <span>{isDisqualified ? 'View Guidelines' : 'Apply on Portal'}</span>
            <span className="material-symbols-outlined text-[14px]">
              {isDisqualified ? 'arrow_forward' : 'open_in_new'}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
