import { CalendarDays, TrendingUp, Clock, Zap, ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const COURTS = [
  { id: 1, name: 'Court Alpha', color: '#4ade80', status: 'available', nextSlot: '10:00 AM' },
  { id: 2, name: 'Court Beta', color: '#60a5fa', status: 'occupied', nextSlot: '11:30 AM' },
  { id: 3, name: 'Court Gamma', color: '#f472b6', status: 'available', nextSlot: '09:30 AM' },
]

const RECENT_BOOKINGS = [
  { id: 'BK-001', court: 'Court Alpha', date: 'Mon, 24 Mar', time: '08:00–09:30', status: 'confirmed', amount: '₹450' },
  { id: 'BK-002', court: 'Court Beta',  date: 'Sat, 22 Mar', time: '10:00–11:30', status: 'completed', amount: '₹600' },
  { id: 'BK-003', court: 'Court Gamma', date: 'Fri, 21 Mar', time: '17:00–18:00', status: 'completed', amount: '₹300' },
]

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-court-500/15 text-court-400',
  completed:  'bg-white/5 text-ink-muted',
  cancelled:  'bg-red-500/15 text-red-400',
}

export function DashboardPage() {
  const { user } = useAuth()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="animate-fade-up stagger-1">
        <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-1">{greeting}</p>
        <h1 className="font-display font-700 text-4xl tracking-tight">
          {user?.name?.split(' ')[0] ?? 'Player'} <span className="text-ink-muted">👋</span>
        </h1>
        <p className="text-ink-muted mt-1 text-sm">Here's what's happening at your courts today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up stagger-2">
        {[
          { label: 'Total Bookings',    value: '14',    icon: CalendarDays, delta: '+3 this week' },
          { label: 'Hours Played',      value: '21h',   icon: Clock,        delta: '+4.5h this week' },
          { label: 'Amount Spent',      value: '₹6.3k', icon: TrendingUp,   delta: 'This month' },
          { label: 'Active Venues',     value: '3',     icon: MapPin,       delta: 'Near you' },
        ].map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="glass-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-ink-border/60 flex items-center justify-center">
                <Icon size={16} className="text-ink-muted" />
              </div>
            </div>
            <p className="font-display font-700 text-2xl tracking-tight">{value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{label}</p>
            <p className="text-xs mt-2 font-mono" style={{ color: 'var(--accent)' }}>{delta}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Court status */}
        <div className="lg:col-span-3 glass-card p-6 animate-fade-up stagger-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-base">Court Status — Today</h2>
            <Link to="/courts" className="flex items-center gap-1 text-xs font-mono hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              Book now <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {COURTS.map((court) => (
              <div key={court.id} className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-ink-border bg-ink/50 hover:border-white/20 transition-colors">
                {/* Color dot */}
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: court.color, boxShadow: `0 0 8px ${court.color}66` }} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{court.name}</p>
                  <p className="text-xs text-ink-muted mt-0.5">Next available: {court.nextSlot}</p>
                </div>

                <span className={`tag text-xs ${court.status === 'available' ? 'text-court-400 bg-court-500/10' : 'text-red-400 bg-red-500/10'}`}>
                  {court.status === 'available' ? '● Available' : '● Occupied'}
                </span>
              </div>
            ))}
          </div>

          {/* Quick time slots */}
          <div className="mt-5 pt-5 border-t border-ink-border">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-3">Quick book</p>
            <div className="flex flex-wrap gap-2">
              {['09:00', '10:30', '12:00', '14:00', '16:00', '18:00'].map((t) => (
                <Link
                  key={t}
                  to="/courts"
                  className="px-3 py-1.5 rounded-lg text-xs font-mono border border-ink-border text-ink-muted hover:border-white/30 hover:text-white transition-all"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="lg:col-span-2 glass-card p-6 animate-fade-up stagger-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-base">Recent Bookings</h2>
            <Link to="/history" className="text-xs font-mono hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {RECENT_BOOKINGS.map((b) => (
              <div key={b.id} className="p-3.5 rounded-xl border border-ink-border bg-ink/50">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-sm font-medium">{b.court}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{b.date} · {b.time}</p>
                  </div>
                  <span className="font-mono text-xs font-500 text-white">{b.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`tag text-xs ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>
                  <span className="text-xs font-mono text-ink-muted">{b.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA banner */}
      <div
        className="rounded-2xl p-6 flex items-center justify-between animate-fade-up stagger-5"
        style={{ background: 'linear-gradient(135deg, rgba(184,255,87,0.12) 0%, rgba(34,197,94,0.08) 100%)', border: '1px solid rgba(184,255,87,0.2)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={18} className="text-ink" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-600 text-sm">Ready to play?</p>
            <p className="text-xs text-ink-muted mt-0.5">Courts are open — book your slot in seconds.</p>
          </div>
        </div>
        <Link to="/courts" className="btn-primary text-sm">
          Book now <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
