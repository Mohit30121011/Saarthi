import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getChatHistory, sendChatMessage } from '../api/chat'
import indianCitizenHeadshot from '../assets/indian-citizen-headshot.png'

const SUGGESTED_INQUIRIES = [
  { icon: 'event', text: 'What schemes do I qualify for?' },
  { icon: 'school', text: 'What is the application deadline for Rajarshi Shahu Maharaj Scholarship?' },
  { icon: 'domain_add', text: 'Which documents do I need for Majhi Ladki Bahin?' },
  { icon: 'autorenew', text: 'How to renew Tahsildar Income Certificate online?' },
]

function SchemeMiniCard({ scheme }) {
  const isStrong = scheme.eligibilityVerdict === 'STRONG'
  return (
    <div className="p-3.5 rounded-xl bg-slate-surface border border-slate-border flex flex-col gap-2 hover:border-chakra-blue/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant truncate">
            {scheme.ministry || 'Government of Maharashtra / Central'}
          </span>
          <h5 className="font-headline-sm text-headline-sm font-bold text-chakra-blue mt-0.5 leading-snug">
            {scheme.name}
          </h5>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold flex items-center gap-1 ${
            isStrong
              ? 'bg-harita-green-soft text-harita-green'
              : 'bg-partial-amber-soft text-partial-amber'
          }`}
        >
          <span className="material-symbols-outlined text-[13px]">
            {isStrong ? 'verified' : 'help'}
          </span>
          {isStrong ? '100% Strong Match' : 'Partial Match'}
        </span>
      </div>

      {scheme.benefitAmount && (
        <div className="p-2 rounded-lg bg-surface-container-low flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Annual Benefit</span>
          <span className="font-headline-sm text-headline-sm font-bold text-chakra-blue">
            {scheme.benefitAmount}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Link
          to={`/schemes/${scheme.schemeId}`}
          className="font-label-sm text-label-sm font-bold text-chakra-blue hover:text-kesari-saffron flex items-center gap-1 transition-colors"
        >
          <span>View Scheme Details</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </Link>
        <Link
          to="/checklist"
          className="font-label-sm text-label-sm font-semibold text-harita-green hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">fact_check</span>
          <span>Open Checklist</span>
        </Link>
      </div>
    </div>
  )
}

function MessageBubble({ msg, userPhoto }) {
  const [feedback, setFeedback] = useState(null)

  if (msg.sender === 'USER') {
    return (
      <div className="flex items-end justify-end gap-2.5 pl-8">
        <div className="bg-chakra-blue !text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm max-w-lg flex flex-col gap-1">
          <span className="font-body-md text-body-md !text-white leading-relaxed">{msg.text}</span>
          <div className="flex items-center justify-end gap-1 font-label-sm text-label-sm !text-white/80">
            <span className="!text-white/80">{msg.time || 'Just now'}</span>
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
    <div className="flex items-start gap-2.5 pr-2">
      <div className="w-8 h-8 rounded-xl bg-chakra-blue text-kesari-saffron flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <span className="material-symbols-outlined text-[18px]">robot_2</span>
      </div>
      <div className="flex flex-col gap-3 max-w-xl w-full">
        {/* Main Assistant speech container */}
        <div className="bg-slate-surface-elevated text-on-surface p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-border flex flex-col gap-3">
          <div className="font-body-md text-body-md leading-relaxed text-on-surface whitespace-pre-wrap">
            {msg.text}
          </div>

          {/* Scheme Mini Cards if attached */}
          {msg.schemes && msg.schemes.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-1">
              <span className="font-label-md text-label-md font-bold text-chakra-blue uppercase tracking-wider">
                Algorithmic Matches Found ({msg.schemes.length})
              </span>
              {msg.schemes.map((s) => (
                <SchemeMiniCard key={s.schemeId} scheme={s} />
              ))}
            </div>
          )}

          {/* Statutory Provenance & Disclaimer */}
          <div className="mt-1 pt-2.5 border-t border-slate-border flex flex-col gap-1 text-on-surface-variant">
            <div className="flex items-start gap-1.5 font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-harita-green text-[15px] mt-0.5 shrink-0">verified_user</span>
              <span><strong>Statutory Provenance:</strong> Grounded in official GR gazette rules &amp; authenticated criteria.</span>
            </div>
            <div className="font-label-sm text-label-sm text-outline italic">
              Official Advisory: Eligibility is provisional. Final sanction resides with issuing departments.
            </div>
          </div>
        </div>

        {/* Feedback Bar */}
        <div className="flex items-center justify-end px-2 font-label-sm text-label-sm text-on-surface-variant">
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
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const { user } = useAuth()
  const userFirstName = (user?.fullName || 'Citizen').split(' ')[0]
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [listening, setListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const scrollRef = useRef(null)

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
              time: 'Earlier',
            }))
          )
        })
        .catch(() => {})
        .finally(() => setHydrated(true))
    }
  }, [open, hydrated])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  async function handleSend(text) {
    const trimmed = (text || input).trim()
    if (!trimmed || sending) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { sender: 'USER', text: trimmed, time: now }])
    setInput('')
    setSending(true)

    try {
      const data = await sendChatMessage(trimmed, sessionId)
      setSessionId(data.sessionId)
      setMessages((prev) => [
        ...prev,
        { sender: 'BOT', text: data.reply, schemes: data.schemes, time: now },
      ])
    } catch (err) {
      const errorText =
        err.response?.data?.error ||
        'Unable to contact the AI Civic Assistant right now. Please verify your connection or try again.'
      setMessages((prev) => [
        ...prev,
        { sender: 'BOT', text: errorText, schemes: [], time: now },
      ])
    } finally {
      setSending(false)
    }
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

  return (
    <>
      {/* Floating launcher trigger */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOpen((v) => !v)}
          className="bg-slate-surface-elevated border border-slate-border rounded-full pl-2.5 pr-4 py-2 shadow-xl flex items-center gap-3 cursor-pointer hover:shadow-2xl hover:border-chakra-blue/40 transition-all group"
          aria-label="Open SAARTHI AI Assistant"
        >
          <div className="w-10 h-10 rounded-full bg-chakra-blue text-kesari-saffron-vibrant flex items-center justify-center shrink-0 shadow-sm relative">
            <span className="material-symbols-outlined text-[24px]">cognition</span>
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

          <div className="w-8 h-8 rounded-full bg-chakra-blue text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <span className="material-symbols-outlined text-[16px]">chat</span>
          </div>
        </button>
      </div>

      {/* Spacious Modern Drawer Panel */}
      {open && (
        <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[95vw] sm:w-[480px] md:w-[520px] h-[82vh] max-h-[720px] bg-slate-surface-elevated rounded-2xl shadow-2xl border border-slate-border flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200 overflow-hidden">
          {/* Crisp, High-Contrast Header */}
          <div className="bg-chakra-blue text-white px-4 py-3 sm:py-3.5 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center relative shrink-0">
                <span className="material-symbols-outlined text-kesari-saffron-vibrant text-[22px]">cognition</span>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-chakra-blue" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-bold text-white text-[15px] sm:text-base tracking-tight truncate">
                  SAARTHI AI Civic Assistant
                </span>
                <span className="bg-kesari-saffron/20 text-kesari-saffron-vibrant border border-kesari-saffron/30 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  सारथी एआई मित्र
                </span>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setMessages([])}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
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

          {/* Chat Stream Body - Maximized height for full visibility */}
          <div ref={scrollRef} className="p-4 flex flex-col gap-3.5 overflow-y-auto bg-slate-surface flex-1 min-h-0">
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
              <MessageBubble key={i} msg={msg} userPhoto={user?.photoUrl} />
            ))}

            {sending && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-chakra-blue-light text-chakra-blue font-label-sm text-xs self-start animate-pulse">
                <span className="material-symbols-outlined text-chakra-blue text-[16px] animate-spin">sync</span>
                <span>Consulting scheme eligibility &amp; gazette rules…</span>
              </div>
            )}
          </div>

          {/* Suggested inquiries chips - Collapsible / Hideable */}
          {showSuggestions ? (
            <div className="px-3.5 py-2.5 bg-slate-surface-elevated border-t border-slate-border flex flex-col gap-2 shrink-0 animate-in fade-in duration-150">
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
              <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto pr-1">
                {SUGGESTED_INQUIRIES.map((item) => (
                  <button
                    key={item.text}
                    onClick={() => handleSend(item.text)}
                    className="px-2.5 py-1 rounded-full bg-slate-surface hover:bg-chakra-blue-light hover:text-chakra-blue text-on-surface text-xs transition-colors text-left flex items-center gap-1 border border-slate-border cursor-pointer shadow-2xs hover:border-chakra-blue/30"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[13px] text-kesari-saffron shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate max-w-[260px] sm:max-w-[320px]">{item.text}</span>
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
          )}

          {/* Clean Input Area */}
          <div className="p-3 bg-slate-surface-elevated border-t border-slate-border shrink-0">
            <div className="flex items-center gap-2 bg-slate-surface rounded-xl px-3 py-1.5 shadow-inner focus-within:ring-2 focus-within:ring-chakra-blue transition-all border border-slate-border">
              <button
                onClick={handleVoiceInput}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  listening
                    ? 'bg-kesari-saffron text-white animate-pulse'
                    : 'hover:bg-kesari-saffron-soft text-on-surface-variant hover:text-kesari-saffron'
                }`}
                title="Voice Input (मराठी/Hindi/English)"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about any scheme, rule, or document requirement…"
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(input)
                }}
                className="w-full bg-transparent border-none text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none py-1"
              />

              <button
                onClick={() => handleSend(input)}
                disabled={sending || !input.trim()}
                className="h-8 px-3 rounded-lg bg-kesari-saffron hover:bg-kesari-saffron-vibrant text-white font-medium text-xs sm:text-sm flex items-center gap-1 transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0"
                type="button"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[15px]">send</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
