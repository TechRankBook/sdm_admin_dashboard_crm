
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export interface Driver {
  id: string
  full_name: string
  phone_number: string
  email?: string
  license_number: string
  profile_picture_url?: string
  kyc_status: 'pending' | 'approved' | 'rejected'
  status: 'active' | 'suspended' | 'on_ride' | 'offline'
  rating: number
  created_at: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year?: number
  license_plate: string
  color?: string
  capacity?: number
  type?: string
  status: 'active' | 'in_maintenance' | 'unavailable'
  image_url?: string
  created_at: string
}

export interface Ride {
  id: string
  customer_id?: string
  driver_id?: string
  vehicle_id?: string
  pickup_location: string
  dropoff_location: string
  fare_amount: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  start_time?: string
  end_time?: string
  booking_time: string
  driver?: Driver
}
