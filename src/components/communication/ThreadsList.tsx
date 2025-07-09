import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Plus, 
  MessageCircle, 
  User, 
  Truck, 
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react'
import { CommunicationThread } from '@/types/communication'
import { formatDistanceToNow } from 'date-fns'

interface ThreadsListProps {
  threads: CommunicationThread[]
  selectedThread: CommunicationThread | null
  onSelectThread: (thread: CommunicationThread) => void
  onCreateThread: () => void
  loading: boolean
}

export const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  selectedThread,
  onSelectThread,
  onCreateThread,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filteredThreads = threads.filter((thread) => {
    const matchesSearch = 
      (thread.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (thread.driver?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (thread.subject?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (thread.customer?.phone_no?.includes(searchTerm)) ||
      (thread.driver?.phone_no?.includes(searchTerm))

    const matchesStatus = statusFilter === 'all' || thread.status === statusFilter
    const matchesType = typeFilter === 'all' || thread.thread_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageCircle className="h-3 w-3" />
      case 'in_progress': return <Clock className="h-3 w-3" />
      case 'resolved': return <CheckCircle2 className="h-3 w-3" />
      case 'closed': return <XCircle className="h-3 w-3" />
      default: return <MessageCircle className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-l-gray-300'
      case 'normal': return 'border-l-blue-300'
      case 'high': return 'border-l-orange-300'
      case 'urgent': return 'border-l-red-300'
      default: return 'border-l-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle className="h-4 w-4" />
      case 'support': return <AlertCircle className="h-4 w-4" />
      case 'booking': return <Calendar className="h-4 w-4" />
      default: return <MessageCircle className="h-4 w-4" />
    }
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversations</CardTitle>
          <Button size="sm" onClick={onCreateThread}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[500px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredThreads.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => onSelectThread(thread)}
                  className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedThread?.id === thread.id ? 'bg-blue-50 border-l-blue-500' : getPriorityColor(thread.priority)
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {thread.customer?.full_name?.[0] || thread.driver?.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium truncate">
                          {thread.customer?.full_name || thread.driver?.full_name || 'Unknown User'}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {thread.unread_count && thread.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                              {thread.unread_count}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {thread.last_message_at 
                              ? formatDistanceToNow(new Date(thread.last_message_at), { addSuffix: true })
                              : formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        {thread.customer && <User className="h-3 w-3 text-blue-500" />}
                        {thread.driver && <Truck className="h-3 w-3 text-green-500" />}
                        <span className="text-xs text-gray-600">
                          {thread.customer?.phone_no || thread.driver?.phone_no}
                        </span>
                      </div>
                      
                      {thread.subject && (
                        <p className="text-sm text-gray-700 truncate mb-2">{thread.subject}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {getTypeIcon(thread.thread_type)}
                            <span className="ml-1 capitalize">{thread.thread_type}</span>
                          </Badge>
                          
                          <Badge className={`text-xs ${getStatusColor(thread.status)}`}>
                            {getStatusIcon(thread.status)}
                            <span className="ml-1 capitalize">{thread.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        
                        {thread.booking && (
                          <span className="text-xs text-gray-500">
                            #{thread.booking.id?.slice(0, 8)}
                          </span>
                        )}
                      </div>
                    </div>
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