
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmualcoqyztvtsqhjlzb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdWFsY29xeXp0dnRzcWhqbHpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NDg4NjIsImV4cCI6MjA2NjQyNDg2Mn0.qQxh6IPHrvDQ5Jsma42eHpRTjeG9vpa0rIkErPeCJe0'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are not set!")
  throw new Error("Missing Supabase configuration")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Add initialization check with enhanced debugging
console.log("Supabase client initializing...")
supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
        console.error("Supabase client initialization error:", error.message)
        return
    }
    if (data.session) {
        console.log("Supabase client initialized - Active session found:", data.session.user.email)
    } else {
        console.log("Supabase client initialized - No active session")
    }
}).catch(error => {
    console.error("Supabase client initialization check failed:", error.message)
})
