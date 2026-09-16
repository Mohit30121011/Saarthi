import { useState } from 'react'
import { Link } from 'react-router-dom'
import saarthiLogoSvg from '../../assets/saarthi-portal-logo.svg'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-[#111C2D] flex flex-col">
      {/* Top Tricolor Decorative Ribbon */}
      <div className="h-1.5 w-full grid grid-cols-3 shrink-0">
        <div className="bg-[#E65100] h-full" />
        <div className="bg-white h-full" />
        <div className="bg-[#138808] h-full" />
      </div>

      <header className="bg-white border-b border-[#E2E8F0] px-4 sm:px-6 lg:px-8 py-3 shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex items-center justify-between">
          <Link to="/login" className="flex items-center gap-3">
            <img src={saarthiLogoSvg} alt="SAARTHI Official Logo" className="h-9 w-auto object-contain" />
          </Link>
          <Link to="/login" className="text-xs font-bold text-[#E65100] hover:underline">
            Back to Sign In →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-12 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-md p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 bg-[#FFF3EB] text-[#E65100] px-3 py-1 rounded-full text-xs font-bold w-fit mb-3">
            <span className="material-symbols-outlined text-[15px]">lock_reset</span>
            <span>CREDENTIAL RECOVERY • OFFICIAL CITIZEN PORTAL</span>
          </div>

          <h1 className="font-display text-2xl font-extrabold text-[#0D2240] tracking-tight">
            Reset Access Password
          </h1>
          <p className="text-xs sm:text-sm text-[#44474E] mt-1.5 mb-6">
            Enter your registered email address or mobile ID to receive a secure statutory password reset token.
          </p>

          {submitted ? (
            <div className="rounded-xl bg-[#EAFBF0] border border-[#16A34A]/30 p-4 text-xs text-[#138808] space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">mark_email_read</span>
                <span>Verification Link Dispatched</span>
              </div>
              <p>
                If an account exists for <strong>{email}</strong>, a secure reset token has been transmitted to your registered email and mobile SMS.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0D2240] mb-1.5" htmlFor="email">
                  Registered Email or Mobile Number
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-slate-400 pointer-events-none">
                    mail
                  </span>
                  <input
                    id="email"
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. mohit@saarthi.gov.in"
                    className="w-full h-11 pl-11 pr-4 bg-[#F0F3FF] border border-[#DEE8FF] text-[#111C2D] rounded-xl text-sm focus:bg-white focus:border-[#0D2240] focus:ring-2 focus:ring-[#0D2240]/10 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#E65100] hover:bg-[#FF7722] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Send Reset Token</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-xs">
            <Link to="/login" className="text-[#0D2240] hover:underline font-bold">
              ← Return to Login Gateway
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
