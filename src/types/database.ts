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
  assigned_driver_id?: string
  vendor_id?: string
  current_odometer?: number
  average_fuel_economy?: number
  monthly_distance?: number
  created_at: string
  updated_at: string
}

export interface VehicleDocument {
  id: string
  vehicle_id: string
  document_type: 'registration' | 'insurance' | 'pollution_certificate' | 'fitness_certificate'
  document_url?: string
  issue_date?: string
  expiry_date?: string
  verified: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface VehiclePerformance {
  id: string
  vehicle_id: string
  recorded_date: string
  odometer_reading?: number
  fuel_consumed?: number
  distance_traveled?: number
  fuel_economy?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface VehicleAlert {
  id: string
  vehicle_id: string
  alert_type: 'service_due' | 'document_expiry' | 'insurance_expiry' | 'pollution_expiry' | 'fitness_expiry' | 'custom'
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  is_resolved: boolean
  resolved_date?: string
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
  service_type?: string
  odometer_reading?: number
  next_service_due_date?: string
  next_service_due_km?: number
  work_performed?: string
  service_center?: string
  bill_document_url?: string
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