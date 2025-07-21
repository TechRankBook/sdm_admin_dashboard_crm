import { useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { AuthState } from '@/types/auth'
import { fetchUserRole } from '@/utils/authDatabase'
import { authLog } from '@/utils/authLogger'

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userRole: null,
    loading: true,
  })

  // Handle session updates with guaranteed state management
  const handleSessionUpdate = useCallback(async (newSession: Session | null, source: string) => {
    authLog(`Session update from ${source}:`, !!newSession)
    
    if (newSession?.user) {
      // Set session and user immediately
      setAuthState(prev => ({
        ...prev,
        session: newSession,
        user: newSession.user,
        loading: true, // Keep loading while fetching role
      }))

      try {
        authLog("Fetching role for authenticated user")
        const role = await fetchUserRole(newSession.user.id)
        
        // Update with role and clear loading
        setAuthState(prev => ({
          ...prev,
          userRole: role,
          loading: false,
        }))
        
        authLog("Role set successfully:", role)
      } catch (error: any) {
        authLog("Failed to fetch user role:", error.message)
        
        // On role fetch failure, set loading to false but keep user/session
        setAuthState(prev => ({
          ...prev,
          userRole: null,
          loading: false,
        }))
      }
    } else {
      // No session - clear everything
      authLog("No session, clearing all auth state")
      setAuthState({
        user: null,
        session: null,
        userRole: null,
        loading: false,
      })
    }
  }, [])

  const clearLoading = useCallback(() => {
    setAuthState(prev => ({ ...prev, loading: false }))
  }, [])

  const clearAuth = useCallback(() => {
    setAuthState({
      user: null,
      session: null,
      userRole: null,
      loading: false,
    })
  }, [])

  return {
    authState,
    handleSessionUpdate,
    clearLoading,
    clearAuth,
  }
}
