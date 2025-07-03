export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      bookings: {
        Row: {
          created_at: string | null
          distance_km: number | null
          driver_id: string | null
          dropoff_address: string | null
          dropoff_latitude: number | null
          dropoff_longitude: number | null
          end_time: string | null
          fare_amount: number | null
          id: string
          payment_method: string | null
          payment_status:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address: string | null
          pickup_latitude: number | null
          pickup_longitude: number | null
          ride_type:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          start_time: string | null
          status: Database["public"]["Enums"]["booking_status_enum"] | null
          updated_at: string | null
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          end_time?: string | null
          fare_amount?: number | null
          id?: string
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          distance_km?: number | null
          driver_id?: string | null
          dropoff_address?: string | null
          dropoff_latitude?: number | null
          dropoff_longitude?: number | null
          end_time?: string | null
          fare_amount?: number | null
          id?: string
          payment_method?: string | null
          payment_status?:
            | Database["public"]["Enums"]["payment_status_enum"]
            | null
          pickup_address?: string | null
          pickup_latitude?: number | null
          pickup_longitude?: number | null
          ride_type?:
            | Database["public"]["Enums"]["booking_ride_type_enum"]
            | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["booking_status_enum"] | null
          updated_at?: string | null
          user_id?: string | null
          vehicle_id?: string | null
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
            referencedRelation: "users"
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
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          reviewed_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewed_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          reviewed_id?: string
          reviewer_id?: string
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
      users: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
        }
        Relationships: []
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
      vehicles: {
        Row: {
          capacity: number | null
          color: string | null
          created_at: string | null
          id: string
          image_url: string | null
          license_plate: string | null
          make: string | null
          model: string | null
          status: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at: string | null
          vendor_id: string | null
          year: number | null
        }
        Insert: {
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          status?: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Update: {
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          license_plate?: string | null
          make?: string | null
          model?: string | null
          status?: Database["public"]["Enums"]["vehicle_status_enum"] | null
          type?: Database["public"]["Enums"]["vehicle_type_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          year?: number | null
        }
        Relationships: [
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      get_user_role: {
        Args: { user_uuid: string }
        Returns: Database["public"]["Enums"]["user_role_enum"]
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
      vehicle_status_enum: "active" | "maintenance" | "out_of_service"
      vehicle_type_enum: "sedan" | "suv" | "bike" | "luxury" | "van"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      vehicle_status_enum: ["active", "maintenance", "out_of_service"],
      vehicle_type_enum: ["sedan", "suv", "bike", "luxury", "van"],
    },
  },
} as const
