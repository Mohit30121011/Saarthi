import client from './client'

export function getBookmarks() {
  return client.get('/bookmarks').then((r) => r.data)
}

export function addBookmark(schemeId) {
  return client.post('/bookmarks', { schemeId }).then((r) => r.data)
}

export function removeBookmark(schemeId) {
  return client.delete(`/bookmarks/${schemeId}`).then((r) => r.data)
}
