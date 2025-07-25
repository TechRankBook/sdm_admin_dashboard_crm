import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { authLog } from '@/utils/authLogger'

/**
 * Hook to sync auth.users with public.users table
 * Ensures data consistency between Supabase auth and application data
 */
export const useUserSync = () => {
  const { user, session } = useAuth()

  useEffect(() => {
    if (!user || !session) return

    const syncUserData = async () => {
      try {
        authLog('Syncing user data for:', user.id)
        
        // Check if user exists in public.users
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email, full_name, phone_no, profile_picture_url, updated_at')
          .eq('id', user.id)
          .maybeSingle()

        if (checkError) {
          authLog('Error checking existing user:', checkError.message)
          return
        }

        const authUserData = {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || existingUser?.full_name || 'User',
          phone_no: user.user_metadata?.phone || existingUser?.phone_no,
          profile_picture_url: user.user_metadata?.avatar_url || existingUser?.profile_picture_url,
          updated_at: new Date().toISOString()
        }

        if (!existingUser) {
          // Create new user record
          authLog('Creating new user record in public.users')
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              ...authUserData,
              role: 'customer', // Default role
              status: 'active',
              created_at: new Date().toISOString()
            })

          if (insertError) {
            authLog('Error creating user record:', insertError.message)
          } else {
            authLog('User record created successfully')
          }
        } else {
          // Update existing user record with any new auth metadata
          const hasChanges = 
            existingUser.email !== authUserData.email ||
            existingUser.full_name !== authUserData.full_name ||
            existingUser.phone_no !== authUserData.phone_no ||
            existingUser.profile_picture_url !== authUserData.profile_picture_url

          if (hasChanges) {
            authLog('Updating existing user record with auth metadata')
            const { error: updateError } = await supabase
              .from('users')
              .update(authUserData)
              .eq('id', user.id)

            if (updateError) {
              authLog('Error updating user record:', updateError.message)
            } else {
              authLog('User record updated successfully')
            }
          }
        }
      } catch (error: any) {
        authLog('Unexpected error during user sync:', error.message)
      }
    }

    // Run sync on mount and when user data changes
    syncUserData()
  }, [user?.id, user?.email, user?.user_metadata, session])

  return null // This hook doesn't return anything, it just performs side effects
}