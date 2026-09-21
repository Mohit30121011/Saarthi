import client from './client'
import { processCivicChat } from '../data/chatEngine'

function getStoredHistory() {
  try {
    const raw = localStorage.getItem('saarthi_chat_history')
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveHistoryMessage(entry) {
  try {
    const history = getStoredHistory()
    history.push(entry)
    localStorage.setItem('saarthi_chat_history', JSON.stringify(history.slice(-30)))
  } catch {}
}

export function getChatHistory() {
  return client
    .get('/chat/history')
    .then((r) => {
      if (r.data && typeof r.data === 'object' && Array.isArray(r.data.messages)) {
        return r.data
      }
      throw new Error('Invalid chat history response')
    })
    .catch((err) => {
      console.warn('Backend chat history API unavailable, using cached session:', err?.message)
      const messages = getStoredHistory()
      return {
        sessionId: Date.now(),
        messages,
      }
    })
}

export function sendChatMessage(message, sessionId) {
  saveHistoryMessage({ sender: 'USER', text: message, createdAt: new Date().toISOString() })

  return client
    .post('/chat/message', { message, sessionId: sessionId ?? null })
    .then((r) => {
      if (r.data && typeof r.data === 'object' && r.data.reply) {
        saveHistoryMessage({
          sender: 'BOT',
          text: r.data.reply,
          schemes: r.data.schemes || [],
          createdAt: new Date().toISOString(),
        })
        return r.data
      }
      throw new Error('Invalid chat reply response')
    })
    .catch((err) => {
      console.warn('Backend chat API unavailable, falling back to grounded Civic AI Assistant engine:', err?.message)
      const replyData = processCivicChat(message, sessionId)
      saveHistoryMessage({
        sender: 'BOT',
        text: replyData.reply,
        schemes: replyData.schemes || [],
        createdAt: new Date().toISOString(),
      })
      return replyData
    })
}
