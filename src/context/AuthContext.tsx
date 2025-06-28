
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: string | null
  loading: boolean
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

  const checkUserRole = async (userId: string) => {
    try {
      console.log("Checking user role for ID:", userId)
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user role:', error.message, error.details)
        // If user doesn't exist in users table, sign them out
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setUserRole(null)
        toast.error('Access denied: User not found in system')
        return null
      } else {
        console.log("User role fetched:", data.role)
        setUserRole(data.role)
        
        // Check if user has admin role
        if (data.role !== 'admin') {
          console.log("User does not have admin role, signing out")
          await supabase.auth.signOut()
          setUser(null)
          setSession(null)
          setUserRole(null)
          toast.error('Access Denied: You do not have administrator privileges.')
          return null
        }
        return data.role
      }
    } catch (error: any) {
      console.error('Error checking user role:', error.message)
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserRole(null)
      toast.error('Access denied: Unable to verify permissions')
      return null
    }
  }

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state management")
    
    const initializeAuth = async () => {
      try {
        setLoading(true)
        console.log("AuthProvider: Getting initial session")
        
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("AuthProvider: Error getting initial session:", error.message)
          setLoading(false)
          return
        }

        if (initialSession?.user) {
          console.log("AuthProvider: Initial session found for user:", initialSession.user.email)
          setSession(initialSession)
          setUser(initialSession.user)
          
          const role = await checkUserRole(initialSession.user.id)
          if (role === 'admin') {
            console.log("AuthProvider: Admin user authenticated successfully")
          }
        } else {
          console.log("AuthProvider: No initial session found")
        }
      } catch (error: any) {
        console.error("AuthProvider: Error during initialization:", error.message)
      } finally {
        setLoading(false)
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("AuthProvider: Auth state change event:", event)
        
        if (newSession?.user) {
          console.log("AuthProvider: New session for user:", newSession.user.email)
          setSession(newSession)
          setUser(newSession.user)
          
          // Check role after successful authentication
          await checkUserRole(newSession.user.id)
        } else {
          console.log("AuthProvider: Session cleared")
          setSession(null)
          setUser(null)
          setUserRole(null)
        }
        
        setLoading(false)
      }
    )

    initializeAuth()

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription")
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log("AuthProvider: Attempting sign in for:", email)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error("AuthProvider: Sign in error:", error.message)
        setLoading(false)
        return { error }
      }

      if (data.user) {
        console.log("AuthProvider: Sign in successful for:", data.user.email)
        // Role check will happen in onAuthStateChange
      }
      
      return { error: null }
    } catch (error: any) {
      console.error("AuthProvider: Unexpected sign in error:", error.message)
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    console.log("AuthProvider: Signing out user")
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
  }

  // Global loading screen for initial auth check
  if (loading) {
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
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
