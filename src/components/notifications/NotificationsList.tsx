import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bell, Mail, MessageSquare, Phone, Smartphone, Check, X, Clock, AlertCircle } from 'lucide-react'
import { Notification } from '@/hooks/useNotifications'
import { formatDistanceToNow } from 'date-fns'

interface NotificationsListProps {
  notifications?: Notification[]
  loading?: boolean
  showActions?: boolean
  onMarkAsRead?: (id: string) => void
}

const channelIcons = {
  in_app: Bell,
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  call: Smartphone
}

const statusIcons = {
  pending: Clock,
  sent: Bell,
  delivered: Check,
  failed: X,
  read: Check
}

const statusColors = {
  pending: 'text-yellow-600',
  sent: 'text-blue-600',
  delivered: 'text-green-600',
  failed: 'text-red-600',
  read: 'text-gray-600'
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications = [],
  loading = false,
  showActions = true,
  onMarkAsRead
}) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <div className="text-muted-foreground">No notifications found</div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => {
        const ChannelIcon = channelIcons[notification.channel as keyof typeof channelIcons] || Bell
        const StatusIcon = statusIcons[notification.delivery_status as keyof typeof statusIcons] || Clock
        const statusColor = statusColors[notification.delivery_status as keyof typeof statusColors] || 'text-gray-600'

        return (
          <div
            key={notification.id}
            className={`flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
              !notification.read ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            {/* Channel Icon */}
            <div className="p-2 rounded-md bg-primary/10">
              <ChannelIcon className="h-4 w-4 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {notification.title && (
                    <div className="font-medium text-sm mb-1 line-clamp-1">
                      {notification.title}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {notification.message}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                    {notification.channel && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {notification.channel.replace('_', ' ')}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-center space-x-2 ml-2">
                  <div className="flex items-center space-x-1">
                    <StatusIcon className={`h-3 w-3 ${statusColor}`} />
                    <span className={`text-xs capitalize ${statusColor}`}>
                      {notification.delivery_status}
                    </span>
                  </div>

                  {showActions && !notification.read && onMarkAsRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-6 px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {notification.delivery_attempts > 1 && (
                <div className="flex items-center space-x-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-amber-600">
                    {notification.delivery_attempts} attempts
                  </span>
                </div>
              )}

              {notification.failed_reason && (
                <div className="mt-1 text-xs text-red-600 bg-red-50 p-1 rounded">
                  {notification.failed_reason}
                </div>
              )}

              {notification.delivered_at && notification.delivery_status === 'delivered' && (
                <div className="text-xs text-green-600 mt-1">
                  Delivered {formatDistanceToNow(new Date(notification.delivered_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}