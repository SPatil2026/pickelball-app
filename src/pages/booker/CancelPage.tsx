import { useState } from "react"
import { bookingsApi } from "../../lib/api"
import { useNavigate, useParams } from "react-router-dom"

export function CancelPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [canceling, setCanceling] = useState(false)

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return
        setCanceling(true)
        try {
            await bookingsApi.cancelBooking(id!)
            navigate('/booker/history')
        } catch (error) {
            console.error('Error cancelling booking:', error)
        }
    }

    return (
        <div>
            <h1>Cancel Booking {id}</h1>
            <button onClick={handleCancel} disabled={canceling}>Cancel</button>
        </div>
    )
}