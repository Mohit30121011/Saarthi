import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'

const TYPE_ICON = { NEW_MATCH: '⭐', DEADLINE_APPROACHING: '⏰' }

export default function Notifications() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    getNotifications().then(setData).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleRowClick(n) {
    if (!n.read) {
      await markNotificationRead(n.notificationId)
      load()
    }
  }

  async function handleMarkAll() {
    await markAllNotificationsRead()
    load()
  }

  if (loading || !data) return <div className="text-center py-24 text-saarthi-muted">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fraunces text-3xl font-bold text-saarthi-ink">Notifications</h1>
        {data.unreadCount > 0 && (
          <button onClick={handleMarkAll} className="text-sm font-medium text-saarthi-green hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {data.notifications.length === 0 && (
        <p className="text-saarthi-muted text-center py-16">No notifications yet.</p>
      )}

      <div className="bg-white rounded-2xl border border-saarthi-border divide-y divide-saarthi-border overflow-hidden">
        {data.notifications.map((n) => (
          <button
            key={n.notificationId}
            onClick={() => handleRowClick(n)}
            className={`w-full text-left px-5 py-4 flex items-start gap-3 transition-colors hover:bg-saarthi-bg ${!n.read ? 'bg-[#F5FAF7]' : 'bg-white'}`}
          >
            <span className="text-lg shrink-0">{TYPE_ICON[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-saarthi-green shrink-0" />}
                <p className="text-sm font-medium text-saarthi-ink">{n.title}</p>
              </div>
              <p className="text-sm text-saarthi-body mt-0.5">{n.message}</p>
              {n.schemeId && (
                <Link to={`/schemes/${n.schemeId}`} className="text-xs text-saarthi-green hover:underline mt-1 inline-block">
                  View scheme →
                </Link>
              )}
              {n.createdAt && <p className="text-[11px] text-saarthi-muted mt-1">{n.createdAt}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
