import { useState, useEffect } from "react"
import { bookingsApi } from "../../lib/api"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Ban, AlertCircle, CalendarDays, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react"
import { Booking } from "../../types"
import { fmtDate, fmtTime } from "../../components/FormatDateTime"

export function CancelPage() {
    const { id: bookingId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [loadingBooking, setLoadingBooking] = useState(true)
    const [canceling, setCanceling] = useState(false)
    const [error, setError] = useState('')
    const [cancelled, setCancelled] = useState(false)

    useEffect(() => {
        bookingsApi.getMyBookings()
            .then((data) => {
                const found = data.find((b: Booking) => b.booking_id === bookingId)
                setBooking(found ?? null)
            })
            .catch(() => setError('Failed to load booking details.'))
            .finally(() => setLoadingBooking(false))
    }, [bookingId])

    const handleCancel = async () => {
        setCanceling(true)
        setError('')
        try {
            await bookingsApi.cancelBooking(bookingId!)
            setCancelled(true)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to cancel booking. Please try again.')
        } finally {
            setCanceling(false)
        }
    }

    // ── Success screen ──
    if (cancelled) {
        return (
            <div className="p-4 sm:p-8 max-w-lg mx-auto flex flex-col items-center text-center min-h-[70vh] justify-center gap-6 animate-fade-up">
                <div className="w-20 h-20 rounded-full flex items-center justify-center bg-support/10 border border-support/20">
                    <CheckCircle2 size={40} className="text-support" />
                </div>
                <div>
                    <h1 className="font-display font-700 text-3xl tracking-tight">Booking Cancelled</h1>
                    <p className="text-ink-muted mt-2 text-sm max-w-xs mx-auto">
                        Your booking has been successfully cancelled. Any eligible refund will be processed automatically.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button onClick={() => navigate('/booker/history')} className="btn-primary h-11 px-6 gap-2">
                        My Bookings <ArrowRight size={16} />
                    </button>
                    <button onClick={() => navigate('/booker/home')} className="btn-ghost h-11 px-6">
                        Back to Marketplace
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-xl mx-auto space-y-6 sm:space-y-8 animate-fade-up">
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
                <h1 className="font-display font-700 text-3xl tracking-tight">Cancel Booking</h1>
                <p className="text-ink-muted mt-1 text-sm">Please review the details before confirming cancellation.</p>
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle size={15} /> {error}
                </div>
            )}

            {/* Booking Info */}
            {loadingBooking ? (
                <div className="flex justify-center py-12">
                    <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                </div>
            ) : !booking ? (
                <div className="glass-card p-8 text-center">
                    <AlertCircle size={24} className="text-red-500 mx-auto mb-3" />
                    <p className="text-ink-muted text-sm">Booking details could not be loaded.</p>
                </div>
            ) : (
                <>
                    {/* Current Booking Detail Card */}
                    <div className="glass-card p-5 border-l-4 border-l-red-400 space-y-3">
                        <span className="text-xs font-mono uppercase text-ink-muted tracking-widest">Booking to Cancel</span>
                        <p className="font-display font-600 text-lg">{booking.court.venue.name} — Court {booking.court.court_number}</p>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                            <span className="flex items-center gap-1.5"><CalendarDays size={14} />{fmtDate(booking.date)}</span>
                            <span className="flex items-center gap-1.5"><Clock size={14} />{fmtTime(booking.start_time)} – {fmtTime(booking.end_time)}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} />{booking.court.venue.address}</span>
                        </div>
                        {booking.total_amount > 0 && (
                            <p className="font-display font-600 text-accent text-lg">₹{booking.total_amount}</p>
                        )}
                    </div>

                    {/* Warning box */}
                    <div className="px-4 py-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex gap-3">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">This action cannot be undone.</p>
                            <p className="text-red-600 leading-relaxed">
                                Cancelling means your slot will be released and made available to other users. Any refund eligibility is subject to the venue's cancellation policy.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                        <button
                            onClick={() => navigate('/booker/history')}
                            className="btn-ghost h-11 px-6"
                        >
                            Keep Booking
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={canceling}
                            className="flex items-center justify-center gap-2 h-11 px-6 rounded-lg font-display font-medium text-sm transition-all bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {canceling ? (
                                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            ) : (
                                <Ban size={16} />
                            )}
                            {canceling ? 'Cancelling...' : 'Yes, Cancel Booking'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}