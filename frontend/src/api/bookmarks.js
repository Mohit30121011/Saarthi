import client from './client'
import { FALLBACK_BOOKMARKS } from '../data/fallbackData'

function getStoredBookmarks() {
  try {
    const raw = localStorage.getItem('saarthi_bookmarks')
    if (raw) return JSON.parse(raw)
  } catch {}
  return FALLBACK_BOOKMARKS
}

export function getBookmarks() {
  return client
    .get('/bookmarks')
    .then((r) => {
      if (Array.isArray(r.data)) {
        localStorage.setItem('saarthi_bookmarks', JSON.stringify(r.data))
        return r.data
      }
      throw new Error('Invalid bookmarks data')
    })
    .catch((err) => {
      console.warn('Backend bookmarks API unavailable, using cached/fallback bookmarks:', err?.message)
      return getStoredBookmarks()
    })
}

export function addBookmark(schemeId) {
  return client
    .post('/bookmarks', { schemeId })
    .then((r) => r.data)
    .catch(() => {
      const current = getStoredBookmarks()
      if (!current.some((b) => b.schemeId === schemeId)) {
        current.push({ bookmarkId: Date.now(), schemeId, createdAt: new Date().toISOString() })
        localStorage.setItem('saarthi_bookmarks', JSON.stringify(current))
      }
      return { success: true }
    })
}

export function removeBookmark(schemeId) {
  return client
    .delete(`/bookmarks/${schemeId}`)
    .then((r) => r.data)
    .catch(() => {
      const current = getStoredBookmarks().filter((b) => b.schemeId !== schemeId)
      localStorage.setItem('saarthi_bookmarks', JSON.stringify(current))
      return { success: true }
    })
}
