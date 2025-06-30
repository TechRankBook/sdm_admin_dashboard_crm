
import { supabase } from '@/lib/supabase'

// Enhanced logging with timestamps for debugging
export const authLog = (message: string, ...args: any[]) => {
  console.log(`[AuthProvider ${new Date().toISOString()}]: ${message}`, ...args)
}

// Fetch user role with timeout and comprehensive error handling
export const fetchUserRole = async (userId: string): Promise<string | null> => {
  authLog("Starting role fetch for user:", userId)
  
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Role fetch timeout')), 8000) // 8 second timeout
    })

    const queryPromise = supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    const result = await Promise.race([queryPromise, timeoutPromise])
    
    if (result.error) {
      authLog("Database error fetching role:", result.error.message)
      return null
    }

    const role = result.data?.role || null
    authLog("Role fetch successful:", role)
    return role

  } catch (error: any) {
    authLog("Exception during role fetch:", error.message)
    return null
  }
}

// Handle auth operations with comprehensive error handling
export const performSignIn = async (email: string, password: string) => {
  authLog("Attempting sign in for:", email)
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      authLog("Sign in error:", error.message)
      return { error }
    }

    authLog("Sign in successful for:", data.user?.email)
    return { error: null }
  } catch (error: any) {
    authLog("Unexpected sign in error:", error.message)
    return { error }
  }
}

export const performSignOut = async () => {
  authLog("Signing out user")
  try {
    await supabase.auth.signOut()
    authLog("Sign out successful")
  } catch (error: any) {
    authLog("Error during sign out:", error.message)
    throw error
  }
}
