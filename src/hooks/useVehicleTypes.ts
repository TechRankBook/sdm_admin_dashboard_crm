import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface VehicleType {
  id: string
  name: string
  display_name: string
  capacity: number
  description?: string | null
  base_fare: number
  per_km_rate: number
  per_minute_rate?: number | null
  icon_emoji?: string | null
  is_active?: boolean | null
  sort_order?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateVehicleTypeData {
  name: string
  display_name: string
  capacity: number
  description?: string
  base_fare: number
  per_km_rate: number
  per_minute_rate?: number
  icon_emoji?: string
  is_active?: boolean
  sort_order?: number
}

export interface UpdateVehicleTypeData {
  name?: string
  display_name?: string
  capacity?: number
  description?: string
  base_fare?: number
  per_km_rate?: number
  per_minute_rate?: number
  icon_emoji?: string
  is_active?: boolean
  sort_order?: number
}

export const useVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVehicleTypes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('display_name', { ascending: true })

      if (error) throw error
      
      setVehicleTypes(data || [])
    } catch (error) {
      console.error('Error fetching vehicle types:', error)
      toast.error('Failed to fetch vehicle types')
    } finally {
      setLoading(false)
    }
  }

  const addVehicleType = async (vehicleTypeData: CreateVehicleTypeData) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .insert([{
          ...vehicleTypeData,
          icon_emoji: vehicleTypeData.icon_emoji || '🚗',
          is_active: vehicleTypeData.is_active ?? true,
          sort_order: vehicleTypeData.sort_order ?? 0
        }])
        .select()
        .single()

      if (error) throw error

      // Refetch to ensure proper ordering
      await fetchVehicleTypes()
      toast.success('Vehicle type added successfully')
      return data
    } catch (error) {
      console.error('Error adding vehicle type:', error)
      toast.error('Failed to add vehicle type')
      throw error
    }
  }

  const updateVehicleType = async (id: string, updates: UpdateVehicleTypeData) => {
    try {
      const { error } = await supabase
        .from('vehicle_types')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Refetch to ensure proper ordering and updated data
      await fetchVehicleTypes()
      toast.success('Vehicle type updated successfully')
      return true
    } catch (error) {
      console.error('Error updating vehicle type:', error)
      toast.error('Failed to update vehicle type')
      throw error
    }
  }

  const deleteVehicleType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_types')
        .delete()
        .eq('id', id)

      if (error) throw error

      setVehicleTypes(prev => prev.filter(type => type.id !== id))
      toast.success('Vehicle type deleted successfully')
    } catch (error) {
      console.error('Error deleting vehicle type:', error)
      toast.error('Failed to delete vehicle type')
      throw error
    }
  }

  useEffect(() => {
    fetchVehicleTypes()

    // Set up real-time subscription for vehicle_types changes
    const channel = supabase
      .channel('vehicle-types-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vehicle_types' },
        () => fetchVehicleTypes()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const toggleActiveStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('vehicle_types')
        .update({ is_active: isActive })
        .eq('id', id)

      if (error) throw error

      await fetchVehicleTypes()
      toast.success(`Vehicle type ${isActive ? 'activated' : 'deactivated'} successfully`)
      return true
    } catch (error) {
      console.error('Error toggling vehicle type status:', error)
      toast.error('Failed to update vehicle type status')
      throw error
    }
  }

  // Utility functions
  const getActiveVehicleTypes = () => vehicleTypes.filter(type => type.is_active !== false)
  const getInactiveVehicleTypes = () => vehicleTypes.filter(type => type.is_active === false)
  const getVehicleTypeByName = (name: string) => vehicleTypes.find(type => type.name === name)
  const getVehicleTypeById = (id: string) => vehicleTypes.find(type => type.id === id)

  return {
    vehicleTypes,
    loading,
    addVehicleType,
    updateVehicleType,
    deleteVehicleType,
    toggleActiveStatus,
    refetch: fetchVehicleTypes,
    // Utility getters
    activeVehicleTypes: getActiveVehicleTypes(),
    inactiveVehicleTypes: getInactiveVehicleTypes(),
    getVehicleTypeByName,
    getVehicleTypeById
  }
}