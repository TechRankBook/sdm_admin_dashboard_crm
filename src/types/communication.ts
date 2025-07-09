export interface CommunicationThread {
  id: string
  thread_type: 'chat' | 'support' | 'booking'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  subject?: string
  booking_id?: string
  customer_id?: string
  driver_id?: string
  assigned_admin_id?: string
  created_by: string
  created_at: string
  updated_at: string
  resolved_at?: string
  last_message_at?: string
  customer?: {
    id: string
    full_name: string
    phone_no: string
    email?: string
  }
  driver?: {
    id: string
    full_name: string
    phone_no: string
    email?: string
  }
  booking?: {
    id: string
    pickup_address?: string
    dropoff_address?: string
    status?: string
  }
  unread_count?: number
}

export interface Message {
  id: string
  thread_id: string
  sender_id: string
  sender_type: 'admin' | 'customer' | 'driver'
  content: string
  message_type: 'text' | 'file' | 'image' | 'system'
  read_by: string[]
  is_internal: boolean
  created_at: string
  updated_at: string
  sender_name?: string
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size?: number
  created_at: string
}

export interface SupportTicket {
  id: string
  thread_id: string
  ticket_number: string
  category: 'technical' | 'billing' | 'driver_issue' | 'customer_complaint' | 'general'
  urgency: 'low' | 'medium' | 'high' | 'critical'
  sla_due_date?: string
  resolution_notes?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface UserActivity {
  id: string
  user_id: string
  activity_type: 'booking_created' | 'booking_cancelled' | 'driver_assigned' | 'payment_completed' | 'message_sent' | 'ticket_created' | 'admin_action'
  description: string
  metadata?: any
  booking_id?: string
  thread_id?: string
  created_by?: string
  created_at: string
}