import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Store,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../contexts/AuthContext'

const BOOKER_NAV = [
  { to: '/booker/home', icon: Store, label: 'Marketplace' },
  { to: '/booker/courts', icon: CalendarDays, label: 'Book Courts' },
  { to: '/booker/history', icon: History, label: 'My Bookings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const OWNER_NAV = [
  { to: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isOwner = user?.role === 'OWNER'
  const navItems = isOwner ? OWNER_NAV : BOOKER_NAV

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-60 flex flex-col border-r border-ink-border bg-ink z-30">
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
                  : 'text-ink-muted hover:text-white hover:bg-ink-subtle'
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
        {/* Role badge */}
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">
            {user?.role ?? 'booker'}
          </p>
          <p className="text-sm font-medium text-white truncate mt-0.5">{user?.name}</p>
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
  )
}
