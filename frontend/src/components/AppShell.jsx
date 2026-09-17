import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications'
import ChatWidget from './ChatWidget'
import saarthiLogoSvg from '../assets/saarthi-portal-logo.svg'
import headshotImg from '../assets/indian-citizen-headshot.png'

function NotificationBell({ unreadCount = 0, setUnreadCount }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  async function load() {
    try {
      const data = await getNotifications()
      const raw = data.notifications || []
      const now = Date.now()
      const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000
      const valid = raw.filter((n) => {
        if (!n.createdAt) return true
        const t = new Date(n.createdAt).getTime()
        if (isNaN(t)) return true
        return (now - t) <= TWO_DAYS_MS
      })
      if (setUnreadCount) setUnreadCount(valid.filter((n) => !n.read).length)
      setNotifications(valid)
    } catch {
      // fallback
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
    try {
      await markAllNotificationsRead()
      if (setUnreadCount) setUnreadCount(0)
      window.dispatchEvent(new CustomEvent('notifications-read'))
      load()
    } catch {
      if (setUnreadCount) setUnreadCount(0)
    }
  }

  async function handleRowClick(n) {
    if (!n.read) {
      try {
        await markNotificationRead(n.notificationId)
        if (setUnreadCount) setUnreadCount((c) => Math.max(0, c - 1))
        window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { unreadCount: Math.max(0, unreadCount - 1) } }))
        load()
      } catch {
        // ignore
      }
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={handleOpen}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#0D2240] hover:bg-[#EBF3FC] border border-[#E2E8F0] transition-colors shadow-2xs cursor-pointer shrink-0"
      >
        <span className="material-symbols-outlined text-[18px] sm:text-[20px] text-[#0D2240]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E65100] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0D2240]">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFF3EB] text-[#E65100]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-xs text-[#E65100] hover:underline font-semibold cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full bg-[#EBF3FC] text-[#0D2240] flex items-center justify-center mx-auto mb-2">
                  <span className="material-symbols-outlined text-[20px]">notifications_none</span>
                </div>
                <p className="text-xs font-bold text-[#0D2240]">No new notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Notifications automatically expire after 2 days (48 hrs).
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.notificationId}
                  onClick={() => handleRowClick(n)}
                  className={`w-full text-left p-3.5 hover:bg-[#F8FAFC] transition-colors flex items-start gap-3 cursor-pointer ${
                    !n.read ? 'bg-[#EBF3FC]/40' : ''
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#E65100]' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug ${!n.read ? 'text-[#0D2240] font-bold' : 'text-slate-600'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
            <NavLink
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-[#0D2240] hover:text-[#E65100] transition-colors"
            >
              View all in Notification Center →
            </NavLink>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [exploreNavDropdownOpen, setExploreNavDropdownOpen] = useState(false)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const isExplorerRoute = location.pathname === '/explorer' || location.pathname.startsWith('/schemes/')

  const menuRef = useRef(null)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)
  const exploreDropdownRef = useRef(null)

  useEffect(() => {
    function fetchUnread() {
      getNotifications()
        .then((data) => setUnreadNotificationsCount(data?.unreadCount ?? 0))
        .catch(() => {})
    }
    fetchUnread()

    function handleNotificationsRead() {
      setUnreadNotificationsCount(0)
    }

    function handleNotificationsUpdated(e) {
      if (typeof e.detail?.unreadCount === 'number') {
        setUnreadNotificationsCount(e.detail.unreadCount)
      } else {
        fetchUnread()
      }
    }

    window.addEventListener('notifications-read', handleNotificationsRead)
    window.addEventListener('notifications-updated', handleNotificationsUpdated)
    window.addEventListener('focus', fetchUnread)

    return () => {
      window.removeEventListener('notifications-read', handleNotificationsRead)
      window.removeEventListener('notifications-updated', handleNotificationsUpdated)
      window.removeEventListener('focus', fetchUnread)
    }
  }, [])

  // When citizen views the notification center, automatically clear unread badge
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadNotificationsCount(0)
    }
  }, [location.pathname])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
      if (exploreDropdownRef.current && !exploreDropdownRef.current.contains(e.target)) {
        setExploreNavDropdownOpen(false)
      }
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
    setSearchOpen(false)
  }

  const displayName = user?.fullName || 'Khushi & Mohit'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#111C2D]">
      {/* 1. TOP CIVIC METADATA HEADER */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E2E8F0] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        {/* Decorative Tiranga Top Ribbon */}
        <div className="h-1.5 w-full grid grid-cols-3">
          <div className="bg-[#E65100] h-full" />
          <div className="bg-white h-full" />
          <div className="bg-[#138808] h-full" />
        </div>

        {/* Sub-Header: Government Provenance & Language */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="h-9 sm:h-10 flex items-center justify-between border-b border-[#E2E8F0] text-[#44474E] text-[11px] sm:text-xs font-semibold gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#138808] shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">{t('gov_initiative', 'GoI & GoM Digital Initiative')}</span>
                <span className="hidden sm:inline">{t('gov_initiative', 'Government of India & Government of Maharashtra Digital Initiative')}</span>
              </span>
              <span className="hidden md:inline text-[#C4C6CE]">|</span>
              <span className="hidden md:inline text-[#111C2D]">{t('service_gateway', 'Official Citizen Service Gateway')}</span>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Main Header Bar */}
          <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-6 shrink-0 min-w-0">
              <NavLink to="/dashboard" className="flex items-center gap-3 group min-w-0">
                <img
                  src={saarthiLogoSvg}
                  alt="SAARTHI Official Portal Logo"
                  className="h-8 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 duration-200 shrink-0"
                />
              </NavLink>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                      : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                  }`
                }
              >
                <span>{t('dashboard', 'Dashboard')}</span>
              </NavLink>

              {/* Explore Schemes Dropdown */}
              <div className="relative" ref={exploreDropdownRef}>
                <button
                  type="button"
                  onClick={() => setExploreNavDropdownOpen((v) => !v)}
                  className={`px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isExplorerRoute
                      ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                      : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                  }`}
                >
                  <span>{t('explore_schemes', 'Explore Schemes')}</span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                      exploreNavDropdownOpen ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>

                {exploreNavDropdownOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <NavLink
                      to="/explorer?tab=matched"
                      onClick={() => setExploreNavDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                        location.pathname === '/explorer' && (!location.search || location.search.includes('tab=matched'))
                          ? 'bg-[#EBF3FC] text-[#0D2240]'
                          : 'text-[#111C2D] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#138808]">verified</span>
                      <div>
                        <p className="leading-tight font-bold">{t('official_matched_dossier', 'Matched Schemes')}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">Recommended for you</p>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/explorer?tab=all"
                      onClick={() => setExploreNavDropdownOpen(false)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl mx-1.5 transition-colors ${
                        location.pathname === '/explorer' && location.search.includes('tab=all')
                          ? 'bg-[#EBF3FC] text-[#0D2240]'
                          : 'text-[#111C2D] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#0D2240]">grid_view</span>
                      <div>
                        <p className="leading-tight font-bold">{t('all_schemes', 'All Schemes')}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">Complete statutory catalog</p>
                      </div>
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to="/checklist"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                      : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                  }`
                }
              >
                <span>{t('checklist', 'Checklist')}</span>
              </NavLink>

              <NavLink
                to="/bookmarks"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                      : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                  }`
                }
              >
                <span>{t('saved', 'Saved')}</span>
              </NavLink>

              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                      : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                  }`
                }
              >
                <span>{t('notifications', 'Notifications')}</span>
                {unreadNotificationsCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E65100] text-white animate-in zoom-in-50 duration-200">
                    {unreadNotificationsCount}
                  </span>
                )}
              </NavLink>

              {user?.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `px-3.5 py-2 rounded-lg text-[13.5px] font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-[#EBF3FC] text-[#0D2240] shadow-xs'
                        : 'text-[#44474E] hover:bg-[#F0F3FF] hover:text-[#0D2240]'
                    }`
                  }
                >
                  <span>Admin</span>
                </NavLink>
              )}
            </nav>

            {/* Right: Search, Notifications & User Lockup */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              {/* Expandable Search Button */}
              <div className="relative" ref={searchContainerRef}>
                {searchOpen ? (
                  <form onSubmit={handleSearchSubmit} className="fixed sm:relative inset-x-0 top-[calc(theme(spacing.9)+theme(spacing.16))] sm:top-auto sm:inset-auto px-4 sm:px-0 flex items-center animate-in fade-in zoom-in-95 duration-150 z-40">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search schemes or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 md:w-72 lg:w-80 bg-white sm:bg-[#F8FAFC] border border-[#0D2240] rounded-lg pl-9 pr-8 py-2 text-[13px] text-[#0D2240] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0D2240]/20 shadow-md sm:shadow-xs"
                    />
                    <span className="material-symbols-outlined text-[18px] text-[#0D2240] absolute left-2.5 sm:left-2.5 pointer-events-none">
                      search
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false)
                        setSearchQuery('')
                      }}
                      className="absolute right-6 sm:right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(true)
                      setTimeout(() => searchInputRef.current?.focus(), 50)
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#0D2240] hover:bg-[#EBF3FC] border border-[#E2E8F0] transition-colors shadow-2xs cursor-pointer shrink-0"
                    title="Search schemes (⌘K)"
                  >
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">search</span>
                  </button>
                )}
              </div>

              {/* Notification Bell */}
              <NotificationBell unreadCount={unreadNotificationsCount} setUnreadCount={setUnreadNotificationsCount} />

              {/* Citizen Profile Lockup */}
              <div className="flex items-center gap-2.5 pl-1.5 sm:pl-2 border-l border-[#E2E8F0]" ref={menuRef}>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-[#0D2240] leading-tight">
                    {displayName}
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[11px] text-[#138808] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
                    <span>85% Verified • MH</span>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="relative cursor-pointer focus:outline-none group shrink-0"
                  aria-label="User profile menu"
                >
                  <img
                    src={headshotImg}
                    alt="Citizen Profile"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#0D2240]/15 group-hover:ring-[#0D2240]/40 transition-all shadow-xs"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  <div
                    style={{ display: 'none' }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#0D2240] text-white font-bold text-xs items-center justify-center ring-2 ring-[#0D2240]/15 shadow-xs"
                  >
                    {displayName.charAt(0)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#138808] ring-2 ring-white" />
                </button>

                {menuOpen && (
                  <div className="absolute right-4 top-16 sm:top-20 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-[#E2E8F0] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                      <p className="text-xs font-bold text-[#0D2240] leading-tight">{displayName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{user?.email || 'citizen@maharashtra.gov.in'}</p>
                      <div className="mt-2 flex items-center gap-1 text-[10.5px] font-bold text-[#138808] bg-[#EAFBF0] px-2 py-0.5 rounded-md w-fit">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>Aadhaar e-KYC Linked</span>
                      </div>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      <NavLink
                        to="/profile"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F0F3FF] hover:text-[#0D2240] rounded-xl transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                        <span>Citizen Profile &amp; Dossier</span>
                      </NavLink>

                      <NavLink
                        to="/checklist"
                        className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F0F3FF] hover:text-[#0D2240] rounded-xl transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-[18px] text-slate-400">checklist</span>
                        <span>Document Checklist</span>
                      </NavLink>

                      {user?.role === 'ADMIN' && (
                        <NavLink
                          to="/admin"
                          className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-[#F0F3FF] hover:text-[#0D2240] rounded-xl transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px] text-slate-400">admin_panel_settings</span>
                          <span>Admin Console</span>
                        </NavLink>
                      )}
                    </div>

                    <div className="p-1.5 border-t border-[#E2E8F0]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-bold text-[#BA1A1A] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#BA1A1A]">logout</span>
                        <span>Sign Out of Portal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg text-[#0D2240] hover:bg-[#EBF3FC] cursor-pointer shrink-0"
                aria-label="Toggle navigation menu"
              >
                <span className="material-symbols-outlined text-[22px] sm:text-[24px]">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              {t('dashboard', 'Dashboard')}
            </NavLink>
            <NavLink
              to="/explorer"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              {t('explore_schemes', 'Explore Schemes')}
            </NavLink>
            <NavLink
              to="/checklist"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              {t('checklist', 'My Checklist')}
            </NavLink>
            <NavLink
              to="/bookmarks"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              {t('saved', 'Saved Schemes')}
            </NavLink>
            <NavLink
              to="/notifications"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              <span>{t('notifications', 'Notifications')}</span>
              {unreadNotificationsCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E65100] text-white">
                  {unreadNotificationsCount}
                </span>
              )}
            </NavLink>
            <NavLink
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-xs font-bold text-[#0D2240] hover:bg-[#EBF3FC] rounded-lg"
            >
              Profile Settings
            </NavLink>
          </div>
        )}
      </header>

      {/* 2. MAIN PAGE ROUTED CONTENT */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* 3. GROUNDED CIVIC AI ASSISTANT (ChatWidget) */}
      <ChatWidget />
    </div>
  )
}
