
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
    
    // Always update session and user first
    setAuthState(prev => ({
      ...prev,
      session: newSession,
      user: newSession?.user ?? null,
    }))

    if (newSession?.user) {
      try {
        authLog("Fetching role for authenticated user")
        const role = await fetchUserRole(newSession.user.id)
        
        setAuthState(prev => ({
          ...prev,
          userRole: role,
          loading: false, // Always clear loading after role fetch
        }))
        
        authLog("Role set successfully:", role)
      } catch (error: any) {
        authLog("Failed to fetch user role:", error.message)
        
        // On role fetch failure, preserve previous role if it exists to prevent flickering
        setAuthState(prev => ({
          ...prev,
          userRole: prev.userRole || null, // Keep existing role if available
          loading: false,
        }))
      }
    } else {
      authLog("No session, clearing role and loading")
      setAuthState(prev => ({
        ...prev,
        userRole: null,
        loading: false,
      }))
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
