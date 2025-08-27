export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      _realtime_schema_migrations: {
        Row: {
          id: number
          inserted_at: string
          version: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          version: string
        }
        Update: {
          id?: number
          inserted_at?: string
          version?: string
        }
        Relationships: []
      }
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
          id: string
          updated_at: string | null
        }
        Insert: {
          assigned_region?: string | null
          can_approve_bookings?: boolean | null
          created_at?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          assigned_region?: string | null
          can_approve_bookings?: boolean | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_user_id_fkey"
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "booking_confirmations_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admins_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_confirmations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "active_bookings_view"
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
      booking_drafts: {
        Row: {
          created_at: string | null
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          estimated_fare: number | null
          id: string
          passenger_count: number | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          scheduled_time: string | null
          selected_vehicle_type: string | null
          service_type: string
          session_id: string
          special_instructions: string | null
          status: string | null
          updated_at: string | null
          whatsapp_user_id: string
        }
        Insert: {
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          estimated_fare?: number | null
          id?: string
          passenger_count?: number | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          scheduled_time?: string | null
          selected_vehicle_type?: string | null
          service_type: string
          session_id: string
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_user_id: string
        }
        Update: {
          created_at?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          estimated_fare?: number | null
          id?: string
          passenger_count?: number | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          scheduled_time?: string | null
          selected_vehicle_type?: string | null
          service_type?: string
          session_id?: string
          special_instructions?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_drafts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chatbot_session_state"
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
          advance_amount: number | null
          cancellation_reason: string | null
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_location_id: string | null
          dropoff_longitude: number | null
          end_time: string | null
          extra_hours_used: number | null
          extra_km_used: number | null
          fare_amount: number | null
          id: string
          included_km: number | null
          is_round_trip: boolean | null
          is_scheduled: boolean | null
          is_shared: boolean | null
          no_show_reason: string | null
          package_hours: number | null
          passengers: number | null
          payment_method: string | null
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address: string
          pickup_latitude: number | null
          pickup_location_id: string | null
          pickup_longitude: number | null
          remaining_amount: number | null
          rental_package_id: string | null
          return_scheduled_time: string | null
          ride_type:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time: string | null
          service_type: string | null
          service_type_id: string | null
          sharing_group_id: string | null
          special_instructions: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops: number | null
          trip_type: string | null
          updated_at: string | null
          upgrade_charges: number | null
          user_id: string
          vehicle_id: string | null
          vehicle_type: string | null
          waiting_time_minutes: number | null
          zone_pricing_id: string | null
        }
        Insert: {
          advance_amount?: number | null
          cancellation_reason?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_location_id?: string | null
          dropoff_longitude?: number | null
          end_time?: string | null
          extra_hours_used?: number | null
          extra_km_used?: number | null
          fare_amount?: number | null
          id?: string
          included_km?: number | null
          is_round_trip?: boolean | null
          is_scheduled?: boolean | null
          is_shared?: boolean | null
          no_show_reason?: string | null
          package_hours?: number | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address: string
          pickup_latitude?: number | null
          pickup_location_id?: string | null
          pickup_longitude?: number | null
          remaining_amount?: number | null
          rental_package_id?: string | null
          return_scheduled_time?: string | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time?: string | null
          service_type?: string | null
          service_type_id?: string | null
          sharing_group_id?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops?: number | null
          trip_type?: string | null
          updated_at?: string | null
          upgrade_charges?: number | null
          user_id: string
          vehicle_id?: string | null
          vehicle_type?: string | null
          waiting_time_minutes?: number | null
          zone_pricing_id?: string | null
        }
        Update: {
          advance_amount?: number | null
          cancellation_reason?: string | null
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_location_id?: string | null
          dropoff_longitude?: number | null
          end_time?: string | null
          extra_hours_used?: number | null
          extra_km_used?: number | null
          fare_amount?: number | null
          id?: string
          included_km?: number | null
          is_round_trip?: boolean | null
          is_scheduled?: boolean | null
          is_shared?: boolean | null
          no_show_reason?: string | null
          package_hours?: number | null
          passengers?: number | null
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address?: string
          pickup_latitude?: number | null
          pickup_location_id?: string | null
          pickup_longitude?: number | null
          remaining_amount?: number | null
          rental_package_id?: string | null
          return_scheduled_time?: string | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          scheduled_time?: string | null
          service_type?: string | null
          service_type_id?: string | null
          sharing_group_id?: string | null
          special_instructions?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          total_stops?: number | null
          trip_type?: string | null
          updated_at?: string | null
          upgrade_charges?: number | null
          user_id?: string
          vehicle_id?: string | null
          vehicle_type?: string | null
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
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
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
            foreignKeyName: "bookings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
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
      chatbot_session_state: {
        Row: {
          booking_draft_id: string | null
          created_at: string
          current_step: string
          error_count: number | null
          flow_data: Json | null
          flow_screen: string | null
          flow_token: string | null
          id: string
          last_interaction_at: string
          session_data: Json | null
          status: string
          updated_at: string
          user_id: string | null
          whatsapp_user_id: string
        }
        Insert: {
          booking_draft_id?: string | null
          created_at?: string
          current_step?: string
          error_count?: number | null
          flow_data?: Json | null
          flow_screen?: string | null
          flow_token?: string | null
          id?: string
          last_interaction_at?: string
          session_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp_user_id: string
        }
        Update: {
          booking_draft_id?: string | null
          created_at?: string
          current_step?: string
          error_count?: number | null
          flow_data?: Json | null
          flow_screen?: string | null
          flow_token?: string | null
          id?: string
          last_interaction_at?: string
          session_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string | null
          whatsapp_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_session_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "communication_threads_assigned_admin_id_fkey"
            columns: ["assigned_admin_id"]
            isOneToOne: false
            referencedRelation: "admins_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "active_bookings_view"
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
            foreignKeyName: "communication_threads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_threads_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_read: boolean | null
          last_name: string
          message: string
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id?: string
          is_read?: boolean | null
          last_name: string
          message: string
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_read?: boolean | null
          last_name?: string
          message?: string
        }
        Relationships: []
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
          {
            foreignKeyName: "customer_saved_locations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers_with_user_info"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          dob: string | null
          id: string
          loyalty_points: number | null
          preferred_payment_method: string | null
          referral_code: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dob?: string | null
          id: string
          loyalty_points?: number | null
          preferred_payment_method?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dob?: string | null
          id?: string
          loyalty_points?: number | null
          preferred_payment_method?: string | null
          referral_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
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
            foreignKeyName: "driver_maintenance_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_maintenance_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "driver_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          id: string
          id_proof_document_url: string | null
          joined_on: string | null
          kyc_status: string | null
          license_document_url: string | null
          license_number: string
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
          id: string
          id_proof_document_url?: string | null
          joined_on?: string | null
          kyc_status?: string | null
          license_document_url?: string | null
          license_number: string
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
          id?: string
          id_proof_document_url?: string | null
          joined_on?: string | null
          kyc_status?: string | null
          license_document_url?: string | null
          license_number?: string
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_options: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          title?: string
        }
        Relationships: []
      }
      faq_views: {
        Row: {
          faq_id: number | null
          id: number
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          faq_id?: number | null
          id?: number
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          faq_id?: number | null
          id?: number
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "faq_views_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: false
            referencedRelation: "faq_options"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_actions: {
        Row: {
          action: string
          created_at: string | null
          id: number
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      google_places_cache: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          formatted_address: string
          id: string
          last_searched_at: string | null
          latitude: number
          longitude: number
          place_id: string
          place_types: string[] | null
          search_count: number | null
          state: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          formatted_address: string
          id?: string
          last_searched_at?: string | null
          latitude: number
          longitude: number
          place_id: string
          place_types?: string[] | null
          search_count?: number | null
          state?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          formatted_address?: string
          id?: string
          last_searched_at?: string | null
          latitude?: number
          longitude?: number
          place_id?: string
          place_types?: string[] | null
          search_count?: number | null
          state?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          created_at: string | null
          id: string
          latitude: number
          longitude: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
        }
        Relationships: []
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
      notification_campaigns: {
        Row: {
          created_at: string
          created_by: string | null
          delivered_count: number | null
          description: string | null
          failed_count: number | null
          id: string
          name: string
          scheduled_at: string | null
          sent_count: number | null
          status: string
          target_criteria: Json
          template_id: string | null
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_criteria: Json
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivered_count?: number | null
          description?: string | null
          failed_count?: number | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_count?: number | null
          status?: string
          target_criteria?: Json
          template_id?: string | null
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_delivery_logs: {
        Row: {
          id: string
          notification_id: string | null
          provider: string | null
          provider_response: Json | null
          status: string
          timestamp: string
        }
        Insert: {
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          status: string
          timestamp?: string
        }
        Update: {
          id?: string
          notification_id?: string | null
          provider?: string | null
          provider_response?: Json | null
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_delivery_logs_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel_enum"]
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          subject: string | null
          template_type: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel_enum"]
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel_enum"]
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string | null
          template_type?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          campaign_id: string | null
          channel:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at: string | null
          delivered_at: string | null
          delivery_attempts: number | null
          delivery_status: string | null
          external_id: string | null
          failed_reason: string | null
          id: string
          message: string | null
          metadata: Json | null
          read: boolean | null
          sent_at: string | null
          template_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          channel?:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_status?: string | null
          external_id?: string | null
          failed_reason?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          sent_at?: string | null
          template_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          channel?:
            | Database["public"]["Enums"]["notification_channel_enum"]
            | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_attempts?: number | null
          delivery_status?: string | null
          external_id?: string | null
          failed_reason?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          read?: boolean | null
          sent_at?: string | null
          template_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "notification_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "notification_templates"
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
          razorpay_payment_id: string | null
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
          razorpay_payment_id?: string | null
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
          razorpay_payment_id?: string | null
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_otps: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          user_id?: string | null
        }
        Relationships: []
      }
      phone_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          otp_code: string
          phone_number: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          otp_code: string
          phone_number: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          otp_code?: string
          phone_number?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
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
          vehicle_type: string | null
          vehicle_type_id: string | null
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
          vehicle_type?: string | null
          vehicle_type_id?: string | null
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
          vehicle_type?: string | null
          vehicle_type_id?: string | null
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
          {
            foreignKeyName: "pricing_rules_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
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
          vehicle_type_id: string | null
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
          vehicle_type_id?: string | null
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
          vehicle_type_id?: string | null
          waiting_limit_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rental_packages_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "users"
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          address: string
          created_at: string | null
          id: string
          is_default: boolean | null
          latitude: number
          longitude: number
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          latitude: number
          longitude: number
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          latitude?: number
          longitude?: number
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "active_bookings_view"
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
            referencedRelation: "active_bookings_view"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          dark_mode: boolean
          email_notifications: boolean
          notification_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dark_mode?: boolean
          email_notifications?: boolean
          notification_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dark_mode?: boolean
          email_notifications?: boolean
          notification_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_rewards: {
        Row: {
          co2_reduced: number
          created_at: string | null
          fuel_saved: number
          id: string
          progress: number
          trees_saved: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          co2_reduced?: number
          created_at?: string | null
          fuel_saved?: number
          id?: string
          progress?: number
          trees_saved?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          co2_reduced?: number
          created_at?: string | null
          fuel_saved?: number
          id?: string
          progress?: number
          trees_saved?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          dark_mode_enabled: boolean | null
          notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dark_mode_enabled?: boolean | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dark_mode_enabled?: boolean | null
          notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_login_at: string | null
          phone_no: string | null
          phone_verification_completed_at: string | null
          phone_verified: boolean | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status: string | null
          updated_at: string | null
          whatsapp_phone: string | null
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_login_at?: string | null
          phone_no?: string | null
          phone_verification_completed_at?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_login_at?: string | null
          phone_no?: string | null
          phone_verification_completed_at?: string | null
          phone_verified?: boolean | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: string | null
          updated_at?: string | null
          whatsapp_phone?: string | null
        }
        Relationships: [
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
          {
            foreignKeyName: "vehicle_alerts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
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
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
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
          {
            foreignKeyName: "vehicle_maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
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
          {
            foreignKeyName: "vehicle_performance_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_types: {
        Row: {
          base_fare: number
          capacity: number
          created_at: string | null
          description: string | null
          display_name: string
          icon_emoji: string | null
          id: string
          is_active: boolean | null
          name: string
          per_km_rate: number
          per_minute_rate: number | null
          sort_order: number | null
        }
        Insert: {
          base_fare?: number
          capacity: number
          created_at?: string | null
          description?: string | null
          display_name: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          per_km_rate?: number
          per_minute_rate?: number | null
          sort_order?: number | null
        }
        Update: {
          base_fare?: number
          capacity?: number
          created_at?: string | null
          description?: string | null
          display_name?: string
          icon_emoji?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          per_km_rate?: number
          per_minute_rate?: number | null
          sort_order?: number | null
        }
        Relationships: []
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
          type: string | null
          updated_at: string | null
          vehicle_type_id: string | null
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
          type?: string | null
          updated_at?: string | null
          vehicle_type_id?: string | null
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
          type?: string | null
          updated_at?: string | null
          vehicle_type_id?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "vehicles_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "vehicles_vehicle_type_id_fkey"
            columns: ["vehicle_type_id"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
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
          gst_number: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          gst_number?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
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
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_message_logs: {
        Row: {
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          message_content: Json
          message_type: string
          status: string | null
          whatsapp_user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_content: Json
          message_type: string
          status?: string | null
          whatsapp_user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_content?: Json
          message_type?: string
          status?: string | null
          whatsapp_user_id?: string
        }
        Relationships: []
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
      active_bookings_view: {
        Row: {
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          driver_name: string | null
          driver_phone: string | null
          dropoff_address: string | null
          fare_amount: number | null
          id: string | null
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address: string | null
          service_type: string | null
          status: Database["public"]["Enums"]["booking_status_enum"] | null
          vehicle_details: string | null
        }
        Relationships: []
      }
      admins_with_user_info: {
        Row: {
          assigned_region: string | null
          can_approve_bookings: boolean | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          phone_no: string | null
          profile_picture_url: string | null
          updated_at: string | null
          user_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admins_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      customers_with_user_info: {
        Row: {
          created_at: string | null
          dob: string | null
          email: string | null
          full_name: string | null
          id: string | null
          loyalty_points: number | null
          phone_no: string | null
          preferred_payment_method: string | null
          profile_picture_url: string | null
          referral_code: string | null
          updated_at: string | null
          user_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers_with_user_info: {
        Row: {
          created_at: string | null
          current_latitude: number | null
          current_longitude: number | null
          email: string | null
          full_name: string | null
          id: string | null
          id_proof_document_url: string | null
          joined_on: string | null
          kyc_status: string | null
          license_document_url: string | null
          license_number: string | null
          phone_no: string | null
          profile_picture_url: string | null
          rating: number | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["driver_status_enum"] | null
          total_rides: number | null
          updated_at: string | null
          user_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles_with_driver_details: {
        Row: {
          assigned_driver_id: string | null
          driver_email: string | null
          driver_id: string | null
          driver_name: string | null
          driver_phone: string | null
          driver_profile_picture_url: string | null
          driver_status:
            | Database["public"]["Enums"]["driver_status_enum"]
            | null
          id: string | null
          is_available: boolean | null
          license_plate: string | null
          make: string | null
          model: string | null
          rating: number | null
          total_rides: number | null
          type: string | null
          vehicle_status:
            | Database["public"]["Enums"]["vehicle_status_enum"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["driver_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "vehicles_with_driver_details"
            referencedColumns: ["driver_id"]
          },
          {
            foreignKeyName: "vehicles_type_fkey"
            columns: ["type"]
            isOneToOne: false
            referencedRelation: "vehicle_types"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Functions: {
      auto_assign_nearest_driver: {
        Args: {
          booking_id: string
          max_distance_km?: number
          pickup_latitude: number
          pickup_longitude: number
        }
        Returns: string
      }
      calculate_booking_fare: {
        Args: {
          distance_km: number
          duration_minutes?: number
          service_type_id: string
          surge_multiplier?: number
          vehicle_type: string
        }
        Returns: number
      }
      change_user_role: {
        Args: {
          admin_uuid: string
          new_role: Database["public"]["Enums"]["user_role_enum"]
          user_uuid: string
        }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_phone_verification: {
        Args: { p_phone_number: string; p_user_id: string }
        Returns: boolean
      }
      create_phone_verification: {
        Args:
          | { p_phone_number: string }
          | { p_phone_number: string; p_user_id: string }
        Returns: {
          otp_code: string
          verification_id: string
        }[]
      }
      generate_otp: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_booking_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          booking_trends: Json
          cancelled_bookings: number
          completed_bookings: number
          completion_rate: number
          hourly_distribution: Json
          pending_bookings: number
          ride_type_distribution: Json
          total_bookings: number
        }[]
      }
      get_customer_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          customer_acquisition_trend: Json
          customer_retention_rate: number
          new_customers: number
          repeat_customers: number
          top_customers: Json
          total_customers: number
        }[]
      }
      get_driver_performance: {
        Args: { driver_id: string; period_days?: number }
        Returns: {
          acceptance_rate: number
          average_rating: number
          cancelled_trips: number
          completed_trips: number
          online_hours: number
          total_earnings: number
          total_trips: number
        }[]
      }
      get_driver_performance_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_rating: number
          driver_earnings: Json
          driver_status_distribution: Json
          top_drivers: Json
          total_active_drivers: number
        }[]
      }
      get_driver_rides: {
        Args: { driver_uuid: string }
        Returns: {
          created_at: string
          dropoff_address: string
          end_time: string
          fare_amount: number
          id: string
          pickup_address: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status_enum"]
        }[]
      }
      get_notification_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          channel_breakdown: Json
          daily_stats: Json
          delivery_rate: number
          total_delivered: number
          total_failed: number
          total_sent: number
        }[]
      }
      get_revenue_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_fare: number
          completed_bookings: number
          daily_revenue: Json
          revenue_growth_percentage: number
          total_revenue: number
        }[]
      }
      get_service_performance_analytics: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_distance: number
          average_trip_duration: number
          maintenance_insights: Json
          popular_routes: Json
          service_efficiency_score: number
          vehicle_utilization: Json
        }[]
      }
      get_settings_by_category: {
        Args: { category_name: string }
        Returns: {
          description: string
          display_name: string
          is_active: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
        }[]
      }
      get_user_profile: {
        Args: { user_uuid: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role_enum"]
      }
      get_user_stats: {
        Args: { user_id: string }
        Returns: {
          average_rating: number
          cancelled_trips: number
          completed_trips: number
          last_trip_date: string
          total_bookings: number
          total_spent: number
        }[]
      }
      process_wallet_transaction: {
        Args: {
          amount: number
          description?: string
          transaction_type: string
          wallet_id: string
        }
        Returns: string
      }
      send_notification: {
        Args: {
          p_campaign_id?: string
          p_channel: Database["public"]["Enums"]["notification_channel_enum"]
          p_message: string
          p_metadata?: Json
          p_template_id?: string
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      send_scheduled_reminders: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      soft_delete_user: {
        Args: { admin_uuid: string; user_uuid: string }
        Returns: boolean
      }
      toggle_user_block: {
        Args: {
          action: string
          admin_uuid: string
          reason?: string
          user_uuid: string
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
      verify_phone_otp: {
        Args:
          | { p_otp_code: string; p_phone_number: string }
          | { p_otp_code: string; p_phone_number: string; p_user_id: string }
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
      driver_status_enum: "active" | "inactive" | "suspended" | "on_ride"
      maintenance_log_status_enum: "pending" | "completed"
      notification_channel_enum:
        | "in_app"
        | "sms"
        | "whatsapp"
        | "call"
        | "email"
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
      driver_status_enum: ["active", "inactive", "suspended", "on_ride"],
      maintenance_log_status_enum: ["pending", "completed"],
      notification_channel_enum: ["in_app", "sms", "whatsapp", "call", "email"],
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
