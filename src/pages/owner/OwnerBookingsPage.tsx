import { useState, useEffect } from 'react'
import { ownerApi } from '../../lib/api'
import { CalendarDays, Clock, User, CheckCircle, Navigation } from 'lucide-react'
import { fmtTime } from '../../components/FormatDateTime'

interface Booking {
  booking_id: string
  date: string
  start_time: string
  end_time: string
  total_amount: number
  status: string
  court: {
    court_number: number
    venue: {
      name: string
    }
  }
  user: {
    name: string
    phone: string
  }
}

export function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [dateFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await ownerApi.getBookings(dateFilter || undefined)
      setBookings(res.bookings || [])
    } catch (err) {
      setError('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-700 text-3xl tracking-tight">My Bookings</h1>
          <p className="text-ink-muted mt-1 text-sm">View and track all reservations across your venues.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
              <CalendarDays size={14} />
            </span>
            <input
              type="date"
              className="input-field pl-9 h-10 py-0"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-ink-muted hover:text-white transition-colors underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-ink-muted">Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <CalendarDays size={24} className="text-ink-muted" />
          </div>
          <h3 className="font-display font-600 text-lg mb-2">No bookings found</h3>
          <p className="text-ink-muted text-sm max-w-sm mb-6">
            {dateFilter
              ? `There are no bookings across your venues for ${dateFilter}.`
              : 'There are currently no bookings for any of your venues.'}
          </p>
        </div>
      ) : (
        <div className="bg-ink-subtle border border-ink-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 font-mono text-xs uppercase tracking-widest text-ink-muted border-b border-ink-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer Details</th>
                  <th className="px-6 py-4 font-medium">Court & Venue</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border">
                {bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-white/5 transition-colors">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0">
                          <User size={14} />
                        </div>
                        <div>
                          <p className="font-medium text-white">{booking.user?.name || 'Unknown'}</p>
                          <p className="text-xs text-ink-muted tracking-wide mt-0.5">{booking.user?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Venue */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{booking.court?.venue?.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                        <Navigation size={12} className="inline" /> Court {booking.court?.court_number}
                      </p>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4">
                      <p className="font-medium text-white whitespace-nowrap">
                        {new Date(booking.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                        <Clock size={12} /> {fmtTime(booking.start_time)} - {fmtTime(booking.end_time)}
                      </p>
                    </td>

                    {/* Payment Status */}
                    <td className="px-6 py-4">
                      <p className="font-display font-600">₹{booking.total_amount}</p>
                      <span
                        className="inline-flex items-center gap-1 mt-1 text-[10px] font-mono uppercase px-2 py-0.5 rounded-full"
                        style={
                          booking.status === 'CONFIRMED'
                            ? { background: 'rgba(184,255,87,0.1)', color: 'var(--accent)', border: '1px solid rgba(184,255,87,0.2)' }
                            : { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }
                        }
                      >
                        {booking.status === 'CONFIRMED' && <CheckCircle size={10} />}
                        {booking.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
