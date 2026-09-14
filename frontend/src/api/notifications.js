import client from './client'

export function getNotifications() {
  return client.get('/notifications').then((r) => r.data)
}

export function markNotificationRead(notificationId) {
  return client.put(`/notifications/${notificationId}/read`).then((r) => r.data)
}

export function markAllNotificationsRead() {
  return client.put('/notifications/read-all').then((r) => r.data)
}
