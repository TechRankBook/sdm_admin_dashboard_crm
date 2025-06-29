
import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute: React.FC = () => {
  const { session, userRole, loading } = useAuth()

  console.log("ProtectedRoute: Checking access - Session:", !!session, "Role:", userRole, "Loading:", loading)

  if (loading) {
    console.log("ProtectedRoute: Still loading, showing loading state")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!session || userRole !== 'admin') {
    console.log("ProtectedRoute: Access denied, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("ProtectedRoute: Access granted")
  return <Outlet />
}
