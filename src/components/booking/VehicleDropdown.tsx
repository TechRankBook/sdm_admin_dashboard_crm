import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Car, User } from 'lucide-react'

interface VehicleWithDriver {
  id: string
  make: string
  model: string
  license_plate: string
  type: string
  status: string
  assigned_driver?: {
    id: string
    full_name: string
    status: string
    rating?: number
  }
}

interface VehicleDropdownProps {
  vehicles: VehicleWithDriver[]
  selectedValue: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export const VehicleDropdown: React.FC<VehicleDropdownProps> = ({
  vehicles,
  selectedValue,
  onValueChange,
  disabled = false,
  placeholder = "Select a vehicle"
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'busy':
      case 'on_trip':
        return 'bg-yellow-100 text-yellow-800'
      case 'offline':
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Only show vehicles that have a driver assigned and are available
  const eligibleVehicles = vehicles.filter(vehicle => 
    vehicle.assigned_driver && 
    vehicle.status === 'active' && 
    vehicle.assigned_driver.status === 'active'
  )

  return (
    <Select value={selectedValue} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border border-border shadow-lg">
        {eligibleVehicles.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No eligible vehicles available. Only vehicles with assigned drivers can be selected.
          </div>
        ) : (
          eligibleVehicles.map((vehicle) => (
            <SelectItem key={vehicle.id} value={vehicle.id} className="p-3">
              <div className="flex flex-col space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {vehicle.make} {vehicle.model}
                    </span>
                  </div>
                  <Badge className={getStatusColor(vehicle.status)} variant="outline">
                    {vehicle.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-mono">
                    {vehicle.license_plate}
                  </span>
                  <span className="text-muted-foreground capitalize">
                    {vehicle.type}
                  </span>
                </div>

                {vehicle.assigned_driver && (
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-border">
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {vehicle.assigned_driver.full_name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(vehicle.assigned_driver.status)} variant="outline">
                        {vehicle.assigned_driver.status}
                      </Badge>
                      {vehicle.assigned_driver.rating && (
                        <span className="text-xs text-muted-foreground">
                          ⭐ {vehicle.assigned_driver.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}