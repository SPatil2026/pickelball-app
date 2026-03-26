import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import { bookingsApi } from '../../lib/api'
import { Booking } from '@/types'
import { BookingCard } from '../../components/BookingCard'

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
              : 'text-ink-muted hover:text-primary'
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
