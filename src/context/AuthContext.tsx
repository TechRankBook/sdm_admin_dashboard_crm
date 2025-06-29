
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Add timestamp to logs for debugging
  const log = (message: string, ...args: any[]) => {
    console.log(`[AuthProvider ${new Date().toISOString()}]: ${message}`, ...args)
  }

  // Fetch user role with timeout and error handling
  const fetchUserRole = useCallback(async (userId: string): Promise<string | null> => {
    log("Starting role fetch for user:", userId)
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Role fetch timeout')), 10000) // 10 second timeout
      })

      const queryPromise = supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle to handle no results gracefully

      const result = await Promise.race([queryPromise, timeoutPromise])
      
      if (result.error) {
        log("Database error fetching role:", result.error.message)
        return null
      }

      const role = result.data?.role || null
      log("Role fetch successful:", role)
      return role

    } catch (error: any) {
      log("Exception during role fetch:", error.message)
      return null
    }
  }, [])

  // Handle session updates with guaranteed cleanup
  const handleSessionUpdate = useCallback(async (newSession: Session | null, source: string) => {
    log(`Session update from ${source}:`, !!newSession)
    
    // Always update session and user first
    setSession(newSession)
    setUser(newSession?.user ?? null)

    if (newSession?.user) {
      try {
        log("Fetching role for authenticated user")
        const role = await fetchUserRole(newSession.user.id)
        setUserRole(role)
        log("Role set successfully:", role)
      } catch (error: any) {
        log("Failed to fetch user role:", error.message)
        setUserRole(null)
      }
    } else {
      log("No session, clearing role")
      setUserRole(null)
    }
  }, [fetchUserRole])

  // Initialize auth with timeout protection
  useEffect(() => {
    log("Initializing AuthProvider")
    let cleanup = false

    const initializeAuth = async () => {
      try {
        // Set up auth listener first
        log("Setting up auth state listener")
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (cleanup) return
            log("Auth state change event:", event)
            await handleSessionUpdate(newSession, 'listener')
          }
        )

        // Get initial session with timeout
        log("Getting initial session")
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Initial session timeout')), 8000)
        })

        const sessionPromise = supabase.auth.getSession()
        
        try {
          const { data: { session: initialSession }, error } = await Promise.race([
            sessionPromise, 
            timeoutPromise
          ])

          if (cleanup) return

          if (error) {
            log("Error getting initial session:", error.message)
          }

          log("Initial session retrieved:", !!initialSession)
          await handleSessionUpdate(initialSession, 'initial')

        } catch (error: any) {
          if (cleanup) return
          log("Timeout or error during initial session check:", error.message)
          // Continue anyway - don't block the app
          setSession(null)
          setUser(null)
          setUserRole(null)
        }

        // Cleanup function
        return () => {
          log("Cleaning up auth subscription")
          cleanup = true
          subscription.unsubscribe()
        }

      } catch (error: any) {
        if (cleanup) return
        log("Fatal error during auth initialization:", error.message)
        setSession(null)
        setUser(null)
        setUserRole(null)
      } finally {
        if (!cleanup) {
          log("Auth initialization complete - setting loading to false")
          setLoading(false)
        }
      }
    }

    // Add safety timeout to absolutely guarantee loading is cleared
    const safetyTimeout = setTimeout(() => {
      if (!cleanup) {
        log("SAFETY TIMEOUT: Force clearing loading state")
        setLoading(false)
      }
    }, 12000) // 12 second absolute maximum

    const cleanupPromise = initializeAuth()

    return () => {
      cleanup = true
      clearTimeout(safetyTimeout)
      cleanupPromise.then(cleanupFn => {
        if (cleanupFn) cleanupFn()
      })
    }
  }, [handleSessionUpdate])

  const signIn = async (email: string, password: string) => {
    log("Attempting sign in for:", email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        log("Sign in error:", error.message)
        return { error }
      }

      log("Sign in successful for:", data.user?.email)
      return { error: null }
    } catch (error: any) {
      log("Unexpected sign in error:", error.message)
      return { error }
    }
  }

  const signOut = async () => {
    log("Signing out user")
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserRole(null)
    } catch (error: any) {
      log("Error during sign out:", error.message)
    }
  }

  // Derived states
  const isAuthenticated = !!session
  const isAdmin = userRole === 'admin'

  log("Current auth state:", { 
    hasUser: !!user, 
    hasSession: !!session, 
    role: userRole, 
    loading, 
    isAuthenticated, 
    isAdmin 
  })

  // Show loading screen only during initial load
  if (loading) {
    log("Rendering loading screen")
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

  const value = {
    user,
    session,
    userRole,
    loading,
    isAuthenticated,
    isAdmin,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
