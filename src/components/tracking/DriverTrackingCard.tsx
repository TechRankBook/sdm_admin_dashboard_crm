import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Phone, Star, Navigation, Car } from 'lucide-react'

interface DriverTrackingCardProps {
  driver: {
    id: string
    full_name: string
    status: string
    current_latitude?: number
    current_longitude?: number
    phone_no: string
    rating?: number
  }
  booking?: {
    id: string
    pickup_address?: string
    dropoff_address?: string
    status: string
  }
  vehicle?: {
    make?: string
    model?: string
    type?: string
    license_plate?: string
  }
  onViewDetails: (driverId: string) => void
  onCallDriver: (phone: string) => void
}

export const DriverTrackingCard: React.FC<DriverTrackingCardProps> = ({
  driver,
  booking,
  vehicle,
  onViewDetails,
  onCallDriver
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'busy':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-yellow-100 text-yellow-800'
      case 'started':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatLastSeen = () => {
    // This would typically calculate based on last location update
    return 'Just now'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Driver Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{driver.full_name}</h4>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {driver.rating && (
                  <>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{driver.rating.toFixed(1)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(driver.status)} variant="outline">
            {driver.status.toUpperCase()}
          </Badge>
        </div>

        {/* Vehicle Info */}
        {vehicle && (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Car className="h-3 w-3" />
              <span>
                {vehicle.make} {vehicle.model} 
                {vehicle.license_plate && ` • ${vehicle.license_plate}`}
              </span>
            </div>
          </div>
        )}

        {/* Booking Info */}
        {booking && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Current Ride</span>
              <Badge className={getBookingStatusColor(booking.status)} variant="outline">
                {booking.status}
              </Badge>
            </div>
            
            {booking.pickup_address && (
              <div className="flex items-start space-x-1 text-xs">
                <MapPin className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">
                  {booking.pickup_address}
                </span>
              </div>
            )}
            
            {booking.dropoff_address && (
              <div className="flex items-start space-x-1 text-xs">
                <Navigation className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground line-clamp-2">
                  {booking.dropoff_address}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Location Status */}
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Last seen: {formatLastSeen()}</span>
          {driver.current_latitude && driver.current_longitude && (
            <div className="ml-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-7"
            onClick={() => onViewDetails(driver.id)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            Track
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs h-7"
            onClick={() => onCallDriver(driver.phone_no)}
          >
            <Phone className="h-3 w-3 mr-1" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}