
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { CalendarDays, Car, Users, DollarSign, Clock, AlertTriangle } from 'lucide-react'

interface DashboardStats {
  totalBookingsToday: number
  totalBookingsWeek: number
  totalBookingsMonth: number
  revenueToday: number
  revenueWeek: number
  revenueMonth: number
  activeDrivers: number
  pendingBookings: number
  ongoingBookings: number
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookingsToday: 0,
    totalBookingsWeek: 0,
    totalBookingsMonth: 0,
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    activeDrivers: 0,
    pendingBookings: 0,
    ongoingBookings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch bookings for different time periods
      const today = new Date().toISOString().split('T')[0]
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      const [bookingsResponse, driversResponse] = await Promise.all([
        supabase.from('bookings').select('*'),
        supabase.from('drivers').select('*')
      ])

      const bookings = bookingsResponse.data || []
      const drivers = driversResponse.data || []

      // Calculate stats
      const todayBookings = bookings.filter(booking => booking.created_at?.startsWith(today))
      const weekBookings = bookings.filter(booking => booking.created_at >= weekAgo)
      const monthBookings = bookings.filter(booking => booking.created_at >= monthAgo)

      setStats({
        totalBookingsToday: todayBookings.length,
        totalBookingsWeek: weekBookings.length,
        totalBookingsMonth: monthBookings.length,
        revenueToday: todayBookings.reduce((sum, booking) => sum + (booking.fare_amount || 0), 0),
        revenueWeek: weekBookings.reduce((sum, booking) => sum + (booking.fare_amount || 0), 0),
        revenueMonth: monthBookings.reduce((sum, booking) => sum + (booking.fare_amount || 0), 0),
        activeDrivers: drivers.filter(driver => driver.status === 'active').length,
        pendingBookings: bookings.filter(booking => booking.status === 'pending').length,
        ongoingBookings: bookings.filter(booking => booking.status === 'in_progress').length,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const kpiCards = [
    {
      title: 'Bookings Today',
      value: stats.totalBookingsToday,
      icon: CalendarDays,
      description: 'Total bookings completed today'
    },
    {
      title: 'Bookings This Week',
      value: stats.totalBookingsWeek,
      icon: CalendarDays,
      description: 'Total bookings this week'
    },
    {
      title: 'Bookings This Month',
      value: stats.totalBookingsMonth,
      icon: CalendarDays,
      description: 'Total bookings this month'
    },
    {
      title: 'Revenue Today',
      value: `$${stats.revenueToday.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total earnings today'
    },
    {
      title: 'Revenue This Week',
      value: `$${stats.revenueWeek.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total earnings this week'
    },
    {
      title: 'Revenue This Month',
      value: `$${stats.revenueMonth.toFixed(2)}`,
      icon: DollarSign,
      description: 'Total earnings this month'
    },
    {
      title: 'Active Drivers',
      value: stats.activeDrivers,
      icon: Users,
      description: 'Currently active drivers'
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Clock,
      description: 'Awaiting driver assignment'
    },
    {
      title: 'Ongoing Bookings',
      value: stats.ongoingBookings,
      icon: Car,
      description: 'Currently in progress'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your fleet operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            Alerts & Notifications
          </CardTitle>
          <CardDescription>
            Important items requiring your attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.pendingBookings > 0 && (
              <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Clock className="h-4 w-4 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    {stats.pendingBookings} pending bookings
                  </p>
                  <p className="text-xs text-amber-600">
                    Require driver assignment
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Car className="h-4 w-4 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  All systems operational
                </p>
                <p className="text-xs text-blue-600">
                  Fleet management running smoothly
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
