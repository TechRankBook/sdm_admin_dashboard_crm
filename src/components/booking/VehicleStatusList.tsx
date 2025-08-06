import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Car, User, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DriverStatus } from './DriverStatus'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleWithDriver {
  id: string
  make: string
  model: string
  license_plate: string
  type: string
  status: string
  assigned_driver?: {
    id: string
    full_name: string
    phone_no?: string
    status: string
    rating?: number
    total_rides?: number
  }
}

interface UnassignedDriver {
  id: string
  full_name: string
  phone_no?: string
  status: string
  rating?: number
  total_rides?: number
}

interface VehicleStatusListProps {
  onRefresh?: () => void
}

export const VehicleStatusList: React.FC<VehicleStatusListProps> = ({ onRefresh }) => {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([])
  const [unassignedDrivers, setUnassignedDrivers] = useState<UnassignedDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  useEffect(() => {
    fetchVehicleAndDriverStatus()
    
    // Set up real-time subscriptions
    const vehiclesChannel = supabase
      .channel('vehicles-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehicleAndDriverStatus()
      })
      .subscribe()

    const driversChannel = supabase
      .channel('drivers-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        fetchVehicleAndDriverStatus()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(vehiclesChannel)
      supabase.removeChannel(driversChannel)
    }
  }, [])

  const fetchVehicleAndDriverStatus = async () => {
    try {
      setLoading(true)
      
      // Fetch vehicles with their assigned drivers
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          id,
          make,
          model,
          license_plate,
          type,
          status,
          assigned_driver_id,
          drivers:assigned_driver_id (
            id,
            status,
            rating,
            total_rides,
            users!inner (
              full_name,
              phone_no
            )
          )
        `)
        .order('make', { ascending: true })

      if (vehiclesError) throw vehiclesError

      // Process vehicles data
      const processedVehicles: VehicleWithDriver[] = vehiclesData.map(vehicle => {
        const driverData = vehicle.drivers as any
        return {
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          type: vehicle.type,
          status: vehicle.status,
          assigned_driver: driverData ? {
            id: driverData.id,
            full_name: driverData.users?.full_name || 'Unknown Driver',
            phone_no: driverData.users?.phone_no,
            status: driverData.status,
            rating: driverData.rating,
            total_rides: driverData.total_rides
          } : undefined
        }
      })

      // Fetch unassigned drivers
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select(`
          id,
          status,
          rating,
          total_rides,
          users!inner (
            full_name,
            phone_no
          )
        `)
        .not('id', 'in', `(${vehiclesData.filter(v => v.assigned_driver_id).map(v => v.assigned_driver_id).join(',') || 'null'})`)
        .order('users(full_name)', { ascending: true })

      if (driversError) throw driversError

      const processedUnassignedDrivers: UnassignedDriver[] = driversData.map(driver => {
        const userData = driver.users as any
        return {
          id: driver.id,
          full_name: userData?.full_name || 'Unknown Driver',
          phone_no: userData?.phone_no,
          status: driver.status,
          rating: driver.rating,
          total_rides: driver.total_rides
        }
      })

      setVehicles(processedVehicles)
      setUnassignedDrivers(processedUnassignedDrivers)
      setLastUpdate(new Date())
      
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error('Error fetching vehicle and driver status:', error)
      toast.error('Failed to load vehicle and driver status')
    } finally {
      setLoading(false)
    }
  }

  const getVehicleStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
      case 'in_maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_service':
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Loading Status...</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Car className="w-5 h-5" />
            <span>Fleet Status</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchVehicleAndDriverStatus}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vehicles Section */}
        <div>
          <h4 className="font-medium mb-3 flex items-center space-x-2">
            <Car className="w-4 h-4" />
            <span>Vehicles ({vehicles.length})</span>
          </h4>
          
          {vehicles.length === 0 ? (
            <div className="text-center py-6">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No vehicles found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-3 border border-border rounded-lg bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h5 className="font-medium">
                        {vehicle.make} {vehicle.model}
                      </h5>
                      <p className="text-sm text-muted-foreground font-mono">
                        {vehicle.license_plate} • {vehicle.type}
                      </p>
                    </div>
                    <Badge className={getVehicleStatusColor(vehicle.status)} variant="outline">
                      {vehicle.status}
                    </Badge>
                  </div>

                  {vehicle.assigned_driver ? (
                    <div className="pt-2 border-t border-border">
                      <DriverStatus driver={vehicle.assigned_driver} compact />
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>No driver assigned</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unassigned Drivers Section */}
        {unassignedDrivers.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Unassigned Drivers ({unassignedDrivers.length})</span>
              </h4>
              
              <div className="space-y-3">
                {unassignedDrivers.map((driver) => (
                  <DriverStatus 
                    key={driver.id} 
                    driver={driver} 
                    showContact={false}
                    compact={false}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}