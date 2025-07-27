import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Car, Trash2, FileText, Calendar } from 'lucide-react'
import { Vehicle } from '@/types/database'
import { useNavigate } from 'react-router-dom'

interface VehicleListViewProps {
  vehicles: Vehicle[]
  getStatusColor: (status: string) => string
  getTypeDisplayName: (type: string) => string
  getStatusDisplayName: (status: string) => string
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
  onViewServiceLogs: (vehicle: Vehicle) => void
}

export const VehicleListView: React.FC<VehicleListViewProps> = ({
  vehicles,
  getStatusColor,
  getTypeDisplayName,
  getStatusDisplayName,
  onEdit,
  onDelete,
  onViewServiceLogs
}) => {
  const navigate = useNavigate()

  const handleViewVehicle = (vehicle: Vehicle) => {
    navigate(`/vehicles/${vehicle.id}`)
  }

  if (vehicles.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500">No vehicles found matching your criteria</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[250px]">Vehicle</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Type</TableHead>
            <TableHead className="w-[80px]">Year</TableHead>
            <TableHead className="w-[100px]">Capacity</TableHead>
            <TableHead className="w-[150px]">Service Info</TableHead>
            <TableHead className="w-[140px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-sm text-gray-500">{vehicle.license_plate}</div>
                    {vehicle.color && (
                      <div className="text-xs text-gray-400">{vehicle.color}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(vehicle.status || 'active')}>
                  {getStatusDisplayName(vehicle.status || 'active')}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {vehicle.type ? getTypeDisplayName(vehicle.type) : 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {vehicle.year || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {vehicle.capacity ? `${vehicle.capacity} pax` : 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <div className="text-xs space-y-1">
                  {vehicle.last_service_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Last: {new Date(vehicle.last_service_date).toLocaleDateString()}
                    </div>
                  )}
                  {vehicle.next_service_due_date && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 mr-1" />
                      Next: {new Date(vehicle.next_service_due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleViewVehicle(vehicle)}
                    className="h-8 w-8 p-0"
                  >
                    <Car className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onViewServiceLogs(vehicle)}
                    className="h-8 w-8 p-0"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(vehicle)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(vehicle)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}