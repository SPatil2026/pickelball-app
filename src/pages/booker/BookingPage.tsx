import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, CalendarDays, CheckCircle } from 'lucide-react'
import { bookerApi, cartApi } from '../../lib/api'

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

const fmtTime = (isoOrTime: string) => {
    if (!isoOrTime) return ''
    if (isoOrTime.includes('T')) {
        const d = new Date(isoOrTime)
        return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
    }
    return isoOrTime.slice(0, 5)
}

const STATUS_STYLE: Record<string, string> = {
    AVAILABLE: 'border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-ink cursor-pointer',
    BOOKED: 'border-red-500/30 bg-red-500/10 text-red-400/60 cursor-not-allowed',
    BLOCKED: 'border-white/10 bg-white/5 text-ink-muted/50 cursor-not-allowed',
    IN_CART: 'border-sky-400/40 bg-sky-400/10 text-sky-400 cursor-not-allowed',
    SELECTED: 'border-accent bg-accent text-ink shadow-[0_0_14px_rgba(184,255,87,0.3)] cursor-pointer',
}

const STATUS_LABEL: Record<string, string> = {
    AVAILABLE: 'Available',
    BOOKED: 'Booked',
    BLOCKED: 'Blocked',
    IN_CART: 'In cart',
    SELECTED: 'Selected',
}

// key for a selection
const selectionKey = (slotIdx: number, courtId: string) => `${slotIdx}::${courtId}`

