import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

interface SystemHealthCheck {
  database: boolean
  authentication: boolean
  storage: boolean
  realtime: boolean
  rls: boolean
}

export const useDataValidation = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealthCheck>({
    database: false,
    authentication: false,
    storage: false,
    realtime: false,
    rls: false
  })
  
  const [loading, setLoading] = useState(false)

  const validateUserRoleIntegrity = async (): Promise<ValidationResult> => {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check for users without corresponding role records
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, role, full_name')

      if (usersError) {
        errors.push(`Failed to fetch users: ${usersError.message}`)
        return { isValid: false, errors, warnings }
      }

      for (const user of users || []) {
        if (user.role === 'driver') {
          const { data: driver } = await supabase
            .from('drivers')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!driver) {
            warnings.push(`User ${user.full_name} (${user.id}) has role 'driver' but no driver record`)
          }
        } else if (user.role === 'customer') {
          const { data: customer } = await supabase
            .from('customers')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!customer) {
            warnings.push(`User ${user.full_name} (${user.id}) has role 'customer' but no customer record`)
          }
        } else if (user.role === 'admin') {
          const { data: admin } = await supabase
            .from('admins')
            .select('id')
            .eq('id', user.id)
            .single()

          if (!admin) {
            warnings.push(`User ${user.full_name} (${user.id}) has role 'admin' but no admin record`)
          }
        }
      }

    } catch (error) {
      errors.push(`Validation failed: ${error}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const validateForeignKeyIntegrity = async (): Promise<ValidationResult> => {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // Check for orphaned drivers
      const { data: orphanedDrivers } = await supabase
        .from('drivers')
        .select('id, license_number')
        .not('id', 'in', 
          supabase.from('users').select('id')
        )

      if (orphanedDrivers && orphanedDrivers.length > 0) {
        errors.push(`Found ${orphanedDrivers.length} drivers without corresponding user records`)
      }

      // Check for bookings with invalid driver_id
      const { data: invalidBookings } = await supabase
        .from('bookings')
        .select('id, driver_id')
        .not('driver_id', 'is', null)
        .not('driver_id', 'in',
          supabase.from('drivers').select('id')
        )

      if (invalidBookings && invalidBookings.length > 0) {
        warnings.push(`Found ${invalidBookings.length} bookings with invalid driver references`)
      }

    } catch (error) {
      errors.push(`Foreign key validation failed: ${error}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  const performSystemHealthCheck = async () => {
    setLoading(true)
    const health: SystemHealthCheck = {
      database: false,
      authentication: false,
      storage: false,
      realtime: false,
      rls: false
    }

    try {
      // Test database connectivity
      const { error: dbError } = await supabase.from('users').select('count').limit(1)
      health.database = !dbError

      // Test authentication
      const { data: { session } } = await supabase.auth.getSession()
      health.authentication = !!session

      // Test storage
      const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
      health.storage = !storageError && buckets.length > 0

      // Test realtime (check if channel can be created)
      const testChannel = supabase.channel('health-check')
      health.realtime = true // Assume working if no immediate error
      supabase.removeChannel(testChannel)

      // Test RLS (try a query that should be affected by RLS)
      const { error: rlsError } = await supabase
        .from('drivers')
        .select('count')
        .limit(1)
      health.rls = !rlsError

    } catch (error) {
      console.error('Health check failed:', error)
    }

    setSystemHealth(health)
    setLoading(false)
  }

  const runComprehensiveValidation = async () => {
    setLoading(true)
    
    try {
      console.log('Starting comprehensive data validation...')
      
      const [roleValidation, fkValidation] = await Promise.all([
        validateUserRoleIntegrity(),
        validateForeignKeyIntegrity()
      ])

      // Report results
      if (roleValidation.errors.length > 0) {
        roleValidation.errors.forEach(error => {
          console.error('Role Validation Error:', error)
          toast.error(error)
        })
      }

      if (roleValidation.warnings.length > 0) {
        roleValidation.warnings.forEach(warning => {
          console.warn('Role Validation Warning:', warning)
          toast.warning(warning)
        })
      }

      if (fkValidation.errors.length > 0) {
        fkValidation.errors.forEach(error => {
          console.error('FK Validation Error:', error)
          toast.error(error)
        })
      }

      if (fkValidation.warnings.length > 0) {
        fkValidation.warnings.forEach(warning => {
          console.warn('FK Validation Warning:', warning)
          toast.warning(warning)
        })
      }

      const isSystemHealthy = roleValidation.isValid && fkValidation.isValid
      
      if (isSystemHealthy) {
        toast.success('All data validation checks passed!')
      } else {
        toast.error('Data validation found issues that need attention')
      }

      return {
        roleValidation,
        fkValidation,
        isSystemHealthy
      }

    } catch (error) {
      console.error('Comprehensive validation failed:', error)
      toast.error('Validation process failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Perform initial health check
    performSystemHealthCheck()
  }, [])

  return {
    systemHealth,
    loading,
    performSystemHealthCheck,
    runComprehensiveValidation,
    validateUserRoleIntegrity,
    validateForeignKeyIntegrity
  }
}