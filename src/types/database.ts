export interface Customer {
  id: string
  full_name: string
  phone_no: string
  email?: string
  profile_picture_url?: string
  loyalty_points?: number
  preferred_payment_method?: string
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

export interface ServiceType {
  id: string
  name: 'city_ride' | 'car_rental' | 'airport' | 'outstation' | 'sharing'
  display_name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PricingRule {
  id: string
  service_type_id: string
  vehicle_type: string
  base_fare: number
  per_km_rate: number
  per_minute_rate?: number
  minimum_fare: number
  surge_multiplier: number
  cancellation_fee: number
  no_show_fee: number
  waiting_charges_per_minute: number
  free_waiting_time_minutes: number
  is_active: boolean
  effective_from?: string
  effective_until?: string
  created_at: string
  updated_at: string
}

export interface RentalPackage {
  id: string
  name: string
  vehicle_type: string
  duration_hours: number
  included_kilometers: number
  base_price: number
  extra_km_rate: number
  extra_hour_rate: number
  cancellation_fee: number
  no_show_fee: number
  waiting_limit_minutes: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ZonePricing {
  id: string
  service_type_id: string
  zone_name: string
  from_location: string
  to_location: string
  vehicle_type: string
  fixed_price?: number
  base_price?: number
  per_km_rate?: number
  estimated_distance_km?: number
  estimated_duration_minutes?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingStop {
  id: string
  booking_id: string
  stop_order: number
  address: string
  latitude?: number
  longitude?: number
  estimated_duration_minutes: number
  actual_arrival_time?: string
  actual_departure_time?: string
  stop_type: 'pickup' | 'intermediate' | 'dropoff'
  is_completed: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface SharedBooking {
  id: string
  sharing_group_id: string
  primary_booking_id: string
  passenger_booking_id: string
  shared_fare_amount: number
  fare_split_percentage: number
  pickup_sequence: number
  dropoff_sequence: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface BookingSchedule {
  id: string
  booking_id: string
  scheduled_for: string
  time_slot_start: string
  time_slot_end: string
  reminder_sent: boolean
  driver_assigned_at?: string
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed'
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
  distance_km?: number
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled' | 'no_driver' | 'in_progress'
  payment_status?: 'pending' | 'paid' | 'failed' | 'completed'
  payment_method?: string
  ride_type?: 'single' | 'shared' | 'rent'
  start_time?: string
  end_time?: string
  service_type_id?: string
  rental_package_id?: string
  zone_pricing_id?: string
  scheduled_time?: string
  is_scheduled: boolean
  is_shared: boolean
  sharing_group_id?: string
  total_stops: number
  package_hours?: number
  included_km?: number
  extra_km_used: number
  extra_hours_used: number
  waiting_time_minutes: number
  cancellation_reason?: string
  no_show_reason?: string
  upgrade_charges: number
  created_at: string
  updated_at: string
  driver?: Driver
  vehicle?: Vehicle
  service_type?: ServiceType
  rental_package?: RentalPackage
  zone_pricing?: ZonePricing
  stops?: BookingStop[]
  payments?: any[]
  cancellations?: any[]
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