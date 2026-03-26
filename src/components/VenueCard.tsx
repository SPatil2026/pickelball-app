// VenueCard.tsx
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Clock, Store } from 'lucide-react'
import { fmtTime } from '../components/FormatDateTime'
import { Venue } from '@/types'

interface VenueCardProps {
    venue: Venue
}

export const VenueCard = ({ venue }: VenueCardProps) => {
    const navigate = useNavigate()

    return (
        <div
            className="glass-card overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300 group cursor-pointer"
            onClick={() => navigate(`/booker/venue/${venue.venue_id}`)}
        >
            {/* Cover image */}
            <div className="h-44 bg-zinc-900 border-b border-ink-border relative overflow-hidden flex items-center justify-center">
                {venue.images && venue.images.length > 0 ? (
                    <img
                        src={venue.images[0].image_url}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <Store size={36} className="text-zinc-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />

                {/* Courts badge */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <span
                        className="text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-medium backdrop-blur-md"
                        style={{
                            background: 'rgba(255,255,255,0.12)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.12)',
                        }}
                    >
                        {venue.courts.length} Court{venue.courts.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Venue name overlay */}
                <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-display font-700 text-white text-lg leading-tight drop-shadow-lg truncate group-hover:text-accent transition-colors">
                        {venue.name}
                    </h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 flex flex-col gap-3">
                <div className="flex items-start gap-2 text-xs text-ink-muted">
                    <MapPin size={13} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{venue.address}</span>
                </div>

                <div className="flex items-center gap-4 text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                        <Clock size={13} />
                        {fmtTime(venue.opening_time)} – {fmtTime(venue.closing_time)}
                    </span>
                    {venue.contact_number && (
                        <span className="flex items-center gap-1.5">
                            <Phone size={13} />
                            {venue.contact_number}
                        </span>
                    )}
                </div>

                {/* Court chips */}
                {venue.courts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {venue.courts.slice(0, 6).map((court) => (
                            <span
                                key={court.court_id}
                                className="text-[10px] px-2 py-0.5 rounded font-mono"
                                style={{
                                    background: 'rgba(255,255,255,0.07)',
                                    color: 'var(--ink-muted)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                }}
                            >
                                Court {court.court_number}
                            </span>
                        ))}
                        {venue.courts.length > 6 && (
                            <span className="text-[10px] px-2 py-0.5 rounded font-mono text-ink-muted">
                                +{venue.courts.length - 6} more
                            </span>
                        )}
                    </div>
                )}

                <button
                    className="btn-primary w-full h-10 mt-auto text-sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/booker/venue/${venue.venue_id}`)
                    }}
                >
                    View &amp; Book
                </button>
            </div>
        </div>
    )
}