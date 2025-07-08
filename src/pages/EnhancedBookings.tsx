import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ServiceType, Booking } from '@/types/database'
import { ServiceSelector } from '@/components/booking/ServiceSelector'
import { CityRideBooking } from '@/components/booking/CityRideBooking'
import { CarRentalBooking } from '@/components/booking/CarRentalBooking'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

export const EnhancedBookings: React.FC = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedService, setSelectedService] = useState<string>('')
  const [activeTab, setActiveTab] = useState('new')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [serviceTypesRes, bookingsRes] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true),
        supabase.from('bookings').select(`
          *,
          service_type:service_types(*),
          rental_package:rental_packages(*),
          driver:drivers(full_name)
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
      const serviceType = serviceTypes.find(s => s.name === bookingData.serviceType)
      if (!serviceType) {
        toast.error('Invalid service type')
        return
      }

      // Create booking in database
      const { data, error } = await supabase.from('bookings').insert([
        {
          service_type_id: serviceType.id,
          pickup_address: bookingData.pickup || bookingData.pickupLocation,
          dropoff_address: bookingData.dropoff,
          fare_amount: 0, // Calculate based on pricing rules
          status: 'pending',
          is_scheduled: bookingData.isScheduled || false,
          scheduled_time: bookingData.scheduledTime,
          rental_package_id: bookingData.rentalPackageId,
          total_stops: bookingData.stops?.length || 0
        }
      ]).select().single()

      if (error) throw error

      // Create booking stops if it's a rental
      if (bookingData.stops && data) {
        const stops = bookingData.stops.map((stop: any) => ({
          booking_id: data.id,
          stop_order: stop.stopOrder,
          address: stop.address,
          estimated_duration_minutes: stop.duration,
          stop_type: stop.stopType
        }))

        const { error: stopsError } = await supabase.from('booking_stops').insert(stops)
        if (stopsError) throw stopsError
      }

      toast.success('Booking created successfully!')
      setActiveTab('history')
      fetchData()
    } catch (error) {
      console.error('Error creating booking:', error)
      toast.error('Failed to create booking')
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600">Create new bookings and manage existing ones across all services</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="new">New Booking</TabsTrigger>
            <TabsTrigger value="history">Booking History</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new" className="space-y-6">
          {renderBookingForm()}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No bookings found
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-mono text-sm text-gray-500">
                              #{booking.id.slice(0, 8)}
                            </span>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                            {booking.service_type && (
                              <Badge variant="outline">
                                {booking.service_type.display_name}
                              </Badge>
                            )}
                            {booking.is_scheduled && (
                              <Badge variant="secondary">Scheduled</Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Pickup</p>
                              <p className="font-medium">{booking.pickup_address || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Dropoff</p>
                              <p className="font-medium">{booking.dropoff_address || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Fare</p>
                              <p className="font-medium">₹{booking.fare_amount}</p>
                            </div>
                          </div>
                          {booking.driver && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Driver: <span className="font-medium">{booking.driver.full_name}</span>
                              </p>
                            </div>
                          )}
                          {booking.rental_package && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Package: <span className="font-medium">{booking.rental_package.name}</span>
                                {booking.total_stops > 0 && (
                                  <span className="ml-2">• {booking.total_stops} stops</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Bookings</CardTitle>
              <CardDescription>
                Bookings scheduled for future dates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bookings.filter(b => b.is_scheduled).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No scheduled bookings found
                  </div>
                ) : (
                  bookings
                    .filter(b => b.is_scheduled)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-mono text-sm text-gray-500">
                                #{booking.id.slice(0, 8)}
                              </span>
                              <Badge variant="secondary">
                                {booking.scheduled_time && 
                                  new Date(booking.scheduled_time).toLocaleString()
                                }
                              </Badge>
                              {booking.service_type && (
                                <Badge variant="outline">
                                  {booking.service_type.display_name}
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Pickup</p>
                                <p className="font-medium">{booking.pickup_address || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Dropoff</p>
                                <p className="font-medium">{booking.dropoff_address || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Fare</p>
                                <p className="font-medium">₹{booking.fare_amount}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              Modify
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}