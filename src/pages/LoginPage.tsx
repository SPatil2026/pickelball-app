import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import clsx from 'clsx'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await login({ email, password })
      if (user?.role === 'OWNER') navigate('/owner/dashboard')
      else navigate('/booker/home')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden border-r border-ink-border">
        {/* Background court lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          viewBox="0 0 400 700"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect x="40" y="80" width="320" height="540" rx="4" stroke="#b8ff57" strokeWidth="2" />
          <line x1="40" y1="350" x2="360" y2="350" stroke="#b8ff57" strokeWidth="1.5" />
          <line x1="200" y1="80" x2="200" y2="620" stroke="#b8ff57" strokeWidth="1" />
          <rect x="100" y="200" width="200" height="300" stroke="#b8ff57" strokeWidth="1" />
          <circle cx="200" cy="350" r="30" stroke="#b8ff57" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <Zap size={16} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-lg">PicklePark</span>
        </div>

        <div className="relative z-10">
          <div className="tag mb-6" style={{ background: 'rgba(184,255,87,0.12)', color: 'var(--accent)' }}>
            ⚡ Courts available now
          </div>
          <h1 className="font-display font-800 text-5xl leading-[1.08] tracking-tight mb-6">
            Book your<br />
            <span style={{ color: 'var(--accent)' }}>perfect</span><br />
            court
          </h1>
          <p className="text-ink-muted text-lg leading-relaxed max-w-xs">
            Real-time availability, instant confirmation, zero hassle.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[['3', 'Courts'], ['24/7', 'Booking'], ['₹0', 'Platform fee']].map(([val, label]) => (
            <div key={label} className="glass-card p-4">
              <p className="font-display font-700 text-2xl" style={{ color: 'var(--accent)' }}>{val}</p>
              <p className="text-xs text-ink-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Zap size={16} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-700 text-lg">PicklePark</span>
          </div>

          <h2 className="font-display font-700 text-3xl tracking-tight mb-1">Welcome back</h2>
          <p className="text-ink-muted text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-11"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                'btn-primary w-full mt-2 h-11',
                loading && 'opacity-70 cursor-not-allowed'
              )}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            No account?{' '}
            <Link to="/register" className="font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
