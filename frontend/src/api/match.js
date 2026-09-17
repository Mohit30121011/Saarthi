import client from './client'

export function getMyMatches() {
  return client.get('/match/my-schemes').then((r) => r.data)
}

export function refreshMatches() {
  return client.post('/match/refresh').then((r) => r.data)
}

export function simulateMatches(params = {}) {
  return client.get('/match/simulate', { params }).then((r) => r.data)
}

