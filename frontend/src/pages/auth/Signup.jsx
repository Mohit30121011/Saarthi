import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import saarthiLogoSvg from '../../assets/saarthi-portal-logo.svg'

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
  const [aadhaarNumber, setAadhaarNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = passwordStrength(password)
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

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
      setError(err.response?.data?.error || 'Registration failed. Please check details and try again.')
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
          <Link to="/login" className="flex items-center gap-3">
            <img src={saarthiLogoSvg} alt="SAARTHI Official Logo" className="h-9 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold text-[#44474E]">
            <LanguageSwitcher />
            <span>Already have an account?</span>
            <Link to="/login" className="text-[#E65100] hover:underline font-bold">
              Sign In →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF3EB] text-[#E65100] px-3 py-1 rounded-full text-xs font-bold w-fit mb-3">
            <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
            <span>CITIZEN REGISTRATION • ONBOARDING PORTAL</span>
          </div>

          <h1 className="font-display text-xl sm:text-3xl font-extrabold text-[#0D2240] tracking-tight truncate">
            Create Citizen Account
          </h1>
          <p className="text-xs sm:text-sm text-[#44474E] mt-1.5 mb-6 truncate">
            Register to unlock personalized scheme eligibility discovery.
          </p>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-500">error</span>
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="name">
                Full Name (as per Aadhaar / Official ID)
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                  person
                </span>
                <input
                  id="name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Mohit Gupta"
                  className="w-full h-11 pl-11 pr-4 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                  email
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mohit@example.com"
                  className="w-full h-11 pl-11 pr-4 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="aadhaar">
                Aadhaar Number (Optional / Demo)
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                  fingerprint
                </span>
                <input
                  id="aadhaar"
                  type="text"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full h-11 pl-11 pr-4 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 pl-11 pr-12 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 p-1 text-slate-400 hover:text-[#0D2240] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>

              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 1 ? 'bg-red-500' : strength <= 3 ? 'bg-amber-500' : 'bg-[#138808]'
                      }`}
                      style={{ width: `${(strength / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{loading ? 'Creating Account...' : 'Continue to Guided Profile Setup →'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs text-[#44474E]">
            Already have an active login?{' '}
            <Link to="/login" className="text-[#0D2240] hover:underline font-bold">
              Sign In to Citizen Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
