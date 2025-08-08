import { useState, useEffect, useCallback } from 'react'
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

export const useVehicleAssignment = () => {
  const [vehicles, setVehicles] = useState<VehicleWithDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVehiclesWithDrivers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles_with_driver_details')
        .select(`
          id,
          make,
          model,
          license_plate,
          type,
          status,
          assigned_driver_id,
          driver_id,
          driver_name,
          driver_phone,
          driver_status,
          driver_rating,
          total_rides
        `)
        .order('make', { ascending: true })

      if (vehiclesError) throw vehiclesError

      const processedVehicles: VehicleWithDriver[] = vehiclesData.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        license_plate: vehicle.license_plate,
        type: vehicle.type,
        status: vehicle.status,
        assigned_driver: vehicle.driver_id ? {
          id: vehicle.driver_id,
          full_name: vehicle.driver_name || 'Unknown Driver',
          phone_no: vehicle.driver_phone,
          status: vehicle.driver_status,
          rating: vehicle.driver_rating,
          total_rides: vehicle.total_rides
        } : undefined
      }))

      setVehicles(processedVehicles)
    } catch (err: any) {
      console.error('Error fetching vehicles with drivers:', err)
      setError(err.message || 'Failed to load vehicles')
      toast.error('Failed to load vehicles and drivers')
    } finally {
      setLoading(false)
    }
  }, [])

  const assignVehicleToBooking = useCallback(async (bookingId: string, vehicleId: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId)
      if (!vehicle?.assigned_driver) {
        throw new Error('Selected vehicle does not have a driver assigned')
      }

      const { error } = await supabase
        .from('bookings')
        .update({ 
          vehicle_id: vehicleId,
          driver_id: vehicle.assigned_driver.id
        })
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Vehicle and driver assigned successfully')
      return true
    } catch (err: any) {
      console.error('Error assigning vehicle:', err)
      toast.error(err.message || 'Failed to assign vehicle')
      return false
    }
  }, [vehicles])

  const getEligibleVehicles = useCallback(() => {
    return vehicles.filter(vehicle => 
      vehicle.assigned_driver && 
      vehicle.status === 'active' && 
      vehicle.assigned_driver.status === 'active'
    )
  }, [vehicles])

  const getVehicleById = useCallback((vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId)
  }, [vehicles])

  useEffect(() => {
    fetchVehiclesWithDrivers()

    // Set up real-time subscriptions
    const vehiclesChannel = supabase
      .channel('vehicles-assignment')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => {
        fetchVehiclesWithDrivers()
      })
      .subscribe()

    const driversChannel = supabase
      .channel('drivers-assignment')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drivers' }, () => {
        fetchVehiclesWithDrivers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(vehiclesChannel)
      supabase.removeChannel(driversChannel)
    }
  }, [fetchVehiclesWithDrivers])

  return {
    vehicles,
    loading,
    error,
    assignVehicleToBooking,
    getEligibleVehicles,
    getVehicleById,
    refetch: fetchVehiclesWithDrivers
  }
}