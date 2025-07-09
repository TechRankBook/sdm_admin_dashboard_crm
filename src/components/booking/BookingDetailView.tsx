import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, MapPin, User, Car, CreditCard, FileText, Clock, Phone, Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Booking, Driver, Vehicle, Customer } from '@/types/database'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { BookingActionsPanel } from './BookingActionsPanel'
import { BookingPaymentInfo } from './BookingPaymentInfo'
import { BookingAuditTrail } from './BookingAuditTrail'

export const BookingDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (id) {
      fetchBookingDetails(id)
    }
  }, [id])

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      // Fetch booking with all related data
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          *,
          service_type:service_types(*),
          rental_package:rental_packages(*),
          driver:drivers(*),
          vehicle:vehicles(*),
          stops:booking_stops(*),
          confirmations:booking_confirmations(*),
          payments:payments(*),
          cancellations:booking_cancellations(*)
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError) throw bookingError

      setBooking(bookingData)

      // Fetch customer details if user_id exists
      if (bookingData.user_id) {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', bookingData.user_id)
          .single()

        if (!customerError) {
          setCustomer(customerData)
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
      toast.error('Failed to load booking details')
    } finally {
      setLoading(false)
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded"></div>
                  <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Booking Not Found</h2>
        <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/bookings')}>
          Back to Bookings
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/bookings')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Booking Details</h1>
            <p className="text-gray-600">#{booking.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(booking.status)}>
            {booking.status?.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge className={getPaymentStatusColor(booking.payment_status || 'pending')}>
            {booking.payment_status?.toUpperCase() || 'PENDING'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
          <TabsTrigger value="driver">Driver & Vehicle</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* General Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>General Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Service Type</label>
                  <p className="font-semibold">{booking.service_type?.display_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Booking ID</label>
                  <p className="font-mono text-sm">{booking.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p>{format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                {booking.scheduled_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled Time</label>
                    <p>{format(new Date(booking.scheduled_time), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Fare Amount</label>
                  <p className="text-2xl font-bold text-green-600">₹{booking.fare_amount}</p>
                </div>
              </CardContent>
            </Card>

            {/* Location Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Location Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pickup Address</label>
                  <p className="text-sm">{booking.pickup_address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Drop-off Address</label>
                  <p className="text-sm">{booking.dropoff_address || 'N/A'}</p>
                </div>
                {booking.distance_km && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Distance</label>
                    <p>{booking.distance_km} km</p>
                  </div>
                )}
                {booking.total_stops > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Stops</label>
                    <p>{booking.total_stops}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trip Timing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Trip Timing</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {booking.start_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Start Time</label>
                    <p>{format(new Date(booking.start_time), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {booking.end_time && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">End Time</label>
                    <p>{format(new Date(booking.end_time), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                )}
                {booking.waiting_time_minutes > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Waiting Time</label>
                    <p>{booking.waiting_time_minutes} minutes</p>
                  </div>
                )}
                {booking.rental_package && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rental Package</label>
                    <p>{booking.rental_package.name}</p>
                    <p className="text-sm text-gray-500">
                      {booking.rental_package.duration_hours}h / {booking.rental_package.included_kilometers}km
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Cancellation Info */}
          {booking.cancellations && booking.cancellations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Cancellation Information</CardTitle>
              </CardHeader>
              <CardContent>
                {booking.cancellations.map((cancellation: any) => (
                  <div key={cancellation.id} className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reason</label>
                      <p>{cancellation.reason || 'No reason provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Cancelled At</label>
                      <p>{format(new Date(cancellation.cancelled_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="customer" className="space-y-6">
          {customer ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-semibold">{customer.full_name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone_no}</span>
                    </p>
                  </div>
                  {customer.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{customer.email}</span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loyalty Points</label>
                    <p>{customer.loyalty_points || 0} points</p>
                  </div>
                  {customer.preferred_payment_method && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Preferred Payment</label>
                      <p className="capitalize">{customer.preferred_payment_method}</p>
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <Button variant="outline" onClick={() => navigate(`/customers/${customer.id}`)}>
                    View Customer Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Customer information not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="driver" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Info */}
            {booking.driver ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Driver Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-semibold">{booking.driver.full_name}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p>{booking.driver.phone_no}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Number</label>
                      <p className="font-mono text-sm">{booking.driver.license_number}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rating</label>
                    <p>{booking.driver.rating?.toFixed(1) || 'N/A'} ⭐</p>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => navigate(`/drivers/${booking.driver.id}`)}>
                      View Driver Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No driver assigned</p>
                  <Button variant="outline">Assign Driver</Button>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Info */}
            {booking.vehicle ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Car className="w-5 h-5" />
                    <span>Vehicle Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vehicle</label>
                    <p className="text-lg font-semibold">
                      {booking.vehicle.make} {booking.vehicle.model}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Plate</label>
                      <p className="font-mono">{booking.vehicle.license_plate}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="capitalize">{booking.vehicle.type}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge variant={booking.vehicle.status === 'active' ? 'default' : 'secondary'}>
                      {booking.vehicle.status?.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => navigate(`/vehicles/${booking.vehicle.id}`)}>
                      View Vehicle Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No vehicle assigned</p>
                  <Button variant="outline">Assign Vehicle</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="payment">
          <BookingPaymentInfo booking={booking} onUpdate={fetchBookingDetails} />
        </TabsContent>

        <TabsContent value="actions">
          <BookingActionsPanel booking={booking} onUpdate={fetchBookingDetails} />
        </TabsContent>
      </Tabs>
    </div>
  )
}