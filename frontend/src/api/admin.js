import client from './client'
import { ALL_SCHEMES } from '../data/fallbackData'

export function listSchemes() {
  return client
    .get('/admin/schemes')
    .then((r) => r.data)
    .catch(() => ALL_SCHEMES)
}

export function getSchemeDetail(schemeId) {
  return client
    .get(`/admin/schemes/${schemeId}`)
    .then((r) => r.data)
    .catch(() => ALL_SCHEMES.find((s) => String(s.schemeId) === String(schemeId)) || ALL_SCHEMES[0])
}

export function createScheme(scheme) {
  return client.post('/admin/schemes', scheme).then((r) => r.data)
}

export function updateScheme(schemeId, scheme) {
  return client.put(`/admin/schemes/${schemeId}`, scheme).then((r) => r.data)
}

export function deactivateScheme(schemeId) {
  return client.delete(`/admin/schemes/${schemeId}`).then((r) => r.data)
}

export function addRule(schemeId, rule) {
  return client.post(`/admin/schemes/${schemeId}/rules`, rule).then((r) => r.data)
}

export function updateRule(ruleId, rule) {
  return client.put(`/admin/rules/${ruleId}`, rule).then((r) => r.data)
}

export function deleteRule(ruleId) {
  return client.delete(`/admin/rules/${ruleId}`).then((r) => r.data)
}

export function addDocument(schemeId, document) {
  return client.post(`/admin/schemes/${schemeId}/documents`, document).then((r) => r.data)
}

export function updateDocument(docId, document) {
  return client.put(`/admin/documents/${docId}`, document).then((r) => r.data)
}

export function deleteDocument(docId) {
  return client.delete(`/admin/documents/${docId}`).then((r) => r.data)
}
