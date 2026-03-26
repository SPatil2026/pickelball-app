import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, CalendarDays, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, Ban } from 'lucide-react'
import { bookingsApi } from '../../lib/api'
import { fmtDate, fmtTime } from '../../components/FormatDateTime'

interface Reschedule {
  rescheduled_at: string
  new_date: string
  new_start_time: string
  new_end_time: string
}

interface Booking {
  booking_id: string
  date: string
  start_time: string
  end_time: string
  total_amount: number
  status: 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED'
  is_reschedule_eligible: boolean
  is_cancel_eligible: boolean
  reschedule_ineligible_reason: string | null
  cancel_ineligible_reason: string | null
  court: {
    court_number: number
    venue: {
      name: string
      address: string
      contact_number: string
    }
  }
  reschedules: Reschedule[]
}

const STATUS_CONFIG = {
  CONFIRMED: {
    label: 'Confirmed',
    cls: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: 'Cancelled',
    cls: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/30',
    icon: XCircle,
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    cls: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/30',
    icon: RefreshCw,
  },
}

function BookingCard({ booking }: { booking: Booking }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.CONFIRMED
  const StatusIcon = cfg.icon

  return (
    <div className="glass-card overflow-hidden hover:border-white/15 transition-all">
      {/* Main row */}
      <div className="p-5 flex items-start gap-4">
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
          <StatusIcon size={16} className={cfg.cls} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-display font-600 text-base truncate">{booking.court.venue.name}</p>
              <p className="text-xs text-ink-muted mt-0.5">Court {booking.court.court_number}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {booking.total_amount > 0 && (
                <span className="font-display font-600 text-sm text-accent">₹{booking.total_amount}</span>
              )}
              <span className={`text-[11px] font-mono uppercase px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.cls}`}>
                {cfg.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={12} />
              {fmtDate(booking.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span className="line-clamp-1">{booking.court.venue.address}</span>
            </span>
          </div>
        </div>

        {/* Expand toggle (if has reschedule history) */}
        {booking.reschedules.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-ink-muted hover:text-white transition-colors shrink-0 mt-1"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* Reschedule history */}
      {expanded && booking.reschedules.length > 0 && (
        <div className="px-5 pb-4 border-t border-ink-border pt-3">
          <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-2">Rescheduled from</p>
          {booking.reschedules.map((r, i) => (
            <p key={i} className="text-xs text-ink-muted">
              {fmtDate(r.new_date)} · {fmtTime(r.new_start_time)} – {fmtTime(r.new_end_time)}
              <span className="ml-2 text-ink-muted/50">({new Date(r.rescheduled_at).toLocaleDateString()})</span>
            </p>
          ))}
        </div>
      )}

      {/* Actions */}
      {booking.status === 'CONFIRMED' && (
        <div className="px-5 pb-4 pt-0 flex flex-wrap items-center gap-2">
          {booking.is_reschedule_eligible ? (
            <button
              onClick={() => navigate(`/booker/booking/${booking.booking_id}/reschedule`)}
              className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-white border border-ink-border hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              <RefreshCw size={12} />
              Reschedule
            </button>
          ) : (
            <p className="text-[11px] text-ink-muted/60 italic">{booking.reschedule_ineligible_reason}</p>
          )}
          {booking.is_cancel_eligible ? (
            <button
              onClick={() => navigate(`/booker/booking/${booking.booking_id}/cancel`)}
              className="flex items-center gap-1.5 text-xs text-red-400/70 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
            >
              <Ban size={12} />
              Cancel
            </button>
          ) : (
            booking.cancel_ineligible_reason && !booking.is_cancel_eligible && booking.is_reschedule_eligible && (
              <p className="text-[11px] text-ink-muted/60 italic">{booking.cancel_ineligible_reason}</p>
            )
          )}
        </div>
      )}
    </div>
  )
}

export function HistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED' | 'RESCHEDULED'>('ALL')
  const navigate = useNavigate()

  useEffect(() => {
    bookingsApi.getMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load your bookings.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter)

  const tabs: Array<{ key: typeof filter; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'RESCHEDULED', label: 'Rescheduled' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="stagger-1">
        <h1 className="font-display font-700 text-3xl tracking-tight">My Bookings</h1>
        <p className="text-ink-muted mt-1 text-sm">View all your past and upcoming court reservations.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-ink-subtle border border-ink-border w-fit">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === key
              ? 'text-ink font-semibold'
              : 'text-ink-muted hover:text-white'
              }`}
            style={filter === key ? { background: 'var(--accent)', color: 'var(--ink)' } : {}}
          >
            {label}
            {key !== 'ALL' && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {bookings.filter((b) => b.status === key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center p-16">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <CalendarDays size={28} className="text-ink-muted mb-3" />
          <h3 className="font-display font-600 text-lg mb-2">No bookings yet</h3>
          <p className="text-ink-muted text-sm mb-6 max-w-sm">
            {filter !== 'ALL'
              ? `You have no ${filter.toLowerCase()} bookings.`
              : "You haven't made any bookings yet. Browse the marketplace to get started."}
          </p>
          {filter === 'ALL' && (
            <button onClick={() => navigate('/booker/home')} className="btn-primary h-10 px-6">
              Explore Venues
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.booking_id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  )
}
