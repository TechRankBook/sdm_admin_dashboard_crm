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

  // Fetch current user profile based on role
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      // Try to get profile from different tables based on user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      const role = userData?.role

      let profile: UserProfile | null = null

      // Get profile data based on role
      if (role === 'admin') {
        const { data, error } = await supabase
          .from('admins')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          profile = {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            profile_picture_url: data.profile_picture_url,
            phone_no: data.phone_no,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        }
      } else if (role === 'customer') {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          profile = {
            id: data.id,
            full_name: data.full_name,
            email: data.email || user.email || '',
            profile_picture_url: data.profile_picture_url,
            phone_no: data.phone_no,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        }
      } else if (role === 'driver') {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (!error && data) {
          profile = {
            id: data.id,
            full_name: data.full_name,
            email: data.email || user.email || '',
            profile_picture_url: data.profile_picture_url,
            phone_no: data.phone_no,
            created_at: data.created_at,
            updated_at: data.updated_at
          }
        }
      }

      // Fallback to auth user data if no profile found
      if (!profile) {
        profile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || 'User',
          email: user.email || '',
          profile_picture_url: user.user_metadata?.avatar_url
        }
      }

      return profile
    },
    enabled: !!user?.id
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      if (!user?.id || !profile) throw new Error('No user or profile found')

      // Get user role first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError) throw userError

      const role = userData?.role
      let result

      // Update based on role
      if (role === 'admin') {
        result = await supabase
          .from('admins')
          .update({
            full_name: updates.full_name,
            profile_picture_url: updates.profile_picture_url,
            phone_no: updates.phone_no,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()
      } else if (role === 'customer') {
        result = await supabase
          .from('customers')
          .update({
            full_name: updates.full_name,
            profile_picture_url: updates.profile_picture_url,
            phone_no: updates.phone_no,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()
      } else if (role === 'driver') {
        result = await supabase
          .from('drivers')
          .update({
            full_name: updates.full_name,
            profile_picture_url: updates.profile_picture_url,
            phone_no: updates.phone_no,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()
      }

      if (result?.error) throw result.error
      return result?.data
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