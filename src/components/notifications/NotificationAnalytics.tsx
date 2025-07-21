import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { TrendingUp, TrendingDown, Send, CheckCircle, XCircle, Bell, Mail, MessageSquare, Phone, Smartphone } from 'lucide-react'
import { NotificationAnalytics as AnalyticsType } from '@/hooks/useNotifications'

interface NotificationAnalyticsProps {
  analytics?: AnalyticsType
}

const channelIcons = {
  in_app: Bell,
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  call: Smartphone
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const NotificationAnalytics: React.FC<NotificationAnalyticsProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              No analytics data available
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const deliveryRate = analytics.delivery_rate || 0
  const failureRate = analytics.total_sent > 0 ? (analytics.total_failed / analytics.total_sent) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Notifications dispatched
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate.toFixed(1)}%</div>
            <Progress value={deliveryRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.total_delivered.toLocaleString()} delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failure Rate</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failureRate.toFixed(1)}%</div>
            <Progress value={failureRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.total_failed.toLocaleString()} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.channel_breakdown?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active channels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Notification Trends</CardTitle>
            <CardDescription>Sent vs Delivered over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.daily_stats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value, name === 'sent' ? 'Sent' : 'Delivered']}
                />
                <Line 
                  type="monotone" 
                  dataKey="sent" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="delivered" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Channel Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution</CardTitle>
            <CardDescription>Notifications by delivery channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.channel_breakdown || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ channel, percent }) => `${channel} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {(analytics.channel_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Channel Performance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Detailed breakdown by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.channel_breakdown?.map((channel, index) => {
              const Icon = channelIcons[channel.channel as keyof typeof channelIcons]
              const successRate = channel.count > 0 ? (channel.delivered / channel.count) * 100 : 0
              const failureRate = channel.count > 0 ? (channel.failed / channel.count) * 100 : 0

              return (
                <div key={channel.channel} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md" style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium capitalize">{channel.channel.replace('_', ' ')}</div>
                      <div className="text-sm text-muted-foreground">
                        {channel.count.toLocaleString()} total notifications
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm font-medium text-green-600">{channel.delivered}</div>
                      <div className="text-xs text-muted-foreground">Delivered</div>
                      <Badge variant="outline" className="mt-1">
                        {successRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm font-medium text-red-600">{channel.failed}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                      <Badge variant="destructive" className="mt-1">
                        {failureRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="w-24">
                      <Progress value={successRate} className="h-2" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
          <CardDescription>Key insights and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-2">
              {deliveryRate >= 90 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <div>
                <div className="font-medium">Delivery Performance</div>
                <div className="text-sm text-muted-foreground">
                  {deliveryRate >= 90 ? 'Excellent' : deliveryRate >= 75 ? 'Good' : 'Needs Improvement'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium">Most Used Channel</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {analytics.channel_breakdown?.reduce((max, channel) => 
                    channel.count > (max?.count || 0) ? channel : max
                  )?.channel?.replace('_', ' ') || 'N/A'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <div className="font-medium">Best Performing</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {analytics.channel_breakdown?.reduce((best, channel) => {
                    const rate = channel.count > 0 ? (channel.delivered / channel.count) : 0
                    const bestRate = best?.count > 0 ? (best.delivered / best.count) : 0
                    return rate > bestRate ? channel : best
                  })?.channel?.replace('_', ' ') || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}