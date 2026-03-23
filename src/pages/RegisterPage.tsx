import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'
import clsx from 'clsx'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('BOOKER')
  const [showPw, setShowPw] = useState(false)
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await register({ name, email, password, role, phone })
      if (user?.role === 'OWNER') navigate('/owner/dashboard')
      else navigate('/booker/home')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] p-12 relative overflow-hidden border-r border-ink-border">
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

        <div className="relative z-10 space-y-5">
          <h1 className="font-display font-800 text-5xl leading-[1.08] tracking-tight">
            Join the<br />
            <span style={{ color: 'var(--accent)' }}>community</span>
          </h1>
          <p className="text-ink-muted text-lg leading-relaxed max-w-xs">
            Whether you play or run a venue, PicklePark has you covered.
          </p>
          <ul className="space-y-3">
            {[
              'Instant court booking',
              'Conflict-free slot management',
              'Weekday & weekend pricing',
              'Full booking history',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-ink-muted">
                <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(184,255,87,0.15)' }}>
                  <Check size={11} style={{ color: 'var(--accent)' }} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 glass-card p-5">
          <p className="text-sm text-ink-muted italic">
            "Booked a court in under 30 seconds. This is exactly what pickleball needed."
          </p>
          <p className="text-xs font-mono text-ink-muted mt-3">— Priya S., Mumbai</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <Zap size={16} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-700 text-lg">PicklePark</span>
          </div>

          <h2 className="font-display font-700 text-3xl tracking-tight mb-1">Create account</h2>
          <p className="text-ink-muted text-sm mb-8">Free forever. No credit card required.</p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Full name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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

            {/* Role picker */}
            <div>
              <label className="block text-xs font-mono text-ink-muted mb-2 uppercase tracking-widest">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['BOOKER', 'OWNER'] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={clsx(
                      'flex flex-col items-start px-4 py-3 rounded-lg border text-sm font-medium transition-all duration-150',
                      role === r
                        ? 'border-transparent text-ink'
                        : 'border-ink-border text-ink-muted hover:border-white/30 hover:text-white'
                    )}
                    style={role === r ? { background: 'var(--accent)' } : {}}
                  >
                    <span className="text-base mb-0.5">{r === 'BOOKER' ? '🏓' : '🏟️'}</span>
                    <span className="capitalize">{r}</span>
                    <span className="text-xs opacity-70 font-normal">
                      {r === 'BOOKER' ? 'Book courts' : 'Manage venues'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-ink-muted mb-1.5 uppercase tracking-widest">
                Phone Number
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                minLength={10}
                maxLength={10}
              />
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
                <>Create account <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:text-white transition-colors" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
