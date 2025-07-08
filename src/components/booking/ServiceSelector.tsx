import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Clock, Plane, MapPin, Users } from 'lucide-react'
import { ServiceType } from '@/types/database'

interface ServiceSelectorProps {
  services: ServiceType[]
  selectedService?: string
  onServiceSelect: (service: ServiceType) => void
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onServiceSelect
}) => {
  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'city_ride': return <Car className="h-8 w-8" />
      case 'car_rental': return <Clock className="h-8 w-8" />
      case 'airport': return <Plane className="h-8 w-8" />
      case 'outstation': return <MapPin className="h-8 w-8" />
      case 'sharing': return <Users className="h-8 w-8" />
      default: return <Car className="h-8 w-8" />
    }
  }

  const getServiceFeatures = (serviceName: string) => {
    switch (serviceName) {
      case 'city_ride':
        return ['Schedule up to 48h ahead', 'Fixed pricing', 'Instant booking']
      case 'car_rental':
        return ['Hourly packages', 'Unlimited halts', 'Flexible stops']
      case 'airport':
        return ['Fixed routes', 'Instant pickup', 'Multiple payment options']
      case 'outstation':
        return ['One-way & round-trip', 'Long distance', 'Family travel']
      case 'sharing':
        return ['Shared rides', 'Split fare', 'Eco-friendly']
      default:
        return []
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
            selectedService === service.name
              ? 'ring-2 ring-primary border-primary'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onServiceSelect(service)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedService === service.name 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {getServiceIcon(service.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{service.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </div>
              </div>
              {selectedService === service.name && (
                <Badge variant="default">Selected</Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {getServiceFeatures(service.name).map((feature, index) => (
                <div key={index} className="flex items-center text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                  {feature}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}