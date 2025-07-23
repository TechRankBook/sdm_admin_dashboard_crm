import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export interface Booking {
  id: string
  user_id: string
  driver_id?: string
  vehicle_id?: string
  pickup_address?: string
  dropoff_address?: string
  status: string
  fare_amount?: number
  created_at: string
  start_time?: string
  end_time?: string
  ride_type?: string
  distance_km?: number
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to fetch bookings')
    } finally {
      setLoading(false)
    }
  }

  const updateBooking = async (bookingId: string, updates: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select()
        .single()

      if (error) throw error

      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, ...data } : booking
      ))
      toast.success('Booking updated successfully')
      return data
    } catch (error) {
      console.error('Error updating booking:', error)
      toast.error('Failed to update booking')
      throw error
    }
  }

  const deleteBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      setBookings(prev => prev.filter(booking => booking.id !== bookingId))
      toast.success('Booking deleted successfully')
    } catch (error) {
      console.error('Error deleting booking:', error)
      toast.error('Failed to delete booking')
      throw error
    }
  }

  useEffect(() => {
    fetchBookings()

    // Set up real-time subscription
    const channel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchBookings()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    bookings,
    loading,
    updateBooking,
    deleteBooking,
    refetch: fetchBookings
  }
}