import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Calendar,
  MessageCircle,
  DollarSign,
  User,
  Truck,
  AlertCircle,
  Settings,
  XCircle,
  Clock
} from 'lucide-react'
import { UserActivity } from '@/types/communication'
import { formatDistanceToNow, format } from 'date-fns'

interface UserActivityTimelineProps {
  activities: UserActivity[]
  loading: boolean
}

export const UserActivityTimeline: React.FC<UserActivityTimelineProps> = ({
  activities,
  loading
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking_created': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'booking_cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      case 'driver_assigned': return <Truck className="h-4 w-4 text-green-500" />
      case 'payment_completed': return <DollarSign className="h-4 w-4 text-emerald-500" />
      case 'message_sent': return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'ticket_created': return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'admin_action': return <Settings className="h-4 w-4 text-gray-500" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'booking_created': return 'bg-blue-100 text-blue-800'
      case 'booking_cancelled': return 'bg-red-100 text-red-800'
      case 'driver_assigned': return 'bg-green-100 text-green-800'
      case 'payment_completed': return 'bg-emerald-100 text-emerald-800'
      case 'message_sent': return 'bg-purple-100 text-purple-800'
      case 'ticket_created': return 'bg-orange-100 text-orange-800'
      case 'admin_action': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Activity Timeline
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No activity found</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.map((activity, index) => (
              <div key={activity.id} className="relative">
                {/* Timeline line */}
                {index !== activities.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={`text-xs ${getActivityColor(activity.activity_type)}`}>
                            {activity.activity_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          
                          {activity.booking_id && (
                            <Badge variant="outline" className="text-xs">
                              Booking #{activity.booking_id.slice(0, 8)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')} • {' '}
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                        
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <details>
                              <summary className="cursor-pointer text-gray-600">View details</summary>
                              <pre className="mt-1 text-gray-700 whitespace-pre-wrap">
                                {JSON.stringify(activity.metadata, null, 2)}
                              </pre>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}