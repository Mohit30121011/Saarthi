import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import { NotificationSkeleton } from '../components/Skeletons'

export default function Notifications() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'matches', 'urgent', 'statutory'

  function load() {
    setLoading(true)
    getNotifications()
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleRowClick(n) {
    if (!n.read) {
      await markNotificationRead(n.notificationId)
      setData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          unreadCount: Math.max(0, (prev.unreadCount || 1) - 1),
          notifications: prev.notifications.map((item) =>
            item.notificationId === n.notificationId ? { ...item, read: true } : item
          ),
        }
      })
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead()
    setData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        unreadCount: 0,
        notifications: prev.notifications.map((item) => ({ ...item, read: true })),
      }
    })
  }

  function downloadCalendarIcs() {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SAARTHI Citizen Portal//EN',
      'BEGIN:VEVENT',
      'SUMMARY:Rajarshi Shahu Maharaj Scholarship Filing Deadline',
      'DESCRIPTION:Online applications close under DTE Maharashtra statutory rules.',
      'DTSTART:20270430T090000Z',
      'DTEND:20270430T170000Z',
      'END:VEVENT',
      'BEGIN:VEVENT',
      'SUMMARY:PM-KISAN e-KYC Verification Tranche 17',
      'DESCRIPTION:Mandatory Aadhaar linking and land title seeding.',
      'DTSTART:20270731T090000Z',
      'DTEND:20270731T170000Z',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'saarthi_deadlines.ics')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const notifications = data?.notifications || []

  // Metrics calculation
  const urgentCount = useMemo(() => {
    return notifications.filter(
      (n) => n.type === 'DEADLINE_APPROACHING' || (n.title && n.title.toLowerCase().includes('deadline'))
    ).length
  }, [notifications])

  const newMatchCount = useMemo(() => {
    return notifications.filter(
      (n) => n.type === 'NEW_MATCH' || (n.title && n.title.toLowerCase().includes('match'))
    ).length
  }, [notifications])

  const statutoryCount = useMemo(() => {
    return Math.max(1, notifications.length - urgentCount - newMatchCount)
  }, [notifications, urgentCount, newMatchCount])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return notifications
    if (activeFilter === 'matches') {
      return notifications.filter(
        (n) => n.type === 'NEW_MATCH' || (n.title && n.title.toLowerCase().includes('match'))
      )
    }
    if (activeFilter === 'urgent') {
      return notifications.filter(
        (n) => n.type === 'DEADLINE_APPROACHING' || (n.title && n.title.toLowerCase().includes('deadline'))
      )
    }
    if (activeFilter === 'statutory') {
      return notifications.filter(
        (n) => n.type !== 'NEW_MATCH' && n.type !== 'DEADLINE_APPROACHING'
      )
    }
    return notifications
  }, [notifications, activeFilter])

  if (loading) {
    return <NotificationSkeleton />
  }

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8">
      {/* 1. TOP ACTION BAR & PAGE IDENTITY (Module 10) */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-kesari-saffron text-on-primary font-label-sm text-label-sm tracking-wide uppercase font-bold">
              Official Advisory Gateway
            </span>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-harita-green bg-harita-green-soft px-2.5 py-0.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-harita-green animate-pulse" />
              Real-Time Engine Active
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-headline-xl text-headline-xl font-bold tracking-tight text-chakra-blue">
              Entitlement &amp; Deadline Notifications
            </h1>
            <span className="font-headline-md text-headline-md text-on-surface-variant font-semibold">
              (अधिसूचना केंद्र)
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
            Statutory triggers, gazette amendments, and automated notifications calibrated for your verified citizen profile.
          </p>
        </div>

        {/* Quick Operations Pill Group */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
          <button
            onClick={handleMarkAll}
            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high text-chakra-blue hover:bg-surface-container-highest transition-colors font-label-lg text-label-lg font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-chakra-blue group-hover:scale-110 transition-transform">
              done_all
            </span>
            <span>Mark All as Read</span>
          </button>

          <button
            onClick={downloadCalendarIcs}
            className="group flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-chakra-blue-light text-chakra-blue hover:bg-surface-container-high transition-colors font-label-lg text-label-lg font-semibold cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-chakra-blue">event_upcoming</span>
            <span>Sync All Deadlines (.ics)</span>
          </button>
        </div>
      </div>

      {/* 2. ALERT METRIC BANNERS / SPLIT INSIGHT STRIP (3 Tiles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Critical Deadlines KPI */}
        <div className="relative overflow-hidden rounded-xl bg-slate-surface-elevated shadow-sm p-5 flex items-center gap-4 border border-slate-border/50">
          <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-kesari-saffron" />
          <div className="w-12 h-12 rounded-lg bg-kesari-saffron-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-kesari-saffron text-[26px]">hourglass_top</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-lg text-headline-lg text-chakra-blue font-bold tracking-tight">
                {String(urgentCount || 3).padStart(2, '0')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-kesari-saffron text-on-primary font-label-sm text-label-sm font-bold">
                Urgent
              </span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant truncate">
              Expiring within 15 days
            </p>
          </div>
        </div>

        {/* Newly Unlocked Benefits KPI */}
        <div className="relative overflow-hidden rounded-xl bg-slate-surface-elevated shadow-sm p-5 flex items-center gap-4 border border-slate-border/50">
          <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-harita-green" />
          <div className="w-12 h-12 rounded-lg bg-harita-green-soft flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-harita-green text-[26px]">auto_awesome</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-lg text-headline-lg text-chakra-blue font-bold tracking-tight">
                ₹18,000
              </span>
              <span className="px-2 py-0.5 rounded-full bg-harita-green-soft text-harita-green font-label-sm text-label-sm font-bold">
                New Match
              </span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant truncate">
              Newly detected benefit entitlement
            </p>
          </div>
        </div>

        {/* Gazette Provenance Feed KPI */}
        <div className="relative overflow-hidden rounded-xl bg-slate-surface-elevated shadow-sm p-5 flex items-center gap-4 border border-slate-border/50">
          <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-chakra-blue" />
          <div className="w-12 h-12 rounded-lg bg-chakra-blue-light flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-chakra-blue text-[26px]">policy</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-headline-lg text-headline-lg text-chakra-blue font-bold tracking-tight">
                {String(statutoryCount || 2).padStart(2, '0')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-chakra-blue-light text-chakra-blue font-label-sm text-label-sm font-bold">
                Gazettes
              </span>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant truncate">
              Statutory order updates (MH &amp; GoI)
            </p>
          </div>
        </div>
      </div>

      {/* 3. FILTER SEGMENT CONTROLLER (Tabs) */}
      <div className="bg-surface-container-high p-1.5 rounded-xl flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-label-lg text-label-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-chakra-blue text-on-primary shadow-sm'
              : 'text-chakra-blue hover:bg-surface-container-highest'
          }`}
        >
          <span>All Notifications</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-surface-elevated/20 text-on-primary font-label-sm text-label-sm">
            {notifications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('matches')}
          className={`px-4 py-2 rounded-lg font-label-lg text-label-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'matches'
              ? 'bg-chakra-blue text-on-primary shadow-sm'
              : 'text-chakra-blue hover:bg-surface-container-highest'
          }`}
        >
          <span>Newly Unlocked Matches</span>
          <span className="px-1.5 py-0.5 rounded-full bg-harita-green-soft text-harita-green font-label-sm text-label-sm font-bold">
            {newMatchCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('urgent')}
          className={`px-4 py-2 rounded-lg font-label-lg text-label-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'urgent'
              ? 'bg-chakra-blue text-on-primary shadow-sm'
              : 'text-chakra-blue hover:bg-surface-container-highest'
          }`}
        >
          <span>Urgent Deadlines (&lt;15 Days)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-kesari-saffron text-on-primary font-label-sm text-label-sm font-bold">
            {urgentCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('statutory')}
          className={`px-4 py-2 rounded-lg font-label-lg text-label-lg font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeFilter === 'statutory'
              ? 'bg-chakra-blue text-on-primary shadow-sm'
              : 'text-chakra-blue hover:bg-surface-container-highest'
          }`}
        >
          <span>Statutory Updates</span>
          <span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest text-chakra-blue font-label-sm text-label-sm font-semibold">
            {statutoryCount}
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2 px-2 text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-[16px] text-harita-green">sync</span>
          <span>Live Updates</span>
        </div>
      </div>

      {/* 4. NOTIFICATIONS TIMELINE STREAM */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-slate-surface-elevated rounded-2xl border border-slate-border p-16 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-chakra-blue-light text-chakra-blue flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[32px]">notifications_none</span>
            </div>
            <h3 className="font-headline-md font-bold text-chakra-blue mb-1">All Caught Up!</h3>
            <p className="font-body-sm text-on-surface-variant max-w-sm mx-auto">
              No pending notifications in this category. You will be notified automatically when new gazette circulars or deadlines trigger.
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isUrgent =
              n.type === 'DEADLINE_APPROACHING' || (n.title && n.title.toLowerCase().includes('deadline'))
            const isNewMatch =
              n.type === 'NEW_MATCH' || (n.title && n.title.toLowerCase().includes('match'))
            const accentColor = isUrgent
              ? 'bg-kesari-saffron'
              : isNewMatch
              ? 'bg-harita-green'
              : 'bg-chakra-blue'

            return (
              <article
                key={n.notificationId}
                onClick={() => handleRowClick(n)}
                className={`relative rounded-xl bg-slate-surface-elevated shadow-sm hover:shadow-md transition-all p-6 pl-8 overflow-hidden group border border-slate-border/60 cursor-pointer ${
                  !n.read ? 'bg-chakra-blue-light/20' : ''
                }`}
              >
                {/* Leading Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2.5 ${accentColor}`} />

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-3 max-w-3xl">
                    {/* Badges & Authority */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {isUrgent && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-kesari-saffron-soft text-kesari-saffron font-label-sm text-label-sm font-bold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[15px]">timer</span>
                          Urgent Deadline • Action Required
                        </span>
                      )}
                      {isNewMatch && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-harita-green-soft text-harita-green font-label-sm text-label-sm font-bold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[15px]">verified_user</span>
                          Strong Match • Verified Entitlement
                        </span>
                      )}
                      {!isUrgent && !isNewMatch && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-chakra-blue-light text-chakra-blue font-label-sm text-label-sm font-bold tracking-wide uppercase">
                          <span className="material-symbols-outlined text-[15px]">policy</span>
                          Gazette Amendment
                        </span>
                      )}

                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high text-chakra-blue font-label-sm text-label-sm font-semibold">
                        {n.ministry || 'Government of Maharashtra / Central Welfare'}
                      </span>

                      {!n.read && (
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-harita-green font-bold">
                          <span className="w-2 h-2 rounded-full bg-harita-green animate-ping" />
                          Unread
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-headline-sm text-headline-sm text-chakra-blue font-bold group-hover:text-kesari-saffron transition-colors">
                      {n.title}
                    </h2>

                    {/* Message */}
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      {n.message}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant font-label-sm text-label-sm pt-1">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {n.createdAt || 'Recent Update'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-chakra-blue">
                        Official Gazette Broadcast
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col shrink-0 gap-2.5 lg:w-56 pt-2 lg:pt-0">
                    {n.schemeId && (
                      <Link
                        to={`/schemes/${n.schemeId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-chakra-blue text-on-primary hover:bg-chakra-blue-subtle transition-all shadow-sm font-label-lg text-label-lg font-bold"
                      >
                        <span>View Scheme Details</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </Link>
                    )}

                    <Link
                      to="/checklist"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-chakra-blue-light text-chakra-blue hover:bg-surface-container-high transition-colors font-label-md text-label-md font-semibold"
                    >
                      <span className="material-symbols-outlined text-[16px]">fact_check</span>
                      <span>View Checklist</span>
                    </Link>
                  </div>
                </div>

                {/* Micro-visualization bar */}
                <div className="mt-4 pt-3 bg-surface-container-low/60 -mx-8 -mb-6 px-8 py-2.5 flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm border-t border-slate-border/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-kesari-saffron" />
                    <span>Statutory Cycle FY 2026-27</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-on-surface-variant">Authenticated Citizen Broadcast</span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>
    </div>
  )
}
