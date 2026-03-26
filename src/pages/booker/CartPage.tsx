import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, MapPin, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { cartApi } from '../../lib/api'
import { fmtDate, fmtTime } from '../../components/FormatDateTime'
import { Cart } from '../../types'

export function CartPage() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const fetchCart = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true)
      const data = await cartApi.getCart()
      // Handle both { cart, total_amount } and empty { items: [], total_amount: 0 } shapes
      if (data.cart) {
        setCart(data.cart)
        setTotalAmount(data.total_amount ?? 0)
      } else {
        setCart({ cart_id: '', items: data.items ?? [] })
        setTotalAmount(data.total_amount ?? 0)
      }
    } catch {
      setError('Failed to load your cart.')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => { 
    fetchCart() 
    const interval = setInterval(() => {
      fetchCart(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleRemove = async (cartItemId: string) => {
    setRemovingId(cartItemId)
    try {
      await cartApi.removeFromCart(cartItemId)
      setCart((prev) =>
        prev ? { ...prev, items: prev.items.filter((i) => i.cart_item_id !== cartItemId) } : prev
      )
    } catch {
      setError('Failed to remove item.')
    } finally {
      setRemovingId(null)
      fetchCart()
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) return
    setClearing(true)
    try {
      await cartApi.clearCart()
      setCart((prev) => prev ? { ...prev, items: [] } : prev)
    } catch {
      setError('Failed to clear cart.')
    } finally {
      setClearing(false)
    }
  }

  const items = cart?.items ?? []
  const hasBookedItems = items.some(i => i.is_booked)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between stagger-1">
        <div>
          <h1 className="font-display font-700 text-3xl tracking-tight">My Cart</h1>
          <p className="text-ink-muted mt-1 text-sm">
            {loading ? 'Loading...' : `${items.length} item${items.length !== 1 ? 's' : ''} ready to book`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={clearing}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {clearing
              ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
              : <Trash2 size={15} />
            }
            Clear all
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 gap-4">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-ink-muted">Loading your cart...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-14 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <ShoppingCart size={24} className="text-ink-muted" />
          </div>
          <h3 className="font-display font-600 text-lg mb-2">Your cart is empty</h3>
          <p className="text-ink-muted text-sm max-w-sm mb-6">
            Browse the marketplace and add court slots to your cart to proceed with booking.
          </p>
          <button onClick={() => navigate('/booker/home')} className="btn-primary h-10 px-6">
            Explore Venues
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className={`glass-card p-5 flex items-start gap-4 transition-all ${
                item.is_booked ? 'border-red-400 bg-red-50/50' : 'hover:border-primary/15'
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                item.is_booked ? 'bg-red-100 border border-red-200 text-red-500' : 'bg-accent/10 border border-accent/20 text-accent'
              }`}>
                <ShoppingCart size={16} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-display font-600 text-base truncate ${item.is_booked ? 'text-ink-muted line-through' : 'text-primary'}`}>
                    {item.court.venue.name}
                  </p>
                  {item.price > 0 && (
                    <span className={`font-display font-600 text-sm shrink-0 ${item.is_booked ? 'text-ink-muted' : 'text-accent'}`}>₹{item.price}</span>
                  )}
                </div>
                <p className="text-xs text-ink-muted mt-0.5">Court {item.court.court_number}</p>

                <div className="flex flex-wrap gap-4 mt-2.5 text-xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} />
                    <span className="line-clamp-1">{item.court.venue.address}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={12} />
                    {fmtDate(item.date)} · {fmtTime(item.start_time)} – {fmtTime(item.end_time)}
                  </span>
                </div>
                
                {item.is_booked && (
                  <div className="text-xs text-red-500 font-medium mt-3 flex items-center gap-1">
                    <AlertCircle size={13} /> This slot is no longer available. Please remove it.
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => handleRemove(item.cart_item_id)}
                disabled={removingId === item.cart_item_id}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0"
              >
                {removingId === item.cart_item_id
                  ? <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  : <Trash2 size={15} />
                }
              </button>
            </div>
          ))}

          {/* Total + Checkout CTA */}
          <div className="pt-4 border-t border-ink-border flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-ink-muted font-mono uppercase tracking-widest">Total</p>
              <p className="font-display font-700 text-2xl mt-0.5">
                ₹{totalAmount}
                <span className="text-xs font-body font-normal text-ink-muted ml-1">incl. taxes</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                className="btn-primary h-12 px-8 gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => navigate('/booker/checkout')}
                disabled={hasBookedItems || items.length === 0}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              {hasBookedItems && (
                <p className="text-xs text-red-500 font-medium mt-1 pr-1 text-right">
                  Please remove unavailable items to continue.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}