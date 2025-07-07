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
  status: 'active' | 'inactive' | 'on_break' | 'suspended' | 'on_ride' | 'offline'
  rating: number
  total_rides?: number
  current_latitude?: number
  current_longitude?: number
  current_vehicle_id?: string
  joined_on?: string
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'resubmission_requested'
  license_document_url?: string
  id_proof_document_url?: string
  rejection_reason?: string
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
  type?: 'sedan' | 'suv' | 'bike' | 'luxury' | 'van'
  status: 'active' | 'maintenance' | 'out_of_service' | 'in_maintenance' | 'unavailable'
  image_url?: string
  insurance_document_url?: string
  registration_document_url?: string
  pollution_certificate_url?: string
  last_service_date?: string
  next_service_due_date?: string
  current_driver_id?: string
  vendor_id?: string
  created_at: string
  updated_at: string
}

export interface VehicleMaintenanceLog {
  id: string
  vehicle_id: string
  maintenance_date: string
  description?: string
  cost?: number
  performed_by?: string
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
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled' | 'no_driver' | 'in_progress'
  payment_status?: 'pending' | 'paid' | 'failed' | 'completed'
  ride_type?: 'single' | 'shared' | 'rent'
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
  assigned_region?: string
  can_approve_bookings?: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  role: 'admin' | 'customer' | 'driver' | 'vendor'
  created_at: string
  updated_at: string
}
