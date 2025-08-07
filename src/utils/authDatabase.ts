
import { supabase } from '@/lib/supabase'
import { authLog } from './authLogger'

// Fetch user role with retry logic and comprehensive error handling
export const fetchUserRole = async (userId: string, retryCount = 0): Promise<string | null> => {
  authLog("Starting role fetch for user:", userId, `(attempt ${retryCount + 1})`)
  
  try {
    // Shorter timeout with retry logic
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Role fetch timeout')), 2000) // 2 second timeout per attempt
    })

    const queryPromise = supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle() // Use maybeSingle to handle no results gracefully

    const result = await Promise.race([queryPromise, timeoutPromise])
    
    if (result.error) {
      authLog("Database error fetching role:", result.error.message)
      
      // Retry on specific errors
      if (retryCount < 2 && (
        result.error.message.includes('network') || 
        result.error.message.includes('timeout') ||
        result.error.message.includes('JWT') ||
        result.error.message.includes('refresh')
      )) {
        authLog("Retrying role fetch due to recoverable error")
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)) // Exponential backoff
        return fetchUserRole(userId, retryCount + 1)
      }
      
      return null
    }

    const role = result.data?.role || null
    authLog("Role fetch successful:", role)
    return role

  } catch (error: any) {
    authLog("Exception during role fetch:", error.message)
    
    // Retry on timeout and JWT errors
    if (retryCount < 2 && (
      error.message.includes('timeout') ||
      error.message.includes('JWT') ||
      error.message.includes('refresh') ||
      error.message.includes('fetch')
    )) {
      authLog("Retrying role fetch due to recoverable exception")
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000)) // Exponential backoff
      return fetchUserRole(userId, retryCount + 1)
    }
    
    return null
  }
}
