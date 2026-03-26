import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export const STATUS_CONFIG = {
    CONFIRMED: {
        label: 'Confirmed',
        cls: 'text-emerald-400',
        bg: 'bg-emerald-400/10 border-emerald-400/30',
        icon: CheckCircle2,
    },
    CANCELLED: {
        label: 'Cancelled',
        cls: 'text-red-400',
        bg: 'bg-red-400/10 border-red-400/30',
        icon: XCircle,
    },
    RESCHEDULED: {
        label: 'Rescheduled',
        cls: 'text-sky-400',
        bg: 'bg-sky-400/10 border-sky-400/30',
        icon: RefreshCw,
    },
}