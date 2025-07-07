
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Vehicle } from '@/types/database'
import { VehicleCard } from './VehicleCard'

interface VehicleGridProps {
  vehicles: Vehicle[]
  getStatusColor: (status: string) => string
  getTypeDisplayName: (type: string) => string
  getStatusDisplayName: (status: string) => string
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  onViewServiceLogs: (vehicle: Vehicle) => void
}

export const VehicleGrid: React.FC<VehicleGridProps> = ({
  vehicles,
  getStatusColor,
  getTypeDisplayName,
  getStatusDisplayName,
  onEdit,
  onDelete,
  onViewServiceLogs
}) => {
  if (vehicles.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No vehicles found matching your criteria</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          getStatusColor={getStatusColor}
          getTypeDisplayName={getTypeDisplayName}
          getStatusDisplayName={getStatusDisplayName}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewServiceLogs={onViewServiceLogs}
        />
      ))}
    </div>
  )
}
