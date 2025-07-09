export interface UserManagementRecord {
  id: string
  role: 'admin' | 'customer' | 'driver' | 'vendor'
  status: 'active' | 'blocked' | 'suspended'
  created_at: string
  updated_at: string
  blocked_at?: string
  blocked_by?: string
  block_reason?: string
  deleted_at?: string
  last_login_at?: string
  full_name?: string
  phone_no?: string
  email?: string
  profile_picture_url?: string
  loyalty_points?: number
  total_rides?: number
  driver_rating?: number
  driver_status?: string
  gst_number?: string
  assigned_region?: string
}

export interface UserFilter {
  role?: string
  status?: string
  dateRange?: {
    from: Date
    to: Date
  }
  search?: string
}

export interface ReviewRecord {
  id: string
  booking_id?: string
  reviewer_id: string
  reviewed_id: string
  rating?: number
  comment?: string
  status: 'active' | 'flagged' | 'archived' | 'approved'
  created_at: string
  updated_at: string
  moderated_by?: string
  moderated_at?: string
  moderation_notes?: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: string
  description: string
  metadata?: any
  booking_id?: string
  thread_id?: string
  created_by?: string
  created_at: string
}

export interface UserStats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  newUsersThisMonth: number
  roleDistribution: {
    customers: number
    drivers: number
    vendors: number
    admins: number
  }
}