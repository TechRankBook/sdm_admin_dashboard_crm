
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, FileText, Car, Trash2 } from 'lucide-react'
import { Vehicle } from '@/types/database'

interface VehicleCardProps {
  vehicle: Vehicle
  getStatusColor: (status: string) => string
  getTypeDisplayName: (type: string) => string
  getStatusDisplayName: (status: string) => string
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  onViewServiceLogs: (vehicle: Vehicle) => void
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  getStatusColor,
  getTypeDisplayName,
  getStatusDisplayName,
  onEdit,
  onDelete,
  onViewServiceLogs
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              {vehicle.image_url ? (
                <img 
                  src={vehicle.image_url} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-500">{vehicle.license_plate}</p>
            </div>
          </div>
          <Badge className={getStatusColor(vehicle.status || 'active')}>
            {getStatusDisplayName(vehicle.status || 'active')}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          {vehicle.year && (
            <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
          )}
          {vehicle.color && (
            <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
          )}
          {vehicle.capacity && (
            <p className="text-sm text-gray-600">Capacity: {vehicle.capacity} passengers</p>
          )}
          {vehicle.type && (
            <p className="text-sm text-gray-600">Type: {getTypeDisplayName(vehicle.type)}</p>
          )}
          {vehicle.last_service_date && (
            <p className="text-sm text-gray-600">
              Last Service: {new Date(vehicle.last_service_date).toLocaleDateString()}
            </p>
          )}
          {vehicle.next_service_due_date && (
            <p className="text-sm text-gray-600">
              Next Service Due: {new Date(vehicle.next_service_due_date).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = `/vehicles/${vehicle.id}`}>
            <Car className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(vehicle)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(vehicle)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
