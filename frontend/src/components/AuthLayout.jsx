import { Link } from 'react-router-dom'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDQ3KGX9_ST3WpdsxEGCgO_e6pobzlqxICZ7Rsz9apFYrWbe0_37lza2jKsMEdp5s06zs50LWON2tns7gWrjU1AVWb5ozm2jD2m5RfTy-zj5XYA7Z2egfARZWrn2--t7djXRMV7yyeC2QCcbJaSpKQgObR0l2-V3dOmf6841dbQ28enRDlIShIDySTcZuzpaNJZYRff0GGu5C2B1SUIBWfVcLUh4pibUqu3EHZ4GcQn'

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 bg-saarthi-bg">
      <main className="w-full max-w-[1440px] bg-white rounded-[36px] overflow-hidden flex flex-col lg:flex-row min-h-[860px]">
        <section className="w-full lg:w-[46%] xl:w-[45%] bg-white flex flex-col justify-between p-7 sm:p-10 xl:p-14 relative z-10 overflow-y-auto">
          <div>
            <header className="flex items-center justify-between gap-3 mb-8">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <span className="flex flex-col">
                  <span className="font-sans font-semibold text-[22px] tracking-tight text-saarthi-ink leading-none">
                    Saarthi
                  </span>
                  <span className="text-[10.5px] uppercase tracking-wider text-saarthi-green font-medium mt-1">
                    सारथी
                  </span>
                </span>
              </Link>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saarthi-bg border border-saarthi-border text-[12px] font-medium text-saarthi-ink/80">
                <span className="w-2 h-2 rounded-full bg-saarthi-saffron inline-block animate-pulse" />
                <span>नागरिक सेवा पोर्टल</span>
              </div>
            </header>

            {children}
          </div>
        </section>

        <section className="w-full lg:w-[54%] xl:w-[55%] bg-[#1F6E43] bg-gradient-to-br from-[#1F6E43] via-[#1B5E39] to-[#10241A] p-6 sm:p-10 xl:p-12 flex flex-col justify-between relative overflow-hidden text-white select-none rounded-[32px]">
          <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 bg-saarthi-saffron/15 rounded-full blur-3xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-saarthi-bg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F2A93B]" />
              <span>Verified Citizen Portal</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/70">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Fast, secure, end-to-end encrypted</span>
            </div>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center py-4">
            <div className="relative w-full max-w-[620px] bg-[#10241A] p-3 sm:p-3.5 rounded-[32px] shadow-saarthi-bezel border border-white/10 transition-transform duration-500 hover:scale-[1.008]">
              <div aria-hidden="true" className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/10 z-20" />
              <div className="relative rounded-[22px] overflow-hidden bg-[#10241A] aspect-[4/3] flex items-center justify-center">
                <img
                  alt="Claymorphic render of a citizen using Saarthi"
                  className="w-full h-full object-cover object-center transform scale-[1.01]"
                  loading="eager"
                  src={HERO_IMAGE}
                />
                <div className="absolute top-4 left-4 bg-[#10241A]/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 shadow-sm hidden sm:flex items-center gap-2">
                  <span className="text-saarthi-saffron font-bold text-xs">₹</span>
                  <span className="text-[11px] font-medium text-white/90">Direct Benefit Transfer Ready</span>
                </div>
              </div>
              <div className="absolute -bottom-5 -right-2 sm:-right-4 bg-white text-saarthi-ink px-4 sm:px-5 py-3 rounded-2xl shadow-xl border border-saarthi-border flex items-center gap-3.5 z-30">
                <div className="w-10 h-10 rounded-xl bg-[#FDF3E7] border border-saarthi-saffron/40 flex items-center justify-center text-saarthi-saffron shrink-0">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 15l-3.5-3.5 1.42-1.42L11 13.17l5.08-5.08 1.42 1.42L11 16z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-sm text-saarthi-ink leading-none">52+ Verified Schemes</p>
                  <p className="text-[11.5px] text-saarthi-body mt-1">Central &amp; State subsidies unlocked</p>
                </div>
              </div>
            </div>
          </div>

          <footer className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/80 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-4 h-4 text-saarthi-saffron" fill="currentColor" viewBox="0 0 20 20">
                <path clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" fillRule="evenodd" />
              </svg>
              <span>Aadhaar, PAN &amp; Ration Card Compatible</span>
            </div>
            <p className="text-[11px] text-white/60 tracking-wide">Official Direct Benefit Discovery Framework</p>
          </footer>
        </section>
      </main>
    </div>
  )
}
