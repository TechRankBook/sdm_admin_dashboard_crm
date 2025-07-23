
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('status', 'active')
        .order('make', { ascending: true })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()

    // Set up real-time subscription
    const channel = supabase
      .channel('vehicles-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vehicles' },
        () => fetchVehicles()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return { vehicles, loading, refetch: fetchVehicles }
}
