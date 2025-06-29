
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
        // If user doesn't exist in users table, this is a critical error
        if (error.code === 'PGRST116') {
          console.error('AuthProvider: User not found in users table, signing out')
          await supabase.auth.signOut()
          toast.error('Access denied: User not found in system')
          return null
        }
        throw error
      }

      console.log("AuthProvider: User role fetched successfully:", data.role)
      return data.role
    } catch (error: any) {
      console.error('AuthProvider: Exception in fetchUserRole:', error.message)
      return null
    }
  }, [])

  // Handle session and role updates
  const handleSessionUpdate = useCallback(async (newSession: Session | null) => {
    console.log("AuthProvider: Handling session update:", !!newSession)
    
    setSession(newSession)
    setUser(newSession?.user ?? null)

    if (newSession?.user) {
      console.log("AuthProvider: Session found, fetching user role for:", newSession.user.email)
      try {
        const role = await fetchUserRole(newSession.user.id)
        
        if (!role) {
          console.log("AuthProvider: No role found, clearing session")
          setUserRole(null)
          setSession(null)
          setUser(null)
          return
        }

        setUserRole(role)
        
        // Check if user has admin role
        if (role !== 'admin') {
          console.log("AuthProvider: User does not have admin role, signing out")
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
          setUserRole(null)
          toast.error('Access Denied: You do not have administrator privileges.')
          return
        }

        console.log("AuthProvider: Admin user authenticated successfully")
      } catch (error: any) {
        console.error('AuthProvider: Error during role check:', error.message)
        setUserRole(null)
        await supabase.auth.signOut()
        toast.error('Access denied: Unable to verify permissions')
      }
    } else {
      console.log("AuthProvider: No session, clearing user data")
      setUserRole(null)
    }
  }, [fetchUserRole])

  useEffect(() => {
    console.log("AuthProvider: Initializing authentication system")
    
    let isMounted = true

    const initializeAuth = async () => {
      try {
        console.log("AuthProvider: Getting initial session")
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("AuthProvider: Error getting initial session:", error.message)
          if (isMounted) {
            setLoading(false)
          }
          return
        }

        console.log("AuthProvider: Initial session check complete:", !!initialSession)
        
        if (isMounted) {
          await handleSessionUpdate(initialSession)
        }
      } catch (error: any) {
        console.error("AuthProvider: Exception during initialization:", error.message)
      } finally {
        if (isMounted) {
          console.log("AuthProvider: Setting loading to false")
          setLoading(false)
        }
      }
    }

    // Set up auth state listener first
    console.log("AuthProvider: Setting up auth state listener")
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("AuthProvider: Auth state change event:", event)
        
        if (isMounted) {
          // Don't set loading here - it's only for initial load
          await handleSessionUpdate(newSession)
        }
      }
    )

    // Then initialize
    initializeAuth()

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription")
      isMounted = false
      subscription.unsubscribe()
    }
  }, [handleSessionUpdate])

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
      // Session update will be handled by onAuthStateChange
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
