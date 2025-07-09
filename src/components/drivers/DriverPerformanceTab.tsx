import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Star, Clock, MapPin, AlertTriangle, Award, Calendar } from 'lucide-react'
import { Driver } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface DriverPerformanceTabProps {
  driverId: string
  driver: Driver
  onPerformanceUpdated: () => void
}

interface TripStats {
  totalTrips: number
  completedTrips: number
  cancelledTrips: number
  avgRating: number
  totalEarnings: number
  monthlyTrips: number
  monthlyEarnings: number
}

interface RecentBooking {
  id: string
  pickup_address: string
  dropoff_address: string
  fare_amount: number
  status: string
  created_at: string
  start_time: string
  end_time: string
}

export const DriverPerformanceTab: React.FC<DriverPerformanceTabProps> = ({ 
  driverId, 
  driver,
  onPerformanceUpdated 
}) => {
  const [tripStats, setTripStats] = useState<TripStats>({
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    avgRating: 0,
    totalEarnings: 0,
    monthlyTrips: 0,
    monthlyEarnings: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPerformanceData()
  }, [driverId])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)

      // Fetch trip statistics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })

      if (bookingsError) throw bookingsError

      // Calculate statistics
      const totalTrips = bookings?.length || 0
      const completedTrips = bookings?.filter(b => b.status === 'completed').length || 0
      const cancelledTrips = bookings?.filter(b => b.status === 'cancelled').length || 0
      const totalEarnings = bookings?.reduce((sum, b) => sum + (b.fare_amount || 0), 0) || 0

      // Monthly statistics
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()
      const monthlyBookings = bookings?.filter(b => {
        const bookingDate = new Date(b.created_at)
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
      }) || []
      
      const monthlyTrips = monthlyBookings.length
      const monthlyEarnings = monthlyBookings.reduce((sum, b) => sum + (b.fare_amount || 0), 0)

      setTripStats({
        totalTrips,
        completedTrips,
        cancelledTrips,
        avgRating: driver.rating || 0,
        totalEarnings,
        monthlyTrips,
        monthlyEarnings
      })

      // Get recent bookings (last 10)
      setRecentBookings(bookings?.slice(0, 10) || [])

    } catch (error) {
      console.error('Error fetching performance data:', error)
      toast.error('Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'started':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const calculateCompletionRate = () => {
    if (tripStats.totalTrips === 0) return 0
    return (tripStats.completedTrips / tripStats.totalTrips) * 100
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Driver Performance & Trip Statistics</h2>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Total Trips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {tripStats.totalTrips.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Star className="w-4 h-4" />
              <span>Average Rating</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-yellow-600">
                {tripStats.avgRating.toFixed(1)}
              </p>
              <div className="flex">
                {renderStars(Math.floor(tripStats.avgRating))}
              </div>
            </div>
            <p className="text-sm text-gray-500">Customer feedback</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Award className="w-4 h-4" />
              <span>Completion Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {calculateCompletionRate().toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">
              {tripStats.completedTrips} of {tripStats.totalTrips} trips
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>This Month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600">
              {tripStats.monthlyTrips}
            </p>
            <p className="text-sm text-gray-500">
              ₹{tripStats.monthlyEarnings.toLocaleString()} earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Earnings Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Earnings:</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{tripStats.totalEarnings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Earnings:</span>
              <span className="text-lg font-semibold text-blue-600">
                ₹{tripStats.monthlyEarnings.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average per Trip:</span>
              <span className="text-lg font-medium">
                ₹{tripStats.totalTrips > 0 ? (tripStats.totalEarnings / tripStats.totalTrips).toFixed(0) : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Trip Status Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{tripStats.completedTrips}</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {calculateCompletionRate().toFixed(1)}%
                </Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{tripStats.cancelledTrips}</span>
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  {tripStats.totalTrips > 0 ? ((tripStats.cancelledTrips / tripStats.totalTrips) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </h4>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ₹{booking.fare_amount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">From:</span>
                      <span>{booking.pickup_address || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span className="text-gray-600">To:</span>
                      <span>{booking.dropoff_address || 'N/A'}</span>
                    </div>
                    
                    {booking.start_time && booking.end_time && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Duration:</span>
                        <span>
                          {Math.round((new Date(booking.end_time).getTime() - new Date(booking.start_time).getTime()) / (1000 * 60))} minutes
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Trip Data</h3>
              <p className="text-gray-500">This driver hasn't completed any trips yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}