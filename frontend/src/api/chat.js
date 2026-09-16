import client from './client'

export function getChatHistory() {
  return client.get('/chat/history').then((r) => r.data)
}

export function sendChatMessage(message, sessionId) {
  return client.post('/chat/message', { message, sessionId: sessionId ?? null }).then((r) => r.data)
}
