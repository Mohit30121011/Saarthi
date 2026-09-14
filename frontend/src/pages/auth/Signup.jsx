import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'

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
    <AuthLayout>
      {error && (
        <div className="mb-7 rounded-2xl bg-saarthi-alert-bg border-l-[4px] border-saarthi-error p-3.5 sm:p-4 shadow-sm" role="alert">
          <p className="text-xs sm:text-[13px] font-medium text-saarthi-ink leading-snug">{error}</p>
        </div>
      )}

      <div className="mb-7">
        <h1 className="font-fraunces text-3xl sm:text-[40px] font-bold text-saarthi-ink leading-tight tracking-tight">
          Create your account
        </h1>
        <p className="mt-2 text-sm sm:text-base text-saarthi-body font-normal">
          It takes less than a minute — see schemes you qualify for right after.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-saarthi-ink block mb-1.5" htmlFor="full_name">
            Full name
          </label>
          <input
            className="w-full h-[52px] px-4.5 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus"
            id="full_name"
            placeholder="As per your Aadhaar or voter ID"
            required
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-saarthi-ink block mb-1.5" htmlFor="email">
            Email address
          </label>
          <input
            className="w-full h-[52px] px-4.5 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus"
            id="email"
            placeholder="you@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-saarthi-ink" htmlFor="password">
              Password
            </label>
            <span className="text-[11px] text-saarthi-muted">8+ chars with letters &amp; numbers</span>
          </div>
          <div className="relative">
            <input
              className="w-full h-[52px] pl-4.5 pr-12 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus"
              id="password"
              placeholder="Create a secure password"
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-saarthi-muted hover:text-saarthi-ink transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-2.5 pt-0.5 space-y-1.5">
              <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`rounded-full ${i < strength ? (strength >= 3 ? 'bg-saarthi-green' : 'bg-saarthi-saffron') : 'bg-saarthi-border'}`} />
                ))}
              </div>
              <span className="text-[11px] font-medium text-saarthi-green">Strength: {strengthLabel}</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            className="w-full h-[52px] rounded-full bg-saarthi-green hover:bg-saarthi-green-hover active:scale-[0.99] text-white font-semibold text-base shadow-saarthi-btn flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </div>
      </form>

      <footer className="pt-8 text-center">
        <p className="text-sm text-saarthi-body">
          Already have an account?
          <Link className="font-semibold text-saarthi-green hover:underline decoration-2 underline-offset-4 ml-1 transition-all" to="/login">
            Log in
          </Link>
        </p>
      </footer>
    </AuthLayout>
  )
}
