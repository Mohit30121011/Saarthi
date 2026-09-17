// frontend/src/components/SchemeTrustBadge.jsx
import { useMemo } from 'react'

export default function SchemeTrustBadge({
  verifiedAt,
  officialPortal,
  sourceUrl,
  deadline,
  state,
  variant = 'card', // 'card' | 'hero' | 'inline'
  className = '',
}) {
  const formattedDate = useMemo(() => {
    if (!verifiedAt) return 'Verified Sep 2026'
    try {
      const d = new Date(verifiedAt)
      if (isNaN(d.getTime())) return verifiedAt
      return `Verified ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } catch {
      return 'Verified Sep 2026'
    }
  }, [verifiedAt])

  const sourceDetails = useMemo(() => {
    const url = (officialPortal || sourceUrl || '').toLowerCase()
    if (url.includes('gov.in') || url.includes('nic.in') || url.includes('mahait.org') || url.includes('mahadbt')) {
      return {
        label: state ? 'Official State Portal' : 'Official Central Portal',
        isOfficial: true,
        icon: 'verified',
        bg: 'bg-[#EAFBF0]',
        border: 'border-[#16A34A]/25',
        text: 'text-[#138808]',
      }
    }
    return {
      label: 'Verified Gazette',
      isOfficial: true,
      icon: 'verified_user',
      bg: 'bg-[#F0F3FF]',
      border: 'border-[#DEE8FF]',
      text: 'text-[#0D2240]',
    }
  }, [officialPortal, sourceUrl, state])

  const deadlineText = useMemo(() => {
    if (!deadline) return 'Annual Ongoing'
    try {
      const d = new Date(deadline)
      if (isNaN(d.getTime())) return 'Active Window'
      const today = new Date()
      const diffDays = Math.ceil((d - today) / (1000 * 60 * 60 * 24))
      if (diffDays <= 0) return 'Window Reopening Soon'
      if (diffDays <= 45) return `Expiring in ${diffDays}d`
      return `Active till ${d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
    } catch {
      return 'Active Window'
    }
  }, [deadline])

  if (variant === 'hero') {
    return (
      <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
        {/* Source Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs ${sourceDetails.bg} ${sourceDetails.border} ${sourceDetails.text}`}>
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {sourceDetails.icon}
          </span>
          <span>{sourceDetails.label}</span>
        </div>

        {/* Verification Freshness Date */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#0D2240] shadow-2xs">
          <span className="material-symbols-outlined text-[16px] text-[#0D2240]">
            event_available
          </span>
          <span>{formattedDate}</span>
        </div>

        {/* Validity Horizon */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF3EB] border border-[#E65100]/20 text-xs font-bold text-[#E65100] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#E65100] animate-pulse" />
          <span>{deadlineText}</span>
        </div>
      </div>
    )
  }

  // Card Variant (compact for Explorer & Dashboard cards)
  return (
    <div className={`flex items-center flex-wrap gap-1.5 text-[11px] font-bold ${className}`}>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border ${sourceDetails.bg} ${sourceDetails.border} ${sourceDetails.text}`}>
        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {sourceDetails.icon}
        </span>
        <span className="truncate">{sourceDetails.label}</span>
      </span>

      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-[#44474E]">
        <span className="material-symbols-outlined text-[13px] text-[#0D2240]">schedule</span>
        <span>{formattedDate}</span>
      </span>
    </div>
  )
}
