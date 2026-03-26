import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, MapPin, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { cartApi } from '../../lib/api'
import { fmtDate, fmtTime } from '../../components/FormatDateTime'
import { CartItem } from '../../types'

export function CheckoutPage() {
  const navigate = useNavigate()

  const [items, setItems] = useState<CartItem[]>([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [placing, setPlacing] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    cartApi.getCart()
      .then((data) => {
        if (data.cart) {
          setItems(data.cart.items ?? [])
          setTotalAmount(data.total_amount ?? 0)
        } else {
          setItems(data.items ?? [])
          setTotalAmount(data.total_amount ?? 0)
        }
      })
      .catch(() => setError('Failed to load cart.'))
      .finally(() => setLoading(false))
  }, [])

  const handleCheckout = async () => {
    setPlacing(true)
    setError('')
    try {
      await cartApi.checkout()
      setSuccess(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Checkout failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="p-8 max-w-lg mx-auto flex flex-col items-center text-center min-h-[70vh] justify-center gap-6 animate-fade-up">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(184,255,87,0.15)', border: '1px solid rgba(184,255,87,0.3)' }}
        >
          <CheckCircle2 size={40} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <h1 className="font-display font-700 text-3xl tracking-tight">Booking Confirmed!</h1>
          <p className="text-ink-muted mt-2 text-sm max-w-xs mx-auto">
            Your court slots have been reserved. You can view your upcoming bookings below.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/booker/history')} className="btn-primary h-11 px-6 gap-2">
            My Bookings <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/booker/home')} className="btn-ghost h-11 px-6">
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-fade-up">
      {/* Back */}
      <button
        onClick={() => navigate('/booker/cart')}
        className="flex items-center gap-2 text-ink-muted hover:text-primary transition-colors text-sm font-medium group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Cart
      </button>

      <div>
        <h1 className="font-display font-700 text-3xl tracking-tight">Checkout</h1>
        <p className="text-ink-muted mt-1 text-sm">Review your selections before confirming.</p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center text-center">
          <ShoppingCart size={28} className="text-ink-muted mb-3" />
          <p className="text-ink-muted text-sm">Your cart is empty.</p>
          <button onClick={() => navigate('/booker/home')} className="btn-primary h-10 px-6 mt-5">
            Explore Venues
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order items */}
          <div className="glass-card divide-y divide-ink-border overflow-hidden">
            {items.map((item) => (
              <div key={item.cart_item_id} className="p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingCart size={15} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-display font-600 text-sm truncate">{item.court.venue.name}</p>
                    {item.price > 0 && (
                      <span className="font-display font-600 text-sm text-accent shrink-0">₹{item.price}</span>
                    )}
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5">Court {item.court.court_number}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={11} />
                      <span className="line-clamp-1">{item.court.venue.address}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={11} />
                      {fmtDate(item.date)} · {fmtTime(item.start_time)} – {fmtTime(item.end_time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="glass-card p-5 space-y-3">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest">Order Summary</p>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">{items.length} slot{items.length !== 1 ? 's' : ''}</span>
              <span>₹{totalAmount}</span>
            </div>
            <div className="border-t border-ink-border pt-3 flex justify-between items-baseline">
              <span className="text-sm font-medium">Total</span>
              <span className="font-display font-700 text-2xl">₹{totalAmount}</span>
            </div>
          </div>

          {/* Notice */}
          <p className="text-xs text-ink-muted">
            By confirming you agree to the venue's cancellation policy. Slots will be atomically locked — if any is unavailable, the entire order will be rolled back.
          </p>

          {/* CTA */}
          <button
            onClick={handleCheckout}
            disabled={placing}
            className="btn-primary w-full h-13 text-base gap-3 py-3.5"
          >
            {placing ? (
              <span className="w-5 h-5 rounded-full border-2 border-ink border-t-transparent animate-spin" />
            ) : (
              <CheckCircle2 size={18} />
            )}
            {placing ? 'Confirming your booking...' : `Confirm & Pay ₹${totalAmount}`}
          </button>
        </div>
      )}
    </div>
  )
}
