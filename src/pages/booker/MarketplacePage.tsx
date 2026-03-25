import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Phone, Clock, Search, SlidersHorizontal, Store } from 'lucide-react'
import { bookerApi } from '../../lib/api'

interface Court {
  court_id: string
  court_number: number
}

interface Venue {
  venue_id: string
  name: string
  address: string
  contact_number: string
  opening_time: string
  closing_time: string
  courts: Court[]
  images?: { image_url: string }[]
}

// Format a DateTime string to HH:mm
const formatTime = (dt: string) => {
  if (!dt) return ''
  if (dt.includes('T')) {
    const d = new Date(dt)
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`
  }
  return dt.slice(0, 5)
}

// Today as YYYY-MM-DD
const todayStr = () => new Date().toISOString().slice(0, 10)

export function MarketplacePage() {
  const navigate = useNavigate()

  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchVenues = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params: { date?: string; time?: string; address?: string } = {}
      if (date) params.date = date
      if (time) params.time = time.length === 5 ? `${time}:00` : time  // ensure HH:MM:SS
      if (search) params.address = search
      const data = await bookerApi.getVenues(Object.keys(params).length ? params : undefined)
      setVenues(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Failed to load venues. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [date, time, search])

  useEffect(() => {
    fetchVenues()
  }, [fetchVenues])

  const filtered = venues.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.address.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-up stagger-1">
        <h1 className="font-display font-700 text-3xl tracking-tight">Discover Venues</h1>
        <p className="text-ink-muted mt-1 text-sm">Find and book pickleball courts near you.</p>
      </div>

      {/* Search + Filters bar */}
      <div className="animate-fade-up stagger-2 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search venues by name or location..."
              className="input-field pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`h-11 px-4 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${filtersOpen || date || time
              ? 'border-accent/50 text-accent bg-accent/10'
              : 'border-ink-border text-ink-muted hover:text-white hover:bg-ink-subtle'
              }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {(date || time) && (
              <span className="w-2 h-2 rounded-full bg-accent" />
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {filtersOpen && (
          <div className="glass-card p-4 flex flex-wrap gap-4 items-end animate-fade-up">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Date</label>
              <input
                type="date"
                className="input-field h-10 py-0"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Time Slot</label>
              <input
                type="time"
                className="input-field h-10 py-0"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setDate(todayStr()); setTime('') }}
              className="h-10 px-4 rounded-lg border border-ink-border text-ink-muted hover:text-white hover:bg-ink-subtle transition-all text-sm"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {error ? (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-4">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-ink-muted">Finding available venues...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-14 flex flex-col items-center text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Store size={24} className="text-ink-muted" />
          </div>
          <h3 className="font-display font-600 text-lg mb-2">No venues found</h3>
          <p className="text-ink-muted text-sm max-w-sm">
            {search
              ? `No venues match "${search}". Try a different search.`
              : time
                ? 'No courts are available at the requested date and time. Try a different slot.'
                : 'No venues are currently listed. Check back soon!'}
          </p>
          {(search || time) && (
            <button
              onClick={() => { setSearch(''); setTime(''); setDate(todayStr()) }}
              className="btn-ghost h-10 px-6 mt-6 text-sm"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-muted -mt-4 animate-fade-up">
            {filtered.length} venue{filtered.length !== 1 ? 's' : ''} available
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-up stagger-3">
            {filtered.map((venue) => (
              <div
                key={venue.venue_id}
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
                      style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.12)' }}
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
                      {formatTime(venue.opening_time)} – {formatTime(venue.closing_time)}
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
                          style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--ink-muted)', border: '1px solid rgba(255,255,255,0.08)' }}
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
                    onClick={(e) => { e.stopPropagation(); navigate(`/booker/venue/${venue.venue_id}`) }}
                  >
                    View &amp; Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
