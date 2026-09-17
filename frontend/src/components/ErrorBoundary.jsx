import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Saarthi ErrorBoundary Caught]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E2E8F0] shadow-xl p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFF3EB] text-[#E65100] flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">sync_problem</span>
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0D2240]">
                Unable to Display Citizen Dossier
              </h2>
              <p className="text-xs sm:text-sm text-[#44474E] leading-relaxed">
                The portal encountered a temporary rendering or sync issue. Your verified profile data is safely intact.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-[#0D2240] hover:bg-[#1A365D] text-white text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Reload Citizen Portal</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  try {
                    sessionStorage.clear()
                    localStorage.removeItem('saarthi_language')
                  } catch (e) {}
                  window.location.assign('/dashboard')
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#44474E] hover:bg-slate-100 transition-all cursor-pointer"
              >
                Reset Session &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
