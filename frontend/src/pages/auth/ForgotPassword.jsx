import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    // NOTE: no backend /api/auth/forgot-password endpoint exists yet — this
    // is UI-only for now. Showing the generic "check your email" state
    // either way is standard practice (never confirm/deny an email exists).
    setSubmitted(true)
  }

  return (
    <AuthLayout>
      <div className="mb-7">
        <h1 className="font-fraunces text-2xl sm:text-[28px] font-bold text-saarthi-ink leading-tight tracking-tight">
          Reset your password
        </h1>
        <p className="mt-2 text-sm sm:text-base text-saarthi-body font-normal">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      {submitted ? (
        <div className="rounded-2xl bg-saarthi-alert-bg border-l-[4px] border-saarthi-saffron p-4 text-sm text-saarthi-ink">
          If an account exists for <strong>{email}</strong>, a reset link is on its way.
        </div>
      ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-saarthi-ink" htmlFor="email">
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
          <button
            className="w-full h-[52px] rounded-full bg-saarthi-green hover:bg-saarthi-green-hover text-white font-medium text-base shadow-saarthi-btn transition-all duration-200"
            type="submit"
          >
            Send reset link
          </button>
        </form>
      )}

      <footer className="pt-8 text-center">
        <Link className="text-sm font-semibold text-saarthi-green hover:underline decoration-2 underline-offset-4" to="/login">
          Back to log in
        </Link>
      </footer>
    </AuthLayout>
  )
}
