// frontend/src/components/TrendingSeasonalBanner.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  getTrendingMeta,
  getSeasonalMeta,
  filterTrendingSchemes,
  filterSeasonalSchemes,
} from '../data/curatedSchemes'

export default function TrendingSeasonalBanner({
  catalogSchemes = [],
  onSelectQuickFilter,
}) {
  const [activeTab, setActiveTab] = useState('trending') // 'trending' | 'seasonal'
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const trendingList = useMemo(() => {
    return filterTrendingSchemes(catalogSchemes)
  }, [catalogSchemes])

  const seasonalList = useMemo(() => {
    return filterSeasonalSchemes(catalogSchemes)
  }, [catalogSchemes])

  const activeItems = activeTab === 'trending' ? trendingList : seasonalList

  // Items per slide based on viewport (3 for desktop, 1 for mobile)
  const itemsPerPage = 3
  const maxIndex = Math.max(0, activeItems.length - itemsPerPage)

  useEffect(() => {
    setCurrentIndex(0)
  }, [activeTab])

  // Auto-advance carousel
  useEffect(() => {
    if (isPaused || activeItems.length <= itemsPerPage) return
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused, maxIndex, activeItems.length])

  function handlePrev() {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  function handleNext() {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const visibleCards = activeItems.slice(currentIndex, currentIndex + itemsPerPage)

  if (!activeItems || activeItems.length === 0) return null

  return (
    <section
      aria-label="Trending and Seasonal Schemes Showcase"
      className="relative w-full rounded-2xl overflow-hidden border border-[#CBD5E1] shadow-lg bg-white font-sans text-[#111C2D]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Tiranga Accent Banner */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

      {/* Header with Dual Tabs and Explorer Pitch */}
      <div className="bg-gradient-to-r from-[#0D2240] via-[#1A365D] to-[#0D2240] p-4 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#E65100] animate-ping" />
              <span>Smart Citizen Curation</span>
            </div>
            <h2 className="font-display text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{activeTab === 'trending' ? '🔥 Trending Welfare Schemes' : '🌾 Seasonal & Time-Sensitive Windows'}</span>
            </h2>
            <p className="text-xs text-white/75">
              {activeTab === 'trending'
                ? 'High-demand citizen programs with massive DBT disbursements across Central & Maharashtra registries.'
                : 'Active deadlines for Kharif agriculture, crop insurance, and academic scholarship intake cycles.'}
            </p>
          </div>

          {/* Interactive Mode Switcher Tabs */}
          <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('trending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trending'
                  ? 'bg-gradient-to-r from-[#E65100] to-[#FF7722] text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
              <span>Trending ({trendingList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seasonal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'seasonal'
                  ? 'bg-gradient-to-r from-[#138808] to-[#16A34A] text-white shadow-md'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
              <span>Seasonal Windows ({seasonalList.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Body */}
      <div className="p-4 sm:p-6 bg-[#F8FAFC]">
        {/* Navigation & Counter Bar */}
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#44474E] uppercase tracking-wider">
              Showing {currentIndex + 1} - {Math.min(currentIndex + itemsPerPage, activeItems.length)} of {activeItems.length} Featured
            </span>
            {activeTab === 'trending' && (
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-[10px] font-bold">
                ⚡ Most Applied This Month
              </span>
            )}
            {activeTab === 'seasonal' && (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ⏳ Application Window Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Slide"
              disabled={activeItems.length <= itemsPerPage}
              className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-[#0D2240] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Slide"
              disabled={activeItems.length <= itemsPerPage}
              className="w-8 h-8 rounded-full border border-slate-300 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-[#0D2240] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carousel Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((scheme) => {
            const trendingMeta = getTrendingMeta(scheme)
            const seasonalMeta = getSeasonalMeta(scheme)
            const isState = scheme.state || (scheme.name && scheme.name.includes('Maharashtra'))

            return (
              <article
                key={scheme.schemeId}
                className="group relative flex flex-col justify-between rounded-xl bg-white border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:border-[#0D2240]/40 transition-all duration-200 overflow-hidden"
              >
                {/* Micro accent top bar */}
                <div
                  className="h-1 w-full"
                  style={{
                    backgroundColor: activeTab === 'trending' ? '#E65100' : '#138808',
                  }}
                />

                <div className="p-4 sm:p-5 space-y-3">
                  {/* Category & Badge Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF3FC] text-[#0D2240] truncate">
                        {scheme.categoryName || 'Welfare'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold shrink-0 ${
                        isState ? 'bg-[#FFF3EB] text-[#E65100]' : 'bg-[#DEE8FF] text-[#44474E]'
                      }`}>
                        {isState ? 'Maharashtra' : 'Central'}
                      </span>
                    </div>

                    {/* Trending or Seasonal Callout Badge */}
                    {activeTab === 'trending' && trendingMeta ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[#E65100] border border-orange-200 text-[10px] font-bold shrink-0">
                        <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                        <span>{trendingMeta.badgeText}</span>
                      </span>
                    ) : seasonalMeta ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-bold shrink-0">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>{seasonalMeta.windowLabel}</span>
                      </span>
                    ) : null}
                  </div>

                  {/* Scheme Title */}
                  <Link
                    to={`/schemes/${scheme.schemeId}`}
                    className="block group-hover:text-[#E65100] transition-colors"
                  >
                    <h3 className="font-display text-sm font-bold text-[#111C2D] line-clamp-2 leading-snug">
                      {scheme.name}
                    </h3>
                  </Link>

                  {/* Ministry Subtext */}
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {scheme.ministry}
                  </p>

                  {/* Primary Benefit Highlight Card */}
                  <div className={`p-2.5 rounded-lg border text-xs ${
                    activeTab === 'trending'
                      ? 'bg-orange-50/70 border-orange-100 text-orange-950'
                      : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold mb-0.5">
                      <span className="material-symbols-outlined text-[16px] text-[#0D2240]">
                        {activeTab === 'trending' ? 'payments' : 'event_available'}
                      </span>
                      <span className="font-display font-extrabold text-[#0D2240]">
                        {scheme.benefitAmount || 'Direct Benefit Transfer (DBT)'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {activeTab === 'trending'
                        ? (trendingMeta?.highlight || scheme.benefitSummary)
                        : (seasonalMeta?.urgencyText || scheme.benefitSummary)}
                    </p>
                  </div>
                </div>

                {/* Card Footer / Quick Actions */}
                <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2 bg-slate-50/50">
                  {onSelectQuickFilter && (
                    <button
                      type="button"
                      onClick={() => onSelectQuickFilter(activeTab === 'trending' ? 'trending' : 'seasonal')}
                      className="text-[11px] font-bold text-[#0D2240] hover:text-[#E65100] transition-colors flex items-center gap-1 cursor-pointer py-2"
                    >
                      <span className="material-symbols-outlined text-[14px]">filter_alt</span>
                      <span>Filter Similar</span>
                    </button>
                  )}
                  <Link
                    to={`/schemes/${scheme.schemeId}`}
                    className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D2240] hover:bg-[#1A365D] text-white text-[11px] font-bold shadow-xs transition-colors"
                  >
                    <span>View Scheme</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* Carousel Slide Indicators */}
        {activeItems.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-1.5 pt-4">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-[#0D2240]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
