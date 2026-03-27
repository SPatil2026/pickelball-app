import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, AlertCircle, ArrowLeft } from 'lucide-react'
import { ownerApi } from '../../lib/api'

export function AddVenuePage() {
    const navigate = useNavigate()

    const [loading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact_number: '',
        email: '',
        opening_time: '06:00',
        closing_time: '23:00'
    })

    const formatTimeToDateString = (timeStr: string) => {
        return `${new Date().toISOString().split('T')[0]}T${timeStr}:00.000Z`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setSaving(true)
        setError('')

        try {
            const payload = {
                name: formData.name,
                address: formData.address,
                contact_number: formData.contact_number,
                email: formData.email,
                opening_time: formatTimeToDateString(formData.opening_time),
                closing_time: formatTimeToDateString(formData.closing_time)
            }

            await ownerApi.createVenue(payload)
            navigate('/owner/venues')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update venue. Please try again.')
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6 animate-fade-up">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/owner/venues')}
                    className="w-10 h-10 rounded-full bg-ink-subtle border border-ink-border flex items-center justify-center hover:bg-primary/5 transition-colors"
                >
                    <ArrowLeft size={18} className="text-primary" />
                </button>
                <div>
                    <h1 className="font-display font-700 text-3xl tracking-tight">Add Venue</h1>
                    <p className="text-ink-muted mt-1 text-sm">Create your venue's basic information</p>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="glass-card p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Venue Name</label>
                            <input
                                type="text"
                                required
                                className="input-field"
                                placeholder="e.g. Ace Pickleball Club"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Address</label>
                            <textarea
                                required
                                rows={2}
                                className="input-field resize-none"
                                placeholder="Full address of the venue"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Contact Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="input-field"
                                    placeholder="+91 9876543210"
                                    minLength={10}
                                    maxLength={10}
                                    value={formData.contact_number}
                                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field"
                                    placeholder="contact@venue.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Opening Time</label>
                                <input
                                    type="time"
                                    required
                                    className="input-field"
                                    value={formData.opening_time}
                                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">Closing Time</label>
                                <input
                                    type="time"
                                    required
                                    className="input-field"
                                    value={formData.closing_time}
                                    onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-ink-border flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/owner/venues')}
                            className="btn-ghost h-11 px-6 text-sm"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-primary h-11 px-8 gap-2 text-sm"
                        >
                            {saving ? (
                                <span className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                            ) : (
                                <>
                                    <Save size={16} /> Create Venue
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
