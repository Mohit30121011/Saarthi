import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import saarthiLogoSvg from '../../assets/saarthi-portal-logo.svg'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('citizen') // 'citizen' or 'admin'
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [captchaInput, setCaptchaInput] = useState('')
  const [captchaCode, setCaptchaCode] = useState('7 X 4 K 9')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function refreshCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let res = ''
    for (let i = 0; i < 5; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length)) + (i < 4 ? ' ' : '')
    }
    setCaptchaCode(res)
    setCaptchaInput('')
  }

  function playAudioCaptcha() {
    const utterance = new SpeechSynthesisUtterance(captchaCode.replace(/\s/g, ' '))
    utterance.lang = 'en-IN'
    window.speechSynthesis?.speak(utterance)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // The backend accepts email/password. Identity can be email or mapped to user email
      const emailParam = identity.includes('@') ? identity : `${identity}@saarthi.gov.in`
      await login({ email: emailParam, password })
      if (role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or access token. Please verify and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#111C2D] flex flex-col">
      {/* Top Tricolor Decorative Ribbon */}
      <div className="h-1.5 w-full grid grid-cols-3 shrink-0">
        <div className="bg-[#E65100] h-full" />
        <div className="bg-white h-full" />
        <div className="bg-[#138808] h-full" />
      </div>

      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={saarthiLogoSvg} alt="SAARTHI Official Logo" className="h-9 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#44474E]">
            <LanguageSwitcher />
            <div className="hidden sm:flex items-center gap-1.5 bg-[#EBF3FC] text-[#0D2240] px-2.5 py-1 rounded-md">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
              <span>National Welfare Discovery Portal</span>
            </div>
            <Link to="/signup" className="text-[#E65100] hover:underline font-bold">
              New Citizen Registration →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8 lg:py-12">
        {/* Page Identity Header */}
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 pb-8">
          <div className="flex flex-col gap-2 max-w-2xl min-w-0 w-full">
            <h1 className="font-display text-lg sm:text-2xl lg:text-4xl font-extrabold tracking-tight text-[#0D2240] truncate">
              Unified Citizen &amp; Official Access Gateway
            </h1>
            <p className="text-xs sm:text-sm text-[#44474E] truncate">
              Sign in to view your personalized Central &amp; Maharashtra scheme eligibility.
            </p>
          </div>
        </div>

        {/* 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: 7 Columns - Authentication Form */}
          <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 lg:p-8">
            {/* Role Switch Tabs */}
            <div className="flex items-center justify-between mb-6 pb-2">
              <div className="flex p-1 bg-[#F0F3FF] rounded-xl w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                    role === 'citizen'
                      ? 'bg-[#0D2240] text-white shadow-sm'
                      : 'text-[#44474E] hover:text-[#0D2240]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">person</span>
                  <span className="whitespace-nowrap">Citizen Portal <span className="hidden sm:inline font-normal opacity-80 text-xs">(नागरिक)</span></span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-[11px] sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                    role === 'admin'
                      ? 'bg-[#0D2240] text-white shadow-sm'
                      : 'text-[#44474E] hover:text-[#0D2240]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">badge</span>
                  <span className="whitespace-nowrap">Officer Console <span className="hidden sm:inline font-normal opacity-80 text-xs">(अधिकारी)</span></span>
                </button>
              </div>
            </div>

            {/* Role Notice Banner */}
            {role === 'citizen' ? (
              <div className="flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-[#EBF3FC] text-[#0D2240] text-xs">
                <span className="material-symbols-outlined text-[20px] text-[#0D2240] shrink-0">info</span>
                <div>
                  <span className="font-bold">Aadhaar / Ration Card / Parivar ID:</span> Sign in to access your direct benefit entitlement dossier, auto-filled state forms, and family quotas.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 mb-6 rounded-xl bg-[#FEF3C7] text-[#D97706] text-xs">
                <span className="material-symbols-outlined text-[20px] shrink-0">admin_panel_settings</span>
                <div>
                  <span className="font-bold">Restricted Government Personnel Gateway:</span> NIC SSO / Parichay OAuth authentication required for District Collectors, Taluka Officers, and Verifiers.
                </div>
              </div>
            )}

            {/* Error Notice */}
            {error && (
              <div className="mb-6 rounded-xl bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-red-500">error</span>
                  <span>{error}</span>
                </div>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Identity Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0D2240]" htmlFor="identity-input">
                  Aadhaar Number / Registered Mobile / Email
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                    fingerprint
                  </span>
                  <input
                    id="identity-input"
                    type="text"
                    required
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    placeholder={role === 'citizen' ? 'e.g. 9876 5432 1098 or mohit@saarthi.gov.in' : 'officer@gov.in'}
                    className="w-full h-12 pl-11 pr-4 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>
                <p className="text-[11px] text-[#44474E]">
                  For Aadhaar, enter 12-digit number without hyphens. OTP verification available on registered SIM.
                </p>
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0D2240]" htmlFor="password-input">
                    Access Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-[#E65100] hover:underline font-bold">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                    password
                  </span>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-11 pr-12 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-[#0D2240] cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* CAPTCHA Box */}
              <div className="p-4 rounded-xl bg-[#F0F3FF] border border-[#DEE8FF] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="bg-white px-4 py-2 rounded-lg border border-[#E2E8F0] flex items-center gap-2 select-none shadow-xs">
                    <span className="font-display text-xl font-black tracking-widest text-[#0D2240] line-through decoration-[#E65100] decoration-2 select-none font-mono">
                      {captchaCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider pl-2 border-l border-slate-200">
                      CAPTCHA
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0D2240] border border-[#E2E8F0] transition-colors shadow-2xs cursor-pointer"
                      title="Reload CAPTCHA"
                    >
                      <span className="material-symbols-outlined text-[16px]">refresh</span>
                    </button>
                    <button
                      type="button"
                      onClick={playAudioCaptcha}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0D2240] border border-[#E2E8F0] transition-colors shadow-2xs cursor-pointer"
                      title="Listen to audio captcha"
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    </button>
                  </div>
                </div>

                <div className="w-full sm:flex-1">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    placeholder="Enter characters"
                    className="w-full h-11 px-3 bg-white border border-[#E2E8F0] text-[#0D2240] rounded-lg text-sm text-center font-mono font-bold tracking-widest uppercase focus:outline-none focus:border-[#0D2240] shadow-inner"
                  />
                </div>
              </div>

              {/* Security Protection Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFF3EB] border border-[#E65100]/20 text-[#E65100]">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">gpp_maybe</span>
                <div className="text-xs">
                  <span className="font-bold">Security Protection Active:</span> Automatic lockout of access credentials after 5 consecutive failed attempts for a cooling duration of 15 minutes.
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to SAARTHI'}</span>
                <span className="material-symbols-outlined text-[20px]">login</span>
              </button>

              {/* Registration Link */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0] text-center sm:text-left">
                <div className="text-xs text-[#44474E]">
                  Don't have an active account?
                </div>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EAFBF0] text-[#138808] border border-[#16A34A]/30 hover:bg-[#138808] hover:text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Register with Aadhaar / DigiLocker</span>
                </Link>
              </div>
            </form>
          </div>

          {/* RIGHT: 5 Columns - National Citizen Registry Bento */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Deep Navy Master Bento Card */}
            <div className="relative overflow-hidden rounded-[28px] bg-[#0A1B33] text-white shadow-2xl ring-1 ring-white/10">
              {/* Tricolor accent edge */}
              <div className="h-1 w-full grid grid-cols-3 shrink-0">
                <div className="bg-[#E65100]" />
                <div className="bg-white/90" />
                <div className="bg-[#138808]" />
              </div>

              {/* Mesh gradient + grid texture background */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              />
              <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#FF7722]/25 blur-[80px]" />
              <div className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#16A34A]/15 blur-[90px]" />
              <span className="material-symbols-outlined pointer-events-none absolute -right-8 top-10 text-[170px] leading-none text-white/[0.035] select-none rotate-12">
                account_balance
              </span>

              <div className="relative p-6 lg:p-7 flex flex-col gap-6">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7722] to-[#E65100] shadow-lg shadow-[#E65100]/30 shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-white">verified</span>
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">National Citizen Registry</span>
                      <span className="text-[10px] text-white/50 font-medium">Government of India · Digital Public Infrastructure</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#16A34A]/15 ring-1 ring-[#16A34A]/30">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
                    </span>
                    <span className="text-[10px] font-bold text-[#4ADE80] tracking-wide">LIVE</span>
                  </span>
                </div>

                {/* Headline */}
                <div>
                  <div className="w-8 h-[3px] rounded-full bg-gradient-to-r from-[#FF7722] to-[#FFC28A] mb-3" />
                  <div className="font-display text-[26px] sm:text-3xl font-extrabold tracking-tight leading-[1.15]">
                    One Profile.<br />
                    <span className="bg-gradient-to-r from-[#FF9A56] via-[#FFB672] to-[#FFC28A] bg-clip-text text-transparent">
                      Every Direct Benefit.
                    </span>
                  </div>
                  <p className="text-xs text-white/65 mt-3 leading-relaxed max-w-[94%]">
                    SAARTHI matches citizen identity records directly against gazette entitlement rule engines across Central, State, and District welfare pipelines.
                  </p>
                </div>

                {/* Stat strip */}
                <div className="flex items-stretch rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md overflow-hidden">
                  <div className="flex-1 flex items-center gap-3 p-4">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-white/80">verified_user</span>
                    </span>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-display text-xl font-extrabold text-white">50+</span>
                      <span className="text-[10.5px] text-white/60 font-medium leading-snug">Verified Central &amp; State Schemes</span>
                    </div>
                  </div>
                  <div className="w-px bg-white/10 my-3" />
                  <div className="flex-1 flex items-center gap-3 p-4">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#FF7722]/15 shrink-0">
                      <span className="material-symbols-outlined text-[18px] text-[#FF9A56]">payments</span>
                    </span>
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="font-display text-xl font-extrabold text-[#FF9A56]">₹2.4L</span>
                      <span className="text-[10.5px] text-white/60 font-medium leading-snug">Avg. Direct Entitlement Value</span>
                    </div>
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1.5 text-[10.5px] text-white/50 font-medium">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    IST (UTC+05:30)
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-[10.5px] font-semibold text-white/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" /> All Clusters Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Grievance & Help Desk Card */}
            <div className="rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFF3EB] text-[#E65100] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">support_agent</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0D2240]">Toll-Free Grievance &amp; Help Desk</div>
                  <div className="text-xs text-slate-500">National Citizen Consumer Helpline</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0F3FF]">
                <div className="flex items-center gap-2 font-display text-base font-bold text-[#0D2240]">
                  <span className="material-symbols-outlined text-[#E65100]">call</span>
                  <span>14566 / 1800-111-555</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#EAFBF0] text-[#138808] text-[11px] font-bold">24x7 Active</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#0D2240] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">help</span> Help Guides
                  </span>
                  <span className="text-[11px] text-[#44474E]">How to register with Aadhaar OTP</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                  <span className="text-xs font-bold text-[#0D2240] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">report_problem</span> File Grievance
                  </span>
                  <span className="text-[11px] text-[#44474E]">Escalate to State Ombudsperson</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
