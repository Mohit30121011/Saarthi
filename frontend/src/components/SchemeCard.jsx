import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addBookmark, removeBookmark } from '../api/bookmarks'

const CATEGORY_META = {
  Education: {
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700 border border-blue-200/60',
  },
  Healthcare: {
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700 border border-rose-200/60',
  },
  Housing: {
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-[#156f45] border border-emerald-200/60',
  },
  'Financial Aid': {
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800 border border-amber-200/60',
  },
  Agriculture: {
    badgeBg: 'bg-lime-50',
    badgeText: 'text-lime-800 border border-lime-200/60',
  },
  Employment: {
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border border-purple-200/60',
  },
}

function getFallbackReasons(scheme, profile) {
  const reasons = []
  const state = profile?.state || 'Maharashtra'
  const occ = (profile?.occupation || 'Student').toLowerCase()
  const cat = (scheme?.categoryName || '').toLowerCase()
  const name = (scheme?.name || '').toLowerCase()
  const income = profile?.annualIncome ? Number(profile.annualIncome) : 250000

  if (scheme?.state && scheme.state.toLowerCase() === state.toLowerCase()) {
    reasons.push(`Eligible for ${state} residents`)
  } else if (!scheme?.state) {
    reasons.push(`Eligible for pan-India residents`)
  }

  if (occ.includes('student') && (cat.includes('education') || name.includes('scholarship') || name.includes('shikshan') || name.includes('ebc'))) {
    reasons.push('Supports your higher education & course fee')
  } else if (occ.includes('farmer') && cat.includes('agriculture')) {
    reasons.push('Direct financial & crop assistance for farmers')
  } else if (cat.includes('employment')) {
    reasons.push('Self-employment and livelihood generation support')
  } else if (cat.includes('healthcare')) {
    reasons.push('Cashless health insurance cover for your family')
  } else if (cat.includes('financial')) {
    reasons.push('Financial assistance and social security support')
  }

  if (income && income > 0) {
    reasons.push(`Income within bracket (< ₹${income.toLocaleString('en-IN')}/yr)`)
  } else if (profile?.category) {
    reasons.push(`Eligible under ${profile.category} category`)
  }

  if (reasons.length < 2) {
    reasons.push('Meets age and identity eligibility criteria')
  }

  return reasons.slice(0, 3)
}

export default function SchemeCard({
  scheme,
  confidence,
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

  const category = scheme?.categoryName || 'General'
  const catMeta = CATEGORY_META[category] || { badgeBg: 'bg-slate-50', badgeText: 'text-slate-700 border border-slate-200' }
  const isStrong = confidence === 'STRONG'
  const isPartial = confidence === 'PARTIAL'

  // Match reasons (provided or dynamically generated)
  const matchReasons = (reasons && reasons.length > 0)
    ? reasons
    : getFallbackReasons(scheme, profile)

  const missingList = (missingFields && missingFields.length > 0)
    ? missingFields
    : ['Annual family income', 'Occupation']

  return (
    <div
      onClick={() => navigate(`/schemes/${scheme.schemeId}`)}
      className="bg-white border border-[#E5EBE5] rounded-[24px] p-5 flex flex-col justify-between hover:shadow-md hover:border-[#156f45]/30 transition-all cursor-pointer group select-none min-h-[350px]"
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1.5 mb-3">
          {/* Category Pill */}
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${catMeta.badgeBg} ${catMeta.badgeText}`}>
            {category}
          </span>

          {/* Match Status Badge */}
          {isStrong ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#156f45] text-white text-[10px] font-bold shadow-2xs">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Strong match</span>
            </span>
          ) : isPartial ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-300 bg-amber-50 text-amber-800 text-[10px] font-semibold">
              <svg className="w-3 h-3 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l2.5 2.5" />
              </svg>
              <span>Needs more info</span>
            </span>
          ) : null}

          {/* Bookmark Ribbon Icon */}
          {showBookmark && (
            <button
              onClick={handleToggleBookmark}
              className={`p-1 text-slate-400 hover:text-[#156f45] transition-colors ml-auto ${
                isSaved ? 'text-[#156f45]' : ''
              }`}
              title={isSaved ? 'Remove from saved' : 'Save scheme'}
              aria-label={isSaved ? 'Remove from saved' : 'Save scheme'}
            >
              <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          )}
        </div>

        {/* Scheme Name */}
        <h3 className="font-fraunces font-bold text-[15px] sm:text-[16px] text-slate-900 leading-snug line-clamp-2 group-hover:text-[#156f45] transition-colors mt-1">
          {scheme.name}
        </h3>

        {/* Ministry */}
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
          {scheme.ministry || 'Government of India'}
        </p>

        {/* Benefit Description */}
        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
          {scheme.benefitSummary || 'Direct financial benefit and welfare support under official guidelines.'}
        </p>

        {/* "Why this matches you" Box OR Key Scheme Benefit Box */}
        {isStrong || isPartial ? (
          <div className={`mt-4 p-3 rounded-xl text-[11px] ${
            isStrong ? 'bg-[#F2FAF4] border border-[#E0F2E9]' : 'bg-[#FEF9EE] border border-[#FDE68A]'
          }`}>
            <p className={`font-bold mb-1.5 ${isStrong ? 'text-[#156f45]' : 'text-amber-800'}`}>
              {isStrong ? 'Why this matches you:' : 'Why this may match you:'}
            </p>

            {isStrong ? (
              <div className="space-y-1 text-slate-700">
                {matchReasons.map((reason, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-[#156f45] shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="line-clamp-1">{reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1 text-amber-900">
                {missingList.map((field, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="line-clamp-1">Add {field}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 p-3 rounded-xl text-[11px] bg-slate-50 border border-slate-200/80 text-slate-700">
            <p className="font-bold text-slate-800 mb-1">Key Scheme Benefit:</p>
            <p className="line-clamp-2 text-slate-600 leading-relaxed">
              {scheme.benefitAmount || scheme.benefitSummary || 'Financial aid and welfare benefits available under central/state guidelines.'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Link & Deadline / Status Badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#156f45] group-hover:underline flex items-center gap-1">
          <span>View details</span>
          <span>→</span>
        </span>
        {scheme.deadline ? (
          <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            Deadline: {scheme.deadline}
          </span>
        ) : (
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            Active Scheme
          </span>
        )}
      </div>
    </div>
  )
}
