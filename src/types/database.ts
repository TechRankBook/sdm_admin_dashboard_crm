
export interface Customer {
  id: string
  full_name: string
  phone_no: string
  email?: string
  profile_picture_url?: string
  loyalty_points?: number
  created_at: string
  updated_at: string
}

export interface Driver {
  id: string
  full_name: string
  phone_no: string
  email?: string
  license_number: string
  profile_picture_url?: string
  status: 'active' | 'suspended' | 'on_ride' | 'offline'
  rating: number
  total_rides?: number
  current_latitude?: number
  current_longitude?: number
  created_at: string
  updated_at: string
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
  updated_at: string
}

export interface Booking {
  id: string
  user_id?: string
  driver_id?: string
  vehicle_id?: string
  pickup_address?: string
  dropoff_address?: string
  pickup_latitude?: number
  pickup_longitude?: number
  dropoff_latitude?: number
  dropoff_longitude?: number
  fare_amount: number
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  payment_status?: 'pending' | 'completed' | 'failed'
  start_time?: string
  end_time?: string
  created_at: string
  updated_at: string
  driver?: Driver
}

export interface Admin {
  id: string
  full_name: string
  email: string
  phone_no: string
  profile_picture_url?: string
  can_approve_bookings?: boolean
  created_at: string
  updated_at: string
}
