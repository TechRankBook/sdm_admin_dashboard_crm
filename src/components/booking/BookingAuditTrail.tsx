import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { History, User, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface AuditEntry {
  id: string
  action: string
  description: string
  user: string
  timestamp: string
  details?: any
}

interface BookingAuditTrailProps {
  bookingId: string
}

export const BookingAuditTrail: React.FC<BookingAuditTrailProps> = ({ bookingId }) => {
  // Mock audit trail data - in real implementation, this would be fetched from database
  const auditEntries: AuditEntry[] = [
    {
      id: '1',
      action: 'created',
      description: 'Booking created',
      user: 'Admin User',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      action: 'driver_assigned',
      description: 'Driver John Doe assigned to booking',
      user: 'Admin User',
      timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '3',
      action: 'status_updated',
      description: 'Status changed from pending to accepted',
      user: 'Driver',
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
  ]

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '🆕'
      case 'driver_assigned':
        return '👤'
      case 'vehicle_assigned':
        return '🚗'
      case 'status_updated':
        return '📊'
      case 'fare_updated':
        return '💰'
      case 'cancelled':
        return '❌'
      default:
        return '📝'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-100 text-blue-800'
      case 'driver_assigned':
      case 'vehicle_assigned':
        return 'bg-green-100 text-green-800'
      case 'status_updated':
        return 'bg-purple-100 text-purple-800'
      case 'fare_updated':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="w-5 h-5" />
          <span>Audit Trail</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditEntries.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No audit entries found</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200"></div>
              
              {auditEntries.map((entry, index) => (
                <div key={entry.id} className="relative flex items-start space-x-4 pb-4">
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-200 rounded-full">
                      <span className="text-lg">{getActionIcon(entry.action)}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 font-medium">{entry.description}</p>
                    
                    <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                      <User className="w-3 h-3" />
                      <span>{entry.user}</span>
                    </div>
                    
                    {entry.details && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <pre>{JSON.stringify(entry.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}