import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { GooglePlacesInput } from '@/components/ui/google-places-input'
import { Clock, Plus, X, MapPin } from 'lucide-react'
import { RentalPackage } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface CarRentalBookingProps {
  onBook: (bookingData: any) => void
}

interface Stop {
  id: string
  address: string
  coordinates?: { lat: number; lng: number }
  duration: number
}

export const CarRentalBooking: React.FC<CarRentalBookingProps> = ({ onBook }) => {
  const [rentalPackages, setRentalPackages] = useState<RentalPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<RentalPackage | null>(null)
  const [stops, setStops] = useState<Stop[]>([
    { id: '1', address: '', duration: 15 }
  ])
  const [pickupLocation, setPickupLocation] = useState('')
  const [pickupCoordinates, setPickupCoordinates] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    fetchRentalPackages()
  }, [])

  const fetchRentalPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_packages')
        .select('*')
        .eq('is_active', true)
        .order('duration_hours')

      if (error) throw error
      setRentalPackages(data || [])
    } catch (error) {
      console.error('Error fetching rental packages:', error)
      toast.error('Failed to load rental packages')
    }
  }

  const addStop = () => {
    const newStop = {
      id: Date.now().toString(),
      address: '',
      duration: 15
    }
    setStops(prev => [...prev, newStop])
  }

  const removeStop = (id: string) => {
    if (stops.length > 1) {
      setStops(prev => prev.filter(stop => stop.id !== id))
    }
  }

  const updateStop = (id: string, field: keyof Stop, value: string | number | { lat: number; lng: number }) => {
    setStops(prev => prev.map(stop => 
      stop.id === id ? { ...stop, [field]: value } : stop
    ))
  }

  const handleSubmit = () => {
    if (!selectedPackage || !pickupLocation || stops.some(stop => !stop.address)) {
      toast.error('Please fill in all required fields')
      return
    }

    onBook({
      serviceType: 'car_rental',
      rentalPackageId: selectedPackage.id,
      pickupLocation,
      pickupCoordinates,
      packageHours: selectedPackage.duration_hours,
      includedKm: selectedPackage.included_kilometers,
      estimatedFare: selectedPackage.base_price,
      stops: stops.map((stop, index) => ({
        ...stop,
        stopOrder: index + 1,
        stopType: index === 0 ? 'pickup' : index === stops.length - 1 ? 'dropoff' : 'intermediate'
      }))
    })
  }

  return (
    <div className="space-y-6">
      {/* Package Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Select Rental Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rentalPackages.map((package_) => (
              <Card
                key={package_.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage?.id === package_.id
                    ? 'ring-2 ring-primary border-primary'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPackage(package_)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{package_.name}</h3>
                    {selectedPackage?.id === package_.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>{package_.duration_hours} hours • {package_.included_kilometers}km included</p>
                    <p className="text-lg font-bold text-foreground">₹{package_.base_price}</p>
                    <p className="text-xs">Extra: ₹{package_.extra_km_rate}/km • ₹{package_.extra_hour_rate}/hour</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="pickup">Pickup Location</Label>
            <GooglePlacesInput
              id="pickup"
              value={pickupLocation}
              onChange={(address, coordinates) => {
                setPickupLocation(address)
                setPickupCoordinates(coordinates || null)
              }}
              placeholder="Enter pickup address"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label>Stops & Destinations</Label>
              <Button variant="outline" size="sm" onClick={addStop}>
                <Plus className="h-4 w-4 mr-1" />
                Add Stop
              </Button>
            </div>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <GooglePlacesInput
                      value={stop.address}
                      onChange={(address, coordinates) => {
                        updateStop(stop.id, 'address', address)
                        updateStop(stop.id, 'coordinates', coordinates || { lat: 0, lng: 0 })
                      }}
                      placeholder={`${index === 0 ? 'First stop' : index === stops.length - 1 ? 'Final destination' : 'Stop'} address`}
                    />
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      value={stop.duration}
                      onChange={(e) => updateStop(stop.id, 'duration', parseInt(e.target.value) || 15)}
                      placeholder="15"
                      min="5"
                      max="120"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">min</span>
                  {stops.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStop(stop.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              You can add or edit stops during your trip. Package upgrades may apply for longer distances.
            </p>
          </div>

          {selectedPackage && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Package Summary</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{selectedPackage.name}</span></p>
                <p>{selectedPackage.duration_hours} hours • {selectedPackage.included_kilometers}km • ₹{selectedPackage.base_price}</p>
                <p className="text-xs text-muted-foreground">
                  Cancellation: ₹{selectedPackage.cancellation_fee} • No-show: ₹{selectedPackage.no_show_fee}
                </p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            size="lg"
            disabled={!selectedPackage || !pickupLocation}
          >
            Book Rental
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}