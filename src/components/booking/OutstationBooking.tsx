import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { GooglePlacesInput } from '@/components/ui/google-places-input'
import { CalendarIcon, Clock, Navigation } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface OutstationBookingProps {
  onBook: (bookingData: any) => void
}

export const OutstationBooking: React.FC<OutstationBookingProps> = ({ onBook }) => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    dropoff: '',
    pickupCoordinates: null as { lat: number; lng: number } | null,
    dropoffCoordinates: null as { lat: number; lng: number } | null,
    tripType: '', // 'oneway' or 'roundtrip'
    vehicleType: '',
    departureDate: undefined as Date | undefined,
    departureTime: '',
    returnDate: undefined as Date | undefined,
    returnTime: ''
  })

  const handleSubmit = () => {
    if (!bookingData.pickup || !bookingData.dropoff || !bookingData.tripType || !bookingData.vehicleType || !bookingData.departureDate || !bookingData.departureTime) {
      toast.error('Please fill in all required fields')
      return
    }

    if (bookingData.tripType === 'roundtrip' && (!bookingData.returnDate || !bookingData.returnTime)) {
      toast.error('Please fill in return date and time for round trip')
      return
    }

    const departureDateTime = new Date(`${format(bookingData.departureDate, 'yyyy-MM-dd')}T${bookingData.departureTime}`)
    const returnDateTime = bookingData.tripType === 'roundtrip' && bookingData.returnDate && bookingData.returnTime
      ? new Date(`${format(bookingData.returnDate, 'yyyy-MM-dd')}T${bookingData.returnTime}`)
      : null

    onBook({
      serviceType: 'outstation',
      pickup: bookingData.pickup,
      dropoff: bookingData.dropoff,
      pickupCoordinates: bookingData.pickupCoordinates,
      dropoffCoordinates: bookingData.dropoffCoordinates,
      tripType: bookingData.tripType,
      vehicleType: bookingData.vehicleType,
      isScheduled: true,
      scheduledTime: departureDateTime.toISOString(),
      returnTime: returnDateTime?.toISOString(),
      estimatedFare: bookingData.tripType === 'roundtrip' ? 800 : 500
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Navigation className="h-5 w-5 mr-2" />
          Outstation Travel
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
              <SelectItem value="oneway">One Way</SelectItem>
              <SelectItem value="roundtrip">Round Trip</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="pickup">From City</Label>
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
            placeholder="Enter departure city"
          />
        </div>

        <div>
          <Label htmlFor="dropoff">To City</Label>
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
            placeholder="Enter destination city"
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

        <div className="space-y-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold">Departure Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {bookingData.departureDate ? format(bookingData.departureDate, 'PPP') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={bookingData.departureDate}
                    onSelect={(date) => setBookingData(prev => ({ ...prev, departureDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="departure-time">Departure Time</Label>
              <input
                id="departure-time"
                type="time"
                value={bookingData.departureTime}
                onChange={(e) => setBookingData(prev => ({ ...prev, departureTime: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {bookingData.tripType === 'roundtrip' && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">Return Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Return Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingData.returnDate ? format(bookingData.returnDate, 'PPP') : 'Pick date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingData.returnDate}
                      onSelect={(date) => setBookingData(prev => ({ ...prev, returnDate: date }))}
                      disabled={(date) => date < (bookingData.departureDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="return-time">Return Time</Label>
                <input
                  id="return-time"
                  type="time"
                  value={bookingData.returnTime}
                  onChange={(e) => setBookingData(prev => ({ ...prev, returnTime: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Clock className="h-4 w-4 mr-2" />
          Book Outstation Trip
        </Button>
      </CardContent>
    </Card>
  )
}