import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Enhanced Driver interface that includes unified data
export interface UnifiedDriver {
  id: string
  // Common fields from users table
  full_name: string
  email: string
  phone_no: string
  profile_picture_url?: string
  role: string
  status: string
  created_at: string
  updated_at: string
  // Driver-specific fields from drivers table
  license_number: string
  total_rides: number
  rating: number
  current_latitude?: number
  current_longitude?: number
  kyc_status: string
  joined_on: string
  driver_status: string
  license_document_url?: string
  id_proof_document_url?: string
  rejection_reason?: string
}

export const useDriversUnified = () => {
  const [drivers, setDrivers] = useState<UnifiedDriver[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          drivers!inner(
            license_number,
            total_rides,
            rating,
            current_latitude,
            current_longitude,
            kyc_status,
            joined_on,
            status,
            license_document_url,
            id_proof_document_url,
            rejection_reason
          )
        `)
        .eq('role', 'driver')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to unified driver format
      const unifiedDrivers = (data as any)
        ?.filter((user: any) => user.drivers && user.drivers.length > 0)
        .map((user: any) => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_no: user.phone_no,
          profile_picture_url: user.profile_picture_url,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          updated_at: user.updated_at,
          license_number: user.drivers[0].license_number,
          total_rides: user.drivers[0].total_rides || 0,
          rating: user.drivers[0].rating || 0,
          current_latitude: user.drivers[0].current_latitude,
          current_longitude: user.drivers[0].current_longitude,
          kyc_status: user.drivers[0].kyc_status || 'pending',
          joined_on: user.drivers[0].joined_on,
          driver_status: user.drivers[0].status || 'active',
          license_document_url: user.drivers[0].license_document_url,
          id_proof_document_url: user.drivers[0].id_proof_document_url,
          rejection_reason: user.drivers[0].rejection_reason
        })) || []

      setDrivers(unifiedDrivers)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const updateDriver = async (driverId: string, updates: Partial<UnifiedDriver>) => {
    try {
      // Separate common fields from driver-specific fields
      const commonFields = {
        full_name: updates.full_name,
        email: updates.email,
        phone_no: updates.phone_no,
        profile_picture_url: updates.profile_picture_url,
        status: updates.status,
        updated_at: new Date().toISOString()
      }

      const driverFields = {
        license_number: updates.license_number,
        rating: updates.rating,
        total_rides: updates.total_rides,
        current_latitude: updates.current_latitude,
        current_longitude: updates.current_longitude,
        kyc_status: updates.kyc_status,
        status: updates.driver_status,
        license_document_url: updates.license_document_url,
        id_proof_document_url: updates.id_proof_document_url,
        rejection_reason: updates.rejection_reason,
        updated_at: new Date().toISOString()
      }

      // Update users table
      if (Object.values(commonFields).some(value => value !== undefined)) {
        const { error: usersError } = await supabase
          .from('users')
          .update(commonFields)
          .eq('id', driverId)

        if (usersError) throw usersError
      }

      // Update drivers table
      if (Object.values(driverFields).some(value => value !== undefined)) {
        const { error: driversError } = await supabase
          .from('drivers')
          .update(driverFields)
          .eq('id', driverId)

        if (driversError) throw driversError
      }

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId ? { ...driver, ...updates } : driver
      ))
      toast.success('Driver updated successfully')
    } catch (error) {
      console.error('Error updating driver:', error)
      toast.error('Failed to update driver')
      throw error
    }
  }

  const deleteDriver = async (driverId: string) => {
    try {
      // Soft delete by updating status
      const { error } = await supabase
        .from('users')
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) throw error

      setDrivers(prev => prev.filter(driver => driver.id !== driverId))
      toast.success('Driver deleted successfully')
    } catch (error) {
      console.error('Error deleting driver:', error)
      toast.error('Failed to delete driver')
      throw error
    }
  }

  const uploadProfilePicture = async (file: File, driverId: string) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${driverId}-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('drivers-profile-pictures')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('drivers-profile-pictures')
        .getPublicUrl(fileName)

      // Update profile picture URL in users table
      await updateDriver(driverId, { profile_picture_url: publicUrl })

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture')
      throw error
    }
  }

  useEffect(() => {
    fetchDrivers()

    // Set up real-time subscription
    const channel = supabase
      .channel('unified-drivers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users', filter: 'role=eq.driver' },
        () => fetchDrivers()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchDrivers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    drivers,
    loading,
    updateDriver,
    deleteDriver,
    uploadProfilePicture,
    refetch: fetchDrivers
  }
}