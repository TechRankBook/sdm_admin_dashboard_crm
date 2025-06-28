
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Car, FileText, Calendar, Phone, Mail, MapPin } from 'lucide-react'
import { Driver } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

interface DriverProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

interface Ride {
  id: string
  pickup_address: string
  dropoff_address: string
  fare_amount: number
  status: string
  created_at: string
  start_time: string
  end_time: string
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({ open, onOpenChange, driver }) => {
  const [rides, setRides] = useState<Ride[]>([])
  const [loading, setLoading] = useState(false)
  const [vehicle, setVehicle] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (driver && open) {
      fetchDriverRides()
      fetchVehicleDetails()
    }
  }, [driver, open])

  const fetchDriverRides = async () => {
    if (!driver) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_driver_rides', {
        driver_uuid: driver.id
      })

      if (error) throw error
      setRides(data?.slice(0, 5) || []) // Show only last 5 rides
    } catch (error) {
      console.error('Error fetching driver rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleDetails = async () => {
    if (!driver?.current_vehicle_id) return

    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', driver.current_vehicle_id)
        .single()

      if (error) throw error
      setVehicle(data)
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on_break':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleManageDocuments = () => {
    onOpenChange(false)
    navigate(`/documents?driver=${driver?.id}`)
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Profile</DialogTitle>
          <DialogDescription>Detailed information about {driver.full_name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Basic Info */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={driver.profile_picture_url || ''} />
              <AvatarFallback>
                {driver.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{driver.full_name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {driver.phone_no}
                </div>
                {driver.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {driver.email}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getStatusColor(driver.status || 'active')}>
                  {(driver.status || 'active').replace('_', ' ').toUpperCase()}
                </Badge>
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(driver.rating || 0))}
                  <span className="text-sm text-gray-500 ml-1">
                    ({(driver.rating || 0).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{driver.total_rides || 0}</div>
                <div className="text-sm text-gray-600">Total Rides</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {driver.joined_on ? new Date(driver.joined_on).getFullYear() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Year Joined</div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Information */}
          {vehicle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Assigned Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Make & Model</p>
                    <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">License Plate</p>
                    <p className="font-medium">{vehicle.license_plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-medium">{vehicle.color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="font-medium">{vehicle.capacity || 'N/A'} passengers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Rides */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Recent Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4">Loading rides...</p>
              ) : rides.length > 0 ? (
                <div className="space-y-3">
                  {rides.map((ride) => (
                    <div key={ride.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {ride.pickup_address} → {ride.dropoff_address}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(ride.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">₹{ride.fare_amount}</p>
                          <Badge className="text-xs">
                            {ride.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">No rides found</p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleManageDocuments}>
              <FileText className="h-4 w-4 mr-2" />
              Manage Documents
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
