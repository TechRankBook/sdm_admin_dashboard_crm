
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

  // Memoized function to fetch user role
  const fetchUserRole = useCallback(async (userId: string): Promise<string | null> => {
    console.log("AuthProvider: Fetching user role for ID:", userId)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('AuthProvider: Error fetching user role:', error.message, error.details)
        return null
      }

      console.log("AuthProvider: User role fetched successfully:", data.role)
      return data.role
    } catch (error: any) {
      console.error('AuthProvider: Exception in fetchUserRole:', error.message)
      return null
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    console.log("AuthProvider: Initializing authentication system")
    
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Getting initial session")
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("AuthProvider: Error getting initial session:", error.message)
          // Continue execution, don't return early
        }

        console.log("AuthProvider: Initial session check complete:", !!initialSession)
        
        if (isMounted) {
          // Always update session state
          setSession(initialSession)
          setUser(initialSession?.user ?? null)

          // Try to fetch role if we have a session
          if (initialSession?.user) {
            console.log("AuthProvider: Session found, fetching user role for:", initialSession.user.email)
            try {
              const role = await fetchUserRole(initialSession.user.id)
              
              if (isMounted) {
                setUserRole(role)
                
                if (role !== 'admin') {
                  console.log("AuthProvider: User does not have admin role")
                  // Don't sign out automatically, just set role to null
                  // Let the app handle this in ProtectedRoute
                }
              }
            } catch (error: any) {
              console.error('AuthProvider: Error during role check:', error.message)
              if (isMounted) {
                setUserRole(null)
              }
            }
          } else {
            console.log("AuthProvider: No session found")
            setUserRole(null)
          }
        }
      } catch (error: any) {
        console.error("AuthProvider: Exception during initialization:", error.message)
        if (isMounted) {
          setSession(null)
          setUser(null)
          setUserRole(null)
        }
      } finally {
        if (isMounted) {
          console.log("AuthProvider: Setting loading to false")
          setLoading(false)
        }
      }
    }

    // Set up auth state listener
    console.log("AuthProvider: Setting up auth state listener")
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("AuthProvider: Auth state change event:", event)
        
        if (isMounted) {
          setSession(newSession)
          setUser(newSession?.user ?? null)

          if (newSession?.user) {
            try {
              const role = await fetchUserRole(newSession.user.id)
              setUserRole(role)
            } catch (error: any) {
              console.error('AuthProvider: Error fetching role on auth change:', error.message)
              setUserRole(null)
            }
          } else {
            setUserRole(null)
          }
        }
      }
    )

    // Initialize auth
    initializeAuth()

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription")
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserRole])

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in for:", email)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error("AuthProvider: Sign in error:", error.message)
        return { error }
      }

      console.log("AuthProvider: Sign in successful for:", data.user?.email)
      return { error: null }
    } catch (error: any) {
      console.error("AuthProvider: Unexpected sign in error:", error.message)
      return { error }
    }
  }

  const signOut = async () => {
    console.log("AuthProvider: Signing out user")
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserRole(null)
    } catch (error: any) {
      console.error("AuthProvider: Error during sign out:", error.message)
    }
  }

  // Derived states
  const isAuthenticated = !!session
  const isAdmin = userRole === 'admin'

  // Global loading screen for initial auth check
  if (loading) {
    console.log("AuthProvider: Rendering loading screen")
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

  console.log("AuthProvider: Rendering children - auth check complete")

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
