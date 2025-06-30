
import { supabase } from '@/lib/supabase'
import { authLog } from './authLogger'

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