export function BookingPage() {
    const { id: venueId } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [date, setDate] = useState(todayStr())
    const [slots, setSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Map of "slotIdx::courtId" → { date, start_time, end_time, court_id, court_number }
    const [selected, setSelected] = useState<Record<string, { date: string; start_time: string; end_time: string; court_id: string; court_number: number }>>({})
    const [addingToCart, setAddingToCart] = useState(false)
    const [cartSuccess, setCartSuccess] = useState(false)

    // ── Fetch slots ──
    const fetchSlots = useCallback(async () => {
        if (!venueId) return
        setLoading(true)
        setError('')
        setSelected({})
        try {
            const data = await bookerApi.getAvailableSlots(venueId, date)
            setSlots(Array.isArray(data) ? data : [])
        } catch {
            setError('Failed to load available slots. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [venueId, date])

    useEffect(() => { fetchSlots() }, [fetchSlots])

    // ── Toggle selection ──
    const toggleSelect = (slotIdx: number, slot: TimeSlot, court: CourtAvailability) => {
        if (court.status !== 'AVAILABLE') return
        const key = selectionKey(slotIdx, court.court_id)
        setSelected((prev) => {
            const next = { ...prev }
            if (next[key]) {
                delete next[key]
            } else {
                next[key] = {
                    date,
                    start_time: slot.start_time,
                    end_time: slot.end_time,
                    court_id: court.court_id,
                    court_number: court.court_number,
                }
            }
            return next
        })
    }

    // ── Add all selected to cart ──
    const handleAddToCart = async () => {
        const items = Object.values(selected)
        if (!items.length) return

        setAddingToCart(true)
        setError('')

        try {
            // cartApi.addToCart expects { court_id, date, start_time, end_time }
            await Promise.all(
                items.map((item) =>
                    cartApi.addToCart({
                        court_id: item.court_id,
                        date: item.date,
                        start_time: item.start_time,
                        end_time: item.end_time,
                    })
                )
            )
            setCartSuccess(true)
            setSelected({})
            // Refresh slots so IN_CART status is reflected
            await fetchSlots()
            setTimeout(() => setCartSuccess(false), 4000)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to add to cart.')
        } finally {
            setAddingToCart(false)
        }
    }

    const selectedCount = Object.keys(selected).length

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-up">
            {/* Back */}
            <button
                onClick={() => navigate(`/booker/venue/${venueId}`)}
                className="flex items-center gap-2 text-ink-muted hover:text-white transition-colors text-sm font-medium group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                Back to Venue
            </button>

            {/* Header + Date picker */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-display font-700 text-3xl tracking-tight">Book a Court</h1>
                    <p className="text-ink-muted mt-1 text-sm">Select the slots you want, then add them to your cart.</p>
                </div>

                <div className="flex items-center gap-3">
                    <CalendarDays size={16} className="text-ink-muted shrink-0" />
                    <input
                        type="date"
                        className="input-field h-10 py-0"
                        value={date}
                        min={todayStr()}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs">
                {[
                    { label: 'Available', cls: 'border-accent/40 bg-accent/10 text-accent' },
                    { label: 'Selected', cls: 'border-accent bg-accent text-ink' },
                    { label: 'In cart', cls: 'border-sky-400/40 bg-sky-400/10 text-sky-400' },
                    { label: 'Booked', cls: 'border-red-500/30 bg-red-500/10 text-red-400/70' },
                    { label: 'Blocked', cls: 'border-white/10 bg-white/5 text-ink-muted/50' },
                ].map(({ label, cls }) => (
                    <span key={label} className={`px-3 py-1 rounded-full border font-mono uppercase ${cls}`}>{label}</span>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Cart success */}
            {cartSuccess && (
                <div
                    className="px-4 py-3 rounded-lg flex items-center gap-2 text-sm"
                    style={{ background: 'rgba(184,255,87,0.1)', color: 'var(--accent)', border: '1px solid rgba(184,255,87,0.2)' }}
                >
                    <CheckCircle size={16} />
                    Added to cart! <button className="underline ml-1" onClick={() => navigate('/booker/cart')}>View cart</button>
                </div>
            )}

            {/* Slot grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4">
                    <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <p className="text-sm text-ink-muted">Loading available slots...</p>
                </div>
            ) : slots.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-ink-muted">No slots available for this date.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Column headers — one per court */}
                        <thead>
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-mono text-ink-muted uppercase tracking-widest whitespace-nowrap">
                                    Time
                                </th>
                                {slots[0].courts.map((court) => (
                                    <th
                                        key={court.court_id}
                                        className="px-4 py-3 text-center text-xs font-mono text-ink-muted uppercase tracking-widest"
                                    >
                                        Court {court.court_number}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-ink-border">
                            {slots.map((slot, slotIdx) => (
                                <tr key={slot.start_time} className="hover:bg-white/5 transition-colors">
                                    {/* Time label */}
                                    <td className="px-4 py-2.5 text-xs text-ink-muted font-mono whitespace-nowrap">
                                        {fmtTime(slot.start_time)} – {fmtTime(slot.end_time)}
                                    </td>

                                    {/* Court cells */}
                                    {slot.courts.map((court) => {
                                        const key = selectionKey(slotIdx, court.court_id)
                                        const isSelected = !!selected[key]
                                        const effectiveStatus = isSelected ? 'SELECTED' : court.status

                                        return (
                                            <td key={court.court_id} className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => toggleSelect(slotIdx, slot, court)}
                                                    disabled={court.status !== 'AVAILABLE' && !isSelected}
                                                    title={STATUS_LABEL[effectiveStatus]}
                                                    className={`w-full mx-auto max-w-[80px] h-8 rounded-lg border text-[10px] font-mono uppercase transition-all duration-150 ${STATUS_STYLE[effectiveStatus]}`}
                                                >
                                                    {STATUS_LABEL[effectiveStatus]}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Sticky footer CTA */}
            {selectedCount > 0 && (
                <div className="sticky bottom-6 flex justify-end">
                    <button
                        onClick={handleAddToCart}
                        disabled={addingToCart}
                        className="btn-primary h-12 px-8 gap-3 text-base shadow-2xl"
                    >
                        {addingToCart ? (
                            <span className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                        ) : (
                            <ShoppingCart size={18} />
                        )}
                        Add {selectedCount} slot{selectedCount !== 1 ? 's' : ''} to Cart
                    </button>
                </div>
            )}
        </div>
    )
}