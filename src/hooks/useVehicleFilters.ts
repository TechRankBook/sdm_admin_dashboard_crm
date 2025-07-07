
import { useMemo } from 'react'
import { Vehicle } from '@/types/database'

export const useVehicleFilters = (vehicles: Vehicle[], searchTerm: string, statusFilter: string) => {
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const matchesSearch = (vehicle.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (vehicle.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (vehicle.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      let matchesStatus = false
      if (statusFilter === 'all') {
        matchesStatus = true
      } else if (statusFilter === 'maintenance') {
        matchesStatus = vehicle.status === 'maintenance' || vehicle.status === 'in_maintenance'
      } else if (statusFilter === 'out_of_service') {
        matchesStatus = vehicle.status === 'out_of_service' || vehicle.status === 'unavailable'
      } else {
        matchesStatus = vehicle.status === statusFilter
      }
      
      return matchesSearch && matchesStatus
    })
  }, [vehicles, searchTerm, statusFilter])

  return filteredVehicles
}
