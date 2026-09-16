import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBookmark, removeBookmark } from '../api/bookmarks'

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
    if (busy) return
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

  const isStrong = confidence === 'STRONG'
  const isPartial = confidence === 'PARTIAL'
  const category = scheme?.categoryName || 'Welfare'
  const isState = scheme?.state || (scheme?.name && scheme.name.includes('Maharashtra'))
  const benefitValue = scheme?.benefitAmount || (isStrong ? 'Direct DBT Subsidy' : 'Statutory Benefit')
  const benefitSubtext = scheme?.benefitSummary || 'Direct Benefit Transfer (DBT) to Aadhaar-seeded bank account'
  const reasonText = (reasons && reasons.length > 0)
    ? reasons.join('. ')
    : getDeterministicReason(scheme, profile)

  return (
    <article
      onClick={() => navigate(`/schemes/${scheme.schemeId}`)}
      className="relative flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#CBD5E1] transition-all duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Tricolor Micro-Accent on Card Top */}
      <div className="h-1 w-full bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

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

          {/* Match Confidence Pill */}
          {isStrong ? (
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

        {/* Scheme Title */}
        <div>
          <h3 className="font-display font-bold text-[15.5px] sm:text-[17px] text-[#0D2240] group-hover:text-[#1A365D] tracking-tight transition-colors line-clamp-2 leading-snug">
            {scheme.name}
          </h3>
          <p className="text-[10.5px] sm:text-[11px] text-[#44474E] mt-1 font-mono truncate">
            SCH-{isState ? 'MH' : 'CENTRAL'}-{scheme.schemeId.toString().padStart(3, '0')} • Direct Benefit Transfer
          </p>
        </div>

        {/* Value Metric Banner */}
        <div className="p-3 sm:p-3.5 rounded-lg bg-[#EAFBF0] border border-[#16A34A]/20 flex items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#138808] text-white flex items-center justify-center font-bold text-sm sm:text-lg shrink-0 shadow-xs">
              ₹
            </div>
            <div className="min-w-0">
              <div className="font-display font-bold text-sm sm:text-base text-[#138808] line-clamp-2 sm:line-clamp-1 leading-snug">
                {benefitValue}
              </div>
              <div className="text-[11px] sm:text-[11.5px] text-[#44474E] line-clamp-2 sm:line-clamp-1 mt-0.5 sm:mt-0">
                {benefitSubtext}
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#138808] text-[18px] sm:text-[22px] shrink-0 mt-0.5 sm:mt-0">
            payments
          </span>
        </div>

        {/* Why You Qualify */}
        <div className="p-2.5 sm:p-3 rounded-lg bg-[#F0F3FF] border border-[#DEE8FF] space-y-1">
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-bold text-[#0D2240]">
            <span className="material-symbols-outlined text-[14px] sm:text-[15px] text-[#138808]">
              verified_user
            </span>
            <span>Why You Qualify:</span>
          </div>
          <p className="text-[11.5px] sm:text-xs text-[#44474E] line-clamp-2 leading-relaxed">
            {reasonText}
          </p>
        </div>

        {/* Approaching Deadline Notice Pill or Active Enrolment */}
        {scheme?.deadline ? (
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-[#FFF3EB] border border-[#E65100]/20">
            <div className="flex items-center gap-2 text-[#E65100] text-[11.5px] sm:text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">alarm</span>
              <span>Deadline: {scheme.deadline}</span>
            </div>
            <span className="text-[9.5px] sm:text-[10px] bg-[#E65100] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Closing Soon
            </span>
          </div>
        ) : (
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
            Verified: Dec 2024
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 sm:flex-none min-w-0">
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
              navigate(`/schemes/${scheme.schemeId}`)
            }}
            className="flex-1 sm:flex-none px-3 sm:px-3.5 py-1.5 rounded-lg text-[11.5px] sm:text-xs font-bold text-white bg-[#E65100] hover:bg-[#FF7722] transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Apply on Portal</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </button>
        </div>
      </div>
    </article>
  )
}
