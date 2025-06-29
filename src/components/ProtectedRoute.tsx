
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute: React.FC = () => {
  const { session, userRole, loading } = useAuth()

  console.log("ProtectedRoute: Checking access - Session:", !!session, "Role:", userRole, "Loading:", loading)

  // If AuthProvider is still loading, don't render anything (it shows its own loading screen)
  if (loading) {
    console.log("ProtectedRoute: AuthProvider still loading")
    return null
  }

  if (!session) {
    console.log("ProtectedRoute: No session, redirecting to login")
    return <Navigate to="/login" replace />
  }

  if (userRole !== 'admin') {
    console.log("ProtectedRoute: User role is not admin, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("ProtectedRoute: Access granted")
  return <Outlet />
}
