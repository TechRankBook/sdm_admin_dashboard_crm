import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Calendar, Star, Car, CreditCard } from 'lucide-react'
import { Driver, Vehicle } from '@/types/database'

interface DriverInfoTabProps {
  driver: Driver
  assignedVehicle: Vehicle | null
}

export const DriverInfoTab: React.FC<DriverInfoTabProps> = ({ driver, assignedVehicle }) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Full Name</label>
            <p className="text-lg font-semibold">{driver.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Phone Number</label>
            <p className="text-lg">{driver.phone_no}</p>
          </div>
          {driver.email && (
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p>{driver.email}</p>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-500">License Number</label>
            <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {driver.license_number}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={driver.status === 'active' ? 'default' : 'secondary'}>
                {(driver.status || 'active').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">KYC Status</label>
            <div className="mt-1">
              <Badge variant={driver.kyc_status === 'approved' ? 'default' : 'secondary'}>
                {(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Vehicle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Assigned Vehicle</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {assignedVehicle ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Vehicle</label>
                <p className="text-lg font-semibold">
                  {assignedVehicle.make} {assignedVehicle.model}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">License Plate</label>
                <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                  {assignedVehicle.license_plate}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="capitalize">{assignedVehicle.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Color</label>
                  <p className="capitalize">{assignedVehicle.color}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge variant={assignedVehicle.status === 'active' ? 'default' : 'secondary'}>
                    {(assignedVehicle.status || 'active').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No vehicle assigned</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance & Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>Performance & Ratings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Overall Rating</label>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                {renderStars(Math.floor(driver.rating || 0))}
              </div>
              <span className="text-lg font-semibold">
                {(driver.rating || 0).toFixed(1)}
              </span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Total Rides</label>
            <p className="text-2xl font-bold text-blue-600">
              {(driver.total_rides || 0).toLocaleString()}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Driver Since</label>
            <p>
              {driver.joined_on 
                ? new Date(driver.joined_on).toLocaleDateString()
                : 'N/A'
              }
            </p>
          </div>
          
          {driver.current_latitude && driver.current_longitude && (
            <div>
              <label className="text-sm font-medium text-gray-500">Last Known Location</label>
              <p className="text-xs font-mono">
                Lat: {driver.current_latitude.toFixed(6)}<br />
                Lng: {driver.current_longitude.toFixed(6)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Account Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Account Created</label>
            <p>{new Date(driver.created_at).toLocaleDateString()}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p>{new Date(driver.updated_at).toLocaleDateString()}</p>
          </div>
          
          {driver.rejection_reason && (
            <div>
              <label className="text-sm font-medium text-red-500">Rejection Reason</label>
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                {driver.rejection_reason}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}