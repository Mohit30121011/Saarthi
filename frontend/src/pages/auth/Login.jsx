import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
          <div className="flex items-center gap-4 text-xs font-semibold text-[#44474E]">
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D2240] to-[#1A365D] text-white p-6 lg:p-7 shadow-xl flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  National Citizen Registry
                </span>
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#16A34A] animate-pulse" />
              </div>

              <div>
                <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                  One Profile.<br />Every Direct Benefit.
                </div>
                <p className="text-xs text-white/80 mt-2 leading-relaxed">
                  SAARTHI matches citizen identity records directly against gazette entitlement rule engines across Central, State, and District welfare pipelines.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md flex flex-col gap-1 border border-white/10">
                  <span className="font-display text-2xl font-extrabold text-white">50+</span>
                  <span className="text-[11px] text-white/80 font-medium">Verified Central &amp; State Schemes</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md flex flex-col gap-1 border border-white/10">
                  <span className="font-display text-2xl font-extrabold text-[#FF7722]">₹2.4 Lakh</span>
                  <span className="text-[11px] text-white/80 font-medium">Avg. Direct Entitlement Value</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] text-white/70">
                <span>Server Clock: IST (UTC+05:30)</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" /> All Clusters Operational
                </span>
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
