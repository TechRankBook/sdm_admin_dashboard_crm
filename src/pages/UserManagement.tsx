import React, { useState } from 'react'
import { UserManagementRecord, UserFilter } from '@/types/user-management'
import { useUserManagement } from '@/hooks/useUserManagement'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserStatsCards } from '@/components/users/UserStatsCards'
import { UserFilters } from '@/components/users/UserFilters'
import { UserManagementTable } from '@/components/users/UserManagementTable'
import { UserDetailModal } from '@/components/users/UserDetailModal'
import { Users, Download, RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const UserManagement: React.FC = () => {
  const {
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
  } = useUserManagement()

  const [filters, setFilters] = useState<UserFilter>({})
  const [selectedUser, setSelectedUser] = useState<UserManagementRecord | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  const handleFiltersChange = (newFilters: UserFilter) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    fetchUsers(filters)
  }

  const handleClearFilters = () => {
    setFilters({})
    fetchUsers()
  }

  const handleViewUser = (user: UserManagementRecord) => {
    setSelectedUser(user)
    setDetailModalOpen(true)
  }

  const handleRefresh = () => {
    fetchUsers(filters)
  }

  const handleExport = () => {
    // Simple CSV export
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'].join(','),
      ...users.map(user => [
        user.full_name || 'Unknown',
        user.email || '',
        user.phone_no || '',
        user.role,
        user.status,
        new Date(user.created_at).toLocaleDateString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  console.log('UserManagement render:', { 
    usersCount: users.length, 
    loading, 
    hasStats: !!stats,
    filtersActive: Object.keys(filters).length > 0
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={users.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <UserStatsCards stats={stats} loading={loading} />

      {/* Filters */}
      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Users ({users.length})</span>
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No users found. Check your filters or try refreshing the page.
              </AlertDescription>
            </Alert>
          ) : (
            <UserManagementTable
              users={users}
              onViewUser={handleViewUser}
              onBlockUser={blockUser}
              onUnblockUser={unblockUser}
              onDeleteUser={deleteUser}
              onChangeRole={changeUserRole}
            />
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false)
          setSelectedUser(null)
        }}
        onFetchActivities={fetchUserActivities}
        onFetchReviews={fetchUserReviews}
        onModerateReview={moderateReview}
      />
    </div>
  )
}