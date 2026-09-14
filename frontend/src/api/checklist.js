import client from './client'

export function getChecklist() {
  return client.get('/checklist').then((r) => r.data)
}

export function toggleChecklistItem(documentName, checked) {
  return client.post('/checklist/toggle', { documentName, checked }).then((r) => r.data)
}
