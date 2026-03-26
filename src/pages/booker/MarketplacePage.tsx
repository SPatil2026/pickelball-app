import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, Store } from 'lucide-react'
import { bookerApi } from '../../lib/api'
import { VenueCard } from '../../components/VenueCard'
import { Venue } from '@/types'

// Today as YYYY-MM-DD
const todayStr = () => new Date().toISOString().slice(0, 10)

export function MarketplacePage() {

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
              <VenueCard key={venue.venue_id} venue={venue} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
