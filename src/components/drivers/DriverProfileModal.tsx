
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Star, Phone, Mail, CreditCard, MapPin, Car } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Driver, Vehicle } from '@/types/database'

interface DriverProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

export const DriverProfileModal: React.FC<DriverProfileModalProps> = ({ open, onOpenChange, driver }) => {
  const [assignedVehicles, setAssignedVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (driver && open) {
      fetchAssignedVehicles()
    }
  }, [driver, open])

  const fetchAssignedVehicles = async () => {
    if (!driver) return
    
    setLoading(true)
    try {
      // Fetch vehicles where current_driver_id matches this driver's ID
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('current_driver_id', driver.id)

      if (error) throw error
      
      setAssignedVehicles(data || [])
    } catch (error) {
      console.error('Error fetching assigned vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'offline':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Driver Profile</DialogTitle>
          <DialogDescription>
            View detailed information about this driver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Driver Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={driver.profile_picture_url || ''} />
              <AvatarFallback className="text-xl">
                {driver.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-xl font-semibold">{driver.full_name}</h2>
                <Badge className={getStatusColor(driver.status || 'active')}>
                  {(driver.status || 'active').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {renderStars(Math.floor(driver.rating || 0))}
                <span className="text-sm text-gray-500 ml-2">
                  ({(driver.rating || 0).toFixed(1)}) • {driver.total_rides || 0} rides
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Joined: {driver.joined_on ? new Date(driver.joined_on).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{driver.phone_no}</span>
              </div>
              {driver.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{driver.email}</span>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span>License: {driver.license_number}</span>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Vehicles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Assigned Vehicles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading vehicles...</p>
                </div>
              ) : assignedVehicles.length > 0 ? (
                <div className="space-y-3">
                  {assignedVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                        <p className="text-sm text-gray-600">
                          {vehicle.year} • {vehicle.color} • {vehicle.type}
                        </p>
                      </div>
                      <Badge variant="outline" className="font-mono">
                        {vehicle.license_plate}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No vehicles currently assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* KYC Status */}
          {driver.kyc_status && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">KYC Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant={driver.kyc_status === 'approved' ? 'default' : 'secondary'}>
                      {driver.kyc_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  {driver.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {driver.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Location */}
          {(driver.current_latitude && driver.current_longitude) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Current Location</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Lat: {driver.current_latitude}, Lng: {driver.current_longitude}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
