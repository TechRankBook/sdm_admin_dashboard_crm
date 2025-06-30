
import React, { createContext, useContext, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AuthContextType } from '@/types/auth'
import { useAuthState } from '@/hooks/useAuthState'
import { performSignIn, performSignOut, authLog } from '@/utils/authUtils'

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

    const initializeAuth = async () => {
      try {
        // Set up auth listener first
        authLog("Setting up auth state listener")
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (cleanup) return
            authLog("Auth state change event:", event)
            await handleSessionUpdate(newSession, 'listener')
          }
        )

        // Get initial session with timeout
        authLog("Getting initial session")
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Initial session timeout')), 6000)
        })

        const sessionPromise = supabase.auth.getSession()
        
        try {
          const { data: { session: initialSession }, error } = await Promise.race([
            sessionPromise, 
            timeoutPromise
          ])

          if (cleanup) return

          if (error) {
            authLog("Error getting initial session:", error.message)
          }

          authLog("Initial session retrieved:", !!initialSession)
          await handleSessionUpdate(initialSession, 'initial')

        } catch (error: any) {
          if (cleanup) return
          authLog("Timeout or error during initial session check:", error.message)
          // Continue anyway - don't block the app
          clearLoading()
        }

        // Cleanup function
        return () => {
          authLog("Cleaning up auth subscription")
          cleanup = true
          subscription.unsubscribe()
        }

      } catch (error: any) {
        if (cleanup) return
        authLog("Fatal error during auth initialization:", error.message)
        clearLoading()
      }
    }

    // Add safety timeout to absolutely guarantee loading is cleared
    const safetyTimeout = setTimeout(() => {
      if (!cleanup) {
        authLog("SAFETY TIMEOUT: Force clearing loading state")
        clearLoading()
      }
    }, 8000) // 8 second absolute maximum

    const cleanupPromise = initializeAuth()

    return () => {
      cleanup = true
      clearTimeout(safetyTimeout)
      cleanupPromise.then(cleanupFn => {
        if (cleanupFn) cleanupFn()
      })
    }
  }, [handleSessionUpdate, clearLoading])

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
