import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, Plus, Store, IndianRupeeIcon } from 'lucide-react'
import { ownerApi } from '../../lib/api'

// API Types based on backend payload
interface Venue {
  venue_id: string
  name: string
  address: string
  opening_time: string
  closing_time: string
  courts: any[]
  pricing: any[]
  images?: { image_url: string }[]
}

export function MyVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await ownerApi.getVenues()
        setVenues(res.venues || [])
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Failed to load venues. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up stagger-1">
        <div>
          <h1 className="font-display font-700 text-3xl tracking-tight">My Venues</h1>
          <p className="text-ink-muted mt-1 text-sm">Manage all your registered pickleball locations.</p>
        </div>

        <Link to="/owner/add-venue" className="btn-primary h-10 px-5 gap-2">
          <Plus size={16} />
          <span>Add Venue</span>
        </Link>
      </div>

      {/* Content */}
      <div className="animate-fade-up stagger-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <p className="text-sm text-ink-muted">Loading venues...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        ) : venues.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <Store size={24} className="text-ink-muted" />
            </div>
            <h3 className="font-display font-600 text-lg mb-2">No venues listed yet</h3>
            <p className="text-ink-muted text-sm max-w-sm mb-6">
              You haven't added any pickleball venues to your portfolio. Start by creating your first venue.
            </p>
            <Link to="/owner/add-venue" className="btn-primary h-10 px-6">
              Create Venue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
              <div key={venue.venue_id} className="glass-card overflow-hidden flex flex-col hover:border-primary/20 transition-all group">
                {/* Img placeholder or Cover */}
                <div className="h-40 bg-zinc-900 border-b border-ink-border flex items-center justify-center relative overflow-hidden">
                  {venue.images && venue.images.length > 0 ? (
                    <img
                      src={venue.images[0].image_url}
                      alt={venue.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Store size={32} className="text-zinc-800 absolute" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />

                  {/* Courts badge */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-mono uppercase font-medium backdrop-blur-md"
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                      {venue.courts.length} Court{venue.courts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-display font-600 text-lg mb-1 truncate group-hover:text-accent transition-colors">
                    {venue.name}
                  </h3>

                  <div className="flex items-start gap-1.5 mt-2">
                    <MapPin size={14} className="text-ink-muted mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-ink-muted line-clamp-2">{venue.address}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock size={14} className="text-ink-muted flex-shrink-0" />
                    <p className="text-xs text-ink-muted">{formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2">
                    <IndianRupeeIcon size={14} className="text-ink-muted flex-shrink-0" />
                    <p className="text-xs text-ink-muted">{venue.pricing[0].day_type} - {venue.pricing[0].price_per_hour}</p>
                    <p className="text-xs text-ink-muted">{venue.pricing[1].day_type} - {venue.pricing[1].price_per_hour}</p>
                  </div>

                  <div className="mt-auto pt-6 grid grid-cols-2 gap-2">
                    <Link to={`/owner/venue/${venue.venue_id}/edit`} className="btn-ghost h-9 px-3 text-xs justify-center border border-ink-border bg-primary/5">
                      Edit details
                    </Link>
                    <Link to={`/owner/venue/${venue.venue_id}`} className="btn-primary h-9 px-3 text-xs justify-center">
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
