// frontend/src/components/SchemeReviewSection.jsx
import { useState, useEffect, useMemo } from 'react'
import { getSchemeReviews, submitSchemeReview, toggleReviewLike } from '../api/reviews'
import SchemeRatingStars from './SchemeRatingStars'
import SchemeReviewModal from './SchemeReviewModal'
import { useAuth } from '../context/AuthContext'

export default function SchemeReviewSection({ schemeId, schemeName, onSummaryChange }) {
  const { isAuthenticated, user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterRating, setFilterRating] = useState('ALL')
  const [likingIds, setLikingIds] = useState(new Set())
  const [toast, setToast] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadReviews() {
    try {
      setLoading(true)
      const data = await getSchemeReviews(schemeId)
      if (data) {
        setReviews(data.reviews || [])
        setSummary(data.summary || null)
        if (data.summary && onSummaryChange) {
          onSummaryChange(data.summary)
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (schemeId) {
      loadReviews()
    }
  }, [schemeId])

  async function handleReviewSubmit(payload) {
    const data = await submitSchemeReview(payload)
    showToast('Your verified review has been published successfully!')
    if (data.review) {
      setReviews((prev) => [data.review, ...prev.filter((r) => r.reviewId !== data.review.reviewId)])
    }
    if (data.summary) {
      setSummary(data.summary)
      if (onSummaryChange) onSummaryChange(data.summary)
    } else {
      loadReviews()
    }
  }

  async function handleToggleLike(reviewId) {
    if (!isAuthenticated) {
      showToast('Please log in to mark reviews as helpful.')
      return
    }

    if (likingIds.has(reviewId)) return

    setLikingIds((prev) => new Set(prev).add(reviewId))

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => {
        if (r.reviewId === reviewId) {
          const wasLiked = r.likedByCurrentUser
          return {
            ...r,
            likedByCurrentUser: !wasLiked,
            likesCount: wasLiked ? Math.max(0, r.likesCount - 1) : r.likesCount + 1,
          }
        }
        return r
      })
    )

    try {
      const res = await toggleReviewLike(reviewId)
      if (res.liked !== undefined) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.reviewId === reviewId) {
              return { ...r, likedByCurrentUser: res.liked }
            }
            return r
          })
        )
      }
    } catch (err) {
      console.error('Failed to toggle review like:', err)
      // Revert on error
      loadReviews()
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev)
        next.delete(reviewId)
        return next
      })
    }
  }

  const filteredReviews = useMemo(() => {
    if (filterRating === 'ALL') return reviews
    const num = Number(filterRating)
    return reviews.filter((r) => r.rating === num)
  }, [reviews, filterRating])

  const totalReviewsCount = summary ? summary.totalReviews : reviews.length
  const avgScore = summary && summary.totalReviews > 0 
    ? summary.averageRating 
    : (reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 0)
  const ratingDistribution = summary?.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  return (
    <section className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 sm:p-8 space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0D2240] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-[16px] text-[#138808]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#E65100] text-[22px]">
              rate_review
            </span>
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#0D2240]">
              Citizen Reviews &amp; Sanction Experience
            </h2>
          </div>
          <p className="text-xs text-[#44474E] max-w-xl leading-relaxed">
            Real-world feedback and approval timelines from verified citizens across Maharashtra &amp; India who applied for this scheme.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!isAuthenticated) {
              showToast('Please log in to submit your citizen review.')
            } else {
              setIsModalOpen(true)
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D2240] hover:bg-[#08182B] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span>Write a Review &amp; Rating</span>
        </button>
      </div>

      {/* Aggregate Score & Analytics Bento */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-5 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0]">
        {/* Left: Overall Big Score */}
        <div className="md:col-span-4 flex flex-col justify-center items-center text-center p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          {totalReviewsCount > 0 ? (
            <>
              <span className="font-display text-4xl sm:text-5xl font-extrabold text-[#0D2240]">
                {Number(avgScore).toFixed(1)}
              </span>
              <div className="my-2">
                <SchemeRatingStars rating={avgScore} size="lg" showCount={false} />
              </div>
              <p className="text-xs font-bold text-[#0D2240]">
                Based on {totalReviewsCount} {totalReviewsCount === 1 ? 'verified review' : 'verified citizen reviews'}
              </p>
            </>
          ) : (
            <>
              <span className="font-display text-3xl font-bold text-slate-400">
                Not Rated Yet
              </span>
              <div className="my-2 text-slate-300">
                <SchemeRatingStars rating={0} size="lg" showCount={false} />
              </div>
              <p className="text-xs text-[#44474E]">
                0 verified reviews
              </p>
            </>
          )}
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#138808] mt-2 bg-[#EAFBF0] px-2.5 py-0.5 rounded border border-[#16A34A]/20">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            100% Aadhaar-Verified Feedback
          </span>
        </div>

        {/* Center: Star Rating Breakdown Bars */}
        <div className="md:col-span-4 flex flex-col justify-center space-y-2 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs text-xs">
          <span className="text-[11px] font-bold text-[#0D2240] mb-1">
            Rating Distribution
          </span>
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars] || 0
            const pct = totalReviewsCount > 0 ? Math.round((count / totalReviewsCount) * 100) : 0
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="font-bold text-[#44474E] w-8 shrink-0 text-right">{stars} ★</span>
                <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10.5px] font-semibold text-[#44474E] w-8 text-right shrink-0">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Right: Key Process Trust Metrics */}
        <div className="md:col-span-4 flex flex-col justify-between space-y-3 p-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs text-xs">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#44474E] uppercase tracking-wider">
              Avg. Sanction Time
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-extrabold text-[#0D2240]">
                {summary && summary.totalReviews > 0 ? `~${summary.averageApprovalWeeks} Weeks` : '—'}
              </span>
              {summary && summary.totalReviews > 0 && (
                <span className="text-[11px] text-[#138808] font-bold">
                  {summary.averageApprovalWeeks <= 3 ? 'Fast Turnaround' : 'Standard Window'}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#44474E] uppercase tracking-wider">
              Benefit Disbursement
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl font-extrabold text-[#138808]">
                {summary && summary.totalReviews > 0 ? `${summary.benefitReceivedPercentage}%` : '—'}
              </span>
              <span className="text-[11px] text-[#44474E]">
                {summary && summary.totalReviews > 0 ? 'Success Rate' : 'Awaiting feedback'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#44474E] uppercase tracking-wider">
              Online Process Ease
            </span>
            <span className="text-xs font-bold text-[#0D2240] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#138808]">check_circle</span>
              Direct Bank Transfer (DBT) Supported
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['ALL', '5', '4', '3'].map((opt) => {
            const label = opt === 'ALL' ? `All Reviews (${reviews.length})` : `${opt} Stars`
            const isSelected = filterRating === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setFilterRating(opt)}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-[#0D2240] text-white border-[#0D2240]'
                    : 'bg-white text-[#44474E] border-[#E2E8F0] hover:bg-[#F0F3FF]'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <span className="text-xs text-[#44474E] font-medium">
          Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      {/* Review Cards List */}
      {loading ? (
        <div className="py-8 text-center text-[#44474E] text-xs font-semibold">
          <span className="material-symbols-outlined text-2xl animate-spin text-[#0D2240] mb-2">sync</span>
          <p>Loading authentic citizen reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-12 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] p-6 space-y-2">
          <span className="material-symbols-outlined text-3xl text-slate-400">rate_review</span>
          <h3 className="text-sm font-bold text-[#0D2240]">No Reviews in this Filter</h3>
          <p className="text-xs text-[#44474E] max-w-md mx-auto">
            Be the first verified applicant to share your experience with this welfare scheme!
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="mt-3 px-4 py-2 bg-[#0D2240] text-white text-xs font-bold rounded-xl hover:bg-[#08182B] transition-colors cursor-pointer"
          >
            Post the First Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const initials = (rev.reviewerName || 'Citizen')
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()

            const reviewDate = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Verified Applicant'

            return (
              <div
                key={rev.reviewId}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0D2240]/30 transition-all space-y-3"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0D2240] text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-[#0D2240]">
                          {rev.reviewerName || 'Citizen Applicant'}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-[#138808] bg-[#EAFBF0] px-1.5 py-0.5 rounded border border-[#16A34A]/20">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                          Verified Applicant
                        </span>
                        {rev.reviewerState && (
                          <span className="text-[10.5px] text-[#44474E] font-medium">
                            • {rev.reviewerState}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#44474E]">
                        Submitted on {reviewDate}
                      </span>
                    </div>
                  </div>

                  {/* Rating Score */}
                  <SchemeRatingStars rating={rev.rating} size="sm" showCount={false} />
                </div>

                {/* Review Title & Narrative */}
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0D2240]">
                    {rev.reviewTitle}
                  </h4>
                  <p className="text-xs text-[#111C2D] leading-relaxed">
                    {rev.reviewText}
                  </p>
                </div>

                {/* Practical Verification Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                  {rev.approvalTimeWeeks && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F0F3FF] border border-[#DEE8FF] text-[#0D2240] font-bold">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Approval: ~{rev.approvalTimeWeeks} {rev.approvalTimeWeeks === 1 ? 'Week' : 'Weeks'}
                    </span>
                  )}

                  {rev.benefitReceived && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EAFBF0] border border-[#16A34A]/20 text-[#138808] font-bold">
                      <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        task_alt
                      </span>
                      Benefit Disbursed
                    </span>
                  )}

                  {rev.processSmoothness >= 4 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FFF3EB] border border-[#E65100]/20 text-[#E65100] font-bold">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      Smooth Application
                    </span>
                  )}
                </div>

                {/* Bottom Bar: Helpful Like Button */}
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#44474E]">
                    Was this citizen review helpful to you?
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleLike(rev.reviewId)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                      rev.likedByCurrentUser
                        ? 'bg-[#EBF3FC] border-[#0D2240] text-[#0D2240] shadow-2xs'
                        : 'bg-white border-[#E2E8F0] hover:border-[#0D2240]/40 text-[#44474E]'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] ${
                        rev.likedByCurrentUser ? 'text-[#0D2240]' : 'text-slate-400'
                      }`}
                      style={{ fontVariationSettings: rev.likedByCurrentUser ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      thumb_up
                    </span>
                    <span>Helpful ({rev.likesCount || 0})</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Review Modal */}
      <SchemeReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schemeId={Number(schemeId)}
        schemeName={schemeName}
        onSubmit={handleReviewSubmit}
      />
    </section>
  )
}
