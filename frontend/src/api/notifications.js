import client from './client'
import { FALLBACK_NOTIFICATIONS } from '../data/fallbackData'

function getStoredNotifications() {
  try {
    const raw = localStorage.getItem('saarthi_notifications')
    if (raw) return JSON.parse(raw)
  } catch {}
  return FALLBACK_NOTIFICATIONS
}

export function getNotifications() {
  return client
    .get('/notifications')
    .then((r) => {
      if (Array.isArray(r.data)) {
        localStorage.setItem('saarthi_notifications', JSON.stringify(r.data))
        return r.data
      }
      throw new Error('Invalid notifications data')
    })
    .catch((err) => {
      console.warn('Backend notifications API unavailable, using cached/fallback notifications:', err?.message)
      return getStoredNotifications()
    })
}

export function markNotificationRead(notificationId) {
  return client
    .put(`/notifications/${notificationId}/read`)
    .then((r) => r.data)
    .catch(() => {
      const list = getStoredNotifications().map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
      localStorage.setItem('saarthi_notifications', JSON.stringify(list))
      return { success: true }
    })
}

export function markAllNotificationsRead() {
  return client
    .put('/notifications/read-all')
    .then((r) => r.data)
    .catch(() => {
      const list = getStoredNotifications().map((n) => ({ ...n, isRead: true }))
      localStorage.setItem('saarthi_notifications', JSON.stringify(list))
      return { success: true }
    })
}
