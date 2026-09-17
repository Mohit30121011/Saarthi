// frontend/src/components/SchemeReviewModal.jsx
import { useState } from 'react'
import SchemeRatingStars from './SchemeRatingStars'

const RATING_LABELS = {
  1: 'Poor / Faced Obstacles (खराब / अडचणी आल्या)',
  2: 'Fair / Multiple Visits Required (साधारण)',
  3: 'Good / Standard Processing (चांगला)',
  4: 'Very Good / Fast Verification (खूप चांगला)',
  5: 'Excellent / Smooth & Timely (उत्कृष्ट / वेळेत लाभ)',
}

export default function SchemeReviewModal({
  isOpen,
  onClose,
  schemeName,
  schemeId,
  onSubmit,
}) {
  const [rating, setRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewText, setReviewText] = useState('')
  const [processSmoothness, setProcessSmoothness] = useState(5)
  const [approvalTimeWeeks, setApprovalTimeWeeks] = useState(2)
  const [benefitReceived, setBenefitReceived] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!reviewTitle.trim()) {
      setError('Please provide a short summary title for your review.')
      return
    }
    if (!reviewText.trim()) {
      setError('Please share your experience with the application and verification process.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        schemeId,
        rating,
        reviewTitle: reviewTitle.trim(),
        reviewText: reviewText.trim(),
        processSmoothness,
        approvalTimeWeeks: Number(approvalTimeWeeks),
        benefitReceived,
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D2240]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-[#E65100] uppercase tracking-wide">
              Citizen Real-World Feedback
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0D2240] line-clamp-1">
              Rate &amp; Review: {schemeName}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-[#0D2240] p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {/* Overall Star Rating */}
          <div className="space-y-2 bg-[#F0F3FF] p-4 rounded-xl border border-[#DEE8FF]">
            <label className="block text-xs font-bold text-[#0D2240]">
              Overall Scheme Rating (एकूण अनुभव)
            </label>
            <div className="flex items-center gap-3">
              <SchemeRatingStars
                rating={rating}
                interactive
                onChange={setRating}
                size="lg"
                showCount={false}
              />
              <span className="text-xs font-bold text-[#0D2240]">
                {rating} / 5 Stars
              </span>
            </div>
            <p className="text-[11px] text-[#44474E] font-medium">
              {RATING_LABELS[rating]}
            </p>
          </div>

          {/* Review Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0D2240]" htmlFor="review-title">
              Review Title (थोडक्यात शीर्षक)
            </label>
            <input
              id="review-title"
              type="text"
              placeholder="e.g. Received DBT in 2 weeks smoothly / Fast verification"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={100}
              className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all"
            />
          </div>

          {/* Detailed Experience */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0D2240]" htmlFor="review-text">
              Detailed Experience &amp; Tips for Citizens (तुमचा सविस्तर अनुभव)
            </label>
            <textarea
              id="review-text"
              rows={4}
              placeholder="Share how you applied, how long document verification took, hospital/bank experience, or any advice for other applicants..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs sm:text-sm font-medium text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Application Timeline & Process Ease (2-Col) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Approval Time in Weeks */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D2240]" htmlFor="approval-weeks">
                Approval Time (मंजुरी कालावधी)
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[18px] text-slate-400 pointer-events-none">
                  schedule
                </span>
                <select
                  id="approval-weeks"
                  value={approvalTimeWeeks}
                  onChange={(e) => setApprovalTimeWeeks(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:outline-none cursor-pointer"
                >
                  <option value={1}>Within 1 Week (1 आठवडा)</option>
                  <option value={2}>2 Weeks (2 आठवडे)</option>
                  <option value={3}>3 Weeks (3 आठवडे)</option>
                  <option value={4}>4 Weeks / 1 Month (1 महिना)</option>
                  <option value={6}>6 Weeks (दीड महिना)</option>
                  <option value={8}>8+ Weeks (2 महिने+)</option>
                </select>
              </div>
            </div>

            {/* Process Smoothness */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0D2240]" htmlFor="smoothness">
                Process Ease (प्रक्रियेचा सुलभपणा)
              </label>
              <select
                id="smoothness"
                value={processSmoothness}
                onChange={(e) => setProcessSmoothness(Number(e.target.value))}
                className="w-full h-10 px-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111C2D] focus:bg-white focus:border-[#0D2240] focus:outline-none cursor-pointer"
              >
                <option value={5}>5/5 - 100% Online &amp; Hassle-Free</option>
                <option value={4}>4/5 - Smooth with Minor Document Check</option>
                <option value={3}>3/5 - Average / Needed 1 Visit</option>
                <option value={2}>2/5 - Slow / Multiple Counter Visits</option>
                <option value={1}>1/5 - Complex &amp; Difficult</option>
              </select>
            </div>
          </div>

          {/* Benefit Received Confirmation */}
          <div className="flex items-center justify-between p-3.5 bg-[#EAFBF0] border border-[#16A34A]/25 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#138808] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              <div>
                <p className="text-xs font-bold text-[#0D2240]">
                  Benefit received as officially described?
                </p>
                <p className="text-[11px] text-[#44474E]">
                  Confirms the actual aid or subsidy reached your bank account/card.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBenefitReceived(!benefitReceived)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                benefitReceived
                  ? 'bg-[#138808] text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {benefitReceived ? '✓ Yes, Received' : 'Pending / No'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#44474E] hover:text-[#0D2240] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#0D2240] hover:bg-[#08182B] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Publishing Review...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Post Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
