import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { UserManagementRecord, UserFilter, ReviewRecord, UserActivity, UserStats } from '@/types/user-management'

export const useUserManagement = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserManagementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)

  const fetchUsers = async (filters?: UserFilter) => {
    setLoading(true)
    try {
      let query = supabase
        .from('user_management_view')
        .select('*')

      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role)
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_no.ilike.%${filters.search}%`)
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.from.toISOString())
          .lte('created_at', filters.dateRange.to.toISOString())
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Fetched users:', data?.length || 0, 'users')
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
      setUsers([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('Fetching user stats...')
      const { data: users, error } = await supabase
        .from('user_management_view')
        .select('role, status, created_at')

      if (error) {
        console.error('Stats query error:', error)
        throw error
      }

      console.log('Stats data received:', users?.length || 0, 'records')

      const totalUsers = users?.length || 0
      const activeUsers = users?.filter(u => u.status === 'active').length || 0
      const blockedUsers = users?.filter(u => u.status === 'blocked').length || 0
      
      const currentMonth = new Date()
      currentMonth.setDate(1)
      const newUsersThisMonth = users?.filter(u => 
        new Date(u.created_at) >= currentMonth
      ).length || 0

      const roleDistribution = {
        customers: users?.filter(u => u.role === 'customer').length || 0,
        drivers: users?.filter(u => u.role === 'driver').length || 0,
        vendors: users?.filter(u => u.role === 'vendor').length || 0,
        admins: users?.filter(u => u.role === 'admin').length || 0
      }

      const statsData = {
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersThisMonth,
        roleDistribution
      }

      console.log('Computed stats:', statsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set default stats on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        newUsersThisMonth: 0,
        roleDistribution: { customers: 0, drivers: 0, vendors: 0, admins: 0 }
      })
    }
  }

  const blockUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('toggle_user_block', {
        user_uuid: userId,
        admin_uuid: user?.id,
        action: 'block',
        reason
      })

      if (error) throw error
      toast.success('User blocked successfully')
      await fetchUsers()
    } catch (error) {
      console.error('Error blocking user:', error)
      toast.error('Failed to block user')
    }
  }

  const unblockUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('toggle_user_block', {
        user_uuid: userId,
        admin_uuid: user?.id,
        action: 'unblock'
      })

      if (error) throw error
      toast.success('User unblocked successfully')
      await fetchUsers()
    } catch (error) {
      console.error('Error unblocking user:', error)
      toast.error('Failed to unblock user')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('soft_delete_user', {
        user_uuid: userId,
        admin_uuid: user?.id
      })

      if (error) throw error
      toast.success('User deleted successfully')
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase.rpc('change_user_role', {
        user_uuid: userId,
        admin_uuid: user?.id,
        new_role: newRole
      })

      if (error) throw error
      toast.success('User role updated successfully')
      await fetchUsers()
    } catch (error) {
      console.error('Error changing user role:', error)
      toast.error('Failed to change user role')
    }
  }

  const fetchUserActivities = async (userId: string): Promise<UserActivity[]> => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user activities:', error)
      return []
    }
  }

  const fetchUserReviews = async (userId: string): Promise<ReviewRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .or(`reviewer_id.eq.${userId},reviewed_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user reviews:', error)
      return []
    }
  }

  const moderateReview = async (reviewId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          status,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes
        })
        .eq('id', reviewId)

      if (error) throw error
      toast.success('Review moderated successfully')
    } catch (error) {
      console.error('Error moderating review:', error)
      toast.error('Failed to moderate review')
    }
  }

  useEffect(() => {
    console.log('useUserManagement: Initializing...')
    fetchUsers()
    fetchStats()
  }, [])

  return {
    users,
    loading,
    stats,
    fetchUsers,
    blockUser,
    unblockUser,
    deleteUser,
    changeUserRole,
    fetchUserActivities,
    fetchUserReviews,
    moderateReview
  }
}