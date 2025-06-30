
import { supabase } from '@/lib/supabase'
import { authLog } from './authLogger'

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
