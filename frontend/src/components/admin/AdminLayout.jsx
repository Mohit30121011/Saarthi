import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/schemes', label: 'Schemes' },
]

export default function AdminLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex bg-saarthi-bg">
      <aside className="w-[240px] shrink-0 bg-saarthi-ink text-white/90 flex flex-col">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-white/10">
          <span className="font-fraunces text-lg text-white">Saarthi</span>
          <span className="text-[11px] uppercase tracking-wide text-white/50">Admin</span>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-5 py-2.5 text-sm border-l-2 transition-colors ${
                  isActive
                    ? 'border-saarthi-green bg-white/5 text-white font-medium'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <NavLink to="/dashboard" className="text-xs text-white/50 hover:text-white/80">
            ← Back to citizen app
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 flex items-center justify-end px-8 border-b border-saarthi-border bg-white">
          <span className="text-sm text-saarthi-body">{user?.fullName || 'Admin'}</span>
        </header>
        <main className="px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
