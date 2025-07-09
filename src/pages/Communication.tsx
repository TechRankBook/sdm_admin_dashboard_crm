
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Users, 
  Clock, 
  AlertCircle,
  BarChart3,
  UserCheck,
  Truck
} from 'lucide-react'
import { useCommunication } from '@/hooks/useCommunication'
import { ThreadsList } from '@/components/communication/ThreadsList'
import { ChatInterface } from '@/components/communication/ChatInterface'
import { UserActivityTimeline } from '@/components/communication/UserActivityTimeline'
import { CreateThreadModal } from '@/components/communication/CreateThreadModal'
import { useAuth } from '@/context/AuthContext'

export const Communication: React.FC = () => {
  const { user } = useAuth()
  const {
    threads,
    selectedThread,
    setSelectedThread,
    messages,
    activities,
    loading,
    fetchMessages,
    fetchUserActivities,
    sendMessage,
    createThread,
    updateThreadStatus
  } = useCommunication()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const handleSelectThread = (thread: any) => {
    setSelectedThread(thread)
    fetchMessages(thread.id)
    
    // Set selected user for activity timeline
    const userId = thread.customer_id || thread.driver_id
    if (userId && userId !== selectedUserId) {
      setSelectedUserId(userId)
      fetchUserActivities(userId)
    }
  }

  const handleSendMessage = (content: string, isInternal?: boolean) => {
    if (selectedThread) {
      sendMessage(selectedThread.id, content, isInternal)
    }
  }

  const handleUpdateStatus = (status: 'open' | 'in_progress' | 'resolved' | 'closed') => {
    if (selectedThread) {
      updateThreadStatus(selectedThread.id, status)
    }
  }

  const handleCreateThread = () => {
    setShowCreateModal(true)
  }

  const handleThreadCreated = (threadId: string) => {
    // Find and select the newly created thread
    const newThread = threads.find(t => t.id === threadId)
    if (newThread) {
      handleSelectThread(newThread)
    }
  }

  // Statistics
  const openThreads = threads.filter(t => t.status === 'open').length
  const inProgressThreads = threads.filter(t => t.status === 'in_progress').length
  const urgentThreads = threads.filter(t => t.priority === 'urgent').length
  const totalUnread = threads.reduce((sum, thread) => sum + (thread.unread_count || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer & Driver Communication CRM</h1>
        <p className="text-gray-600">Centralized communication management and support system</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Open Conversations</p>
                <p className="text-2xl font-bold">{openThreads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{inProgressThreads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold">{urgentThreads}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{totalUnread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
        {/* Threads List */}
        <div className="lg:col-span-1">
          <ThreadsList
            threads={threads}
            selectedThread={selectedThread}
            onSelectThread={handleSelectThread}
            onCreateThread={handleCreateThread}
            loading={loading}
          />
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Conversation</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Activity Timeline</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="h-full mt-4">
              <ChatInterface
                thread={selectedThread}
                messages={messages}
                onSendMessage={handleSendMessage}
                onUpdateStatus={handleUpdateStatus}
                currentUserId={user?.id || ''}
              />
            </TabsContent>

            <TabsContent value="activity" className="h-full mt-4">
              <UserActivityTimeline
                activities={activities}
                loading={loading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* User Profile Summary */}
      {selectedThread && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedThread.customer ? (
                <UserCheck className="h-5 w-5 text-blue-500" />
              ) : (
                <Truck className="h-5 w-5 text-green-500" />
              )}
              <span>
                {selectedThread.customer?.full_name || selectedThread.driver?.full_name} Profile
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Contact Information</p>
                <p className="font-medium">
                  {selectedThread.customer?.phone_no || selectedThread.driver?.phone_no}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedThread.customer?.email || selectedThread.driver?.email || 'No email'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">User Type</p>
                <Badge variant={selectedThread.customer ? 'default' : 'secondary'}>
                  {selectedThread.customer ? 'Customer' : 'Driver'}
                </Badge>
              </div>
              
              {selectedThread.booking && (
                <div>
                  <p className="text-sm text-gray-600">Related Booking</p>
                  <p className="font-medium">#{selectedThread.booking.id?.slice(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {selectedThread.booking.pickup_address} → {selectedThread.booking.dropoff_address}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Thread Modal */}
      <CreateThreadModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onThreadCreated={handleThreadCreated}
      />
    </div>
  )
}
