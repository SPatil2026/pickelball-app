import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, RefreshCw, AlertCircle, Clock } from 'lucide-react'
import { bookerApi, bookingsApi } from '../../lib/api'
import { fmtTime, fmtDate } from '../../components/FormatDateTime'
import { Booking } from '../../types'

interface CourtAvailability {
    court_id: string
    court_number: number
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'IN_CART'
}
interface TimeSlot {
    start_time: string
    end_time: string
    courts: CourtAvailability[]
}

const todayStr = () => new Date().toISOString().slice(0, 10)

const STATUS_STYLE: Record<string, string> = {
    AVAILABLE: 'border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-ink cursor-pointer',
    BOOKED: 'border-red-500/30 bg-red-500/10 text-red-500/60 cursor-not-allowed',
    BLOCKED: 'border-primary/10 bg-primary/5 text-ink-muted/50 cursor-not-allowed',
    IN_CART: 'border-sky-400/40 bg-sky-400/10 text-sky-400 cursor-not-allowed',
    SELECTED: 'border-accent bg-accent text-ink shadow-[0_0_14px_rgba(200,90,56,0.2)] cursor-pointer',
}

export function ReschedulePage() {
    const { id: bookingId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [loadingBooking, setLoadingBooking] = useState(true)

    const [date, setDate] = useState(todayStr())
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)
    
    const [selectedSlot, setSelectedSlot] = useState<{ date: string; start_time: string; end_time: string } | null>(null)

    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // ── Fetch booking ──
    useEffect(() => {
        bookingsApi.getMyBookings()
            .then((data) => {
                const found = data.find((b: Booking) => b.booking_id === bookingId)
                if (found) {
                    setBooking(found)
                    setDate(found.date.split('T')[0])
                } else {
                    setError('Booking not found.')
                }
            })
            .catch(() => setError('Failed to load booking details.'))
            .finally(() => setLoadingBooking(false))
    }, [bookingId])

    // ── Fetch slots ──
    const fetchSlots = useCallback(async () => {
        if (!booking) return
        setLoadingSlots(true)
        setSelectedSlot(null) // clear selection when date changes
        try {
            const data = await bookerApi.getAvailableSlots(booking.court.venue_id, date)
            setSlots(Array.isArray(data) ? data : [])
        } catch {
            setError('Failed to load available slots.')
        } finally {
            setLoadingSlots(false)
        }
    }, [booking, date])

    useEffect(() => { fetchSlots() }, [fetchSlots])

    // ── Submit ──
    const handleReschedule = async () => {
        if (!bookingId || !selectedSlot) return
        setSubmitting(true)
        setError('')
        try {
            await bookingsApi.rescheduleBooking(bookingId, {
                date: selectedSlot.date,
                start_time: selectedSlot.start_time,
                end_time: selectedSlot.end_time,
            })
            navigate('/booker/history')
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to reschedule booking.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loadingBooking) {
        return (
            <div className="p-8 max-w-4xl mx-auto flex justify-center items-center">
                <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="p-4 sm:p-8 max-w-3xl mx-auto flex flex-col items-center glass-card mt-12 gap-4">
               <AlertCircle size={24} className="text-red-500 mt-4" /> 
               <p className="mb-4">{error || 'Booking not found.'}</p>
               <button onClick={() => navigate('/booker/history')} className="btn-ghost mb-8">Back to History</button>
            </div>
        )
    }

    const courtNumber = booking.court.court_number

    return (
        <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-fade-up">
            {/* Back */}
            <button
                onClick={() => navigate('/booker/history')}
                className="flex items-center gap-2 text-ink-muted hover:text-primary transition-colors text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to History
            </button>

            {/* Header */}
            <div>
                <h1 className="font-display font-700 text-3xl tracking-tight">Reschedule Booking</h1>
                <p className="text-ink-muted mt-1 text-sm">Select a new time slot for your court reservation.</p>
            </div>

            {/* Current Booking Info */}
            <div className="glass-card p-5 border-l-4 border-l-accent flex flex-col gap-2">
                <span className="text-xs font-mono uppercase text-ink-muted tracking-widest">Current Slot</span>
                <p className="font-display font-600 text-lg">{booking.court.venue.name} — Court {courtNumber}</p>
                <div className="flex flex-wrap gap-4 text-sm text-ink-muted">
                    <span className="flex items-center gap-1.5"><CalendarDays size={14}/>{fmtDate(booking.date)}</span>
                    <span className="flex items-center gap-1.5"><Clock size={14}/>{fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}</span>
                </div>
            </div>

            {/* Date picker */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="font-display font-600 text-lg">Pick a New Slot</h3>
                <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-ink-muted shrink-0" />
                    <input
                        type="date"
                        className="input-field h-10 py-0 w-auto"
                        value={date}
                        min={todayStr()}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle size={15}/> {error}
                </div>
            )}

            {/* Slot grid */}
            {loadingSlots ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4">
                    <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                </div>
            ) : slots.length === 0 ? (
                <div className="glass-card p-12 text-center text-ink-muted">
                    No slots available for this date.
                </div>
            ) : (
                <div className="glass-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-ink-border">
                                <th className="px-5 py-3 text-left text-xs font-mono text-ink-muted uppercase tracking-widest">Time</th>
                                <th className="px-5 py-3 text-center text-xs font-mono text-ink-muted uppercase tracking-widest">Court {courtNumber}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink-border">
                            {slots.map((slot) => {
                                const court = slot.courts.find(c => c.court_number === courtNumber)
                                if (!court) return null

                                const isSelected = selectedSlot?.start_time === slot.start_time
                                const effectiveStatus = isSelected ? 'SELECTED' : court.status

                                return (
                                    <tr key={slot.start_time} className="hover:bg-primary/5 transition-colors">
                                        <td className="px-5 py-3 text-sm text-ink-muted font-mono whitespace-nowrap">
                                            {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    if (court.status === 'AVAILABLE') {
                                                        setSelectedSlot(isSelected ? null : {
                                                            date,
                                                            start_time: slot.start_time,
                                                            end_time: slot.end_time
                                                        })
                                                    }
                                                }}
                                                disabled={court.status !== 'AVAILABLE' && !isSelected}
                                                className={`w-full mx-auto max-w-[120px] h-9 rounded-lg border text-xs font-mono uppercase transition-all duration-150 ${STATUS_STYLE[effectiveStatus]}`}
                                            >
                                                {effectiveStatus === 'SELECTED' ? 'Selected' : effectiveStatus === 'AVAILABLE' ? 'Available' : 'Unavailable'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sticky footer CTA */}
            {selectedSlot && (
                <div className="sticky bottom-6 flex flex-col gap-2 items-end">
                    <button
                        onClick={handleReschedule}
                        disabled={submitting}
                        className="btn-primary h-12 px-8 gap-3 text-base shadow-2xl"
                    >
                        {submitting ? (
                            <span className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                        ) : (
                            <RefreshCw size={18} />
                        )}
                        Confirm Reschedule
                    </button>
                </div>
            )}
        </div>
    )
}
