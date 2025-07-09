import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Eye, 
  User, 
  Car, 
  MapPin, 
  Clock, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  UserPlus,
  CarFront
} from 'lucide-react'
import { Booking } from '@/types/database'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

interface BookingTableProps {
  bookings: Booking[]
  loading: boolean
  onAssignDriver: (bookingId: string) => void
  onAssignVehicle: (bookingId: string) => void
}

export const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  loading,
  onAssignDriver,
  onAssignVehicle
}) => {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'started': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_driver': return 'bg-orange-100 text-orange-800 border-orange-200'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'started':
        return <Clock className="w-4 h-4 text-green-600" />
      default:
        return null
    }
  }

  const truncateAddress = (address: string, maxLength: number = 40) => {
    if (!address) return 'N/A'
    return address.length > maxLength ? `${address.substring(0, maxLength)}...` : address
  }

  const formatBookingId = (id: string) => {
    return `#${id.slice(0, 8)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Bookings...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-500">Try adjusting your filters or search criteria</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking List</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fare</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} className="hover:bg-gray-50">
                  {/* Booking ID */}
                  <TableCell className="font-mono text-sm">
                    {formatBookingId(booking.id)}
                  </TableCell>

                  {/* Service Type */}
                  <TableCell>
                    <Badge variant="outline">
                      {booking.service_type?.display_name || 'N/A'}
                    </Badge>
                  </TableCell>

                  {/* Customer */}
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {booking.user_id ? 'Customer' : 'Guest'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Driver */}
                  <TableCell>
                    {booking.driver ? (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{booking.driver.full_name}</p>
                          <p className="text-xs text-gray-500">{booking.driver.phone_no}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600">Unassigned</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Vehicle */}
                  <TableCell>
                    {booking.vehicle ? (
                      <div className="flex items-center space-x-2">
                        <Car className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">
                            {booking.vehicle.make} {booking.vehicle.model}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {booking.vehicle.license_plate}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span className="text-sm text-orange-600">Unassigned</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Route */}
                  <TableCell className="max-w-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {truncateAddress(booking.pickup_address || '')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">
                          {truncateAddress(booking.dropoff_address || '')}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Schedule */}
                  <TableCell>
                    <div className="text-xs">
                      {booking.is_scheduled && booking.scheduled_time ? (
                        <>
                          <Badge variant="secondary" className="mb-1">Scheduled</Badge>
                          <p>{format(new Date(booking.scheduled_time), 'MMM dd, HH:mm')}</p>
                        </>
                      ) : (
                        <span className="text-gray-500">Immediate</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(booking.status)}
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Payment */}
                  <TableCell>
                    <Badge className={getPaymentStatusColor(booking.payment_status || 'pending')}>
                      {(booking.payment_status || 'pending').toUpperCase()}
                    </Badge>
                  </TableCell>

                  {/* Fare */}
                  <TableCell>
                    <span className="font-semibold text-green-600">
                      ₹{booking.fare_amount}
                    </span>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      {!booking.driver && ['pending', 'accepted'].includes(booking.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignDriver(booking.id)}
                          title="Assign Driver"
                        >
                          <UserPlus className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      
                      {!booking.vehicle && ['pending', 'accepted'].includes(booking.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAssignVehicle(booking.id)}
                          title="Assign Vehicle"
                        >
                          <CarFront className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}