import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle, Save, MapPin, Clock, UploadCloud } from 'lucide-react'
import { ownerApi, uploadApi } from '../../lib/api'

interface VenueDetails {
  venue_id: string
  name: string
  address: string
  opening_time: string
  closing_time: string
  _count: {
    courts: number
    pricing: number
  }
}

export function ManageVenuePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [venue, setVenue] = useState<VenueDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pricing forms
  const [weekdayPrice, setWeekdayPrice] = useState<string>('')
  const [weekendPrice, setWeekendPrice] = useState<string>('')
  const [savingPricing, setSavingPricing] = useState(false)
  const [pricingSuccess, setPricingSuccess] = useState('')

  // Image forms
  const [images, setImages] = useState<any[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageError, setImageError] = useState('')
  const [imageSuccess, setImageSuccess] = useState('')

  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchVenueDetails = async () => {
      try {
        const [venueRes, imagesRes] = await Promise.all([
          ownerApi.getVenueById(id),
          uploadApi.getVenueImages(id).catch(() => ({ images: [] }))
        ])

        setVenue(venueRes.venue)
        setImages(imagesRes.images || [])
      } catch (err: any) {
        setError('Failed to load venue details.')
      } finally {
        setLoading(false)
      }
    }
    fetchVenueDetails()
  }, [id])

  const handleUpdatePricing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return

    setSavingPricing(true)
    setPricingSuccess('')
    setError('')

    const pricingPayload = []
    if (weekdayPrice) pricingPayload.push({ day_type: 'WEEKDAY', price_per_hour: parseFloat(weekdayPrice) })
    if (weekendPrice) pricingPayload.push({ day_type: 'WEEKEND', price_per_hour: parseFloat(weekendPrice) })

    try {
      await ownerApi.setPricing(id, { pricing: pricingPayload })
      setPricingSuccess('Pricing updated successfully!')
      setTimeout(() => setPricingSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update pricing.')
    } finally {
      setSavingPricing(false)
    }
  }

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files?.length) return
    const files = Array.from(e.target.files)

    if (files.length > 5 || images.length + files.length > 5) {
      setImageError('Maximum 5 images allowed per venue.')
      e.target.value = ''
      return
    }

    setUploadingImages(true)
    setImageError('')
    setImageSuccess('')

    try {
      await uploadApi.uploadVenueImages(id, files)

      // Refresh images list
      const imgRes = await uploadApi.getVenueImages(id)
      setImages(imgRes.images || [])
      setImageSuccess('Images uploaded successfully!')
      setTimeout(() => setImageSuccess(''), 4000)
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to upload images.')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const handleDeleteVenue = async () => {
    if (!id) return
    const confirmed = window.confirm('Are you absolutely sure you want to delete this venue? This action cannot be undone.')
    if (!confirmed) return

    setDeleting(true)
    try {
      await ownerApi.deleteVenue(id)
      navigate('/owner/venues')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete venue.')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-display font-700 text-2xl tracking-tight mb-2">Venue Not Found</h2>
        <p className="text-ink-muted text-sm max-w-xs">{error || "The venue you are looking for does not exist."}</p>
        <button onClick={() => navigate('/owner/venues')} className="mt-6 btn-primary h-10 px-6">
          Back to My Venues
        </button>
      </div>
    )
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return
    try {
      await uploadApi.deleteVenueImage(imageId)
      setImages(images.filter(img => img.image_id !== imageId))
      setImageSuccess('Image deleted.')
      setTimeout(() => setImageSuccess(''), 3000)
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to delete image.')
    }
  }

  const handleSetThumbnail = async (imageId: string) => {
    try {
      await uploadApi.setVenueThumbnail(imageId)
      setImages(images.map(img => ({
        ...img,
        is_thumbnail: img.image_id === imageId
      })))
      setImageSuccess('Cover photo updated.')
      setTimeout(() => setImageSuccess(''), 3000)
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to update cover photo.')
    }
  }

  const handleReplaceImage = async (imageId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImages(true)
    try {
      await uploadApi.replaceVenueImage(imageId, file)
      const imgRes = await uploadApi.getVenueImages(id!)
      setImages(imgRes.images || [])
      setImageSuccess('Image replaced.')
      setTimeout(() => setImageSuccess(''), 3000)
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to replace image.')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const timeformat = (isoString: string) => {
    //use UTC time
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
  }

  return (

    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-3xl tracking-tight">{venue.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <MapPin size={14} /> {venue.address}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Clock size={14} /> {timeformat(venue.opening_time)} - {timeformat(venue.closing_time)}
            </span>
          </div>
        </div>
        <button className="btn-ghost h-10 px-4 gap-2" onClick={() => navigate('/owner/venues')}>
          Back
        </button>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Images Panel */}
        <div className="md:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-lg">Venue Photos</h2>
            <p className="text-xs text-ink-muted">{images.length} / 5 Uploaded</p>
          </div>

          {imageError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {imageError}
            </div>
          )}
          {imageSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: 'rgba(184,255,87,0.1)', color: 'var(--accent)', border: '1px solid rgba(184,255,87,0.2)' }}>
              <Save size={16} />
              {imageSuccess}
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {images.map((img: any) => (
              <div key={img.image_id || img.image_url} className="aspect-square rounded-xl bg-ink-subtle border border-ink-border overflow-hidden relative group">
                <img src={img.image_url} alt="Venue" className="w-full h-full object-cover" />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-ink/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  {!img.is_thumbnail && (
                    <button
                      onClick={() => handleSetThumbnail(img.image_id)}
                      className="text-[10px] font-mono uppercase bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full w-full max-w-[120px] backdrop-blur-md transition-colors"
                    >
                      Set Cover
                    </button>
                  )}

                  <label className="text-[10px] font-mono uppercase bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full w-full max-w-[120px] backdrop-blur-md transition-colors text-center cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleReplaceImage(img.image_id, e)}
                    />
                  </label>

                  <button
                    onClick={() => handleDeleteImage(img.image_id)}
                    className="text-[10px] font-mono uppercase bg-red-500/20 hover:bg-red-500/40 text-red-100 px-3 py-1.5 rounded-full w-full max-w-[120px] backdrop-blur-md transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {img.is_thumbnail && (
                  <span className="absolute top-2 left-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-accent text-ink pointer-events-none group-hover:opacity-0 transition-opacity">
                    Cover
                  </span>
                )}
              </div>
            ))}

            {images.length < 5 && (
              <label className="aspect-square rounded-xl border border-dashed border-ink-border hover:border-accent/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImages}
                  disabled={uploadingImages}
                  className="hidden"
                />
                {uploadingImages ? (
                  <span className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                ) : (
                  <>
                    <UploadCloud size={24} className="text-ink-muted mb-2 group-hover:text-accent transition-colors" />
                    <span className="text-xs font-medium text-ink-muted text-center max-w-[80px]">Upload up to {5 - images.length}</span>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {/* Pricing Panel */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-600 text-lg">Set Pricing Rates</h2>
          </div>

          {pricingSuccess && (
            <div className="mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm" style={{ background: 'rgba(184,255,87,0.1)', color: 'var(--accent)', border: '1px solid rgba(184,255,87,0.2)' }}>
              <Save size={16} />
              {pricingSuccess}
            </div>
          )}

          <form onSubmit={handleUpdatePricing} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Weekday Price (/hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="input-field pl-8"
                  placeholder="e.g. 500"
                  value={weekdayPrice}
                  onChange={(e) => setWeekdayPrice(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Weekend Price (/hr)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="input-field pl-8"
                  placeholder="e.g. 750"
                  value={weekendPrice}
                  onChange={(e) => setWeekendPrice(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPricing || (!weekdayPrice && !weekendPrice)}
              className="btn-primary w-full h-11 mt-2"
            >
              {savingPricing ? <span className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent animate-spin" /> : 'Save Pricing Details'}
            </button>
          </form>
        </div>

        {/* Danger Zone Panel */}
        <div className="glass-card p-6 border-red-500/20 flex flex-col items-start bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <AlertTriangle size={20} />
            <h2 className="font-display font-600 text-lg">Danger Zone</h2>
          </div>
          <p className="text-sm text-ink-muted mb-6 w-full">
            Permanently delete this venue and all of its associated courts, pricing structures, and historical data. This cannot be undone.
          </p>

          <button
            onClick={handleDeleteVenue}
            disabled={deleting}
            className="w-full mt-auto h-11 rounded-lg border border-red-500/30 text-red-500 flex items-center justify-center gap-2 font-medium hover:bg-red-500 hover:text-primary transition-all disabled:opacity-50"
          >
            {deleting ? (
              <span className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              <>
                <Trash2 size={16} /> Delete Venue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
