import React from 'react'
import { UserStats } from '@/types/user-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, TrendingUp, Car, Store, Shield, User } from 'lucide-react'

interface UserStatsCardsProps {
  stats: UserStats | null
  loading?: boolean
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "All registered users",
      icon: Users,
      trend: `+${stats.newUsersThisMonth} this month`
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      description: "Currently active accounts",
      icon: UserCheck,
      trend: `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total`
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers.toLocaleString(),
      description: "Suspended or blocked accounts",
      icon: UserX,
      trend: stats.blockedUsers > 0 ? "Requires attention" : "All clear"
    },
    {
      title: "New This Month",
      value: stats.newUsersThisMonth.toLocaleString(),
      description: "Recent registrations",
      icon: TrendingUp,
      trend: "Monthly growth"
    },
    {
      title: "Customers",
      value: stats.roleDistribution.customers.toLocaleString(),
      description: "Regular customers",
      icon: User,
      trend: `${((stats.roleDistribution.customers / stats.totalUsers) * 100).toFixed(1)}% of users`
    },
    {
      title: "Drivers",
      value: stats.roleDistribution.drivers.toLocaleString(),
      description: "Active drivers",
      icon: Car,
      trend: `${((stats.roleDistribution.drivers / stats.totalUsers) * 100).toFixed(1)}% of users`
    },
    {
      title: "Vendors",
      value: stats.roleDistribution.vendors.toLocaleString(),
      description: "Partner vendors",
      icon: Store,
      trend: `${((stats.roleDistribution.vendors / stats.totalUsers) * 100).toFixed(1)}% of users`
    },
    {
      title: "Admins",
      value: stats.roleDistribution.admins.toLocaleString(),
      description: "System administrators",
      icon: Shield,
      trend: `${((stats.roleDistribution.admins / stats.totalUsers) * 100).toFixed(1)}% of users`
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.trend}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}