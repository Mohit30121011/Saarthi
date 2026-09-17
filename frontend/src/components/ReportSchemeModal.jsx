import { useState } from 'react'
import { submitSchemeReport } from '../api/reports'

const REPORT_REASONS = [
  {
    id: 'DEADLINE_INCORRECT',
    label: 'Deadline appears incorrect',
    icon: 'alarm',
    description: 'Application window dates, closing dates, or review periods are outdated.',
  },
  {
    id: 'ELIGIBILITY_CHANGED',
    label: 'Eligibility information changed',
    icon: 'rule',
    description: 'Income criteria, age limits, caste reservations, or state norms have been revised.',
  },
  {
    id: 'LINK_NOT_WORKING',
    label: 'Application link not working',
    icon: 'link_off',
    description: 'Official department portal, direct application URL, or GR link is broken (404/expired).',
  },
  {
    id: 'OTHER',
    label: 'Other',
    icon: 'help_outline',
    description: 'Any other inaccuracy, typographical error, or discrepancy in scheme guidelines.',
  },
]

export default function ReportSchemeModal({ schemeId, schemeName, isOpen, onClose, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('DEADLINE_INCORRECT')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const reasonObj = REPORT_REASONS.find((r) => r.id === selectedReason) || REPORT_REASONS[3]

    try {
      await submitSchemeReport({
        schemeId,
        reason: selectedReason,
        reasonLabel: reasonObj.label,
        details: details.trim(),
      })
      onSuccess?.('Thank you for your report! Our administrative team will verify and audit this scheme.')
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D2240]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#CBD5E1] overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
      >
        {/* Top Decorative Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#E65100] via-[#FF9933] to-[#138808]" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-[#E2E8F0] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">report_problem</span>
            </div>
            <div className="min-w-0">
              <h3 id="report-modal-title" className="text-base font-bold text-[#0D2240] truncate">
                Report Outdated Scheme
              </h3>
              <p className="text-xs text-[#555E6D] truncate mt-0.5" title={schemeName}>
                {schemeName || 'Government Welfare Scheme'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#0D2240] mb-2">
              Select the issue you noticed:
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((option) => {
                const isChecked = selectedReason === option.id
                return (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-[#F0F3FF] border-[#0D2240] shadow-xs'
                        : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={option.id}
                      checked={isChecked}
                      onChange={() => setSelectedReason(option.id)}
                      className="mt-1 h-4 w-4 text-[#0D2240] border-[#CBD5E1] focus:ring-[#0D2240] cursor-pointer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`material-symbols-outlined text-[16px] ${isChecked ? 'text-[#0D2240]' : 'text-slate-400'}`}>
                          {option.icon}
                        </span>
                        <span className={`text-xs font-bold ${isChecked ? 'text-[#0D2240]' : 'text-[#111C2D]'}`}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {option.description}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <div>
            <label htmlFor="report-details" className="block text-xs font-bold text-[#0D2240] mb-1">
              Additional Details / Correct URL or Date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="report-details"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. The application portal announced an extension to 15th October, or link is showing Error 404..."
              className="w-full text-xs p-3 rounded-xl border border-[#CBD5E1] focus:outline-none focus:ring-2 focus:ring-[#0D2240] focus:border-[#0D2240] bg-[#F8FAFC] placeholder:text-slate-400 transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-[#555E6D] flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">verified_user</span>
            <span>Reports are reviewed by Saarthi portal administrators against official Gazette Notifications.</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-[#44474E] hover:text-[#0D2240] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0D2240] hover:bg-[#1E3A8A] rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Submit Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
