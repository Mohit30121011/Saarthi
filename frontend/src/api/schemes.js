import client from './client'

export function searchSchemes({ category, state, q } = {}) {
  const params = {}
  if (category) params.category = category
  if (state) params.state = state
  if (q) params.q = q
  return client.get('/schemes', { params }).then((r) => r.data)
}

export function getSchemeDetail(schemeId) {
  return client.get(`/schemes/${schemeId}`).then((r) => r.data)
}
