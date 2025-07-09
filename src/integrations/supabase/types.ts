export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          assigned_region: string | null
          can_approve_bookings: boolean | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone_no: string
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_region?: string | null
          can_approve_bookings?: boolean | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone_no: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_region?: string | null
          can_approve_bookings?: boolean | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone_no?: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_cancellations: {
        Row: {
          booking_id: string | null
          cancelled_at: string | null
          id: string
          reason: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          cancelled_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          cancelled_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_cancellations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_cancellations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_cancellations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_confirmations: {
        Row: {
          admin_id: string | null
          booking_id: string | null
          confirmation_status:
            | Database["public"]["Enums"]["booking_confirmation_status_enum"]
            | null
          confirmed_at: string | null
          created_at: string | null
          driver_verified: boolean | null
          id: string
          notes: string | null
          vehicle_verified: boolean | null
        }
        Insert: {
          admin_id?: string | null
          booking_id?: string | null
          confirmation_status?:
            | Database["public"]["Enums"]["booking_confirmation_status_enum"]
            | null
          confirmed_at?: string | null
          created_at?: string | null
          driver_verified?: boolean | null
          id?: string
          notes?: string | null
          vehicle_verified?: boolean | null
        }
        Update: {
          admin_id?: string | null
          booking_id?: string | null
          confirmation_status?:
            | Database["public"]["Enums"]["booking_confirmation_status_enum"]
            | null
          confirmed_at?: string | null
          created_at?: string | null
          driver_verified?: boolean | null
          id?: string
          notes?: string | null
          vehicle_verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_confirmations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_confirmations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_schedules: {
        Row: {
          booking_id: string
          created_at: string
          driver_assigned_at: string | null
          id: string
          reminder_sent: boolean | null
          scheduled_for: string
          status: string | null
          time_slot_end: string
          time_slot_start: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          driver_assigned_at?: string | null
          id?: string
          reminder_sent?: boolean | null
          scheduled_for: string
          status?: string | null
          time_slot_end: string
          time_slot_start: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          driver_assigned_at?: string | null
          id?: string
          reminder_sent?: boolean | null
          scheduled_for?: string
          status?: string | null
          time_slot_end?: string
          time_slot_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_schedules_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_stops: {
        Row: {
          actual_arrival_time: string | null
          actual_departure_time: string | null
          address: string
          booking_id: string
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          is_completed: boolean | null
          latitude: number | null
          longitude: number | null
          notes: string | null
          stop_order: number
          stop_type: string | null
          updated_at: string
        }
        Insert: {
          actual_arrival_time?: string | null
          actual_departure_time?: string | null
          address: string
          booking_id: string
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          stop_order: number
          stop_type?: string | null
          updated_at?: string
        }
        Update: {
          actual_arrival_time?: string | null
          actual_departure_time?: string | null
          address?: string
          booking_id?: string
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          stop_order?: number
          stop_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_stops_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          cancellation_reason: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          end_time: string | null
          extra_hours_used: number | null
          extra_km_used: number | null
          fare_amount: number | null
          id: string
          included_km: number | null
          is_scheduled: boolean | null
          is_shared: boolean | null
          no_show_reason: string | null
          package_hours: number | null
          payment_method: string | null
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          rental_package_id: string | null
          ride_type:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time: string | null
          service_type_id: string | null
          sharing_group_id: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops: number | null
          updated_at: string | null
          upgrade_charges: number | null
          user_id: string | null
          vehicle_id: string | null
          waiting_time_minutes: number | null
          zone_pricing_id: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          end_time?: string | null
          extra_hours_used?: number | null
          extra_km_used?: number | null
          fare_amount?: number | null
          id?: string
          included_km?: number | null
          is_scheduled?: boolean | null
          is_shared?: boolean | null
          no_show_reason?: string | null
          package_hours?: number | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          rental_package_id?: string | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time?: string | null
          service_type_id?: string | null
          sharing_group_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops?: number | null
          updated_at?: string | null
          upgrade_charges?: number | null
          user_id?: string | null
          vehicle_id?: string | null
          waiting_time_minutes?: number | null
          zone_pricing_id?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          end_time?: string | null
          extra_hours_used?: number | null
          extra_km_used?: number | null
          fare_amount?: number | null
          id?: string
          included_km?: number | null
          is_scheduled?: boolean | null
          is_shared?: boolean | null
          no_show_reason?: string | null
          package_hours?: number | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          rental_package_id?: string | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time?: string | null
          service_type_id?: string | null
          sharing_group_id?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops?: number | null
          updated_at?: string | null
          upgrade_charges?: number | null
          user_id?: string | null
          vehicle_id?: string | null
          waiting_time_minutes?: number | null
          zone_pricing_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_rental_package_id_fkey"
            columns: ["rental_package_id"]
            isOneToOne: false
            referencedRelation: "rental_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_zone_pricing_id_fkey"
            columns: ["zone_pricing_id"]
            isOneToOne: false
            referencedRelation: "zone_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_threads: {
        Row: {
          assigned_admin_id: string | null
          booking_id: string | null
          created_at: string
          created_by: string
          customer_id: string | null
          driver_id: string | null
          id: string
          last_message_at: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string | null
          thread_type: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          booking_id?: string | null
          created_at?: string
          created_by: string
          customer_id?: string | null
          driver_id?: string | null
          id?: string
          last_message_at?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          thread_type: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          booking_id?: string | null
          created_at?: string
          created_by?: string
          customer_id?: string | null
          driver_id?: string | null
          id?: string
          last_message_at?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string | null
          thread_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_threads_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_saved_locations: {
        Row: {
          address: string
          created_at: string | null
          customer_id: string | null
          id: string
          is_default: boolean | null
          label: string
          latitude: number
          longitude: number
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_default?: boolean | null
          label: string
          latitude: number
          longitude: number
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_saved_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          dob: string | null
          email: string | null
          full_name: string
          id: string
          loyalty_points: number | null
          phone_no: string
          preferred_payment_method: string | null
          profile_picture_url: string | null
          referral_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dob?: string | null
          email?: string | null
          full_name: string
          id: string
          loyalty_points?: number | null
          phone_no: string
          preferred_payment_method?: string | null
          profile_picture_url?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dob?: string | null
          email?: string | null
          full_name?: string
          id?: string
          loyalty_points?: number | null
          phone_no?: string
          preferred_payment_method?: string | null
          profile_picture_url?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_maintenance_logs: {
        Row: {
          cost: number | null
          created_at: string | null
          description: string | null
          driver_id: string | null
          id: string
          next_due_date: string | null
          service_date: string | null
          status:
            | Database["public"]["Enums"]["maintenance_log_status_enum"]
            | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          id?: string
          next_due_date?: string | null
          service_date?: string | null
          status?:
            | Database["public"]["Enums"]["maintenance_log_status_enum"]
            | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          description?: string | null
          driver_id?: string | null
          id?: string
          next_due_date?: string | null
          service_date?: string | null
          status?:
            | Database["public"]["Enums"]["maintenance_log_status_enum"]
            | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_maintenance_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          email: string | null
          full_name: string
          id: string
          id_proof_document_url: string | null
          joined_on: string | null
          kyc_status: string | null
          license_document_url: string | null
          license_number: string
          phone_no: string
          profile_picture_url: string | null
          rating: number | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["driver_status_enum"] | null
          total_rides: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          email?: string | null
          full_name: string
          id: string
          id_proof_document_url?: string | null
          joined_on?: string | null
          kyc_status?: string | null
          license_document_url?: string | null
          license_number: string
          phone_no: string
          profile_picture_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["driver_status_enum"] | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_latitude?: number | null
          current_longitude?: number | null
          email?: string | null
          full_name?: string
          id?: string
          id_proof_document_url?: string | null
          joined_on?: string | null
          kyc_status?: string | null
          license_document_url?: string | null
          license_number?: string
          phone_no?: string
          profile_picture_url?: string | null
          rating?: number | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["driver_status_enum"] | null
          total_rides?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          contact_name: string | null
          contact_number: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          contact_name?: string | null
          contact_number?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          contact_name?: string | null
          contact_number?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          message_type: string
          read_by: Json | null
          sender_id: string
          sender_type: string
          thread_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          read_by?: Json | null
          sender_id: string
          sender_type: string
          thread_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          message_type?: string
          read_by?: Json | null
          sender_id?: string
          sender_type?: string
          thread_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at: string | null
          id: string
          message: string | null
          read: boolean | null
          sent_at: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          channel?:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          channel?:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at?: string | null
          id?: string
          message?: string | null
          read?: boolean | null
          sent_at?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          currency: string | null
          gateway_response: Json | null
          id: string
          status: Database["public"]["Enums"]["payment_status_enum"] | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          currency?: string | null
          gateway_response?: Json | null
          id?: string
          status?: Database["public"]["Enums"]["payment_status_enum"] | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_fare: number
          cancellation_fee: number | null
          created_at: string
          effective_from: string | null
          effective_until: string | null
          free_waiting_time_minutes: number | null
          id: string
          is_active: boolean
          minimum_fare: number
          no_show_fee: number | null
          per_km_rate: number
          per_minute_rate: number | null
          service_type_id: string
          surge_multiplier: number | null
          updated_at: string
          vehicle_type: string
          waiting_charges_per_minute: number | null
        }
        Insert: {
          base_fare?: number
          cancellation_fee?: number | null
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          free_waiting_time_minutes?: number | null
          id?: string
          is_active?: boolean
          minimum_fare?: number
          no_show_fee?: number | null
          per_km_rate?: number
          per_minute_rate?: number | null
          service_type_id: string
          surge_multiplier?: number | null
          updated_at?: string
          vehicle_type: string
          waiting_charges_per_minute?: number | null
        }
        Update: {
          base_fare?: number
          cancellation_fee?: number | null
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          free_waiting_time_minutes?: number | null
          id?: string
          is_active?: boolean
          minimum_fare?: number
          no_show_fee?: number | null
          per_km_rate?: number
          per_minute_rate?: number | null
          service_type_id?: string
          surge_multiplier?: number | null
          updated_at?: string
          vehicle_type?: string
          waiting_charges_per_minute?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string | null
          created_at: string | null
          discount_type: string | null
          discount_value: number | null
          expiry_date: string | null
          id: string
          usage_limit: number | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          usage_limit?: number | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          expiry_date?: string | null
          id?: string
          usage_limit?: number | null
        }
        Relationships: []
      }
      rental_packages: {
        Row: {
          base_price: number
          cancellation_fee: number | null
          created_at: string
          duration_hours: number
          extra_hour_rate: number
          extra_km_rate: number
          id: string
          included_kilometers: number
          is_active: boolean
          name: string
          no_show_fee: number | null
          updated_at: string
          vehicle_type: string
          waiting_limit_minutes: number | null
        }
        Insert: {
          base_price: number
          cancellation_fee?: number | null
          created_at?: string
          duration_hours: number
          extra_hour_rate: number
          extra_km_rate: number
          id?: string
          included_kilometers: number
          is_active?: boolean
          name: string
          no_show_fee?: number | null
          updated_at?: string
          vehicle_type: string
          waiting_limit_minutes?: number | null
        }
        Update: {
          base_price?: number
          cancellation_fee?: number | null
          created_at?: string
          duration_hours?: number
          extra_hour_rate?: number
          extra_km_rate?: number
          id?: string
          included_kilometers?: number
          is_active?: boolean
          name?: string
          no_show_fee?: number | null
          updated_at?: string
          vehicle_type?: string
          waiting_limit_minutes?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_notes: string | null
          rating: number | null
          reviewed_id: string
          reviewer_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          rating?: number | null
          reviewed_id: string
          reviewer_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_notes?: string | null
          rating?: number | null
          reviewed_id?: string
          reviewer_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_moderated_by_fkey"
            columns: ["moderated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_passes: {
        Row: {
          created_at: string | null
          expiry_date: string | null
          id: string
          pass_type: string | null
          rides_remaining: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          pass_type?: string | null
          rides_remaining?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          pass_type?: string | null
          rides_remaining?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ride_passes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ride_passes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_bookings: {
        Row: {
          created_at: string
          dropoff_sequence: number
          fare_split_percentage: number
          id: string
          passenger_booking_id: string
          pickup_sequence: number
          primary_booking_id: string
          shared_fare_amount: number
          sharing_group_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dropoff_sequence: number
          fare_split_percentage: number
          id?: string
          passenger_booking_id: string
          pickup_sequence: number
          primary_booking_id: string
          shared_fare_amount: number
          sharing_group_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dropoff_sequence?: number
          fare_split_percentage?: number
          id?: string
          passenger_booking_id?: string
          pickup_sequence?: number
          primary_booking_id?: string
          shared_fare_amount?: number
          sharing_group_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_bookings_passenger_booking_id_fkey"
            columns: ["passenger_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_bookings_primary_booking_id_fkey"
            columns: ["primary_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          resolution_notes: string | null
          sla_due_date: string | null
          tags: string[] | null
          thread_id: string
          ticket_number: string
          updated_at: string
          urgency: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          resolution_notes?: string | null
          sla_due_date?: string | null
          tags?: string[] | null
          thread_id: string
          ticket_number: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          resolution_notes?: string | null
          sla_due_date?: string | null
          tags?: string[] | null
          thread_id?: string
          ticket_number?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          booking_id: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
          thread_id: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          thread_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          thread_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "communication_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_promo_usages: {
        Row: {
          id: string
          promo_code_id: string | null
          used_on: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          promo_code_id?: string | null
          used_on?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          promo_code_id?: string | null
          used_on?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_promo_usages_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_promo_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_promo_usages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          last_login_at: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status: string | null
          updated_at: string | null
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id: string
          last_login_at?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          last_login_at?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          is_resolved: boolean | null
          priority: string | null
          resolved_date: string | null
          title: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_resolved?: boolean | null
          priority?: string | null
          resolved_date?: string | null
          title: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_resolved?: boolean | null
          priority?: string | null
          resolved_date?: string | null
          title?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_assignments: {
        Row: {
          assigned_on: string | null
          driver_id: string
          id: string
          status: string | null
          unassigned_on: string | null
          vehicle_id: string
        }
        Insert: {
          assigned_on?: string | null
          driver_id: string
          id?: string
          status?: string | null
          unassigned_on?: string | null
          vehicle_id: string
        }
        Update: {
          assigned_on?: string | null
          driver_id?: string
          id?: string
          status?: string | null
          unassigned_on?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_documents: {
        Row: {
          created_at: string | null
          document_type: string
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          notes: string | null
          updated_at: string | null
          vehicle_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          updated_at?: string | null
          vehicle_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          updated_at?: string | null
          vehicle_id?: string
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_logs: {
        Row: {
          bill_document_url: string | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          maintenance_date: string
          next_service_due_date: string | null
          next_service_due_km: number | null
          odometer_reading: number | null
          performed_by: string | null
          service_center: string | null
          service_type: string | null
          updated_at: string | null
          vehicle_id: string
          work_performed: string | null
        }
        Insert: {
          bill_document_url?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_date: string
          next_service_due_date?: string | null
          next_service_due_km?: number | null
          odometer_reading?: number | null
          performed_by?: string | null
          service_center?: string | null
          service_type?: string | null
          updated_at?: string | null
          vehicle_id: string
          work_performed?: string | null
        }
        Update: {
          bill_document_url?: string | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_date?: string
          next_service_due_date?: string | null
          next_service_due_km?: number | null
          odometer_reading?: number | null
          performed_by?: string | null
          service_center?: string | null
          service_type?: string | null
          updated_at?: string | null
          vehicle_id?: string
          work_performed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_performance: {
        Row: {
          created_at: string | null
          distance_traveled: number | null
          fuel_consumed: number | null
          fuel_economy: number | null
          id: string
          notes: string | null
          odometer_reading: number | null
          recorded_date: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          distance_traveled?: number | null
          fuel_consumed?: number | null
          fuel_economy?: number | null
          id?: string
          notes?: string | null
          odometer_reading?: number | null
          recorded_date?: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          distance_traveled?: number | null
          fuel_consumed?: number | null
          fuel_economy?: number | null
          id?: string
          notes?: string | null
          odometer_reading?: number | null
          recorded_date?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_performance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          assigned_driver_id: string | null
          average_fuel_economy: number | null
          capacity: number | null
          color: string | null
          created_at: string | null
          current_odometer: number | null
          id: string
          image_url: string | null
          insurance_document_url: string | null
          last_service_date: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          monthly_distance: number | null
          next_service_due_date: string | null
          pollution_certificate_url: string | null
          registration_document_url: string | null
          status: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at: string | null
          vendor_id: string | null
          year: number | null
        }
        Insert: {
          assigned_driver_id?: string | null
          average_fuel_economy?: number | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          current_odometer?: number | null
          id?: string
          image_url?: string | null
          insurance_document_url?: string | null
          last_service_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          monthly_distance?: number | null
          next_service_due_date?: string | null
          pollution_certificate_url?: string | null
          registration_document_url?: string | null
          status?: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Update: {
          assigned_driver_id?: string | null
          average_fuel_economy?: number | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          current_odometer?: number | null
          id?: string
          image_url?: string | null
          insurance_document_url?: string | null
          last_service_date?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          monthly_distance?: number | null
          next_service_due_date?: string | null
          pollution_certificate_url?: string | null
          registration_document_url?: string | null
          status?: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          email: string
          gst_number: string | null
          id: string
          phone_no: string
          profile_picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          email: string
          gst_number?: string | null
          id: string
          phone_no: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string
          gst_number?: string | null
          id?: string
          phone_no?: string
          profile_picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number | null
          description: string | null
          id: string
          status: string | null
          transaction_date: string | null
          type: string | null
          wallet_id: string | null
        }
        Insert: {
          amount?: number | null
          description?: string | null
          id?: string
          status?: string | null
          transaction_date?: string | null
          type?: string | null
          wallet_id?: string | null
        }
        Update: {
          amount?: number | null
          description?: string | null
          id?: string
          status?: string | null
          transaction_date?: string | null
          type?: string | null
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          currency: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          balance?: number | null
          currency?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_pricing: {
        Row: {
          base_price: number | null
          created_at: string
          estimated_distance_km: number | null
          estimated_duration_minutes: number | null
          fixed_price: number | null
          from_location: string
          id: string
          is_active: boolean
          per_km_rate: number | null
          service_type_id: string
          to_location: string
          updated_at: string
          vehicle_type: string
          zone_name: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          fixed_price?: number | null
          from_location: string
          id?: string
          is_active?: boolean
          per_km_rate?: number | null
          service_type_id: string
          to_location: string
          updated_at?: string
          vehicle_type: string
          zone_name: string
        }
        Update: {
          base_price?: number | null
          created_at?: string
          estimated_distance_km?: number | null
          estimated_duration_minutes?: number | null
          fixed_price?: number | null
          from_location?: string
          id?: string
          is_active?: boolean
          per_km_rate?: number | null
          service_type_id?: string
          to_location?: string
          updated_at?: string
          vehicle_type?: string
          zone_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_pricing_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_management_view: {
        Row: {
          assigned_region: string | null
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          deleted_at: string | null
          driver_rating: number | null
          driver_status:
            | Database["public"]["Enums"]["driver_status_enum"]
            | null
          email: string | null
          full_name: string | null
          gst_number: string | null
          id: string | null
          last_login_at: string | null
          loyalty_points: number | null
          phone_no: string | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role_enum"] | null
          status: string | null
          total_rides: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "user_management_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      change_user_role: {
        Args: {
          user_uuid: string
          admin_uuid: string
          new_role: Database["public"]["Enums"]["user_role_enum"]
        }
        Returns: boolean
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_booking_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_bookings: number
          completed_bookings: number
          cancelled_bookings: number
          pending_bookings: number
          completion_rate: number
          booking_trends: Json
          ride_type_distribution: Json
          hourly_distribution: Json
        }[]
      }
      get_customer_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_customers: number
          new_customers: number
          repeat_customers: number
          customer_retention_rate: number
          top_customers: Json
          customer_acquisition_trend: Json
        }[]
      }
      get_driver_performance_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_active_drivers: number
          average_rating: number
          top_drivers: Json
          driver_status_distribution: Json
          driver_earnings: Json
        }[]
      }
      get_driver_rides: {
        Args: { driver_uuid: string }
        Returns: {
          id: string
          pickup_address: string
          dropoff_address: string
          fare_amount: number
          status: Database["public"]["Enums"]["booking_status_enum"]
          created_at: string
          start_time: string
          end_time: string
        }[]
      }
      get_revenue_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          total_revenue: number
          completed_bookings: number
          average_fare: number
          revenue_growth_percentage: number
          daily_revenue: Json
        }[]
      }
      get_service_performance_analytics: {
        Args: { start_date?: string; end_date?: string }
        Returns: {
          average_trip_duration: number
          average_distance: number
          service_efficiency_score: number
          popular_routes: Json
          vehicle_utilization: Json
          maintenance_insights: Json
        }[]
      }
      get_settings_by_category: {
        Args: { category_name: string }
        Returns: {
          setting_key: string
          setting_value: Json
          setting_type: string
          display_name: string
          description: string
          is_active: boolean
        }[]
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role_enum"]
      }
      soft_delete_user: {
        Args: { user_uuid: string; admin_uuid: string }
        Returns: boolean
      }
      toggle_user_block: {
        Args: {
          user_uuid: string
          admin_uuid: string
          action: string
          reason?: string
        }
        Returns: boolean
      }
      update_admin_setting: {
        Args: {
          p_category: string
          p_setting_key: string
          p_setting_value: Json
          p_updated_by: string
        }
        Returns: boolean
      }
    }
    Enums: {
      booking_confirmation_status_enum: "confirmed" | "rejected" | "pending"
      booking_ride_type_enum: "single" | "shared" | "rent"
      booking_status_enum:
        | "pending"
        | "accepted"
        | "started"
        | "completed"
        | "cancelled"
        | "no_driver"
      driver_status_enum: "active" | "inactive" | "on_break"
      maintenance_log_status_enum: "pending" | "completed"
      notification_channel_enum: "in_app" | "sms" | "whatsapp" | "call"
      payment_status_enum: "pending" | "paid" | "failed"
      user_role_enum: "customer" | "driver" | "admin" | "vendor"
      vehicle_status_enum:
        | "active"
        | "maintenance"
        | "out_of_service"
        | "in_maintenance"
        | "unavailable"
      vehicle_type_enum: "sedan" | "suv" | "bike" | "luxury" | "van"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_confirmation_status_enum: ["confirmed", "rejected", "pending"],
      booking_ride_type_enum: ["single", "shared", "rent"],
      booking_status_enum: [
        "pending",
        "accepted",
        "started",
        "completed",
        "cancelled",
        "no_driver",
      ],
      driver_status_enum: ["active", "inactive", "on_break"],
      maintenance_log_status_enum: ["pending", "completed"],
      notification_channel_enum: ["in_app", "sms", "whatsapp", "call"],
      payment_status_enum: ["pending", "paid", "failed"],
      user_role_enum: ["customer", "driver", "admin", "vendor"],
      vehicle_status_enum: [
        "active",
        "maintenance",
        "out_of_service",
        "in_maintenance",
        "unavailable",
      ],
      vehicle_type_enum: ["sedan", "suv", "bike", "luxury", "van"],
    },
  },
} as const
