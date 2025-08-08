import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Car, User, Phone, Star, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleWithDriver {
  id: string
  make: string
  model: string
  license_plate: string
  type: string
  status: string
  driver_id?: string
  driver_name?: string
  driver_phone?: string
  driver_status?: string
  driver_rating?: number
  driver_profile_picture?: string
}

interface BookingActionsTabProps {
  bookingId: string
  currentVehicleId?: string
  currentDriverId?: string
  onAssignmentUpdate: () => void
}

export const BookingActionsTab: React.FC<BookingActionsTabProps> = ({
  bookingId,
  currentVehicleId,
  currentDriverId,
  onAssignmentUpdate
}) => {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(currentVehicleId || '')

  useEffect(() => {
    fetchAvailableVehicles()
  }, [])

  const fetchAvailableVehicles = async () => {
    try {
      setLoading(true)
      
      const { data: vehiclesData, error } = await supabase
        .from('vehicles_with_driver_details')
        .select(`
          id,
          make,
          model,
          license_plate,
          type,
          status:vehicle_status,
          driver_id,
          driver_name,
          driver_phone,
          driver_status,
          driver_rating:rating,
          driver_profile_picture:driver_profile_picture_url
        `)
        .eq('vehicle_status', 'active')
        .eq('driver_status', 'active')
        .not('driver_id', 'is', null)
        .order('make', { ascending: true })

      if (error) throw error
      setVehicles(vehiclesData || [])
    } catch (error: any) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load available vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignVehicle = async () => {
    if (!selectedVehicleId) {
      toast.error('Please select a vehicle')
      return
    }

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)
    if (!selectedVehicle?.driver_id) {
      toast.error('Selected vehicle does not have a driver assigned')
      return
    }

    try {
      setAssigning(true)
      
      const { error } = await supabase
        .from('bookings')
        .update({
          vehicle_id: selectedVehicleId,
          driver_id: selectedVehicle.driver_id,
          status: 'accepted'
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Vehicle and driver assigned successfully!')
      onAssignmentUpdate()
    } catch (error: any) {
      console.error('Error assigning vehicle:', error)
      toast.error(error.message || 'Failed to assign vehicle')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'busy':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Vehicle Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Vehicle Assignment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Select Vehicle & Driver
            </label>
            <Select 
              value={selectedVehicleId} 
              onValueChange={setSelectedVehicleId}
              disabled={assigning}
            >
              <SelectTrigger className="w-full min-h-[60px] p-0 border-2 border-border">
                <SelectValue 
                  placeholder="Choose a vehicle with assigned driver"
                  className="p-4"
                />
              </SelectTrigger>
              <SelectContent className="max-w-[500px] max-h-[300px] bg-background border border-border shadow-xl z-[100]">
                {vehicles.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No available vehicles with drivers found
                  </div>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem 
                      key={vehicle.id} 
                      value={vehicle.id}
                      className="p-0 focus:bg-muted/50 cursor-pointer"
                    >
                      <div className="w-full p-4">
                        <div className="flex items-start space-x-4">
                          {/* Vehicle Section */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Car className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">
                                {vehicle.make} {vehicle.model}
                              </span>
                              <Badge className={`${getStatusColor(vehicle.status)} text-xs`}>
                                {vehicle.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {vehicle.license_plate} • {vehicle.type}
                            </div>
                          </div>

                          {/* Driver Section */}
                          {vehicle.driver_id && (
                            <div className="flex-1 border-l border-border/30 pl-4">
                              <div className="flex items-center space-x-2 mb-2">
                                {vehicle.driver_profile_picture ? (
                                  <img 
                                    src={vehicle.driver_profile_picture}
                                    alt={vehicle.driver_name}
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-muted-foreground" />
                                )}
                                <span className="font-medium text-sm">
                                  {vehicle.driver_name}
                                </span>
                                {vehicle.driver_rating && (
                                  <div className="flex items-center space-x-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-muted-foreground">
                                      {vehicle.driver_rating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {vehicle.driver_phone && (
                                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{vehicle.driver_phone}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleAssignVehicle}
            disabled={!selectedVehicleId || assigning}
            className="w-full"
          >
            {assigning ? 'Assigning...' : 'Assign Vehicle & Driver'}
          </Button>
        </CardContent>
      </Card>

      {/* Current Assignment Display */}
      {currentVehicleId && currentDriverId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Car className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">Vehicle & Driver Assigned</p>
                <p className="text-sm text-green-600">
                  This booking has been assigned to a vehicle and driver
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}