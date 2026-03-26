import { Construction } from 'lucide-react'

interface PlaceholderProps {
  title: string
  description: string
}

function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-subtle border border-ink-border flex items-center justify-center mb-5">
        <Construction size={24} className="text-ink-muted" />
      </div>
      <h2 className="font-display font-700 text-2xl tracking-tight mb-2">{title}</h2>
      <p className="text-ink-muted text-sm max-w-xs">{description}</p>
      <div className="mt-5 tag" style={{ background: 'rgba(184,255,87,0.1)', color: 'var(--accent)' }}>
        Coming soon
      </div>
    </div>
  )
}

export function CourtsPage() {
  return <Placeholder title="Book Courts" description="3-court colour-coded grid with real-time availability and multi-slot cart." />
}

export function HistoryPage() {
  return <Placeholder title="My Bookings" description="View, reschedule, or cancel your past and upcoming bookings." />
}

export function MarketplacePage() {
  return <Placeholder title="Venue Marketplace" description="Browse venues near you, filter by availability, and book instantly." />
}

