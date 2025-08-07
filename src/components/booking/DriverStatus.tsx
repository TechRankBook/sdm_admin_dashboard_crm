import React from 'react'
import { Badge } from '@/components/ui/badge'
import { User, Phone, Star } from 'lucide-react'

interface Driver {
  id: string
  full_name: string
  phone_no?: string
  status: string
  rating?: number
  total_rides?: number
}

interface DriverStatusProps {
  driver: Driver
  showContact?: boolean
  compact?: boolean
}

export const DriverStatus: React.FC<DriverStatusProps> = ({ 
  driver, 
  showContact = false, 
  compact = false 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'busy':
      case 'on_trip':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{driver.full_name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(driver.status)} variant="outline">
            {driver.status}
          </Badge>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 border border-border rounded-lg bg-card">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{driver.full_name}</span>
        </div>
        <Badge className={getStatusColor(driver.status)} variant="outline">
          {driver.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-sm">
        {showContact && driver.phone_no && (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <Phone className="w-3 h-3" />
            <span>{driver.phone_no}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          {driver.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-muted-foreground">
                {driver.rating.toFixed(1)}
              </span>
            </div>
          )}
          {driver.total_rides && (
            <span className="text-muted-foreground">
              {driver.total_rides} rides
            </span>
          )}
        </div>
      </div>
    </div>
  )
}