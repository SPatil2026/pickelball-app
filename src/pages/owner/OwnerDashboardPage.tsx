import { ownerApi } from '../../lib/api'
import { Users, TrendingUp, Calendar as CalendarIcon, MapPin, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'


interface Dashboard {
  message: string,
  totalVenues: number
  totalCourts: number
  totalBookings: number
  totalRevenue: {
    _sum: {
      total_amount: number | null;
    };
  };
}

const recentBookings = [
  { id: '1', user: 'Rahul Sharma', venue: 'Ace Pickleball', time: 'Today, 18:00 - 19:30', amount: '₹450', status: 'confirmed' },
  { id: '2', user: 'Priya Patel', venue: 'Ace Pickleball', time: 'Today, 19:30 - 21:00', amount: '₹450', status: 'confirmed' },
  { id: '3', user: 'Amit Kumar', venue: 'Downtown Courts', time: 'Tomorrow, 07:00 - 08:00', amount: '₹300', status: 'pending' },
]

export function OwnerDashboardPage() {
  const [dashboard, setDashboard] = useState<Dashboard>({
    message: '',
    totalVenues: 0,
    totalCourts: 0,
    totalBookings: 0,
    totalRevenue: {
      _sum: {
        total_amount: 0,
      },
    }
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await ownerApi.getDashboard()
        setDashboard({
          message: res.message ?? '',
          totalVenues: res.totalVenues ?? 0,
          totalCourts: res.totalCourts ?? 0,
          totalBookings: res.totalBookings ?? 0,
          totalRevenue: {
            _sum: {
              total_amount: res.totalRevenue?._sum?.total_amount ?? 0,
            },
          },
        })
      } catch (err) {
        setError('Failed to load venues. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const stats = [
    { label: 'Total Venues', value: dashboard.totalVenues, icon: MapPin, trend: '+1 this month' },
    { label: 'Active Courts', value: dashboard.totalCourts, icon: Zap, trend: 'All operational' },
    { label: 'Total Bookings', value: dashboard.totalBookings, icon: CalendarIcon, trend: '+24% vs last week' },
    { label: 'Revenue (MTD)', value: dashboard.totalRevenue._sum.total_amount, icon: TrendingUp, trend: '+12% vs last month' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-up stagger-1">
        <h1 className="font-display font-700 text-3xl tracking-tight">Owner Dashboard</h1>
        <p className="text-ink-muted mt-1 text-sm">Welcome back. Here's what's happening across your venues today.</p>
      </div>

      {/* Stats Grid */}
      {error ? (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <span className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <p className="text-sm text-ink-muted">Loading stats...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up stagger-2">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="glass-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-ink-muted uppercase tracking-widest">{stat.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary/5 text-ink-muted">
                    <Icon size={16} />
                  </div>
                </div>
                <div>
                  <span className="font-display font-700 text-3xl">{stat.value}</span>
                  {/* <p className="text-xs mt-1" style={{ color: 'var(--accent)' }}>{stat.trend}</p> */}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up stagger-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-700 text-lg">Recent Bookings</h2>
            <button className="text-sm font-medium hover:text-primary transition-colors" style={{ color: 'var(--accent)' }}>
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl border border-ink-border bg-ink-subtle hover:border-primary/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{booking.user}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{booking.venue} · {booking.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display font-600">{booking.amount}</p>
                  <span className="tag text-[10px] px-2 py-0.5 mt-1 inline-block"
                    style={booking.status === 'confirmed' ? { background: 'rgba(184,255,87,0.12)', color: 'var(--accent)' } : { background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="font-display font-700 text-lg mb-6">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { label: 'Add new venue', desc: 'List another location', path: '/owner/add-venue' },
              { label: 'Manage courts', desc: 'Update court availability', path: '/owner/manage-courts' },
              { label: 'View reports', desc: 'Monthly revenue & usage', path: '/owner/reports' },
            ].map((action, i) => (
              <button key={i} className="w-full text-left p-4 rounded-xl border border-ink-border hover:bg-primary/5 transition-colors group">
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
                <p className="text-xs text-ink-muted mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
