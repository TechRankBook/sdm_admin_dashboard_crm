
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

export const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth()

  console.log("AuthenticatedApp: Auth state - isAuthenticated:", isAuthenticated, "isAdmin:", isAdmin)

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

  // If authenticated but not admin, show login page with error
  if (!isAdmin) {
    console.log("AuthenticatedApp: Authenticated but not admin, showing login")
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
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
          <Route path="notifications" element={<div className="p-6">Notifications page coming soon...</div>} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
