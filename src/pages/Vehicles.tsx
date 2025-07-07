
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'
import { toast } from 'sonner'
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal'
import { EditVehicleModal } from '@/components/vehicles/EditVehicleModal'
import { DeleteVehicleModal } from '@/components/vehicles/DeleteVehicleModal'
import { ServiceLogsModal } from '@/components/vehicles/ServiceLogsModal'
import { VehicleHeader } from '@/components/vehicles/VehicleHeader'
import { VehicleSearchAndFilter } from '@/components/vehicles/VehicleSearchAndFilter'
import { VehicleGrid } from '@/components/vehicles/VehicleGrid'
import { VehicleLoadingState } from '@/components/vehicles/VehicleLoadingState'
import { useVehicleFilters } from '@/hooks/useVehicleFilters'
import { useVehicleUtils } from '@/hooks/useVehicleUtils'

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showServiceLogsModal, setShowServiceLogsModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const { getStatusColor, getTypeDisplayName, getStatusDisplayName } = useVehicleUtils()
  const filteredVehicles = useVehicleFilters(vehicles, searchTerm, statusFilter)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log('Edit vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    console.log('Delete vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowDeleteModal(true)
  }

  const handleViewServiceLogs = (vehicle: Vehicle) => {
    console.log('View service logs for vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowServiceLogsModal(true)
  }

  if (loading) {
    return <VehicleLoadingState />
  }

  return (
    <div className="space-y-6">
      <VehicleHeader onAddVehicle={() => setShowAddModal(true)} />

      <VehicleSearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        getStatusDisplayName={getStatusDisplayName}
      />

      <VehicleGrid
        vehicles={filteredVehicles}
        getStatusColor={getStatusColor}
        getTypeDisplayName={getTypeDisplayName}
        getStatusDisplayName={getStatusDisplayName}
        onEdit={handleEditVehicle}
        onDelete={handleDeleteVehicle}
        onViewServiceLogs={handleViewServiceLogs}
      />

      {/* Modals */}
      <AddVehicleModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onVehicleAdded={fetchVehicles}
      />
      
      <EditVehicleModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        vehicle={selectedVehicle}
        onVehicleUpdated={fetchVehicles}
      />
      
      <DeleteVehicleModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        vehicle={selectedVehicle}
        onVehicleDeleted={fetchVehicles}
      />
      
      <ServiceLogsModal 
        open={showServiceLogsModal} 
        onOpenChange={setShowServiceLogsModal}
        vehicle={selectedVehicle}
      />
    </div>
  )
}
