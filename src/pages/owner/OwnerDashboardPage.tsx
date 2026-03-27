import { ownerApi } from '../../lib/api'
import { TrendingUp, Calendar as CalendarIcon, MapPin, Zap } from 'lucide-react'
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
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
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

    </div>
  )
}
