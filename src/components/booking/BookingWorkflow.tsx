import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Phone, 
  MessageSquare, 
  Navigation 
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingWorkflowProps {
  bookingId: string
  currentStatus: string
  onStatusUpdate: (newStatus: string) => void
}

const statusFlow = [
  { status: 'pending', label: 'Pending', description: 'Waiting for driver assignment' },
  { status: 'accepted', label: 'Accepted', description: 'Driver assigned and confirmed' },
  { status: 'started', label: 'Started', description: 'Driver en route to pickup' },
  { status: 'arrived', label: 'Arrived', description: 'Driver arrived at pickup location' },
  { status: 'picked_up', label: 'Picked Up', description: 'Customer picked up' },
  { status: 'completed', label: 'Completed', description: 'Trip completed successfully' }
]

const getStatusIcon = (status: string, isActive: boolean, isCompleted: boolean) => {
  if (isCompleted) {
    return <CheckCircle2 className="h-5 w-5 text-green-600" />
  }
  if (isActive) {
    return <Clock className="h-5 w-5 text-blue-600" />
  }
  return <div className="h-5 w-5 rounded-full bg-gray-300" />
}

const getStatusColor = (status: string, currentStatus: string) => {
  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus)
  const statusIndex = statusFlow.findIndex(s => s.status === status)
  
  if (statusIndex < currentIndex) return 'bg-green-100 border-green-200 text-green-800'
  if (statusIndex === currentIndex) return 'bg-blue-100 border-blue-200 text-blue-800'
  return 'bg-gray-100 border-gray-200 text-gray-600'
}

export const BookingWorkflow: React.FC<BookingWorkflowProps> = ({
  bookingId,
  currentStatus,
  onStatusUpdate
}) => {
  const [loading, setLoading] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      await onStatusUpdate(newStatus)
      toast.success(`Booking status updated to ${newStatus}`)
    } catch (error) {
      toast.error('Failed to update booking status')
    } finally {
      setLoading(false)
    }
  }

  const canAdvanceToStatus = (status: string) => {
    const currentIndex = statusFlow.findIndex(s => s.status === currentStatus)
    const targetIndex = statusFlow.findIndex(s => s.status === status)
    return targetIndex === currentIndex + 1
  }

  const currentIndex = statusFlow.findIndex(s => s.status === currentStatus)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Booking Workflow
        </CardTitle>
        <CardDescription>
          Track and manage booking progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Timeline */}
        <div className="space-y-4">
          {statusFlow.map((step, index) => {
            const isCompleted = index < currentIndex
            const isActive = index === currentIndex
            const canAdvance = canAdvanceToStatus(step.status)

            return (
              <div
                key={step.status}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(step.status, currentStatus)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(step.status, isActive, isCompleted)}
                  <div>
                    <p className="font-medium">{step.label}</p>
                    <p className="text-sm opacity-75">{step.description}</p>
                  </div>
                </div>
                
                {canAdvance && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(step.status)}
                    disabled={loading}
                    className="ml-2"
                  >
                    <ArrowRight className="h-4 w-4 mr-1" />
                    Advance
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Quick Actions</h4>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Call Customer
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-1" />
              Call Driver
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-1" />
              Send SMS
            </Button>
          </div>
        </div>

        {/* Status Actions */}
        {currentStatus === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Action Required</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              This booking needs driver assignment. Use the vehicle assignment panel to assign a driver.
            </p>
          </div>
        )}

        {currentStatus === 'started' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">In Progress</span>
            </div>
            <p className="text-sm text-blue-700">
              Driver is en route to pickup location. Monitor progress and communicate with customer if needed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}