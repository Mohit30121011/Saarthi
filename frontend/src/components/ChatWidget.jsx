import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChatHistory, sendChatMessage } from '../api/chat'
import indianCitizenHeadshot from '../assets/indian-citizen-headshot.png'

const MAX_MESSAGE_LENGTH = 1000
const WARN_MESSAGE_LENGTH = 850

const SUGGESTED_INQUIRIES = [
  { icon: 'event', text: 'What schemes do I qualify for?' },
  { icon: 'school', text: 'What is the application deadline for Rajarshi Shahu Maharaj Scholarship?' },
  { icon: 'domain_add', text: 'Which documents do I need for Majhi Ladki Bahin?' },
  { icon: 'autorenew', text: 'How to renew Tahsildar Income Certificate online?' },
]

function formatTimestamp(value) {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : 'Just now'

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  return `${date.toLocaleDateString([], { day: '2-digit', month: 'short' })}, ${time}`
}

function renderInline(text, keyPrefix) {
  // Splits on **bold** markers and returns an array of strings/<strong> nodes.
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter((p) => p !== '')
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`} className="font-bold">{part.slice(2, -2)}</strong>
    }
    return <span key={`${keyPrefix}-${i}`}>{part}</span>
  })
}

/** The model is instructed to reply in plain text but routinely emits light markdown
 * (bold + `*`/`-` bullets); rendering it verbatim as pre-wrap text shows literal
 * asterisks, so translate the small subset we actually see into real markup. */
function FormattedMessage({ text }) {
  const lines = (text || '').split('\n')
  const blocks = []
  let currentList = null

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[*-]\s+(.*)$/)
    if (bulletMatch) {
      if (!currentList) {
        currentList = { type: 'ul', items: [] }
        blocks.push(currentList)
      }
      currentList.items.push(bulletMatch[1])
    } else {
      currentList = null
      blocks.push({ type: 'line', text: line })
    }
  }

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === 'ul') {
          return (
            <ul key={i} className="list-disc pl-5 my-1.5 flex flex-col gap-1">
              {block.items.map((item, j) => (
                <li key={j} className="leading-relaxed">{renderInline(item, `${i}-${j}`)}</li>
              ))}
            </ul>
          )
        }
        if (block.text.trim() === '') {
          return <div key={i} className="h-2" />
        }
        return (
          <p key={i} className="leading-relaxed">
            {renderInline(block.text, `${i}`)}
          </p>
        )
      })}
    </>
  )
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    return true
  } catch {
    return false
  }
}

function SchemeMiniCard({ scheme }) {
  const isStrong = scheme.eligibilityVerdict === 'STRONG'
  const isNotMatched = scheme.eligibilityVerdict === 'NOT_MATCHED'

  return (
    <div className="p-3.5 rounded-xl bg-slate-surface border border-slate-border flex flex-col gap-2 hover:border-chakra-blue/40 transition-colors min-w-0">
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant truncate">
            {scheme.ministry || 'Government of Maharashtra / Central'}
          </span>
          <h5 className="font-headline-sm text-headline-sm font-bold text-chakra-blue mt-0.5 leading-snug break-words">
            {scheme.name}
          </h5>
        </div>
        {scheme.eligibilityVerdict && (
          <span
            className={`shrink-0 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 whitespace-nowrap ${
              isStrong
                ? 'bg-harita-green-soft text-harita-green'
                : isNotMatched
                ? 'bg-error-soft text-error'
                : 'bg-partial-amber-soft text-partial-amber'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {isStrong ? 'verified' : isNotMatched ? 'block' : 'help'}
            </span>
            {isStrong ? 'Strong Match' : isNotMatched ? 'Not Matched' : 'Partial Match'}
          </span>
        )}
      </div>

      {(scheme.benefitAmount || scheme.deadline) && (
        <div className="flex flex-col gap-1.5">
          {scheme.benefitAmount && (
            <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between gap-2 min-w-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant shrink-0">Benefit</span>
              <span className="font-headline-sm text-headline-sm font-bold text-chakra-blue text-right truncate">
                {scheme.benefitAmount}
              </span>
            </div>
          )}
          {scheme.deadline && (
            <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-kesari-saffron">
              <span className="material-symbols-outlined text-[14px]">event_busy</span>
              <span className="truncate">Deadline: {scheme.deadline}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
        <Link
          to={`/schemes/${scheme.schemeId}`}
          className="font-label-sm text-label-sm font-bold text-chakra-blue hover:text-kesari-saffron flex items-center gap-1 transition-colors"
        >
          <span>View Details</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
        <Link
          to="/checklist"
          className="font-label-sm text-label-sm font-semibold text-harita-green hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">fact_check</span>
          <span>Checklist</span>
        </Link>
      </div>

      {scheme.verifiedAt && (
        <div className="pt-1.5 mt-0.5 border-t border-slate-border/70 font-label-sm text-label-sm text-outline flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">gavel</span>
          <span className="truncate">Gazette-verified {scheme.verifiedAt}</span>
        </div>
      )}
    </div>
  )
}

function MessageBubble({ msg, userPhoto, onRetry }) {
  const [feedback, setFeedback] = useState(null)
  const [copied, setCopied] = useState(false)

  if (msg.sender === 'USER') {
    return (
      <div className="flex items-end justify-end gap-2 sm:gap-2.5 pl-6 sm:pl-8 min-w-0">
        <div className="bg-chakra-blue !text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-tr-none shadow-sm max-w-[82%] sm:max-w-lg flex flex-col gap-1 min-w-0">
          <span className="font-body-md text-body-md !text-white leading-relaxed break-words">{msg.text}</span>
          <div className="flex items-center justify-end gap-1 font-label-sm text-label-sm !text-white/80">
            <span className="!text-white/80">{formatTimestamp(msg.time)}</span>
            <span className="material-symbols-outlined text-[14px] text-emerald-400">done_all</span>
          </div>
        </div>
        <img
          src={userPhoto || indianCitizenHeadshot}
          alt="Citizen"
          className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-chakra-blue/20"
        />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 sm:gap-2.5 pr-1 sm:pr-2 min-w-0">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
          msg.isError ? 'bg-error text-white' : 'bg-chakra-blue text-kesari-saffron'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]" style={msg.isError ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {msg.isError ? 'error' : 'robot_2'}
        </span>
      </div>
      <div className="flex flex-col gap-2 sm:gap-3 max-w-[85%] sm:max-w-xl w-full min-w-0">
        <div
          className={`p-3.5 sm:p-4 rounded-2xl rounded-tl-none shadow-sm border flex flex-col gap-3 min-w-0 ${
            msg.isError
              ? 'bg-slate-surface-elevated border-error/25 text-on-surface'
              : 'bg-slate-surface-elevated text-on-surface border-slate-border'
          }`}
        >
          <div className="font-body-md text-body-md leading-relaxed text-on-surface break-words flex flex-col">
            <FormattedMessage text={msg.text} />
          </div>

          {msg.isError && onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="self-start flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-error text-white font-label-sm text-label-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span>
              Retry
            </button>
          )}

          {msg.schemes && msg.schemes.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-1 min-w-0">
              <span className="font-label-md text-label-md font-bold text-chakra-blue uppercase tracking-wider">
                Matches Found ({msg.schemes.length})
              </span>
              {msg.schemes.map((s) => (
                <SchemeMiniCard key={s.schemeId} scheme={s} />
              ))}
            </div>
          )}

          {!msg.isError && (
            <div className="mt-1 pt-2.5 border-t border-slate-border flex flex-col gap-1 text-on-surface-variant">
              <div className="flex items-start gap-1.5 font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-harita-green text-[15px] mt-0.5 shrink-0">verified_user</span>
                <span className="break-words"><strong>Statutory Provenance:</strong> Grounded in official GR gazette rules &amp; authenticated criteria.</span>
              </div>
              <div className="font-label-sm text-label-sm text-outline italic">
                Official Advisory: Eligibility is provisional. Final sanction resides with issuing departments.
              </div>
            </div>
          )}
        </div>

        {msg.isError && (
          <div className="px-1 sm:px-2 font-label-sm text-label-sm text-on-surface-variant">
            {formatTimestamp(msg.time)}
          </div>
        )}

        {!msg.isError && (
          <div className="flex items-center justify-between px-1 sm:px-2 font-label-sm text-label-sm text-on-surface-variant gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span>{formatTimestamp(msg.time)}</span>
              <button
                onClick={async () => {
                  const ok = await copyToClipboard(msg.text)
                  if (ok) {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1600)
                  }
                }}
                type="button"
                title="Copy reply"
                className="flex items-center gap-0.5 hover:text-chakra-blue transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied && <span className="text-harita-green font-semibold">Copied</span>}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-on-surface-variant">Was this accurate?</span>
              <button
                onClick={() => setFeedback('yes')}
                className={`flex items-center gap-0.5 transition-colors cursor-pointer ${
                  feedback === 'yes' ? 'text-harita-green font-bold' : 'hover:text-chakra-blue'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">thumb_up</span> Yes
              </button>
              <button
                onClick={() => setFeedback('no')}
                className={`flex items-center gap-0.5 transition-colors cursor-pointer ${
                  feedback === 'no' ? 'text-error font-bold' : 'hover:text-kesari-saffron'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">thumb_down</span> No
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const { user } = useAuth()
  const userFirstName = (user?.fullName || 'Citizen').split(' ')[0]
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [listening, setListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [lastFailedText, setLastFailedText] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function goOnline() { setIsOffline(false) }
    function goOffline() { setIsOffline(true) }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (open && !hydrated) {
      getChatHistory()
        .then((data) => {
          setSessionId(data.sessionId)
          setMessages(
            data.messages.map((m) => ({
              sender: m.sender,
              text: m.message,
              schemes: m.schemes,
              time: m.createdAt || null,
            }))
          )
        })
        .catch(() => {})
        .finally(() => setHydrated(true))
    }
  }, [open, hydrated])

  useEffect(() => {
    if (open) {
      setUnreadCount(0)
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [open])

  const prevMessageCount = useRef(0)
  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    } else if (messages.length > prevMessageCount.current) {
      setUnreadCount((c) => c + (messages.length - prevMessageCount.current))
    }
    prevMessageCount.current = messages.length
  }, [messages, sending, open])

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollToBottom(distanceFromBottom > 160)
  }

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }

  const remainingChars = MAX_MESSAGE_LENGTH - input.length
  const disabledInput = sending || isOffline
  const trimmedInput = useMemo(() => input.trim(), [input])

  async function handleSend(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || sending || isOffline) return
    if (trimmed.length > MAX_MESSAGE_LENGTH) return

    const now = new Date().toISOString()
    setMessages((prev) => [...prev, { sender: 'USER', text: trimmed, time: now }])
    setInput('')
    setSending(true)
    setLastFailedText(null)

    try {
      const data = await sendChatMessage(trimmed, sessionId)
      setSessionId(data.sessionId)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'BOT',
          text: data.reply,
          schemes: data.schemes,
          time: new Date().toISOString(),
          limitReached: data.limitReached,
        },
      ])
    } catch (err) {
      const errorText =
        err.response?.data?.error ||
        'Unable to contact the AI Civic Assistant right now. Please verify your connection or try again.'
      setMessages((prev) => [
        ...prev,
        { sender: 'BOT', text: errorText, schemes: [], time: new Date().toISOString(), isError: true },
      ])
      setLastFailedText(trimmed)
    } finally {
      setSending(false)
    }
  }

  function handleRetry() {
    if (lastFailedText) {
      setMessages((prev) => {
        const idx = [...prev].reverse().findIndex((m) => m.isError)
        if (idx === -1) return prev
        const realIdx = prev.length - 1 - idx
        return prev.slice(0, realIdx)
      })
      handleSend(lastFailedText)
    }
  }

  function handleClearConfirmed() {
    setMessages([])
    setSessionId(null)
    setHydrated(false)
    setConfirmingClear(false)
    setLastFailedText(null)
  }

  function handleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice dictation is supported in modern Chrome, Edge, and Android browsers.')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false

      recognition.onstart = () => setListening(true)
      recognition.onend = () => setListening(false)
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInput(transcript)
          handleSend(transcript)
        }
      }
      recognition.start()
    } catch {
      setListening(false)
    }
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const lastMessageLimitReached = messages.length > 0 && messages[messages.length - 1]?.limitReached

  return (
    <>
      {/* Floating launcher trigger */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <button
          onClick={() => setOpen((v) => !v)}
          className="relative bg-slate-surface-elevated border border-slate-border rounded-full pl-2.5 pr-3.5 sm:pr-4 py-2 shadow-xl flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:shadow-2xl hover:border-chakra-blue/40 transition-all group"
          aria-label={open ? 'Close SAARTHI AI Assistant' : 'Open SAARTHI AI Assistant'}
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-chakra-blue text-kesari-saffron-vibrant flex items-center justify-center shrink-0 shadow-sm relative">
            <span className="material-symbols-outlined text-[22px] sm:text-[24px]">cognition</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-harita-green ring-2 ring-slate-surface-elevated" />
          </div>

          <div className="hidden sm:block text-left">
            <div className="flex items-center gap-1.5">
              <p className="font-label-lg font-bold text-chakra-blue leading-tight">SAARTHI AI</p>
              <span className="px-1.5 py-0.2 rounded bg-kesari-saffron-soft text-kesari-saffron font-label-sm text-[10px] font-bold">सारथी</span>
            </div>
            <p className="font-label-sm text-on-surface-variant leading-tight max-w-[200px] truncate">
              Civic Welfare Assistant
            </p>
          </div>

          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-chakra-blue text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span className="material-symbols-outlined text-[16px]">{open ? 'expand_more' : 'chat'}</span>
          </div>

          {!open && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-error text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-slate-surface-elevated">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Drawer / full-screen panel */}
      {open && (
        <div
          className={`fixed z-50 bg-slate-surface-elevated shadow-2xl border border-slate-border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200
            inset-0 rounded-none
            sm:inset-auto sm:rounded-2xl
            ${
              expanded
                ? 'sm:bottom-4 sm:right-4 sm:top-4 sm:left-auto sm:w-[560px] md:w-[640px]'
                : 'sm:bottom-24 sm:right-6 sm:w-[420px] md:w-[460px] sm:h-[640px] sm:max-h-[85vh]'
            }`}
        >
          {/* Header */}
          <div className="bg-chakra-blue text-white px-3.5 sm:px-4 py-2.5 sm:py-3.5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative shrink-0">
                <span className="material-symbols-outlined text-kesari-saffron-vibrant text-[22px]">cognition</span>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-chakra-blue ${isOffline ? 'bg-error' : 'bg-emerald-400'}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-white text-[14px] sm:text-base tracking-tight truncate">
                    SAARTHI AI Civic Assistant
                  </span>
                  <span className="hidden xs:inline-flex bg-kesari-saffron/20 text-kesari-saffron-vibrant border border-kesari-saffron/30 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    सारथी एआई मित्र
                  </span>
                </div>
                <span className="text-[11px] text-white/70 leading-tight truncate">
                  {isOffline ? 'Offline — reconnect to continue' : sending ? 'Typing…' : 'Online · grounded in gazette data'}
                </span>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="hidden sm:flex p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                title={expanded ? 'Collapse' : 'Expand'}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {expanded ? 'close_fullscreen' : 'open_in_full'}
                </span>
              </button>
              <button
                onClick={() => setConfirmingClear(true)}
                disabled={messages.length === 0}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear Conversation"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Close"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Clear-conversation confirmation */}
          {confirmingClear && (
            <div className="px-4 py-3 bg-partial-amber-soft border-b border-slate-border flex items-center justify-between gap-3 shrink-0">
              <span className="font-label-sm text-label-sm text-on-surface flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-partial-amber shrink-0">warning</span>
                <span className="truncate">Clear this entire conversation?</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleClearConfirmed}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-error text-white text-xs font-bold cursor-pointer hover:opacity-90"
                >
                  Clear
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-slate-surface border border-slate-border text-xs font-bold cursor-pointer hover:bg-surface-container-high"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isOffline && (
            <div className="px-4 py-2 bg-error-soft border-b border-slate-border flex items-center gap-1.5 shrink-0 font-label-sm text-label-sm text-error">
              <span className="material-symbols-outlined text-[15px]">wifi_off</span>
              You are offline. Messages will send once your connection is restored.
            </div>
          )}

          {/* Chat Stream Body */}
          <div className="relative flex-1 min-h-0">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="no-scrollbar absolute inset-0 p-3.5 sm:p-4 flex flex-col gap-3.5 overflow-y-auto overflow-x-hidden bg-slate-surface"
            >
              {messages.length === 0 && (
                <div className="bg-slate-surface-elevated p-3.5 rounded-xl border border-slate-border text-center space-y-1.5 shadow-2xs">
                  <p className="font-headline-sm font-bold text-chakra-blue text-sm">
                    Namaste {userFirstName}! 🙏
                  </p>
                  <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                    I am your citizen welfare assistant. Ask any question regarding Central &amp; Maharashtra scheme eligibility, documents, or application processes.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  userPhoto={user?.photoUrl}
                  onRetry={msg.isError && i === messages.length - 1 ? handleRetry : null}
                />
              ))}

              {sending && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-chakra-blue-light text-chakra-blue font-label-sm text-xs self-start">
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-chakra-blue animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-chakra-blue animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-chakra-blue animate-bounce" />
                  </span>
                  <span>Consulting scheme eligibility &amp; gazette rules…</span>
                </div>
              )}
            </div>

            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                type="button"
                title="Scroll to latest"
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-chakra-blue text-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-chakra-blue/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
              </button>
            )}
          </div>

          {/* Suggested inquiries chips */}
          {!lastMessageLimitReached && (showSuggestions ? (
            <div className="px-3 sm:px-3.5 py-2.5 bg-slate-surface-elevated border-t border-slate-border flex flex-col gap-2 shrink-0 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-kesari-saffron">lightbulb</span>
                  Suggested Questions
                </span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-[11px] text-on-surface-variant hover:text-chakra-blue flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="Hide Suggested Questions"
                  type="button"
                >
                  <span>Hide</span>
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>
              <div className="no-scrollbar flex flex-wrap gap-1.5 max-h-[88px] sm:max-h-[105px] overflow-y-auto pr-1">
                {SUGGESTED_INQUIRIES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSend(item.text)}
                    disabled={disabledInput}
                    className="px-2.5 py-1 rounded-full bg-slate-surface hover:bg-chakra-blue-light hover:text-chakra-blue text-on-surface text-xs transition-colors text-left flex items-center gap-1 border border-slate-border cursor-pointer shadow-2xs hover:border-chakra-blue/30 disabled:opacity-50 disabled:cursor-not-allowed max-w-full"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px] text-kesari-saffron shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate max-w-[220px] sm:max-w-[320px]">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-1 bg-slate-surface-elevated/70 border-t border-slate-border/70 flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowSuggestions(true)}
                className="text-[11px] font-semibold text-chakra-blue hover:text-kesari-saffron flex items-center gap-1 py-0.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[13px] text-kesari-saffron">lightbulb</span>
                <span>Show Suggested Questions</span>
              </button>
            </div>
          ))}

          {/* Limit-reached CTA */}
          {lastMessageLimitReached && (
            <div className="px-3.5 py-3 bg-partial-amber-soft border-t border-slate-border flex items-center justify-between gap-2 shrink-0">
              <span className="font-label-sm text-label-sm text-on-surface flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-partial-amber shrink-0">schedule</span>
                <span className="truncate">Daily message limit reached.</span>
              </span>
              <Link
                to="/schemes"
                className="shrink-0 px-2.5 py-1 rounded-lg bg-chakra-blue text-white text-xs font-bold hover:bg-chakra-blue/90 transition-colors"
              >
                Browse Schemes
              </Link>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2.5 sm:p-3 bg-slate-surface-elevated border-t border-slate-border shrink-0 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2 bg-slate-surface rounded-xl px-2.5 sm:px-3 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-chakra-blue transition-all border border-slate-border">
              <button
                onClick={handleVoiceInput}
                disabled={disabledInput}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                  listening
                    ? 'bg-kesari-saffron text-white animate-pulse'
                    : 'hover:bg-kesari-saffron-soft text-on-surface-variant hover:text-kesari-saffron'
                }`}
                title="Voice Input (मराठी/Hindi/English)"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                placeholder="Ask about any scheme, rule, or document requirement…"
                disabled={disabledInput || lastMessageLimitReached}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent border-none resize-none text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none py-1.5 max-h-24 leading-relaxed"
                style={{ minHeight: '1.75rem' }}
              />

              <button
                onClick={() => handleSend(input)}
                disabled={disabledInput || !trimmedInput || lastMessageLimitReached}
                className="h-8 px-3 rounded-lg bg-kesari-saffron hover:bg-kesari-saffron-vibrant text-white font-medium text-xs sm:text-sm flex items-center gap-1 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                type="button"
              >
                <span className="hidden xs:inline">Send</span>
                <span className="material-symbols-outlined text-[15px]">send</span>
              </button>
            </div>
            {remainingChars <= MAX_MESSAGE_LENGTH - WARN_MESSAGE_LENGTH && (
              <div className={`mt-1 text-right text-[10px] font-medium ${remainingChars <= 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                {remainingChars} characters left
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
