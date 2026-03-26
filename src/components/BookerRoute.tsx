import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Role } from '../types'

export function BookerRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role !== Role.BOOKER) {
    return <Navigate to="/owner/dashboard" replace />
  }

  return <Outlet />
}
