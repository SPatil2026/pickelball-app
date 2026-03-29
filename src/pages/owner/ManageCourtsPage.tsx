import { useState, useEffect } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { ownerApi } from '../../lib/api'

interface Court {
  court_id: string
  court_number: number
}

interface Venue {
  venue_id: string
  name: string
  address: string
  courts: Court[]
}

export function ManageCourtsPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [selectedVenueId, setSelectedVenueId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New court state
  const [newCourtNumber, setNewCourtNumber] = useState('')
  const [addingCourt, setAddingCourt] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const res = await ownerApi.getVenues()
      setVenues(res.venues || [])
      if (res.venues?.length > 0 && !selectedVenueId) {
        setSelectedVenueId(res.venues[0].venue_id)
      }
    } catch (err) {
      setError('Failed to load venues.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVenueId || !newCourtNumber) return

    setActionError('')
    setAddingCourt(true)
    try {
      await ownerApi.createCourt({
        venue_id: selectedVenueId,
        court_number: parseInt(newCourtNumber)
      })

      setNewCourtNumber('')
      // Refresh venues to get new court list
      await fetchVenues()
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to add court.')
    } finally {
      setAddingCourt(false)
    }
  }

  const handleRemoveCourt = async (courtId: string) => {
    if (!window.confirm('Are you sure you want to remove this court?')) return

    setActionError('')
    try {
      await ownerApi.removeCourt(courtId)
      // Refresh venues to get updated court list
      await fetchVenues()
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to remove court.')
    }
  }

  const selectedVenue = venues.find(v => v.venue_id === selectedVenueId)

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <div className="animate-fade-up stagger-1">
        <h1 className="font-display font-700 text-3xl tracking-tight">Manage Courts</h1>
        <p className="text-ink-muted mt-1 text-sm">Add or remove courts from your venues.</p>
      </div>

      {error ? (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : loading && venues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-ink-muted">Loading courts...</p>
        </div>
      ) : venues.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <h3 className="font-display font-600 text-lg mb-2">No venues found</h3>
          <p className="text-ink-muted text-sm max-w-sm">
            You need to create a venue before you can manage courts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up stagger-2">

          {/* Left Column: Venue Selector */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="font-display font-600 text-lg mb-4">Select Venue</h2>
            <div className="space-y-2">
              {venues.map((venue) => (
                <button
                  key={venue.venue_id}
                  onClick={() => {
                    setSelectedVenueId(venue.venue_id)
                    setActionError('')
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${selectedVenueId === venue.venue_id
                    ? 'border-accent bg-accent/5'
                    : 'border-ink-border bg-ink-subtle hover:bg-primary/5'
                    }`}
                >
                  <p className={`font-medium text-sm truncate ${selectedVenueId === venue.venue_id ? 'text-accent' : 'text-primary'}`}>
                    {venue.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <MapPin size={12} className="text-ink-muted flex-shrink-0" />
                    <p className="text-xs text-ink-muted truncate">{venue.address}</p>
                  </div>
                  <p className="text-xs text-ink-muted mt-2 font-mono">
                    {venue.courts.length} Courts
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Court Management */}
          <div className="md:col-span-2 space-y-6">
            {selectedVenue && (
              <>
                <div className="glass-card p-6 border-accent/20">
                  <h2 className="font-display font-600 text-xl mb-1">{selectedVenue.name}</h2>
                  <p className="text-sm text-ink-muted mb-6 flex items-center gap-1">
                    <MapPin size={14} /> {selectedVenue.address}
                  </p>

                  {actionError && (
                    <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {actionError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-display font-600 text-sm tracking-wide uppercase text-ink-muted">Existing Courts</h3>

                    {selectedVenue.courts.length === 0 ? (
                      <p className="text-sm text-ink-muted italic py-2">No courts added yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {selectedVenue.courts.sort((a, b) => a.court_number - b.court_number).map((court) => (
                          <div key={court.court_id} className="flex items-center justify-between p-3 rounded-lg bg-ink-subtle border border-ink-border group">
                            <span className="font-mono text-sm font-medium">Court {court.court_number}</span>
                            <button
                              onClick={() => handleRemoveCourt(court.court_id)}
                              className="w-7 h-7 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all"
                              title="Remove Court"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-display font-600 text-sm tracking-wide uppercase text-ink-muted mb-4">Add New Court</h3>
                  <form onSubmit={handleAddCourt} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                        Court Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="input-field"
                        placeholder="e.g. 1"
                        value={newCourtNumber}
                        onChange={(e) => setNewCourtNumber(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={addingCourt || !newCourtNumber}
                      className={`btn-primary h-11 px-5 w-32 ${addingCourt || !newCourtNumber ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {addingCourt ? (
                        <span className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                      ) : (
                        <>
                          <Plus size={16} /> Add Court
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
