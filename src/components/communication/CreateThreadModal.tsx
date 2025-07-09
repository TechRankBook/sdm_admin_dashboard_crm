import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Customer {
  id: string
  full_name: string
  phone_no: string
  email?: string
}

interface Driver {
  id: string
  full_name: string
  phone_no: string
  email?: string
}

interface Booking {
  id: string
  pickup_address?: string
  dropoff_address?: string
  status?: string
  customer?: Customer
  driver?: Driver
}

interface CreateThreadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onThreadCreated: (threadId: string) => void
}

export const CreateThreadModal: React.FC<CreateThreadModalProps> = ({
  open,
  onOpenChange,
  onThreadCreated
}) => {
  const [formData, setFormData] = useState({
    thread_type: 'chat' as 'chat' | 'support' | 'booking',
    subject: '',
    message: '',
    customer_id: '',
    driver_id: '',
    booking_id: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent'
  })
  
  const [customers, setCustomers] = useState<Customer[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchUsers()
    }
  }, [open])

  const fetchUsers = async () => {
    try {
      // Fetch customers
      const { data: customersData } = await supabase
        .from('customers')
        .select('id, full_name, phone_no, email')
        .order('full_name')

      // Fetch drivers
      const { data: driversData } = await supabase
        .from('drivers')
        .select('id, full_name, phone_no, email')
        .order('full_name')

      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id, pickup_address, dropoff_address, status,
          customer:customers!bookings_user_id_fkey(id, full_name, phone_no),
          driver:drivers!bookings_driver_id_fkey(id, full_name, phone_no)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      setCustomers(customersData || [])
      setDrivers(driversData || [])
      setBookings((bookingsData || []).map(booking => ({
        ...booking,
        customer: Array.isArray(booking.customer) ? booking.customer[0] : booking.customer,
        driver: Array.isArray(booking.driver) ? booking.driver[0] : booking.driver
      })))
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreate = async () => {
    if (!formData.message.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!formData.customer_id && !formData.driver_id) {
      toast.error('Please select a customer or driver')
      return
    }

    setLoading(true)
    try {
      // Create thread
      const { data: thread, error: threadError } = await supabase
        .from('communication_threads')
        .insert({
          thread_type: formData.thread_type,
          subject: formData.subject || null,
          customer_id: formData.customer_id || null,
          driver_id: formData.driver_id || null,
          booking_id: formData.booking_id || null,
          priority: formData.priority,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single()

      if (threadError) throw threadError

      // Send initial message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: thread.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          sender_type: 'admin',
          content: formData.message,
          read_by: [(await supabase.auth.getUser()).data.user?.id]
        })

      if (messageError) throw messageError

      toast.success('Conversation created successfully')
      onThreadCreated(thread.id)
      onOpenChange(false)
      resetForm()
    } catch (error: any) {
      toast.error('Failed to create conversation')
      console.error('Error creating thread:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      thread_type: 'chat',
      subject: '',
      message: '',
      customer_id: '',
      driver_id: '',
      booking_id: '',
      priority: 'normal'
    })
  }

  const handleBookingSelect = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (booking) {
      setFormData(prev => ({
        ...prev,
        booking_id: bookingId,
        customer_id: booking.customer?.id || '',
        driver_id: booking.driver?.id || ''
      }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
          <DialogDescription>
            Create a new conversation with a customer or driver
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="thread_type">Type</Label>
              <Select 
                value={formData.thread_type} 
                onValueChange={(value: 'chat' | 'support' | 'booking') => 
                  setFormData(prev => ({ ...prev, thread_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">Chat</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="booking">Booking Related</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: 'low' | 'normal' | 'high' | 'urgent') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.thread_type === 'booking' && (
            <div>
              <Label htmlFor="booking">Related Booking</Label>
              <Select 
                value={formData.booking_id} 
                onValueChange={handleBookingSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookings.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      #{booking.id.slice(0, 8)} - {booking.pickup_address} → {booking.dropoff_address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select 
              value={formData.customer_id} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, customer_id: value, driver_id: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.phone_no}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="driver">Driver</Label>
            <Select 
              value={formData.driver_id} 
              onValueChange={(value) => 
                setFormData(prev => ({ ...prev, driver_id: value, customer_id: '' }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select driver" />
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

          <div>
            <Label htmlFor="subject">Subject (Optional)</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject"
            />
          </div>

          <div>
            <Label htmlFor="message">Initial Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Type your message..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Conversation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}