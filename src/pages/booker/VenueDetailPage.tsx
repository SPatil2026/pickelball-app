import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Mail, Clock, ArrowLeft, Store, Tag } from 'lucide-react'
import { bookerApi } from '../../lib/api'
import { fmtTime } from '../../components/FormatDateTime'

interface Pricing {
  day_type: string
  price_per_hour: number
}

interface VenueDetail {
  name: string
  address: string
  contact_number: string
  email: string
  opening_time: string
  closing_time: string
  images: { image_url: string; is_thumbnail: boolean }[]
  pricing: Pricing[]
  _count: { courts: number }
}

const DAY_TYPE_LABEL: Record<string, string> = {
  WEEKDAY: 'Weekday',
  WEEKEND: 'Weekend',
}

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [venue, setVenue] = useState<VenueDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    if (!id) return
    bookerApi.getVenueById(id)
      .then((data) => {
        setVenue(data)
        // Set active image to thumbnail if present
        const thumbIdx = data.images?.findIndex((i: any) => i.is_thumbnail)
        if (thumbIdx > 0) setActiveImage(thumbIdx)
      })
      .catch(() => setError('Failed to load venue details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-display font-700 text-2xl mb-2">Venue Not Found</h2>
        <p className="text-ink-muted text-sm mb-6">{error || 'This venue does not exist.'}</p>
        <button onClick={() => navigate('/booker/home')} className="btn-primary h-10 px-6">Back to Marketplace</button>
      </div>
    )
  }

  const thumbnail = venue.images?.find((i) => i.is_thumbnail)
  const sortedImages = [
    ...(thumbnail ? [thumbnail] : []),
    ...venue.images.filter((i) => !i.is_thumbnail),
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* Back button */}
      <button
        onClick={() => navigate('/booker/home')}
        className="flex items-center gap-2 text-ink-muted hover:text-white transition-colors text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Marketplace
      </button>

      {/* Gallery */}
      <div className="space-y-2">
        <div className="h-72 md:h-96 rounded-2xl bg-zinc-900 border border-ink-border overflow-hidden relative">
          {sortedImages.length > 0 ? (
            <img
              src={sortedImages[activeImage]?.image_url}
              alt={venue.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store size={48} className="text-zinc-800" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent pointer-events-none" />
        </div>

        {/* Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sortedImages.map((img, i) => (
              <button
                key={img.image_url}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImage ? 'border-accent' : 'border-ink-border opacity-60 hover:opacity-100'
                  }`}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Venue Info */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="font-display font-700 text-3xl tracking-tight">{venue.name}</h1>

            <div className="mt-3 flex flex-col gap-2">
              <span className="flex items-start gap-2 text-sm text-ink-muted">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                {venue.address}
              </span>
              <span className="flex items-center gap-2 text-sm text-ink-muted">
                <Clock size={15} className="shrink-0" />
                Open {fmtTime(venue.opening_time)} – {fmtTime(venue.closing_time)}
              </span>
              {venue.contact_number && (
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  <Phone size={15} className="shrink-0" />
                  {venue.contact_number}
                </span>
              )}
              {venue.email && (
                <span className="flex items-center gap-2 text-sm text-ink-muted">
                  <Mail size={15} className="shrink-0" />
                  {venue.email}
                </span>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-3">Courts Available</p>
            <p className="font-display font-600 text-4xl">
              {venue._count.courts}
              <span className="text-base font-body font-400 text-ink-muted ml-2">courts</span>
            </p>
          </div>
        </div>

        {/* Right: Pricing + CTA */}
        <div className="space-y-4">
          {venue.pricing.length > 0 && (
            <div className="glass-card p-5 space-y-3">
              <p className="text-xs font-mono text-ink-muted uppercase tracking-widest flex items-center gap-2">
                <Tag size={12} /> Pricing
              </p>
              {venue.pricing.map((p) => (
                <div key={p.day_type} className="flex items-center justify-between">
                  <span className="text-sm text-ink-muted">{DAY_TYPE_LABEL[p.day_type] ?? p.day_type}</span>
                  <span className="font-display font-600 text-lg">
                    ₹{p.price_per_hour}
                    <span className="text-xs font-body text-ink-muted font-normal">/hr</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn-primary w-full h-12 text-base gap-2"
            onClick={() => navigate(`/booker/venue/${id}/book`)}
          >
            Book a Court
          </button>

          <p className="text-xs text-ink-muted text-center">
            Choose your preferred court, date and time on the next step.
          </p>
        </div>
      </div>
    </div>
  )
}
