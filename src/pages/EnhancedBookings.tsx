import React, { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, AlertCircle, TrendingUp, Clock, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ServiceType, Booking } from '@/types/database'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { CityRideBooking } from '@/components/booking/CityRideBooking'
import { CarRentalBooking } from '@/components/booking/CarRentalBooking'
import { AirportBooking } from '@/components/booking/AirportBooking'
import { OutstationBooking } from '@/components/booking/OutstationBooking'
import { SharingBooking } from '@/components/booking/SharingBooking'
import { BookingFiltersAndSearch, BookingFilters } from '@/components/booking/BookingFiltersAndSearch'
import { BookingTable } from '@/components/booking/BookingTable'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export const EnhancedBookings: React.FC = () => {
  const navigate = useNavigate()
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<BookingFilters>({
    search: '',
    status: '',
    serviceType: '',
    timeRange: '',
    assignmentStatus: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [serviceTypesRes, bookingsRes] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true).order('display_name'),
        supabase.from('bookings').select(`
          *,
          service_type:service_types(*),
          rental_package:rental_packages(*),
          driver:drivers(*),
          vehicle:vehicles(*)
        `).order('created_at', { ascending: false })
      ])

      if (serviceTypesRes.error) throw serviceTypesRes.error
      if (bookingsRes.error) throw bookingsRes.error

      setServiceTypes(serviceTypesRes.data || [])
      setBookings(bookingsRes.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load booking data')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service.name)
  }

  const handleBooking = async (bookingData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('You must be logged in to create a booking')
        return
      }

      const serviceType = serviceTypes.find(s => s.name === bookingData.serviceType)
      if (!serviceType) {
        toast.error('Invalid service type')
        return
      }

      console.log('Creating booking with data:', bookingData)

      // Create booking in database
      const { data, error } = await supabase.from('bookings').insert([
        {
          user_id: user.id, // Required for RLS policies
          service_type_id: serviceType.id,
          pickup_address: bookingData.pickup || bookingData.pickupLocation,
          dropoff_address: bookingData.dropoff,
          pickup_latitude: bookingData.pickupCoordinates?.lat,
          pickup_longitude: bookingData.pickupCoordinates?.lng,
          dropoff_latitude: bookingData.dropoffCoordinates?.lat,
          dropoff_longitude: bookingData.dropoffCoordinates?.lng,
          fare_amount: bookingData.estimatedFare || 0,
          status: 'pending',
          is_scheduled: bookingData.isScheduled || false,
          scheduled_time: bookingData.scheduledTime,
          rental_package_id: bookingData.rentalPackageId,
          total_stops: bookingData.stops?.length || 0,
          package_hours: bookingData.packageHours,
          included_km: bookingData.includedKm
        }
      ]).select().single()

      if (error) {
        console.error('Booking creation error:', error)
        throw error
      }

      console.log('Booking created successfully:', data)

      // Create booking stops if it's a rental
      if (bookingData.stops && data) {
        const stops = bookingData.stops.map((stop: any) => ({
          booking_id: data.id,
          stop_order: stop.stopOrder,
          address: stop.address,
          latitude: stop.coordinates?.lat,
          longitude: stop.coordinates?.lng,
          estimated_duration_minutes: stop.duration,
          stop_type: stop.stopType
        }))

        const { error: stopsError } = await supabase.from('booking_stops').insert(stops)
        if (stopsError) {
          console.error('Stops creation error:', stopsError)
          throw stopsError
        }
      }

      toast.success('Booking created successfully!')
      setActiveTab('dashboard')
      fetchData()
    } catch (error: any) {
      console.error('Error creating booking:', error)
      toast.error(error.message || 'Failed to create booking')
    }
  }

  // Filter bookings based on current filters
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(searchTerm) ||
        booking.pickup_address?.toLowerCase().includes(searchTerm) ||
        booking.dropoff_address?.toLowerCase().includes(searchTerm) ||
        booking.driver?.full_name?.toLowerCase().includes(searchTerm) ||
        booking.vehicle?.license_plate?.toLowerCase().includes(searchTerm)
      )
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(booking => booking.status === filters.status)
    }

    // Service type filter
    if (filters.serviceType && filters.serviceType !== 'all') {
      filtered = filtered.filter(booking => booking.service_type?.name === filters.serviceType)
    }

    // Time range filter
    if (filters.timeRange && filters.timeRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (filters.timeRange) {
        case 'today':
          filtered = filtered.filter(booking => {
            const bookingDate = new Date(booking.created_at)
            return bookingDate >= today
          })
          break
        case 'upcoming':
          filtered = filtered.filter(booking => 
            booking.is_scheduled && 
            booking.scheduled_time && 
            new Date(booking.scheduled_time) > now
          )
          break
        case 'past_7_days':
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(booking => 
            new Date(booking.created_at) >= sevenDaysAgo
          )
          break
        case 'past_30_days':
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(booking => 
            new Date(booking.created_at) >= thirtyDaysAgo
          )
          break
      }
    }

    // Assignment status filter
    if (filters.assignmentStatus && filters.assignmentStatus !== 'all') {
      switch (filters.assignmentStatus) {
        case 'assigned':
          filtered = filtered.filter(booking => booking.driver_id && booking.vehicle_id)
          break
        case 'partial':
          filtered = filtered.filter(booking => 
            (booking.driver_id && !booking.vehicle_id) || 
            (!booking.driver_id && booking.vehicle_id)
          )
          break
        case 'unassigned':
          filtered = filtered.filter(booking => !booking.driver_id && !booking.vehicle_id)
          break
      }
    }

    return filtered
  }, [bookings, filters])

  // Calculate dashboard stats
  const dashboardStats = useMemo(() => {
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const activeBookings = bookings.filter(b => ['accepted', 'started'].includes(b.status)).length
    const unassignedBookings = bookings.filter(b => !b.driver_id || !b.vehicle_id).length
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.fare_amount, 0)

    return {
      totalBookings,
      pendingBookings,
      activeBookings,
      unassignedBookings,
      totalRevenue
    }
  }, [bookings])

  const handleAssignDriver = (bookingId: string) => {
    navigate(`/bookings/${bookingId}?tab=actions`)
  }

  const handleAssignVehicle = (bookingId: string) => {
    navigate(`/bookings/${bookingId}?tab=actions`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'started': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderBookingForm = () => {
    if (!selectedService) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Select a Service</CardTitle>
            <CardDescription>Choose the type of ride you want to book</CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceSelector
              services={serviceTypes}
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
            />
          </CardContent>
        </Card>
      )
    }

    switch (selectedService) {
      case 'city_ride':
        return <CityRideBooking onBook={handleBooking} />
      case 'car_rental':
        return <CarRentalBooking onBook={handleBooking} />
      case 'airport':
        return <AirportBooking onBook={handleBooking} />
      case 'outstation':
        return <OutstationBooking onBook={handleBooking} />
      case 'sharing':
        return <SharingBooking onBook={handleBooking} />
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Booking form for {serviceTypes.find(s => s.name === selectedService)?.display_name} coming soon!
              </p>
              <Button 
                variant="outline" 
                onClick={() => setSelectedService('')}
                className="mt-4"
              >
                Choose Different Service
              </Button>
            </CardContent>
          </Card>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600">Comprehensive booking dashboard with advanced filtering and lifecycle management</p>
        </div>
        <Button onClick={() => setActiveTab('new')} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Booking</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="new">New Booking</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.totalBookings}</p>
                    <p className="text-sm text-gray-500">Total Bookings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.pendingBookings}</p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.activeBookings}</p>
                    <p className="text-sm text-gray-500">Active</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats.unassignedBookings}</p>
                    <p className="text-sm text-gray-500">Unassigned</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center p-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{dashboardStats.totalRevenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <BookingFiltersAndSearch
            filters={filters}
            onFiltersChange={setFilters}
            serviceTypes={serviceTypes}
            resultsCount={filteredBookings.length}
          />

          {/* Booking Table */}
          <BookingTable
            bookings={filteredBookings}
            loading={loading}
            onAssignDriver={handleAssignDriver}
            onAssignVehicle={handleAssignVehicle}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          {renderBookingForm()}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <BookingFiltersAndSearch
            filters={{...filters, timeRange: 'upcoming'}}
            onFiltersChange={setFilters}
            serviceTypes={serviceTypes}
            resultsCount={bookings.filter(b => b.is_scheduled).length}
          />

          <BookingTable
            bookings={bookings.filter(b => b.is_scheduled)}
            loading={loading}
            onAssignDriver={handleAssignDriver}
            onAssignVehicle={handleAssignVehicle}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}