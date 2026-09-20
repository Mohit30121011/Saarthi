import client from './client'
import { FALLBACK_CHECKLIST } from '../data/fallbackData'

function getStoredChecklist() {
  try {
    const raw = localStorage.getItem('saarthi_checklist')
    if (raw) return JSON.parse(raw)
  } catch {}
  return FALLBACK_CHECKLIST
}

export function getChecklist() {
  return client
    .get('/checklist')
    .then((r) => {
      if (r.data && typeof r.data === 'object') {
        localStorage.setItem('saarthi_checklist', JSON.stringify(r.data))
        return r.data
      }
      throw new Error('Invalid checklist data')
    })
    .catch((err) => {
      console.warn('Backend checklist API unavailable, using cached/fallback checklist:', err?.message)
      return getStoredChecklist()
    })
}

export function toggleChecklistItem(documentName, checked) {
  return client
    .post('/checklist/toggle', { documentName, checked })
    .then((r) => r.data)
    .catch(() => {
      const current = getStoredChecklist()
      current[documentName] = checked
      localStorage.setItem('saarthi_checklist', JSON.stringify(current))
      return { success: true }
    })
}
