import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/explorer', label: 'Explorer' },
  { to: '/checklist', label: 'Checklist' },
  { to: '/bookmarks', label: 'Bookmarks' },
]

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  async function load() {
    try {
      const data = await getNotifications()
      setUnreadCount(data.unreadCount)
      setNotifications(data.notifications)
    } catch {
      // notification load failures shouldn't break the shell
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleOpen() {
    setOpen((v) => !v)
    if (!open) await load()
  }

  async function handleMarkAll() {
    await markAllNotificationsRead()
    load()
  }

  async function handleRowClick(n) {
    if (!n.read) {
      await markNotificationRead(n.notificationId)
      load()
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-saarthi-ink hover:bg-saarthi-bg transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-saarthi-error text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-saarthi-card border border-saarthi-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-saarthi-border">
            <p className="text-sm font-semibold text-saarthi-ink">Notifications</p>
            <button onClick={handleMarkAll} className="text-xs font-medium text-saarthi-green hover:underline">
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="text-sm text-saarthi-muted text-center py-8">No notifications yet</p>
            )}
            {notifications.map((n) => (
              <button
                key={n.notificationId}
                onClick={() => handleRowClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-saarthi-border last:border-0 hover:bg-saarthi-bg transition-colors ${
                  !n.read ? 'bg-[#F5FAF7]' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-saarthi-green mt-1.5 shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-saarthi-ink">{n.title}</p>
                    <p className="text-xs text-saarthi-body mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-saarthi-bg">
      <header className="sticky top-0 z-40 bg-white border-b border-saarthi-border h-[72px] flex items-center px-4 sm:px-8">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-2">
              <span className="font-sans font-semibold text-lg text-saarthi-ink">Saarthi</span>
            </NavLink>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium pb-2 border-b-2 transition-colors ${
                      isActive
                        ? 'text-saarthi-green border-saarthi-green'
                        : 'text-saarthi-body border-transparent hover:text-saarthi-ink'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-saarthi-bg transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-saarthi-green/10 text-saarthi-green flex items-center justify-center text-sm font-semibold">
                  {(user?.fullName || '?').charAt(0).toUpperCase()}
                </span>
                <svg className="w-3.5 h-3.5 text-saarthi-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-saarthi-card border border-saarthi-border z-50 overflow-hidden">
                  <NavLink to="/profile" className="block px-4 py-3 text-sm text-saarthi-ink hover:bg-saarthi-bg transition-colors" onClick={() => setMenuOpen(false)}>
                    Profile
                  </NavLink>
                  {user?.role === 'ADMIN' && (
                    <NavLink to="/admin" className="block px-4 py-3 text-sm text-saarthi-ink hover:bg-saarthi-bg transition-colors" onClick={() => setMenuOpen(false)}>
                      Admin panel
                    </NavLink>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-saarthi-error hover:bg-saarthi-bg transition-colors border-t border-saarthi-border">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
