
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Bookings } from '@/pages/Bookings'
import { EnhancedBookings } from '@/pages/EnhancedBookings'
import { Drivers } from '@/pages/Drivers'
import { Vehicles } from '@/pages/Vehicles'
import { LiveTracking } from '@/pages/LiveTracking'
import { Pricing } from '@/pages/Pricing'
import { Analytics } from '@/pages/Analytics'
import { Communication } from '@/pages/Communication'
import { Documents } from '@/pages/Documents'
import { AdminProfile } from '@/pages/AdminProfile'
import { UserManagement } from '@/pages/UserManagement'
import { Settings } from '@/pages/Settings'
import { VehicleDetailView } from '@/components/vehicles/VehicleDetailView'
import { DriverDetailView } from '@/components/drivers/DriverDetailView'
import { BookingDetailView } from '@/components/booking/BookingDetailView'
import { Notifications } from '@/pages/Notifications'

export const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isAdmin, loading, userRole } = useAuth()

  console.log("AuthenticatedApp: Auth state - isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin, "loading:", loading, "userRole:", userRole)

  // Show loading while authentication state is being determined
  if (loading) {
    console.log("AuthenticatedApp: Still loading auth state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-400 mt-2">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    console.log("AuthenticatedApp: Not authenticated, showing login")
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // If authenticated but role is not admin (and role fetch is complete), show login with error
  if (isAuthenticated && userRole !== null && !isAdmin) {
    console.log("AuthenticatedApp: Authenticated but not admin, showing login with error")
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    )
  }

  // If authenticated but role is still being fetched, show loading
  if (isAuthenticated && userRole === null) {
    console.log("AuthenticatedApp: Authenticated but role still loading")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Verifying permissions...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait...</p>
        </div>
      </div>
    )
  }

  // If authenticated admin, show the full app
  console.log("AuthenticatedApp: Authenticated admin, showing full app")
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bookings" element={<EnhancedBookings />} />
          <Route path="bookings/:id" element={<BookingDetailView />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="drivers/:id" element={<DriverDetailView />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="vehicles/:id" element={<VehicleDetailView />} />
          <Route path="live-tracking" element={<LiveTracking />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="communication" element={<Communication />} />
          <Route path="documents" element={<Documents />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
