import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Switch } from '@/components/ui/switch'
import { CalendarIcon, Clock, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface CityRideBookingProps {
  onBook: (bookingData: any) => void
}

export const CityRideBooking: React.FC<CityRideBookingProps> = ({ onBook }) => {
  const [bookingData, setBookingData] = useState({
    pickup: '',
    dropoff: '',
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
      return
    }

    const scheduledDateTime = bookingData.isScheduled && bookingData.scheduledDate && bookingData.scheduledTime
      ? new Date(`${format(bookingData.scheduledDate, 'yyyy-MM-dd')}T${bookingData.scheduledTime}`)
      : null

    onBook({
      serviceType: 'city_ride',
      ...bookingData,
      scheduledTime: scheduledDateTime?.toISOString()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          City Ride Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pickup">Pickup Location</Label>
          <Input
            id="pickup"
            value={bookingData.pickup}
            onChange={(e) => setBookingData(prev => ({ ...prev, pickup: e.target.value }))}
            placeholder="Enter pickup address"
          />
        </div>

        <div>
          <Label htmlFor="dropoff">Drop-off Location</Label>
          <Input
            id="dropoff"
            value={bookingData.dropoff}
            onChange={(e) => setBookingData(prev => ({ ...prev, dropoff: e.target.value }))}
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