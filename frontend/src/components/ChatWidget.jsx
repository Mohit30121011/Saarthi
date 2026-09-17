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
      <div className="flex items-end justify-end gap-2.5 pl-8 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="bg-gradient-to-r from-[#0D2240] to-[#183B6B] !text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm max-w-[85%] sm:max-w-md flex flex-col gap-1 min-w-0">
          <span className="text-xs sm:text-sm !text-white leading-relaxed break-words font-medium">{msg.text}</span>
          <div className="flex items-center justify-end gap-1 text-[10.5px] !text-white/70 pt-0.5">
            <span>{formatTimestamp(msg.time)}</span>
            <span className="material-symbols-outlined text-[13px] text-emerald-300">done_all</span>
          </div>
        </div>
        <img
          src={userPhoto || indianCitizenHeadshot}
          alt="Citizen"
          className="w-7 h-7 rounded-full object-cover shrink-0 ring-2 ring-white shadow-xs"
        />
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2.5 pr-2 min-w-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${
          msg.isError
            ? 'bg-rose-600 text-white'
            : 'bg-gradient-to-br from-[#0D2240] to-[#1E3A8A] text-[#E65100] border border-white/10'
        }`}
      >
        <span className="material-symbols-outlined text-[17px]" style={msg.isError ? { fontVariationSettings: "'FILL' 1" } : undefined}>
          {msg.isError ? 'error' : 'smart_toy'}
        </span>
      </div>
      <div className="flex flex-col gap-2 max-w-[88%] sm:max-w-xl w-full min-w-0">
        <div
          className={`p-4 rounded-2xl rounded-tl-xs shadow-xs border flex flex-col gap-3 min-w-0 transition-all ${
            msg.isError
              ? 'bg-rose-50/50 border-rose-200 text-rose-950'
              : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300'
          }`}
        >
          <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 break-words flex flex-col space-y-1">
            <FormattedMessage text={msg.text} />
          </div>

          {msg.isError && onRetry && (
            <button
              onClick={onRetry}
              type="button"
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Retry Question
            </button>
          )}

          {msg.schemes && msg.schemes.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 min-w-0">
              <span className="text-[11px] font-extrabold text-[#0D2240] uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#138808]">verified</span>
                Matching Schemes ({msg.schemes.length})
              </span>
              {msg.schemes.map((s) => (
                <SchemeMiniCard key={s.schemeId} scheme={s} />
              ))}
            </div>
          )}

          {!msg.isError && (
            <div className="mt-0.5 pt-2.5 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
              <div className="flex items-start gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[#138808] text-[14px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="break-words">
                  <strong className="text-[#0D2240]">Statutory Provenance:</strong> Grounded in official GR gazette rules &amp; authenticated criteria.
                </span>
              </div>
            </div>
          )}
        </div>

        {!msg.isError && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
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
                title="Copy response"
                className="flex items-center gap-1 hover:text-[#0D2240] transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {copied ? 'check' : 'content_copy'}
                </span>
                {copied && <span className="text-emerald-600 font-bold text-[10px]">Copied</span>}
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-slate-400 text-[10.5px]">Was this helpful?</span>
              <button
                onClick={() => setFeedback('yes')}
                className={`flex items-center gap-1 transition-all cursor-pointer px-1.5 py-0.5 rounded ${
                  feedback === 'yes' ? 'text-emerald-600 font-bold bg-emerald-50' : 'text-slate-400 hover:text-emerald-600'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                <span>Yes</span>
              </button>
              <button
                onClick={() => setFeedback('no')}
                className={`flex items-center gap-1 transition-all cursor-pointer px-1.5 py-0.5 rounded ${
                  feedback === 'no' ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-400 hover:text-rose-600'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[14px]">thumb_down</span>
                <span>No</span>
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
        const next = [...prev]
        if (next.length > 0 && next[next.length - 1].isError) {
          next.pop()
        }
        return next
      })
      handleSend(lastFailedText)
    }
  }

  function handleClearConfirmed() {
    setMessages([])
    setConfirmingClear(false)
  }

  function handleVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.')
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      if (transcript) {
        setInput(transcript)
        handleSend(transcript)
      }
    }
    recognition.start()
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

  const lastMessageLimitReached = messages.length > 0 && messages[messages.length - 1].limitReached

  return (
    <>
      {/* Floating Pill Launcher (Crisp White Modern Design) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen((v) => !v)}
          type="button"
          aria-label={open ? 'Close SAARTHI AI Assistant' : 'Open SAARTHI AI Assistant'}
          className="group relative flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-full bg-white/95 backdrop-blur-md text-[#0D2240] shadow-[0_12px_36px_-4px_rgba(13,34,64,0.18)] hover:shadow-[0_20px_44px_-4px_rgba(13,34,64,0.28)] hover:-translate-y-1 active:scale-95 transition-all duration-300 border border-slate-200/90 hover:border-blue-300 cursor-pointer"
        >
          {/* Subtle Tricolor Top Glow */}
          <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-[#E65100] via-slate-300 to-[#138808] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />

          {/* AI Avatar Icon with pulsing dot */}
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#0D2240] to-[#1A365D] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[#FF9E80] text-[20px]">
              smart_toy
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-[#0D2240] tracking-wide">SAARTHI AI</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#FFF3EB] text-[#E65100] border border-[#E65100]/20 text-[9.5px] font-extrabold">
                सारथी
              </span>
            </div>
            <span className="text-[11px] text-[#44474E] font-medium leading-tight">
              Civic Welfare Assistant
            </span>
          </div>

          <div className="w-7 h-7 rounded-full bg-[#F0F3FF] text-[#0D2240] flex items-center justify-center group-hover:bg-[#0D2240] group-hover:text-white transition-all shadow-2xs ml-0.5">
            <span className="material-symbols-outlined text-[16px]">{open ? 'expand_more' : 'chat'}</span>
          </div>

          {!open && unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-[#E65100] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Modern Sleek Drawer Panel */}
      {open && (
        <div
          className={`fixed z-50 bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(13,34,64,0.35)] border border-slate-200/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 zoom-in-95 duration-300 ease-out
            inset-0 rounded-none
            sm:inset-auto sm:rounded-3xl
            ${
              expanded
                ? 'sm:bottom-4 sm:right-4 sm:top-4 sm:left-auto sm:w-[580px] md:w-[680px]'
                : 'sm:bottom-22 sm:right-6 sm:w-[410px] md:w-[440px] sm:h-[620px] sm:max-h-[85vh]'
            }`}
        >
          {/* Sleek Gradient Header with Curvy Bottom Edge */}
          <div className="relative bg-gradient-to-r from-[#0D2240] via-[#14325C] to-[#0A1A30] text-white px-4 pt-3.5 pb-4.5 rounded-b-[26px] sm:rounded-b-[30px] flex items-center justify-between shrink-0 shadow-[0_12px_24px_-6px_rgba(13,34,64,0.35)] z-20">
            {/* Top Tricolor Strip */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E65100] via-white to-[#138808]" />

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center relative shrink-0 ring-1 ring-white/20 shadow-inner">
                <span className="material-symbols-outlined text-[#E65100] text-[22px]">
                  smart_toy
                </span>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0D2240] ${isOffline ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-extrabold text-white text-sm tracking-tight truncate">
                    SAARTHI AI Assistant
                  </span>
                  <span className="bg-[#FFF3EB]/20 text-[#FF9E80] border border-[#FF9E80]/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                    सारथी
                  </span>
                </div>
                <span className="text-[11px] text-white/70 leading-tight truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  {isOffline ? 'Offline — reconnect to continue' : sending ? 'Consulting gazette rules…' : 'Online • Grounded in Gazette Data'}
                </span>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="hidden sm:flex w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all hover:scale-105 items-center justify-center cursor-pointer"
                title={expanded ? 'Collapse' : 'Expand'}
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">
                  {expanded ? 'close_fullscreen' : 'open_in_full'}
                </span>
              </button>

              <button
                onClick={() => setConfirmingClear(true)}
                disabled={messages.length === 0}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all hover:scale-105 items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                title="Clear Conversation"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">delete_sweep</span>
              </button>

              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-500/80 text-white/80 hover:text-white transition-all hover:scale-105 items-center justify-center cursor-pointer"
                title="Close"
                type="button"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            </div>
          </div>

          {/* Clear-conversation confirmation */}
          {confirmingClear && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between gap-3 shrink-0 animate-in fade-in duration-150 z-20">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">warning</span>
                <span className="truncate">Clear this entire conversation?</span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleClearConfirmed}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isOffline && (
            <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 flex items-center gap-1.5 shrink-0 text-xs font-bold text-rose-800 z-20">
              <span className="material-symbols-outlined text-[15px]">wifi_off</span>
              You are offline. Messages will send once connection is restored.
            </div>
          )}

          {/* Chat Stream Body with Curvy Top Under Header */}
          <div className="relative flex-1 min-h-0 bg-slate-50/80 -mt-3.5 pt-5 z-10">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="no-scrollbar absolute inset-0 p-4 pt-5 flex flex-col gap-3.5 overflow-y-auto overflow-x-hidden"
            >
              {/* Empty State Welcome Card */}
              {messages.length === 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-orange-50/40 border border-blue-100/80 shadow-xs space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0D2240] text-white flex items-center justify-center shadow-2xs">
                      <span className="material-symbols-outlined text-[18px]">waving_hand</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-[#0D2240]">
                        Namaste {userFirstName}!
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-medium">Your Personal Welfare Entitlement Guide</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ask any question regarding Maharashtra &amp; Central welfare scheme rules, eligibility requirements, required documents, or application procedures.
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
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-[#0D2240] self-start animate-pulse">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#0D2240] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#E65100] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#138808] animate-bounce" />
                  </span>
                  <span>Consulting official GR rules &amp; eligibility…</span>
                </div>
              )}
            </div>

            {showScrollToBottom && (
              <button
                onClick={scrollToBottom}
                type="button"
                title="Scroll to latest"
                className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#0D2240] text-white shadow-lg hover:scale-105 flex items-center justify-center cursor-pointer transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
              </button>
            )}
          </div>

          {/* Suggested Questions Section */}
          {!lastMessageLimitReached && (showSuggestions ? (
            <div className="px-3.5 py-2.5 bg-white border-t border-slate-200/80 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-[#E65100]">lightbulb</span>
                  Suggested Inquiries
                </span>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Hide Suggested Questions"
                  type="button"
                >
                  <span>Hide</span>
                  <span className="material-symbols-outlined text-[13px]">close</span>
                </button>
              </div>

              <div className="no-scrollbar flex flex-wrap gap-1.5 max-h-[85px] sm:max-h-[100px] overflow-y-auto pr-0.5">
                {SUGGESTED_INQUIRIES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSend(item.text)}
                    disabled={disabledInput}
                    className="group px-3 py-1.5 rounded-full bg-slate-50 hover:bg-blue-50/80 text-slate-700 hover:text-[#0D2240] text-xs font-semibold transition-all text-left flex items-center gap-1.5 border border-slate-200/90 hover:border-blue-300 hover:shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px] text-[#E65100] group-hover:scale-110 transition-transform shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate max-w-[240px] sm:max-w-[340px]">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 bg-white border-t border-slate-200/80 flex items-center justify-between shrink-0">
              <button
                onClick={() => setShowSuggestions(true)}
                className="text-[11px] font-bold text-[#0D2240] hover:text-[#E65100] flex items-center gap-1 py-0.5 transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[14px] text-[#E65100]">lightbulb</span>
                <span>Show Suggested Inquiries</span>
              </button>
            </div>
          ))}

          {/* Limit-reached CTA */}
          {lastMessageLimitReached && (
            <div className="px-3.5 py-2.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between gap-2 shrink-0">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 min-w-0">
                <span className="material-symbols-outlined text-[16px] text-amber-600 shrink-0">schedule</span>
                <span className="truncate">Daily message quota reached.</span>
              </span>
              <Link
                to="/explorer"
                className="shrink-0 px-3 py-1 rounded-xl bg-[#0D2240] text-white text-xs font-bold hover:bg-[#14325C] transition-colors"
              >
                Explore Schemes
              </Link>
            </div>
          )}

          {/* Sleek Floating Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200/80 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2 bg-slate-50/80 focus-within:bg-white rounded-2xl px-3 py-1.5 shadow-2xs focus-within:shadow-md focus-within:border-blue-400 transition-all border border-slate-200/90">
              {/* Mic / Voice Button */}
              <button
                onClick={handleVoiceInput}
                disabled={disabledInput}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                  listening
                    ? 'bg-[#E65100] text-white animate-pulse shadow-xs scale-105'
                    : 'text-slate-500 hover:text-[#0D2240] hover:bg-slate-200/60'
                }`}
                title="Voice Input (मराठी/Hindi/English)"
                type="button"
              >
                <span className="material-symbols-outlined text-[19px]">mic</span>
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                placeholder="Ask about any scheme, rule, or eligibility…"
                disabled={disabledInput || lastMessageLimitReached}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent border-none text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none py-1.5 font-medium"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSend(input)}
                disabled={disabledInput || !trimmedInput || lastMessageLimitReached}
                className="h-8 px-3.5 rounded-xl bg-gradient-to-r from-[#E65100] to-[#F97316] hover:from-[#D84315] hover:to-[#EA580C] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer shrink-0"
                type="button"
              >
                <span className="hidden xs:inline">Send</span>
                <span className="material-symbols-outlined text-[14px]">send</span>
              </button>
            </div>

            {remainingChars <= MAX_MESSAGE_LENGTH - WARN_MESSAGE_LENGTH && (
              <div className={`mt-1 text-right text-[10px] font-bold ${remainingChars <= 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {remainingChars} characters left
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
