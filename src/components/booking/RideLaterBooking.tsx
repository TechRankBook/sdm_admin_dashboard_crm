import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { GooglePlacesInput } from '@/components/ui/google-places-input'
import { CalendarIcon, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface RideLaterBookingProps {
  onBook: (bookingData: any) => void
}

export const RideLaterBooking: React.FC<RideLaterBookingProps> = ({ onBook }) => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    dropoff: '',
    pickupCoordinates: null as { lat: number; lng: number } | null,
    dropoffCoordinates: null as { lat: number; lng: number } | null,
    vehicleType: '',
    isScheduled: false,
    scheduledDate: undefined as Date | undefined,
    scheduledTime: ''
  })

  const handleScheduleToggle = (enabled: boolean) => {
    setBookingData(prev => ({
      ...prev,
      isScheduled: enabled,
      scheduledDate: enabled ? prev.scheduledDate : undefined,
      scheduledTime: enabled ? prev.scheduledTime : ''
    }))
  }

  const handleSubmit = () => {
    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.vehicleType) {
      toast.error('Please fill in all required fields: pickup location, dropoff location, and vehicle type')
      return
    }

    if (bookingData.isScheduled && (!bookingData.scheduledDate || !bookingData.scheduledTime)) {
      toast.error('Please select both date and time for scheduled rides')
      return
    }

    const scheduledDateTime = bookingData.isScheduled && bookingData.scheduledDate && bookingData.scheduledTime
      ? new Date(`${format(bookingData.scheduledDate, 'yyyy-MM-dd')}T${bookingData.scheduledTime}`)
      : null

    onBook({
      serviceType: 'ride_later',
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff,
      pickupCoordinates: bookingData.pickupCoordinates,
      dropoffCoordinates: bookingData.dropoffCoordinates,
      vehicleType: bookingData.vehicleType,
      isScheduled: bookingData.isScheduled,
      scheduledTime: scheduledDateTime?.toISOString(),
      estimatedFare: 150 // Basic fare calculation
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Ride Later Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pickup">Pickup Location</Label>
          <GooglePlacesInput
            id="pickup"
            value={bookingData.pickup}
            onChange={(address, coordinates) => 
              setBookingData(prev => ({ 
                ...prev, 
                pickup: address,
                pickupCoordinates: coordinates || null
              }))
            }
            placeholder="Enter pickup address"
          />
        </div>

        <div>
          <Label htmlFor="dropoff">Drop-off Location</Label>
          <GooglePlacesInput
            id="dropoff"
            value={bookingData.dropoff}
            onChange={(address, coordinates) => 
              setBookingData(prev => ({ 
                ...prev, 
                dropoff: address,
                dropoffCoordinates: coordinates || null
              }))
            }
            placeholder="Enter drop-off address"
          />
        </div>

        <div>
          <Label>Vehicle Type</Label>
          <Select value={bookingData.vehicleType} onValueChange={(value) => setBookingData(prev => ({ ...prev, vehicleType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="schedule"
            checked={bookingData.isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
          <Label htmlFor="schedule">Schedule for later (up to 48 hours)</Label>
        </div>

        {bookingData.isScheduled && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div>
              <Label>Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingData.scheduledDate ? format(bookingData.scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bookingData.scheduledDate}
                    onSelect={(date) => setBookingData(prev => ({ ...prev, scheduledDate: date }))}
                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 48 * 60 * 60 * 1000)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Select Time</Label>
              <Input
                id="time"
                type="time"
                value={bookingData.scheduledTime}
                onChange={(e) => setBookingData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              />
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Clock className="h-4 w-4 mr-2" />
          {bookingData.isScheduled ? 'Schedule Ride' : 'Book Now'}
        </Button>
      </CardContent>
    </Card>
  )
}