import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChatHistory, sendChatMessage } from '../api/chat'
import askSaarthiAvatarImg from '../assets/ask-saarthi-avatar.jpg'

const SUGGESTIONS = [
  'What schemes do I qualify for?',
  'Which documents do I need?',
  'Am I eligible for a scholarship?',
]

function SchemeMiniCard({ scheme }) {
  const verdictStyle = {
    STRONG: 'bg-[#156f45] text-white',
    PARTIAL: 'border border-amber-400 text-amber-700',
    NOT_MATCHED: 'bg-slate-100 text-slate-500',
  }[scheme.eligibilityVerdict]

  const verdictLabel = {
    STRONG: 'You qualify',
    PARTIAL: 'May qualify',
    NOT_MATCHED: "Doesn't match",
  }[scheme.eligibilityVerdict]

  return (
    <Link
      to={`/schemes/${scheme.schemeId}`}
      className="block bg-white border border-slate-200 rounded-2xl p-3 hover:border-[#156f45]/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-xs font-bold text-slate-900 leading-snug">{scheme.name}</p>
        {scheme.eligibilityVerdict && (
          <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${verdictStyle}`}>
            {verdictLabel}
          </span>
        )}
      </div>
      <p className="text-[10px] text-slate-500 mb-1">{scheme.ministry}</p>
      {scheme.benefitAmount && (
        <p className="text-[11px] font-semibold text-[#156f45]">{scheme.benefitAmount}</p>
      )}
      {scheme.verifiedAt && (
        <p className="text-[9px] text-slate-400 mt-1">Verified {scheme.verifiedAt}</p>
      )}
      <p className="text-[10px] font-medium text-[#156f45] mt-1.5">View details →</p>
    </Link>
  )
}

function MessageBubble({ msg }) {
  if (msg.sender === 'USER') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-[#156f45] text-white text-xs rounded-2xl rounded-br-sm px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap">
          {msg.text}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="max-w-[90%] bg-slate-50 border border-slate-100 text-slate-800 text-xs rounded-2xl rounded-bl-sm px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap">
        {msg.text}
      </div>
      {msg.schemes?.length > 0 && (
        <div className="w-[90%] space-y-2">
          {msg.schemes.map((s) => (
            <SchemeMiniCard key={s.schemeId} scheme={s} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ChatWidget() {
  const { user } = useAuth()
  const userFirstName = (user?.fullName || 'there').split(' ')[0]
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open && !hydrated) {
      getChatHistory()
        .then((data) => {
          setSessionId(data.sessionId)
          setMessages(data.messages.map((m) => ({ sender: m.sender, text: m.message, schemes: m.schemes })))
        })
        .catch(() => {})
        .finally(() => setHydrated(true))
    }
  }, [open, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend(text) {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setMessages((prev) => [...prev, { sender: 'USER', text: trimmed }])
    setInput('')
    setSending(true)
    try {
      const data = await sendChatMessage(trimmed, sessionId)
      setSessionId(data.sessionId)
      setMessages((prev) => [...prev, { sender: 'BOT', text: data.reply, schemes: data.schemes }])
    } catch (err) {
      const errorText = err.response?.data?.error || 'Something went wrong reaching the assistant. Please try again.'
      setMessages((prev) => [...prev, { sender: 'BOT', text: errorText, schemes: [] }])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-white border border-[#E5EBE5] rounded-full pl-2 pr-4 py-2 shadow-lg flex items-center gap-3 cursor-pointer hover:shadow-xl hover:border-[#156f45]/30 transition-all group"
        >
          <img
            src={askSaarthiAvatarImg}
            alt="Ask Saarthi"
            className="w-10 h-10 rounded-full object-cover border border-[#156f45]/20 shrink-0"
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Ask Saarthi</p>
            <p className="text-[10px] text-slate-500 leading-tight max-w-[190px] truncate">
              Find a scheme, check eligibility or get help
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#156f45] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4L12 2z" />
            </svg>
          </div>
        </button>
      </div>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200 max-h-[75vh]">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={askSaarthiAvatarImg} alt="Saarthi Assistant" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Saarthi Assistant</h4>
                <p className="text-[10px] text-[#156f45] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#156f45] inline-block" />
                  Online &amp; ready to help
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[220px]">
            {messages.length === 0 && (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Namaste {userFirstName}! Ask me about scheme eligibility, benefits, or required documents.
                </p>
                <div className="space-y-1.5 pt-1">
                  {SUGGESTIONS.map((query) => (
                    <button
                      key={query}
                      onClick={() => handleSend(query)}
                      className="w-full text-left p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[11px] font-medium text-slate-700 hover:text-[#156f45] transition-colors border border-slate-100 flex items-center gap-2"
                    >
                      <svg className="w-3.5 h-3.5 text-[#156f45] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{query}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} />
            ))}

            {sending && (
              <div className="flex items-center gap-1.5 px-3.5 py-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" />
              </div>
            )}
          </div>

          <div className="p-3 border-t border-slate-100 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about schemes..."
              disabled={sending}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#156f45] disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(input)
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={sending || !input.trim()}
              className="w-7 h-7 rounded-full bg-[#156f45] text-white flex items-center justify-center shrink-0 shadow-xs disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
