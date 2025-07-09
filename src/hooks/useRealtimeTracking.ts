import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface TrackingData {
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
    pickup_latitude?: number
    pickup_longitude?: number
    dropoff_latitude?: number
    dropoff_longitude?: number
    status: string
  }
  vehicle?: {
    make?: string
    model?: string
    type?: string
    license_plate?: string
  }
}

export const useRealtimeTracking = () => {
  const [trackingData, setTrackingData] = useState<TrackingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchTrackingData = useCallback(async () => {
    try {
      setError(null)
      
      // Fetch drivers with active bookings
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select(`
          id,
          full_name,
          status,
          current_latitude,
          current_longitude,
          phone_no,
          rating
        `)
        .eq('status', 'active')

      if (driversError) throw driversError

      // Fetch active bookings with vehicle details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          driver_id,
          pickup_address,
          dropoff_address,
          pickup_latitude,
          pickup_longitude,
          dropoff_latitude,
          dropoff_longitude,
          status,
          vehicle_id,
          vehicles (
            make,
            model,
            type,
            license_plate
          )
        `)
        .in('status', ['accepted', 'started'])

      if (bookingsError) throw bookingsError

      // Combine driver and booking data
      const combinedData: TrackingData[] = driversData.map(driver => {
        const driverBooking = bookingsData.find(booking => booking.driver_id === driver.id)
        
        return {
          driver: {
            id: driver.id,
            full_name: driver.full_name,
            status: driver.status,
            current_latitude: driver.current_latitude,
            current_longitude: driver.current_longitude,
            phone_no: driver.phone_no,
            rating: driver.rating
          },
          booking: driverBooking ? {
            id: driverBooking.id,
            pickup_address: driverBooking.pickup_address,
            dropoff_address: driverBooking.dropoff_address,
            pickup_latitude: driverBooking.pickup_latitude,
            pickup_longitude: driverBooking.pickup_longitude,
            dropoff_latitude: driverBooking.dropoff_latitude,
            dropoff_longitude: driverBooking.dropoff_longitude,
            status: driverBooking.status
          } : undefined,
          vehicle: driverBooking?.vehicles ? {
            make: (driverBooking.vehicles as any)?.make,
            model: (driverBooking.vehicles as any)?.model,
            type: (driverBooking.vehicles as any)?.type,
            license_plate: (driverBooking.vehicles as any)?.license_plate
          } : undefined
        }
      })

      setTrackingData(combinedData)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.error('Error fetching tracking data:', err)
      setError(err.message || 'Failed to fetch tracking data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Set up real-time subscriptions
  useEffect(() => {
    fetchTrackingData()

    // Subscribe to driver location updates
    const driversChannel = supabase
      .channel('drivers-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers',
          filter: 'status=eq.active'
        },
        (payload) => {
          console.log('Driver update:', payload)
          fetchTrackingData()
        }
      )
      .subscribe()

    // Subscribe to booking updates
    const bookingsChannel = supabase
      .channel('bookings-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log('Booking update:', payload)
          fetchTrackingData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(driversChannel)
      supabase.removeChannel(bookingsChannel)
    }
  }, [fetchTrackingData])

  const refreshData = useCallback(() => {
    setLoading(true)
    fetchTrackingData()
  }, [fetchTrackingData])

  const updateDriverLocation = useCallback(async (driverId: string, latitude: number, longitude: number) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          current_latitude: latitude,
          current_longitude: longitude
        })
        .eq('id', driverId)

      if (error) throw error
    } catch (err: any) {
      console.error('Error updating driver location:', err)
      setError(err.message || 'Failed to update location')
    }
  }, [])

  const getDriverById = useCallback((driverId: string) => {
    return trackingData.find(data => data.driver.id === driverId)
  }, [trackingData])

  const getActiveDriversCount = useCallback(() => {
    return trackingData.filter(data => data.driver.status === 'active').length
  }, [trackingData])

  const getOnRideDriversCount = useCallback(() => {
    return trackingData.filter(data => data.booking?.status === 'started').length
  }, [trackingData])

  return {
    trackingData,
    loading,
    error,
    lastUpdate,
    refreshData,
    updateDriverLocation,
    getDriverById,
    getActiveDriversCount,
    getOnRideDriversCount
  }
}