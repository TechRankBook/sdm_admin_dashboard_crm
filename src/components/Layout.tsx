
import React, { useState } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export const Layout: React.FC = () => {
  const { user, userRole, loading } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If not authenticated or not admin, redirect to login
  if (!user || userRole !== 'admin') {
    if (location.pathname !== '/login') {
      return <Navigate to="/login" replace />
    }
  }

  // If authenticated admin is on login page, redirect to dashboard
  if (user && userRole === 'admin' && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />
  }

  if (location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-gray-50 flex w-full">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
