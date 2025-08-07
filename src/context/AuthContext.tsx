
import React, { createContext, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContextType } from '@/types/auth'
import { useAuthState } from '@/hooks/useAuthState'
import { performSignIn, performSignOut } from '@/utils/authOperations'
import { authLog } from '@/utils/authLogger'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authState, handleSessionUpdate, clearLoading, clearAuth } = useAuthState()

  // Initialize auth with comprehensive timeout protection
  useEffect(() => {
    authLog("Initializing AuthProvider")
    let cleanup = false
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        // Set up auth listener first to catch any immediate events
        authLog("Setting up auth state listener")
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            if (cleanup) return
            authLog("Auth state change event:", event)
            // Use setTimeout to prevent auth callback blocking
            setTimeout(() => {
              if (!cleanup) {
                handleSessionUpdate(newSession, 'listener').catch(error => {
                  authLog("Error in auth state change handler:", error.message)
                  if (!cleanup) clearLoading()
                })
              }
            }, 0)
          }
        )

        // Then get initial session
        authLog("Getting initial session")
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()

        if (cleanup) return

        if (error) {
          authLog("Error getting initial session:", error.message)
          clearLoading()
        } else {
          authLog("Initial session retrieved:", !!initialSession)
          await handleSessionUpdate(initialSession, 'initial')
        }

        // Cleanup function
        return () => {
          authLog("Cleaning up auth subscription")
          cleanup = true
          subscription.unsubscribe()
          if (timeoutId) clearTimeout(timeoutId)
        }

      } catch (error: any) {
        if (cleanup) return
        authLog("Fatal error during auth initialization:", error.message)
        clearLoading()
      }
    }

    // Safety timeout to absolutely guarantee loading is cleared
    timeoutId = setTimeout(() => {
      if (!cleanup) {
        authLog("SAFETY TIMEOUT: Force clearing loading state")
        clearLoading()
      }
    }, 2000) // Reduced to 2 seconds for faster recovery

    const cleanupPromise = initializeAuth()

    return () => {
      cleanup = true
      if (timeoutId) clearTimeout(timeoutId)
      cleanupPromise.then(cleanupFn => {
        if (cleanupFn) cleanupFn()
      })
    }
  }, [handleSessionUpdate, clearLoading])

  // User sync logic - moved here to avoid circular dependency
  useEffect(() => {
    if (!authState.user || !authState.session) return

    const syncUserData = async () => {
      try {
        authLog('Syncing user data for:', authState.user.id)
        
        // Check if user exists in public.users
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id, email, full_name, phone_no, profile_picture_url, updated_at')
          .eq('id', authState.user.id)
          .maybeSingle()

        if (checkError) {
          authLog('Error checking existing user:', checkError.message)
          return
        }

        const authUserData = {
          id: authState.user.id,
          email: authState.user.email,
          full_name: authState.user.user_metadata?.full_name || existingUser?.full_name || 'User',
          phone_no: authState.user.user_metadata?.phone || existingUser?.phone_no,
          profile_picture_url: authState.user.user_metadata?.avatar_url || existingUser?.profile_picture_url,
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
              .eq('id', authState.user.id)

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

    // Run sync when user data changes
    syncUserData()
  }, [authState.user?.id, authState.user?.email, authState.user?.user_metadata, authState.session])

  const signIn = async (email: string, password: string) => {
    return performSignIn(email, password)
  }

  const signOut = async () => {
    try {
      await performSignOut()
      clearAuth()
    } catch (error: any) {
      authLog("Error during sign out:", error.message)
    }
  }

  // Derived states
  const isAuthenticated = !!authState.session
  const isAdmin = authState.userRole === 'admin'

  authLog("Current auth state:", { 
    hasUser: !!authState.user, 
    hasSession: !!authState.session, 
    role: authState.userRole, 
    loading: authState.loading, 
    isAuthenticated, 
    isAdmin 
  })

  // Show loading screen only during initial load
  if (authState.loading) {
    authLog("Rendering loading screen")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading application...</p>
          <p className="text-sm text-gray-400 mt-2">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const value: AuthContextType = {
    user: authState.user,
    session: authState.session,
    userRole: authState.userRole,
    loading: authState.loading,
    isAuthenticated,
    isAdmin,
    signIn,
    signOut,
  }

  // Always provide the context value, even during transitions
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
