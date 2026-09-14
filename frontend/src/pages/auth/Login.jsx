import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      {error && (
        <div className="mb-7 rounded-2xl bg-saarthi-alert-bg border-l-[4px] border-saarthi-error p-3.5 sm:p-4 shadow-sm flex items-start gap-3" role="alert">
          <div className="flex-1">
            <p className="text-xs sm:text-[13px] font-medium text-saarthi-ink leading-snug">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-7">
        <h1 className="font-fraunces text-3xl sm:text-[40px] font-bold text-saarthi-ink leading-tight tracking-tight">
          Welcome back
        </h1>
        <p className="mt-2 text-sm sm:text-base text-saarthi-body font-normal">
          Log in to see personalized schemes and benefits you qualify for.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-saarthi-ink" htmlFor="email">
            Email address
          </label>
          <input
            autoComplete="email"
            className="w-full h-[52px] px-4.5 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-saarthi-ink" htmlFor="password">
              Password
            </label>
            <Link className="text-xs sm:text-[13px] font-medium text-saarthi-saffron hover:underline transition-all underline-offset-2" to="/forgot-password">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              autoComplete="current-password"
              className="w-full h-[52px] pl-4.5 pr-12 rounded-[16px] bg-saarthi-bg border-[1.5px] border-saarthi-border text-saarthi-ink placeholder-saarthi-muted text-sm sm:text-[15px] transition duration-150 saarthi-input-focus"
              id="password"
              name="password"
              placeholder="••••••••••••"
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
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            className="w-full h-[52px] rounded-full bg-saarthi-green hover:bg-saarthi-green-hover text-white font-medium text-base tracking-normal shadow-saarthi-btn transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md flex items-center justify-center gap-2 group disabled:opacity-60 disabled:pointer-events-none"
            disabled={loading}
            type="submit"
          >
            <span>{loading ? 'Logging in…' : 'Log in'}</span>
            {!loading && (
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </form>

      <footer className="pt-8 text-center">
        <p className="text-sm text-saarthi-body">
          New here?
          <Link className="font-semibold text-saarthi-green hover:underline decoration-2 underline-offset-4 ml-1 transition-all" to="/signup">
            Create an account
          </Link>
        </p>
      </footer>
    </AuthLayout>
  )
}
