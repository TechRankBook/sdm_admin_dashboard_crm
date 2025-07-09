import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { GooglePlacesInput } from '@/components/ui/google-places-input'
import { CalendarIcon, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface SharingBookingProps {
  onBook: (bookingData: any) => void
}

export const SharingBooking: React.FC<SharingBookingProps> = ({ onBook }) => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    dropoff: '',
    pickupCoordinates: null as { lat: number; lng: number } | null,
    dropoffCoordinates: null as { lat: number; lng: number } | null,
    passengerCount: 1,
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
    if (!bookingData.pickup || !bookingData.dropoff) {
      toast.error('Please fill in pickup and dropoff locations')
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
      serviceType: 'sharing',
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff,
      pickupCoordinates: bookingData.pickupCoordinates,
      dropoffCoordinates: bookingData.dropoffCoordinates,
      passengerCount: bookingData.passengerCount,
      isScheduled: bookingData.isScheduled,
      scheduledTime: scheduledDateTime?.toISOString(),
      estimatedFare: Math.round(120 / bookingData.passengerCount) // Shared fare
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Shared Ride
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
          <Label>Number of Passengers</Label>
          <Select 
            value={bookingData.passengerCount.toString()} 
            onValueChange={(value) => setBookingData(prev => ({ ...prev, passengerCount: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select passenger count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Passenger</SelectItem>
              <SelectItem value="2">2 Passengers</SelectItem>
              <SelectItem value="3">3 Passengers</SelectItem>
              <SelectItem value="4">4 Passengers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="schedule"
            checked={bookingData.isScheduled}
            onCheckedChange={handleScheduleToggle}
          />
          <Label htmlFor="schedule">Schedule for later</Label>
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
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="time">Select Time</Label>
              <input
                id="time"
                type="time"
                value={bookingData.scheduledTime}
                onChange={(e) => setBookingData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900">Sharing Benefits</h4>
          <ul className="text-sm text-blue-700 mt-2 space-y-1">
            <li>• Split fare with other passengers</li>
            <li>• Eco-friendly travel option</li>
            <li>• Meet new people on your route</li>
            <li>• Estimated fare: ₹{Math.round(120 / bookingData.passengerCount)} per person</li>
          </ul>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Clock className="h-4 w-4 mr-2" />
          {bookingData.isScheduled ? 'Schedule Shared Ride' : 'Find Shared Ride'}
        </Button>
      </CardContent>
    </Card>
  )
}