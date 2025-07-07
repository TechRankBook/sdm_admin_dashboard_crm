import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Calendar, Gauge } from 'lucide-react'
import { Vehicle, Driver } from '@/types/database'
import { useVehicleUtils } from '@/hooks/useVehicleUtils'

interface VehicleInfoTabProps {
  vehicle: Vehicle
  driver: Driver | null
}

export const VehicleInfoTab: React.FC<VehicleInfoTabProps> = ({ vehicle, driver }) => {
  const { getStatusColor, getTypeDisplayName, getStatusDisplayName } = useVehicleUtils()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gauge className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Registration Number</label>
            <p className="text-lg font-semibold">{vehicle.license_plate}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Model</label>
            <p className="text-lg">{vehicle.make} {vehicle.model}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Year</label>
              <p>{vehicle.year || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Color</label>
              <p>{vehicle.color || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p>{getTypeDisplayName(vehicle.type || 'sedan')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Capacity</label>
              <p>{vehicle.capacity || 'N/A'} seats</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge className={getStatusColor(vehicle.status || 'active')}>
                {getStatusDisplayName(vehicle.status || 'active')}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Assigned Driver</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {driver ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold">{driver.full_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p>{driver.phone_no}</p>
              </div>
              {driver.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p>{driver.email}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">License Number</label>
                <p>{driver.license_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Rating</label>
                  <p>{driver.rating?.toFixed(1) || 'N/A'} ⭐</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Rides</label>
                  <p>{driver.total_rides || 0}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={driver.status === 'active' ? 'default' : 'secondary'}>
                    {driver.status}
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No driver assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Location & Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Performance & Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {driver?.current_latitude && driver?.current_longitude ? (
            <div>
              <label className="text-sm font-medium text-gray-500">Current Location</label>
              <p>Lat: {driver.current_latitude.toFixed(6)}</p>
              <p>Lng: {driver.current_longitude.toFixed(6)}</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-500">Current Location</label>
              <p className="text-gray-400">Location not available</p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Current Mileage</label>
            <p className="text-lg font-semibold">{vehicle.current_odometer?.toLocaleString() || 'N/A'} km</p>
          </div>
          
          {vehicle.average_fuel_economy && (
            <div>
              <label className="text-sm font-medium text-gray-500">Avg Fuel Economy</label>
              <p>{vehicle.average_fuel_economy} km/l</p>
            </div>
          )}
          
          {vehicle.monthly_distance && (
            <div>
              <label className="text-sm font-medium text-gray-500">Monthly Distance</label>
              <p>{vehicle.monthly_distance.toLocaleString()} km</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Information */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Service Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {vehicle.last_service_date && (
            <div>
              <label className="text-sm font-medium text-gray-500">Last Service</label>
              <p>{new Date(vehicle.last_service_date).toLocaleDateString()}</p>
            </div>
          )}
          
          {vehicle.next_service_due_date && (
            <div>
              <label className="text-sm font-medium text-gray-500">Next Service Due</label>
              <p className={`font-medium ${
                new Date(vehicle.next_service_due_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
                  ? 'text-red-600' 
                  : 'text-green-600'
              }`}>
                {new Date(vehicle.next_service_due_date).toLocaleDateString()}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Added On</label>
            <p>{new Date(vehicle.created_at).toLocaleDateString()}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p>{new Date(vehicle.updated_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}