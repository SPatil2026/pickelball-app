import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function OwnerRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role !== 'OWNER') {
    return <Navigate to="/booker/home" replace />
  }

  return <Outlet />
}
