import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import saarthiLogo from '../assets/saarthi-logo.png'



const SIDEBAR_NAV_LINKS = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/explorer',
    label: 'Explore Schemes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    to: '/checklist',
    label: 'My Checklist',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/bookmarks',
    label: 'Saved Schemes',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'My Profile',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  async function load() {
    try {
      const data = await getNotifications()
      setUnreadCount(data.unreadCount || 0)
      setNotifications(data.notifications || [])
    } catch {
      // notification load failure handled gracefully
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
        className="relative w-10 h-10 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-1 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
          {unreadCount > 9 ? '9+' : unreadCount > 0 ? unreadCount : '9+'}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[#156f45] text-[10px] font-bold">
                {unreadCount} new
              </span>
            </div>
            <button onClick={handleMarkAll} className="text-xs font-medium text-[#156f45] hover:underline">
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm text-slate-500 font-medium">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notificationId}
                  onClick={() => handleRowClick(n)}
                  className={`w-full text-left px-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                    !n.read ? 'bg-[#F0FDF4]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.read ? (
                      <span className="w-2 h-2 rounded-full bg-[#156f45] mt-1.5 shrink-0" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isExplorerRoute = location.pathname === '/explorer' || location.pathname.startsWith('/schemes/')
  const [exploreOpen, setExploreOpen] = useState(true)
  const menuRef = useRef(null)

  useEffect(() => {
    if (isExplorerRoute) {
      setExploreOpen(true)
    }
  }, [isExplorerRoute])

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

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/explorer?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/explorer')
    }
  }

  const displayName = user?.fullName || 'Mohit Gupta'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5EBE5] h-[72px] flex items-center px-4 sm:px-6 lg:px-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Left: Brand Lockup with Emblem */}
          <div className="flex items-center gap-6 shrink-0">
            <NavLink to="/dashboard" className="flex items-center gap-3 group">
              <img
                src={saarthiLogo}
                alt="Saarthi Logo"
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105 duration-200"
              />
              <div className="hidden sm:flex flex-col">
                <span className="font-sans font-extrabold text-[19px] text-[#10241A] tracking-tight leading-none">
                  Saarthi
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5">
                  सरकारी योजनाओं तक आसान पहुँच
                </span>
              </div>
            </NavLink>
          </div>

          {/* Global Quick Search Pill (Center/Right aligned) */}
          <div className="flex-1 max-w-lg mx-auto hidden md:block px-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search schemes, benefits or ministries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F4F6F4] border border-[#E2E8E2] rounded-full pl-10 pr-4 py-2 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#156f45] focus:bg-white focus:ring-2 focus:ring-[#156f45]/20 transition-all shadow-2xs"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>
          </div>

          {/* Right: Search Input, Notifications & User Lockup */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            


            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile Avatar Lockup with Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-[#E8F5EE] text-[#156f45] flex items-center justify-center text-xs font-bold border border-[#156f45]/20 shadow-xs">
                  {initial}
                </div>
                <span className="hidden md:inline text-[13px] font-semibold text-slate-800 leading-tight">
                  {displayName}
                </span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{displayName}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user?.email || 'citizen@gov.in'}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#156f45] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    My Profile
                  </NavLink>
                  {user?.role === 'ADMIN' && (
                    <NavLink
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#156f45] transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#EF4444] hover:bg-rose-50 transition-colors border-t border-slate-100"
                  >
                    <svg className="w-4 h-4 text-[#EF4444]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>

          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex min-h-[calc(100vh-72px)]">
        
        {/* Left Sidebar (Desktop Rail) */}
        <aside className="hidden lg:flex flex-col w-56 xl:w-60 shrink-0 bg-white border-r border-[#E5EBE5] p-4 justify-between select-none sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
          
          {/* Top: Nav Links */}
          <div className="space-y-1">
            {SIDEBAR_NAV_LINKS.map((link) => {
              if (link.to === '/explorer') {
                const isExplorerActive = location.pathname === '/explorer' || location.pathname.startsWith('/schemes/')
                const isMatchedActive = location.pathname === '/explorer' && (!location.search || location.search.includes('tab=matched') || location.search.includes('filter=matched'))
                const isAllActive = location.pathname === '/explorer' && (location.search.includes('tab=all') || location.search.includes('filter=all'))

                return (
                  <div key={link.to} className="space-y-1">
                    <div
                      onClick={() => {
                        setExploreOpen((v) => !v)
                        if (location.pathname !== '/explorer') {
                          navigate('/explorer?tab=matched')
                        }
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                        isExplorerActive
                          ? 'bg-[#E8F5EE] text-[#156f45]'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isExplorerActive ? 'text-[#156f45]' : 'text-slate-400'}>
                          {link.icon}
                        </span>
                        <span>{link.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExploreOpen((v) => !v)
                        }}
                        className="p-1 rounded-md hover:bg-black/5 text-slate-400 hover:text-[#156f45] transition-colors"
                        aria-label="Toggle explore schemes submenu"
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${exploreOpen ? 'rotate-180 text-[#156f45]' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {/* Submenu Dropdown: Matched Schemes & All Schemes */}
                    {exploreOpen && (
                      <div className="ml-4 pl-3.5 border-l-2 border-[#156f45]/20 space-y-1 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <NavLink
                          to="/explorer?tab=matched"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            isMatchedActive
                              ? 'bg-[#156f45] text-white shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Matched Schemes</span>
                        </NavLink>

                        <NavLink
                          to="/explorer?tab=all"
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                            isAllActive
                              ? 'bg-[#156f45] text-white shadow-2xs font-bold'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          }`}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span>All Schemes</span>
                        </NavLink>
                      </div>
                    )}
                  </div>
                )
              }

              const isActive = location.pathname === link.to
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#E8F5EE] text-[#156f45]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span className={isActive ? 'text-[#156f45]' : 'text-slate-400'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </NavLink>
              )
            })}
          </div>

          {/* Bottom Sidebar Content: Monuments Art + Sabka Saath Sabka Vikas + Need Help Card */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            
            {/* Monument silhouette line art + Tricolor Ribbon & Calligraphy */}
            <div className="flex flex-col items-center text-center px-1">
              <svg className="h-16 w-auto text-emerald-800/25" viewBox="0 0 100 65" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M15 65 V25 H85 V65 M30 65 V42 Q50 32 70 42 V65 M20 22 H80 M30 15 H70 V22 M40 10 H60 V15 M48 5 H52 V10" />
                <path d="M5 65 L10 35 L15 65 M85 65 L90 35 L95 65" />
              </svg>

              <div className="mt-1 flex flex-col items-center">
                <span className="font-serif italic text-sm font-bold text-slate-700 leading-tight">
                  Sabka Saath
                </span>
                <span className="font-serif italic text-sm font-bold text-slate-700 leading-tight">
                  Sabka Vikas
                </span>
                
                {/* Tricolor Ribbon */}
                <svg className="w-24 h-4 mt-1" viewBox="0 0 100 16" fill="none">
                  <path d="M0 4 C25 12, 65 0, 100 6" stroke="#FF9933" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M0 8 C25 16, 65 4, 100 10" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
                  <path d="M0 12 C25 20, 65 8, 100 14" stroke="#138808" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Need Help? Card */}
            <div className="rounded-2xl bg-[#F0F7F3] border border-[#d2e8db] p-3.5 text-center">
              <div className="w-8 h-8 rounded-full bg-white text-[#156f45] mx-auto flex items-center justify-center shadow-xs mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
              </div>
              <h4 className="text-xs font-bold text-slate-800">Need Help?</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                Ask Saarthi or browse our help center.
              </p>
              <button
                onClick={() => navigate('/explorer')}
                className="mt-2.5 w-full py-1.5 px-3 rounded-full border border-slate-300 bg-white hover:bg-emerald-50/70 text-slate-700 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 shadow-2xs"
              >
                <span>Get Help</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex">
            <div className="w-64 bg-white p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-extrabold text-lg text-slate-900">Saarthi Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-1">
                  {SIDEBAR_NAV_LINKS.map((link) => {
                    if (link.to === '/explorer') {
                      const isExplorerActive = location.pathname === '/explorer' || location.pathname.startsWith('/schemes/')
                      const isMatchedActive = location.pathname === '/explorer' && (!location.search || location.search.includes('tab=matched') || location.search.includes('filter=matched'))
                      const isAllActive = location.pathname === '/explorer' && (location.search.includes('tab=all') || location.search.includes('filter=all'))

                      return (
                        <div key={link.to} className="space-y-1">
                          <div
                            onClick={() => {
                              setExploreOpen((v) => !v)
                              if (location.pathname !== '/explorer') {
                                navigate('/explorer?tab=matched')
                                setMobileMenuOpen(false)
                              }
                            }}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                              isExplorerActive ? 'bg-[#E8F5EE] text-[#156f45]' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={isExplorerActive ? 'text-[#156f45]' : 'text-slate-400'}>
                                {link.icon}
                              </span>
                              <span>{link.label}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setExploreOpen((v) => !v)
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-[#156f45]"
                            >
                              <svg
                                className={`w-4 h-4 transition-transform duration-200 ${exploreOpen ? 'rotate-180 text-[#156f45]' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {exploreOpen && (
                            <div className="ml-4 pl-3.5 border-l-2 border-[#156f45]/20 space-y-1 py-1">
                              <NavLink
                                to="/explorer?tab=matched"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                  isMatchedActive
                                    ? 'bg-[#156f45] text-white font-bold'
                                    : 'text-slate-600 hover:bg-slate-100/70'
                                }`}
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Matched Schemes</span>
                              </NavLink>

                              <NavLink
                                to="/explorer?tab=all"
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                                  isAllActive
                                    ? 'bg-[#156f45] text-white font-bold'
                                    : 'text-slate-600 hover:bg-slate-100/70'
                                }`}
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                <span>All Schemes</span>
                              </NavLink>
                            </div>
                          )}
                        </div>
                      )
                    }

                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                            isActive ? 'bg-[#E8F5EE] text-[#156f45]' : 'text-slate-600 hover:bg-slate-50'
                          }`
                        }
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </NavLink>
                    )
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center justify-center gap-2"
                >
                  Log out
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
          </div>
        )}

        {/* Main Routed Content View */}
        <main className="flex-1 min-w-0 bg-[#F8FAF8] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

