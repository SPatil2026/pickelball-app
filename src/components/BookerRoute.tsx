import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function BookerRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role !== 'BOOKER') {
    return <Navigate to="/owner/dashboard" replace />
  }

  return <Outlet />
}
