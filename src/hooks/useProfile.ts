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

      // Get profile data from unified users table with role-specific joins
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          admins(
            can_approve_bookings,
            assigned_region
          ),
          customers(
            loyalty_points,
            dob,
            preferred_payment_method,
            referral_code
          ),
          drivers(
            license_number,
            status,
            rating,
            total_rides,
            current_latitude,
            current_longitude,
            kyc_status,
            joined_on
          )
        `)
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      // Transform data to include role-specific information
      const profile: UserProfile & { [key: string]: any } = {
        id: (userData as any).id,
        full_name: (userData as any).full_name || user.user_metadata?.full_name || 'User',
        email: (userData as any).email || user.email || '',
        profile_picture_url: (userData as any).profile_picture_url || user.user_metadata?.avatar_url,
        phone_no: (userData as any).phone_no,
        created_at: (userData as any).created_at,
        updated_at: (userData as any).updated_at,
        role: (userData as any).role,
        status: (userData as any).status
      }

      // Add role-specific data
      if ((userData as any).role === 'admin' && (userData as any).admins?.[0]) {
        profile.can_approve_bookings = (userData as any).admins[0].can_approve_bookings
        profile.assigned_region = (userData as any).admins[0].assigned_region
      } else if ((userData as any).role === 'customer' && (userData as any).customers?.[0]) {
        profile.loyalty_points = (userData as any).customers[0].loyalty_points
        profile.dob = (userData as any).customers[0].dob
        profile.preferred_payment_method = (userData as any).customers[0].preferred_payment_method
        profile.referral_code = (userData as any).customers[0].referral_code
      } else if ((userData as any).role === 'driver' && (userData as any).drivers?.[0]) {
        profile.license_number = (userData as any).drivers[0].license_number
        profile.driver_status = (userData as any).drivers[0].status
        profile.rating = (userData as any).drivers[0].rating
        profile.total_rides = (userData as any).drivers[0].total_rides
        profile.current_latitude = (userData as any).drivers[0].current_latitude
        profile.current_longitude = (userData as any).drivers[0].current_longitude
        profile.kyc_status = (userData as any).drivers[0].kyc_status
        profile.joined_on = (userData as any).drivers[0].joined_on
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