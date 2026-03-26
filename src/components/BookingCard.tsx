import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { STATUS_CONFIG } from "./constant/ConstantValues"
import { Ban, CalendarDays, ChevronDown, ChevronUp, Clock, MapPin, RefreshCw } from "lucide-react"
import { Booking } from "@/types"
import { fmtDate, fmtTime } from "./FormatDateTime"

export function BookingCard({ booking }: { booking: Booking }) {
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