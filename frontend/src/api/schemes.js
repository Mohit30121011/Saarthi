import client from './client'
import { ALL_SCHEMES } from '../data/fallbackData'

export function searchSchemes({ category, state, q } = {}) {
  const params = {}
  if (category) params.category = category
  if (state) params.state = state
  if (q) params.q = q
  return client
    .get('/schemes', { params })
    .then((r) => {
      if (Array.isArray(r.data)) return r.data
      throw new Error('Invalid schemes response')
    })
    .catch((err) => {
      console.warn('Backend schemes API unavailable, using fallback schemes:', err?.message)
      let list = ALL_SCHEMES
      if (category && category !== 'all') {
        list = list.filter((s) => (s.categoryName || '').toLowerCase().includes(category.toLowerCase()))
      }
      if (state && state !== 'all') {
        list = list.filter((s) => !s.state || s.state.toLowerCase() === state.toLowerCase())
      }
      if (q) {
        const lower = q.toLowerCase()
        list = list.filter(
          (s) =>
            (s.name || '').toLowerCase().includes(lower) ||
            (s.description || '').toLowerCase().includes(lower) ||
            (s.ministry || '').toLowerCase().includes(lower)
        )
      }
      return list
    })
}

export function getSchemeDetail(schemeId) {
  return client
    .get(`/schemes/${schemeId}`)
    .then((r) => {
      if (r.data && typeof r.data === 'object') return r.data
      throw new Error('Invalid scheme detail')
    })
    .catch((err) => {
      console.warn('Backend scheme detail API unavailable, using fallback:', err?.message)
      const found = ALL_SCHEMES.find((s) => String(s.schemeId) === String(schemeId))
      return found || ALL_SCHEMES[0]
    })
}
