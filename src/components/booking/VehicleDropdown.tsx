import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Car, User, ChevronDown } from 'lucide-react'

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
    phone_no?: string
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

  // Find selected vehicle for display in trigger
  const selectedVehicle = eligibleVehicles.find(v => v.id === selectedValue)

  return (
    <div className="w-full space-y-2">
      <Select value={selectedValue} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full min-h-[72px] p-0 border-2 border-border hover:border-primary/50 transition-colors duration-200 bg-background/50 hover:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary">
          <div className="flex items-center w-full px-4 py-3">
            {selectedVehicle ? (
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                {/* Vehicle Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                </div>
                
                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {selectedVehicle.make} {selectedVehicle.model}
                    </h3>
                    <Badge 
                      className={`${getStatusColor(selectedVehicle.status)} text-xs flex-shrink-0`} 
                      variant="outline"
                    >
                      {selectedVehicle.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {selectedVehicle.license_plate}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedVehicle.type}
                    </span>
                    {selectedVehicle.assigned_driver && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-[150px]">
                            {selectedVehicle.assigned_driver.full_name}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Car className="w-6 h-6 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <SelectValue placeholder={
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-muted-foreground">
                        {placeholder}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Choose from {eligibleVehicles.length} available vehicles
                      </div>
                    </div>
                  } />
                </div>
              </div>
            )}
          </div>
        </SelectTrigger>
      <SelectContent 
        className="min-w-[450px] max-w-[650px] max-h-[200px] bg-background border border-border shadow-xl z-[100]"
        position="popper"
        side="bottom"
        align="start"
        sideOffset={8}
        avoidCollisions={true}
      >
        <div className="max-h-[200px] overflow-y-auto">
          {eligibleVehicles.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No eligible vehicles available. Only vehicles with assigned drivers can be selected.
            </div>
          ) : (
          eligibleVehicles.map((vehicle) => {
            const isSelected = vehicle.id === selectedValue;
            return (
              <SelectItem 
                key={vehicle.id} 
                value={vehicle.id} 
                className={`p-0 focus:bg-muted/50 data-[highlighted]:bg-muted/50 cursor-pointer ${
                  isSelected ? 'bg-primary/5 border-l-4 border-primary' : ''
                }`}
              >
                <div className="w-full p-4">
                  <div className="flex flex-wrap items-start justify-between">
                    {/* Vehicle Section */}
                    <div className="grid grid-cols-12 gap-1 items-start">
                      <div className="col-span-1">
                        <Car className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="col-span-11">
                        <div className={`font-medium text-sm leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {vehicle.license_plate} • {vehicle.type}
                        </div>
                      </div>
                    </div>

                    {/* Driver Section */}
                    {vehicle.assigned_driver && (
                      <div className="border-t border-border/30">
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-1">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                          <div className="col-span-10">
                            <div className="text-sm text-muted-foreground leading-tight">
                              {vehicle.assigned_driver.full_name}
                            </div>
                            {vehicle.assigned_driver.phone_no && (
                              <div className="text-xs text-muted-foreground mt-1">
                                📞 {vehicle.assigned_driver.phone_no}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })
        )}
        </div>
      </SelectContent>
    </Select>
    </div>
  )
}