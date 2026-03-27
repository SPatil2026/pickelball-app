import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Store,
  ShoppingCart,
  LogOut,
  Zap,
  Settings,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { Role } from '../../types'

const BOOKER_NAV = [
  { to: '/booker/home', icon: Store, label: 'Marketplace' },
  { to: '/booker/cart', icon: ShoppingCart, label: 'My Cart' },
  { to: '/booker/history', icon: History, label: 'My Bookings' },
]

const OWNER_NAV = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/owner/venues', icon: Store, label: 'My Venues' },
  { to: '/owner/bookings', icon: CalendarDays, label: 'My Bookings' },
  { to: '/owner/manage-courts', icon: Settings, label: 'Manage Courts' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isOwner = user?.role === Role.OWNER
  const navItems = isOwner ? OWNER_NAV : BOOKER_NAV

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      {/* ── Desktop sidebar (lg+) ── */}
      <aside className="hidden lg:fixed lg:flex lg:left-0 lg:top-0 lg:h-full lg:w-60 flex-col border-r border-ink-border bg-ink z-30">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-ink-border">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={16} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-base tracking-tight">PicklePark</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-150',
                  isActive
                    ? 'text-ink font-semibold'
                    : 'text-ink-muted hover:text-primary hover:bg-ink-subtle'
                )}
                style={isActive ? { background: 'var(--accent)', color: 'var(--ink)' } : {}}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-ink-border space-y-1">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">
              {user?.role ?? 'booker'}
            </p>
            <p className="text-sm font-medium text-primary truncate mt-0.5">{user?.name}</p>
            <p className="text-xs text-ink-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-ink border-b border-ink-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={14} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-sm tracking-tight">PicklePark</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-red-400 transition-colors p-2"
        >
          <LogOut size={15} />
        </button>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center border-t border-ink-border bg-ink">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-all duration-150',
                isActive ? 'text-primary' : 'text-ink-muted'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-7 rounded-lg flex items-center justify-center transition-all',
                  isActive ? 'text-ink' : ''
                )}
                style={isActive ? { background: 'var(--accent)' } : {}}
              >
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              {label}
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
