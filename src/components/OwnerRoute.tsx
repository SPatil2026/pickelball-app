import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Role } from '../types'

export function OwnerRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  if (user?.role !== Role.OWNER) {
    return <Navigate to="/booker/home" replace />
  }

  return <Outlet />
}
