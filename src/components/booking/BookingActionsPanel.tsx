import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  UserPlus, 
  Car, 
  Edit, 
  X, 
  DollarSign, 
  Clock, 
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Booking, Driver, Vehicle } from '@/types/database'
import { toast } from 'sonner'

interface BookingActionsPanelProps {
  booking: Booking
  onUpdate: (bookingId: string) => void
}

export const BookingActionsPanel: React.FC<BookingActionsPanelProps> = ({ booking, onUpdate }) => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedDriver, setSelectedDriver] = useState<string>('')
  const [selectedVehicle, setSelectedVehicle] = useState<string>('')
  const [newStatus, setNewStatus] = useState<string>(booking.status)
  const [newFare, setNewFare] = useState<string>(booking.fare_amount.toString())
  const [fareReason, setFareReason] = useState<string>('')
  const [cancellationReason, setCancellationReason] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAvailableResources()
  }, [])

  const fetchAvailableResources = async () => {
    try {
      const [driversRes, vehiclesRes] = await Promise.all([
        supabase
          .from('drivers')
          .select('*')
          .eq('status', 'active')
          .order('full_name'),
        supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .is('assigned_driver_id', null)
          .order('make, model')
      ])

      if (driversRes.error) throw driversRes.error
      if (vehiclesRes.error) throw vehiclesRes.error

      setDrivers(driversRes.data || [])
      setVehicles(vehiclesRes.data || [])
      
      // Set current selections
      if (booking.driver_id) setSelectedDriver(booking.driver_id)
      if (booking.vehicle_id) setSelectedVehicle(booking.vehicle_id)
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load available drivers and vehicles')
    }
  }

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      toast.error('Please select a driver')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ driver_id: selectedDriver })
        .eq('id', booking.id)

      if (error) throw error

      toast.success('Driver assigned successfully')
      onUpdate(booking.id)
    } catch (error) {
      console.error('Error assigning driver:', error)
      toast.error('Failed to assign driver')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignVehicle = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ vehicle_id: selectedVehicle })
        .eq('id', booking.id)

      if (error) throw error

      // Update vehicle assignment
      await supabase
        .from('vehicles')
        .update({ assigned_driver_id: booking.driver_id })
        .eq('id', selectedVehicle)

      toast.success('Vehicle assigned successfully')
      onUpdate(booking.id)
    } catch (error) {
      console.error('Error assigning vehicle:', error)
      toast.error('Failed to assign vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (newStatus === booking.status) {
      toast.error('Status is already set to this value')
      return
    }

    setLoading(true)
    try {
      const updateData: any = { status: newStatus }
      
      // Add timestamps based on status
      if (newStatus === 'started' && !booking.start_time) {
        updateData.start_time = new Date().toISOString()
      } else if (newStatus === 'completed' && !booking.end_time) {
        updateData.end_time = new Date().toISOString()
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id)

      if (error) throw error

      toast.success('Booking status updated successfully')
      onUpdate(booking.id)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update booking status')
    } finally {
      setLoading(false)
    }
  }

  const handleFareUpdate = async () => {
    const fareAmount = parseFloat(newFare)
    if (isNaN(fareAmount) || fareAmount < 0) {
      toast.error('Please enter a valid fare amount')
      return
    }

    if (fareAmount === booking.fare_amount) {
      toast.error('Fare is already set to this amount')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ fare_amount: fareAmount })
        .eq('id', booking.id)

      if (error) throw error

      // TODO: Log fare change with reason
      toast.success('Fare updated successfully')
      onUpdate(booking.id)
      setFareReason('')
    } catch (error) {
      console.error('Error updating fare:', error)
      toast.error('Failed to update fare')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason')
      return
    }

    setLoading(true)
    try {
      // Update booking status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason 
        })
        .eq('id', booking.id)

      if (bookingError) throw bookingError

      // Create cancellation record
      const { error: cancellationError } = await supabase
        .from('booking_cancellations')
        .insert([{
          booking_id: booking.id,
          reason: cancellationReason,
          cancelled_at: new Date().toISOString()
        }])

      if (cancellationError) throw cancellationError

      toast.success('Booking cancelled successfully')
      onUpdate(booking.id)
      setCancellationReason('')
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  const canAssign = ['pending', 'accepted'].includes(booking.status)
  const canUpdateStatus = booking.status !== 'cancelled' && booking.status !== 'completed'
  const canEditFare = ['pending', 'completed'].includes(booking.status)
  const canCancel = !['cancelled', 'completed'].includes(booking.status)

  return (
    <div className="space-y-6">
      {/* Assignment Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Driver Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Driver Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.driver ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">
                  Currently assigned: {booking.driver.full_name}
                </p>
                <p className="text-sm text-green-600">
                  {booking.driver.phone_no} • {booking.driver.license_number}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800">No driver assigned</p>
              </div>
            )}
            
            {canAssign && (
              <>
                <div>
                  <Label htmlFor="driver-select">Select Driver</Label>
                  <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.full_name} - {driver.phone_no}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssignDriver}
                  disabled={loading || !selectedDriver}
                  className="w-full"
                >
                  {booking.driver ? 'Reassign Driver' : 'Assign Driver'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="w-5 h-5" />
              <span>Vehicle Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.vehicle ? (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">
                  Currently assigned: {booking.vehicle.make} {booking.vehicle.model}
                </p>
                <p className="text-sm text-green-600">
                  {booking.vehicle.license_plate}
                </p>
              </div>
            ) : (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-800">No vehicle assigned</p>
              </div>
            )}
            
            {canAssign && (
              <>
                <div>
                  <Label htmlFor="vehicle-select">Select Vehicle</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAssignVehicle}
                  disabled={loading || !selectedVehicle}
                  className="w-full"
                >
                  {booking.vehicle ? 'Reassign Vehicle' : 'Assign Vehicle'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Status Update</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="status-select">Current Status</Label>
              <Badge className="ml-2">{booking.status.toUpperCase()}</Badge>
            </div>
            
            {canUpdateStatus && (
              <>
                <div>
                  <Label htmlFor="status-select">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="started">Started</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="no_driver">No Driver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={loading || newStatus === booking.status}
                  className="w-full"
                >
                  Update Status
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Fare Edit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Fare Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current-fare">Current Fare</Label>
              <p className="text-2xl font-bold text-green-600">₹{booking.fare_amount}</p>
            </div>
            
            {canEditFare && (
              <>
                <div>
                  <Label htmlFor="new-fare">New Fare Amount</Label>
                  <Input
                    id="new-fare"
                    type="number"
                    value={newFare}
                    onChange={(e) => setNewFare(e.target.value)}
                    placeholder="Enter new fare"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="fare-reason">Reason (Optional)</Label>
                  <Input
                    id="fare-reason"
                    value={fareReason}
                    onChange={(e) => setFareReason(e.target.value)}
                    placeholder="Reason for fare change"
                  />
                </div>
                <Button 
                  onClick={handleFareUpdate}
                  disabled={loading || newFare === booking.fare_amount.toString()}
                  className="w-full"
                >
                  Update Fare
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cancel Booking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-5 h-5" />
              <span>Cancel Booking</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {booking.status === 'cancelled' ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-medium text-red-800">Booking is cancelled</p>
                {booking.cancellation_reason && (
                  <p className="text-sm text-red-600">
                    Reason: {booking.cancellation_reason}
                  </p>
                )}
              </div>
            ) : canCancel ? (
              <>
                <div>
                  <Label htmlFor="cancel-reason">Cancellation Reason</Label>
                  <Textarea
                    id="cancel-reason"
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Provide reason for cancellation"
                    rows={3}
                  />
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      disabled={!cancellationReason.trim()}
                    >
                      Cancel Booking
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <span>Cancel Booking</span>
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This action cannot be undone.
                        Cancellation charges may apply according to the booking terms.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCancelBooking}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Yes, Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600">
                  Booking cannot be cancelled in current status
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}