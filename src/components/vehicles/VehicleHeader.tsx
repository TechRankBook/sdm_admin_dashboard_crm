
import React from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface VehicleHeaderProps {
  onAddVehicle: () => void
}

export const VehicleHeader: React.FC<VehicleHeaderProps> = ({ onAddVehicle }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
        <p className="text-gray-600">Manage and monitor all vehicles in your fleet</p>
      </div>
      <Button onClick={onAddVehicle}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Vehicle
      </Button>
    </div>
  )
}
