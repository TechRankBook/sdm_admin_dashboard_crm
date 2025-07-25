
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Driver } from '@/types/database'
import { toast } from 'sonner'

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(`
          *,
          users!inner (
            full_name,
            email,
            phone_no,
            profile_picture_url
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform the data to flatten user fields
      const transformedData = (data || []).map(driver => {
        const userData = (driver.users as any)
        return {
          ...driver,
          full_name: userData?.full_name || '',
          email: userData?.email || '',
          phone_no: userData?.phone_no || '',
          profile_picture_url: userData?.profile_picture_url || '',
          users: undefined // Remove the nested object
        }
      })
      
      setDrivers(transformedData)
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const updateDriver = async (driverId: string, updates: Partial<Driver>) => {
    try {
      // Separate driver-specific fields from user fields
      const { full_name, email, phone_no, profile_picture_url, ...driverUpdates } = updates
      
      // Update user fields if they exist
      if (full_name !== undefined || email !== undefined || phone_no !== undefined || profile_picture_url !== undefined) {
        const userUpdates: any = {}
        if (full_name !== undefined) userUpdates.full_name = full_name
        if (email !== undefined) userUpdates.email = email
        if (phone_no !== undefined) userUpdates.phone_no = phone_no
        if (profile_picture_url !== undefined) userUpdates.profile_picture_url = profile_picture_url
        
        const { error: userError } = await supabase
          .from('users')
          .update({
            ...userUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', driverId)
        
        if (userError) throw userError
      }
      
      // Update driver-specific fields if they exist
      if (Object.keys(driverUpdates).length > 0) {
        const { error: driverError } = await supabase
          .from('drivers')
          .update({
            ...driverUpdates,
            updated_at: new Date().toISOString()
          })
          .eq('id', driverId)
        
        if (driverError) throw driverError
      }

      // Refetch the updated driver data
      await fetchDrivers()
      
      toast.success('Driver updated successfully')
      return true
    } catch (error) {
      console.error('Error updating driver:', error)
      toast.error('Failed to update driver')
      throw error
    }
  }

  const deleteDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
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

      return publicUrl
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture')
      throw error
    }
  }

  useEffect(() => {
    fetchDrivers()

    // Set up real-time subscriptions for both drivers and users tables
    const driversChannel = supabase
      .channel('drivers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'drivers' },
        () => fetchDrivers()
      )
      .subscribe()
      
    const usersChannel = supabase
      .channel('users-drivers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'users' },
        () => fetchDrivers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(driversChannel)
      supabase.removeChannel(usersChannel)
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
