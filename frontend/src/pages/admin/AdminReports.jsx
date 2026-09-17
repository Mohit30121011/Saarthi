import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { listAdminSchemeReports, updateAdminSchemeReportStatus } from '../../api/reports'

const REASON_COLORS = {
  DEADLINE_INCORRECT: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: 'alarm',
  },
  ELIGIBILITY_CHANGED: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'rule',
  },
  LINK_NOT_WORKING: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: 'link_off',
  },
  OTHER: {
    badge: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: 'help_outline',
  },
}

const STATUS_TABS = [
  { id: 'ALL', label: 'All Reports' },
  { id: 'PENDING', label: 'Pending Review' },
  { id: 'RESOLVED', label: 'Resolved' },
  { id: 'DISMISSED', label: 'Dismissed' },
]

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('ALL')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  function fetchReports() {
    setLoading(true)
    listAdminSchemeReports('ALL')
      .then((data) => setReports(data || []))
      .catch((err) => setError('Failed to load reported schemes: ' + (err.response?.data?.error || err.message)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [])

  async function handleStatusUpdate(reportId, newStatus) {
    const adminNotes = window.prompt(`Add resolution note for marking as ${newStatus} (optional):`, '')
    if (adminNotes === null) return // cancelled

    setActionLoadingId(reportId)
    try {
      await updateAdminSchemeReportStatus(reportId, {
        status: newStatus,
        adminNotes: adminNotes.trim(),
      })
      showToast(`Report #${reportId} updated to ${newStatus}.`)
      fetchReports()
    } catch (err) {
      alert('Failed to update report status: ' + (err.response?.data?.error || err.message))
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredReports = useMemo(() => {
    if (activeTab === 'ALL') return reports
    return reports.filter((r) => r.status === activeTab)
  }, [reports, activeTab])

  const pendingCount = useMemo(() => reports.filter((r) => r.status === 'PENDING').length, [reports])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D2240] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-[18px] text-[#138808]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-extrabold text-[#0D2240]">
              Reported Outdated Schemes
            </h1>
            {pendingCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {pendingCount} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-[#555E6D] mt-1">
            Crowdsourced citizen audit desk. Review user flags, audit Gazette references, and resolve scheme discrepancies.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-xs font-bold text-[#0D2240] hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const count = tab.id === 'ALL' ? reports.length : reports.filter((r) => r.status === tab.id).length
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-[#0D2240] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-[#E2E8F0]">
          <span className="material-symbols-outlined text-3xl animate-spin text-[#0D2240]">progress_activity</span>
          <p className="mt-2 font-semibold">Loading reported schemes...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E2E8F0] space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h3 className="text-sm font-bold text-[#0D2240]">No reports in this queue</h3>
          <p className="text-xs text-slate-500">
            {activeTab === 'PENDING'
              ? 'All crowdsourced citizen reports have been reviewed and resolved.'
              : 'No reported scheme discrepancies match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredReports.map((report) => {
            const reasonConfig = REASON_COLORS[report.reason] || REASON_COLORS.OTHER
            const isPending = report.status === 'PENDING'
            const isResolved = report.status === 'RESOLVED'
            const isDismissed = report.status === 'DISMISSED'

            return (
              <div
                key={report.reportId}
                className="p-5 bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#CBD5E1] shadow-xs transition-all space-y-3"
              >
                {/* Top Row: Scheme title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{report.reportId}
                    </span>
                    <Link
                      to={`/schemes/${report.schemeId}`}
                      target="_blank"
                      className="text-sm font-bold text-[#0D2240] hover:text-[#E65100] hover:underline transition-colors truncate"
                      title="Inspect scheme detail in new tab"
                    >
                      {report.schemeName}
                    </Link>
                    <span className="material-symbols-outlined text-[14px] text-slate-400">
                      open_in_new
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isResolved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : isResolved ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                      <span>{report.status}</span>
                    </span>
                  </div>
                </div>

                {/* Reason & Details */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border ${reasonConfig.badge}`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{reasonConfig.icon}</span>
                    <span>{report.reasonLabel || report.reason}</span>
                  </span>

                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    Reported by: <strong className="text-slate-700">{report.userName || report.userEmail || 'Citizen (Guest)'}</strong>
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">
                    {report.createdAt ? new Date(report.createdAt).toLocaleString('en-IN') : 'Recent'}
                  </span>
                </div>

                {report.details && (
                  <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs text-[#334155] font-medium leading-relaxed">
                    <strong className="text-slate-700">Citizen Note: </strong>
                    {report.details}
                  </div>
                )}

                {report.adminNotes && (
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-900">
                    <strong>Admin Resolution Note: </strong>
                    {report.adminNotes}
                    {report.reviewerName && <span className="text-emerald-700 font-semibold ml-1">— {report.reviewerName}</span>}
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/schemes/${report.schemeId}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0D2240] hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Inspect Scheme</span>
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                    </Link>
                    <Link
                      to="/admin/schemes"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center gap-1"
                    >
                      <span>Edit in Catalog</span>
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                    </Link>
                  </div>

                  {isPending && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(report.reportId, 'DISMISSED')}
                        disabled={actionLoadingId === report.reportId}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(report.reportId, 'RESOLVED')}
                        disabled={actionLoadingId === report.reportId}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        <span>Mark Resolved</span>
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => handleStatusUpdate(report.reportId, 'PENDING')}
                      disabled={actionLoadingId === report.reportId}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Reopen as Pending
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
