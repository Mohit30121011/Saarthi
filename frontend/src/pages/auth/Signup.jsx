import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import loginHero from '../../assets/login-hero.png'
import emblemIndia from '../../assets/emblem-india.svg'

function passwordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

export default function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(password)
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][strength]

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register({ fullName, email, password })
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F2F7F2] font-sans selection:bg-[#156f45]/20 selection:text-[#10241A]">
      
      {/* LEFT: Full-Bleed Hero Artwork (Single seamless container, zero padding) */}
      <div className="relative w-full lg:w-[60%] xl:w-[62%] min-h-[420px] sm:min-h-[540px] lg:min-h-screen overflow-hidden bg-[#E9F3EB]">
        <img
          src={loginHero}
          alt="Saarthi - Your Guide to Government Schemes"
          className="w-full h-full object-cover object-left"
        />
      </div>

      {/* RIGHT: 40% Clean Authentication Pane */}
      <div className="w-full lg:w-[40%] xl:w-[38%] min-h-screen bg-white flex flex-col justify-center items-center p-6 sm:p-8 xl:p-12 z-10 shadow-[-12px_0_35px_rgba(0,0,0,0.04)] border-l border-slate-100 overflow-y-auto">
        <div className="w-full max-w-[460px] my-auto flex flex-col justify-between py-2">
          
          {/* Top Row: Citizen Portal Badge + Indian Emblem */}
          <div className="flex items-center justify-between gap-3">
            {/* Verified Citizen Portal Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-emerald-200/80 text-[11px] font-semibold text-[#047857] shadow-sm">
              <svg className="w-3.5 h-3.5 fill-[#10B981] text-white" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Verified Citizen Portal</span>
            </div>

            {/* State Emblem of India */}
            <div className="flex items-center gap-2 text-right">
              <img
                src={emblemIndia}
                alt="National Emblem"
                className="h-9 w-auto object-contain opacity-85"
              />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] font-bold text-slate-800 tracking-tight">Government of India</span>
                <span className="text-[9.5px] font-semibold text-slate-500 font-devanagari">भारत सरकार</span>
              </div>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="mt-6 mb-5">
            <h2 className="text-3xl sm:text-[34px] font-black text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 mt-1.5 font-normal leading-relaxed">
              It takes less than a minute — discover all schemes you qualify for.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 flex items-center justify-between" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-2">×</button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="full_name">
                Full name
              </label>
              <div className="relative flex items-center bg-[#EDF3FC] rounded-xl px-3.5 h-11.5 border border-transparent focus-within:border-[#156f45] focus-within:ring-2 focus-within:ring-[#156f45]/20 transition-all">
                <svg className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="full_name"
                  type="text"
                  required
                  placeholder="As per your Aadhaar or Voter ID"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium p-0 focus:ring-0"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="email">
                Email address
              </label>
              <div className="relative flex items-center bg-[#EDF3FC] rounded-xl px-3.5 h-11.5 border border-transparent focus-within:border-[#156f45] focus-within:ring-2 focus-within:ring-[#156f45]/20 transition-all">
                <svg className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium p-0 focus:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800" htmlFor="password">
                  Password
                </label>
                <span className="text-[10.5px] text-slate-400 font-medium">8+ chars with letters &amp; numbers</span>
              </div>
              <div className="relative flex items-center bg-[#EDF3FC] rounded-xl px-3.5 h-11.5 border border-transparent focus-within:border-[#156f45] focus-within:ring-2 focus-within:ring-[#156f45]/20 transition-all">
                <svg className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-900 placeholder-slate-400 font-medium p-0 pr-8 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`rounded-full transition-colors duration-200 ${
                          i < strength
                            ? strength >= 3
                              ? 'bg-[#156f45]'
                              : 'bg-[#f59e0b]'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="text-slate-400">Security:</span>
                    <span className={`font-semibold ${strength >= 3 ? 'text-[#156f45]' : 'text-[#f59e0b]'}`}>
                      {strengthLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#156f45] hover:bg-[#115e3b] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#156f45]/25 transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                <span>{loading ? 'Creating account…' : 'Create account'}</span>
                {!loading && <span className="text-base leading-none">→</span>}
              </button>
            </div>
          </form>

          {/* Divider: Already have an account? */}
          <div className="relative flex items-center justify-center my-4.5">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] font-medium text-slate-400">
              Already have an account?
            </span>
          </div>

          {/* Secondary Button: Log in */}
          <Link
            to="/login"
            className="w-full h-11 rounded-full border border-[#86efac] bg-white hover:bg-emerald-50/60 active:scale-[0.99] text-[#156f45] font-semibold text-sm flex items-center justify-center transition-all duration-150 shadow-sm"
          >
            Log in to existing account
          </Link>

          {/* Trust Badges Row */}
          <div className="flex items-center justify-between gap-2 mt-5 pt-3.5 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Secure &amp; Encrypted</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Aadhaar Compatible</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#156f45]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h3a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
              <span>PAN &amp; Ration Card</span>
            </div>
          </div>

          {/* Decorative Bottom: Monuments Watermark & Tricolor Wave Script */}
          <div className="mt-4 pt-1 flex items-end justify-between relative select-none pointer-events-none">
            {/* Left: Indian Monuments Line Art Silhouette */}
            <div className="opacity-25 text-emerald-800">
              <svg className="h-9 w-auto" viewBox="0 0 240 50" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M10 50 L14 15 L18 50 M12 35 H16 M13 25 H15" />
                <path d="M30 50 V20 H58 V50 M38 50 V32 Q44 26 50 32 V50 M32 17 H56 M36 12 H52 V17" />
                <path d="M70 50 V28 H76 V50 M82 50 V28 H88 V50 M70 28 Q79 20 88 28" />
                <path d="M110 50 V18 L112 50 M111 28 H111.5" />
                <path d="M118 50 V30 H142 V50 M124 50 V38 Q130 32 136 38 V50 M122 30 Q130 14 138 30 M130 14 V8" />
                <path d="M150 50 V18 L148 50 M149 28 H148.5" />
                <path d="M165 50 V32 H172 V28 H178 V32 H185 V28 H191 V32 H198 V50" />
                <path d="M178 28 Q184.5 22 191 28 M184.5 22 V18" />
                <path d="M210 50 Q220 25 225 50 M215 50 Q225 30 235 50" />
              </svg>
            </div>

            {/* Right: Tricolor Wave + Calligraphy */}
            <div className="flex flex-col items-end">
              <span className="font-caveat text-xl sm:text-2xl text-slate-800/90 tracking-wide -mb-1 rotate-[-2deg]">
                A Better Tomorrow Together
              </span>
              
              <svg className="w-28 sm:w-32 h-6" viewBox="0 0 140 24" fill="none">
                <path
                  d="M0 8 C30 18, 70 2, 105 10 C120 14, 135 8, 140 6"
                  stroke="#FF9933"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M0 12 C30 22, 70 6, 105 14 C120 18, 135 12, 140 10"
                  stroke="#E2E8F0"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M0 16 C30 26, 70 10, 105 18 C120 22, 135 16, 140 14"
                  stroke="#138808"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
