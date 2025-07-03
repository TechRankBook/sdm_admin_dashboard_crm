
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
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDrivers(data || [])
    } catch (error) {
      console.error('Error fetching drivers:', error)
      toast.error('Failed to fetch drivers')
    } finally {
      setLoading(false)
    }
  }

  const updateDriver = async (driverId: string, updates: Partial<Driver>) => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)
        .select()
        .single()

      if (error) throw error

      setDrivers(prev => prev.map(driver => 
        driver.id === driverId ? { ...driver, ...data } : driver
      ))
      toast.success('Driver updated successfully')
      return data
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

    // Set up real-time subscription
    const channel = supabase
      .channel('drivers-changes')
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
