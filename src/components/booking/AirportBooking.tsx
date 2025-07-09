import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GooglePlacesInput } from '@/components/ui/google-places-input'
import { CalendarIcon, Clock, Plane } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface AirportBookingProps {
  onBook: (bookingData: any) => void
}

export const AirportBooking: React.FC<AirportBookingProps> = ({ onBook }) => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    dropoff: '',
    pickupCoordinates: null as { lat: number; lng: number } | null,
    dropoffCoordinates: null as { lat: number; lng: number } | null,
    tripType: '', // 'pickup' or 'drop'
    flightNumber: '',
    scheduledDate: undefined as Date | undefined,
    scheduledTime: ''
  })

  const handleSubmit = () => {
    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.tripType || !bookingData.scheduledDate || !bookingData.scheduledTime) {
      toast.error('Please fill in all required fields')
      return
    }

    const scheduledDateTime = new Date(`${format(bookingData.scheduledDate, 'yyyy-MM-dd')}T${bookingData.scheduledTime}`)

    onBook({
      serviceType: 'airport',
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff,
      pickupCoordinates: bookingData.pickupCoordinates,
      dropoffCoordinates: bookingData.dropoffCoordinates,
      tripType: bookingData.tripType,
      flightNumber: bookingData.flightNumber,
      isScheduled: true,
      scheduledTime: scheduledDateTime.toISOString(),
      estimatedFare: 300 // Airport rides typically cost more
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plane className="h-5 w-5 mr-2" />
          Airport Transfer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Trip Type</Label>
          <Select value={bookingData.tripType} onValueChange={(value) => setBookingData(prev => ({ ...prev, tripType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select trip type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pickup">Airport Pickup</SelectItem>
              <SelectItem value="drop">Airport Drop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pickup">
            {bookingData.tripType === 'pickup' ? 'Airport Terminal' : 'Pickup Location'}
          </Label>
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
            placeholder={bookingData.tripType === 'pickup' ? 'Select airport terminal' : 'Enter pickup address'}
          />
        </div>

        <div>
          <Label htmlFor="dropoff">
            {bookingData.tripType === 'pickup' ? 'Destination' : 'Airport Terminal'}
          </Label>
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
            placeholder={bookingData.tripType === 'pickup' ? 'Enter destination address' : 'Select airport terminal'}
          />
        </div>

        <div>
          <Label htmlFor="flight">Flight Number (Optional)</Label>
          <input
            id="flight"
            type="text"
            value={bookingData.flightNumber}
            onChange={(e) => setBookingData(prev => ({ ...prev, flightNumber: e.target.value }))}
            placeholder="e.g. AI 123"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <div>
            <Label>Travel Date</Label>
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
            <Label htmlFor="time">Travel Time</Label>
            <input
              id="time"
              type="time"
              value={bookingData.scheduledTime}
              onChange={(e) => setBookingData(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Clock className="h-4 w-4 mr-2" />
          Book Airport Transfer
        </Button>
      </CardContent>
    </Card>
  )
}