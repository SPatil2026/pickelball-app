import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { OwnerRoute } from './components/OwnerRoute'
import { BookerRoute } from './components/BookerRoute'
import { AppLayout } from './components/layout/AppLayout'
import { RegisterPage } from './pages/RegisterPage'

// Owner Pages
import { OwnerDashboardPage } from './pages/owner/OwnerDashboardPage'
import { MyVenuesPage } from './pages/owner/MyVenuesPage'
import { ManageCourtsPage } from './pages/owner/ManageCourtsPage'
import { ManageVenuePage } from './pages/owner/ManageVenuePage'
import { EditVenuePage } from './pages/owner/EditVenuePage'
import { OwnerBookingsPage } from './pages/owner/OwnerBookingsPage'
import { AddVenuePage } from './pages/owner/AddVenuePage'
import { MarketplacePage } from './pages/booker/MarketplacePage'
import { VenueDetailPage } from './pages/booker/VenueDetailPage'

// Placeholders
import { HistoryPage } from './pages/booker/HistoryPage'
import { LoginPage } from './pages/LoginPage'
import { BookingPage } from './pages/booker/BookingPage'
import { CartPage } from './pages/booker/CartPage'
import { CheckoutPage } from './pages/booker/CheckoutPage'
import { CancelPage } from './pages/booker/CancelPage'
import { ReschedulePage } from './pages/booker/ReschedulePage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>

            {/* Owner Section */}
            <Route element={<OwnerRoute />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/venues" element={<MyVenuesPage />} />
              <Route path="/owner/add-venue" element={<AddVenuePage />} />
              <Route path="/owner/venue/:id" element={<ManageVenuePage />} />
              <Route path="/owner/venue/:id/edit" element={<EditVenuePage />} />
              <Route path="/owner/bookings" element={<OwnerBookingsPage />} />
              <Route path="/owner/manage-courts" element={<ManageCourtsPage />} />
            </Route>

            {/* Booker Section */}
            <Route element={<BookerRoute />}>
              <Route path="/booker/home" element={<MarketplacePage />} />
              <Route path="/booker/venue/:id" element={<VenueDetailPage />} />
              <Route path="/booker/venue/:id/book" element={<BookingPage />} />
              <Route path="/booker/cart" element={<CartPage />} />
              <Route path="/booker/checkout" element={<CheckoutPage />} />
              <Route path="/booker/history" element={<HistoryPage />} />
              <Route path="/booker/booking/:id/cancel" element={<CancelPage />} />
              <Route path="/booker/booking/:id/reschedule" element={<ReschedulePage />} />
            </Route>

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
