
import { supabase } from '@/lib/supabase'
import { authLog } from './authLogger'

// Fetch user role with retry logic and comprehensive error handling
export const fetchUserRole = async (userId: string, retryCount = 0): Promise<string | null> => {
  authLog("Starting role fetch for user:", userId, `(attempt ${retryCount + 1})`)
  
  try {
    // Shorter timeout with retry logic
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Role fetch timeout')), 3000) // 3 second timeout per attempt
    })

    const queryPromise = supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    const result = await Promise.race([queryPromise, timeoutPromise])
    
    if (result.error) {
      authLog("Database error fetching role:", result.error.message)
      
      // Retry on network errors
      if (retryCount < 2 && (result.error.message.includes('network') || result.error.message.includes('timeout'))) {
        authLog("Retrying role fetch due to network error")
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
        return fetchUserRole(userId, retryCount + 1)
      }
      
      return null
    }

    const role = result.data?.role || null
    authLog("Role fetch successful:", role)
    return role

  } catch (error: any) {
    authLog("Exception during role fetch:", error.message)
    
    // Retry on timeout errors
    if (retryCount < 2 && error.message.includes('timeout')) {
      authLog("Retrying role fetch due to timeout")
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
      return fetchUserRole(userId, retryCount + 1)
    }
    
    return null
  }
}
