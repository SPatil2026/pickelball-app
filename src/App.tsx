import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OwnerRoute } from './components/OwnerRoute'
import { BookerRoute } from './components/BookerRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CourtsPage, HistoryPage, MarketplacePage, SettingsPage } from './pages/PlaceholderPages'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            
            {/* Owner Section */}
            <Route element={<OwnerRoute />}>
              <Route path="/owner/dashboard" element={<DashboardPage />} />
            </Route>

            {/* Booker Section */}
            <Route element={<BookerRoute />}>
              <Route path="/booker/home" element={<MarketplacePage />} />
              <Route path="/booker/history" element={<HistoryPage />} />
              <Route path="/booker/courts" element={<CourtsPage />} />
            </Route>

            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
