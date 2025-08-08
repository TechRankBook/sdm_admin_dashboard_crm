import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  full_name: string
  email: string
  profile_picture_url?: string
  phone_no?: string
  created_at?: string
  updated_at?: string
}

export const useProfile = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch current user profile from unified users table
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      // Get profile data using the unified function
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_profile', { user_uuid: user.id })

      if (profileError) throw profileError

      // The function returns a JSON object with all the needed data
      const profile: UserProfile & { [key: string]: any } = {
        id: profileData.id,
        full_name: profileData.full_name || user.user_metadata?.full_name || 'User',
        email: profileData.email || user.email || '',
        profile_picture_url: profileData.profile_picture_url || user.user_metadata?.avatar_url,
        phone_no: profileData.phone_no,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
        role: profileData.role,
        status: profileData.status
      }

      // Add role-specific data from the JSON structure
      if (profileData.admin_data) {
        Object.assign(profile, profileData.admin_data)
      }
      if (profileData.customer_data) {
        Object.assign(profile, profileData.customer_data)
      }
      if (profileData.driver_data) {
        Object.assign(profile, profileData.driver_data)
      }

      return profile
    },
    enabled: !!user?.id
  })

  // Update profile mutation - now uses unified users table
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile & { [key: string]: any }>) => {
      if (!user?.id || !profile) throw new Error('No user or profile found')

      // Separate common fields from role-specific fields
      const commonFields = {
        full_name: updates.full_name,
        email: updates.email,
        phone_no: updates.phone_no,
        profile_picture_url: updates.profile_picture_url,
        updated_at: new Date().toISOString()
      }

      const roleSpecificFields = { ...updates }
      delete roleSpecificFields.full_name
      delete roleSpecificFields.email
      delete roleSpecificFields.phone_no
      delete roleSpecificFields.profile_picture_url
      delete roleSpecificFields.id
      delete roleSpecificFields.created_at
      delete roleSpecificFields.updated_at
      delete roleSpecificFields.role
      delete roleSpecificFields.status

      // Update common fields in users table
      const { error: usersError } = await supabase
        .from('users')
        .update(commonFields)
        .eq('id', user.id)

      if (usersError) throw usersError

      // Update role-specific fields if any
      if (Object.keys(roleSpecificFields).length > 0) {
        const role = profile.role
        let roleResult

        if (role === 'admin') {
          const adminFields = {
            can_approve_bookings: roleSpecificFields.can_approve_bookings,
            assigned_region: roleSpecificFields.assigned_region,
            updated_at: new Date().toISOString()
          }
          
          roleResult = await supabase
            .from('admins')
            .update(adminFields)
            .eq('id', user.id)
        } else if (role === 'customer') {
          const customerFields = {
            loyalty_points: roleSpecificFields.loyalty_points,
            dob: roleSpecificFields.dob,
            preferred_payment_method: roleSpecificFields.preferred_payment_method,
            referral_code: roleSpecificFields.referral_code,
            updated_at: new Date().toISOString()
          }
          
          roleResult = await supabase
            .from('customers')
            .update(customerFields)
            .eq('id', user.id)
        } else if (role === 'driver') {
          const driverFields = {
            license_number: roleSpecificFields.license_number,
            status: roleSpecificFields.driver_status,
            rating: roleSpecificFields.rating,
            total_rides: roleSpecificFields.total_rides,
            current_latitude: roleSpecificFields.current_latitude,
            current_longitude: roleSpecificFields.current_longitude,
            kyc_status: roleSpecificFields.kyc_status,
            updated_at: new Date().toISOString()
          }
          
          roleResult = await supabase
            .from('drivers')
            .update(driverFields)
            .eq('id', user.id)
        }

        if (roleResult?.error) throw roleResult.error
      }

      return { success: true }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    }
  })

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'admins', filter: `id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'customers', filter: `id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'drivers', filter: `id=eq.${user.id}` },
        () => queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])

  return {
    profile,
    profileLoading,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending
  }
}