import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CommunicationThread, Message, UserActivity } from '@/types/communication'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export const useCommunication = () => {
  const [threads, setThreads] = useState<CommunicationThread[]>([])
  const [selectedThread, setSelectedThread] = useState<CommunicationThread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [activities, setActivities] = useState<UserActivity[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Fetch all threads
  const fetchThreads = useCallback(async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('communication_threads')
        .select(`
          *,
          customer:customers(id, full_name, phone_no, email),
          driver:drivers(id, full_name, phone_no, email),
          booking:bookings(id, pickup_address, dropoff_address, status)
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get unread message counts for each thread
      const threadsWithUnread = await Promise.all(
        (data || []).map(async (thread) => {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .not('read_by', 'cs', `["${user.id}"]`)

          return {
            ...thread,
            unread_count: count || 0
          }
        })
      )

      setThreads(threadsWithUnread)
    } catch (error: any) {
      toast.error('Failed to fetch conversations')
      console.error('Error fetching threads:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Fetch messages for a thread
  const fetchMessages = useCallback(async (threadId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments:message_attachments(*)
        `)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Get sender names
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (message) => {
          let senderName = 'Unknown'
          
          if (message.sender_type === 'admin') {
            const { data: admin } = await supabase
              .from('admins')
              .select('full_name')
              .eq('id', message.sender_id)
              .single()
            senderName = admin?.full_name || 'Admin'
          } else if (message.sender_type === 'customer') {
            const { data: customer } = await supabase
              .from('customers')
              .select('full_name')
              .eq('id', message.sender_id)
              .single()
            senderName = customer?.full_name || 'Customer'
          } else if (message.sender_type === 'driver') {
            const { data: driver } = await supabase
              .from('drivers')
              .select('full_name')
              .eq('id', message.sender_id)
              .single()
            senderName = driver?.full_name || 'Driver'
          }

          return {
            ...message,
            sender_name: senderName
          }
        })
      )

      setMessages(messagesWithSenders)

      // Mark messages as read
      const { data: unreadMessages } = await supabase
        .from('messages')
        .select('id, read_by')
        .eq('thread_id', threadId)
        .not('read_by', 'cs', `["${user.id}"]`)

      if (unreadMessages && unreadMessages.length > 0) {
        for (const message of unreadMessages) {
          const updatedReadBy = [...(message.read_by || []), user.id]
          await supabase
            .from('messages')
            .update({ read_by: updatedReadBy })
            .eq('id', message.id)
        }
      }

    } catch (error: any) {
      toast.error('Failed to fetch messages')
      console.error('Error fetching messages:', error)
    }
  }, [user])

  // Send a message
  const sendMessage = useCallback(async (
    threadId: string, 
    content: string, 
    isInternal: boolean = false
  ) => {
    if (!user) return

    try {
      const senderType = user.id.includes('admin') ? 'admin' : 
                        user.id.includes('driver') ? 'driver' : 'customer'

      const { error } = await supabase
        .from('messages')
        .insert({
          thread_id: threadId,
          sender_id: user.id,
          sender_type: senderType,
          content,
          is_internal: isInternal,
          read_by: [user.id]
        })

      if (error) throw error

      // Refresh messages
      await fetchMessages(threadId)
      await fetchThreads()

      toast.success('Message sent successfully')
    } catch (error: any) {
      toast.error('Failed to send message')
      console.error('Error sending message:', error)
    }
  }, [user, fetchMessages, fetchThreads])

  // Create a new thread
  const createThread = useCallback(async (
    type: 'chat' | 'support' | 'booking',
    customerId?: string,
    driverId?: string,
    bookingId?: string,
    subject?: string
  ) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('communication_threads')
        .insert({
          thread_type: type,
          customer_id: customerId,
          driver_id: driverId,
          booking_id: bookingId,
          subject: subject,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      await fetchThreads()
      return data
    } catch (error: any) {
      toast.error('Failed to create conversation')
      console.error('Error creating thread:', error)
    }
  }, [user, fetchThreads])

  // Update thread status
  const updateThreadStatus = useCallback(async (
    threadId: string, 
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ) => {
    try {
      const { error } = await supabase
        .from('communication_threads')
        .update({ 
          status,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', threadId)

      if (error) throw error

      await fetchThreads()
      toast.success(`Status updated to ${status}`)
    } catch (error: any) {
      toast.error('Failed to update status')
      console.error('Error updating thread status:', error)
    }
  }, [fetchThreads])

  // Fetch user activities
  const fetchUserActivities = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setActivities(data || [])
    } catch (error: any) {
      console.error('Error fetching activities:', error)
    }
  }, [])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    const messagesChannel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (selectedThread && payload.new.thread_id === selectedThread.id) {
            fetchMessages(selectedThread.id)
          }
          fetchThreads()
        }
      )
      .subscribe()

    const threadsChannel = supabase
      .channel('threads')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'communication_threads' },
        () => {
          fetchThreads()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(threadsChannel)
    }
  }, [user, selectedThread, fetchMessages, fetchThreads])

  return {
    threads,
    selectedThread,
    setSelectedThread,
    messages,
    activities,
    loading,
    fetchThreads,
    fetchMessages,
    fetchUserActivities,
    sendMessage,
    createThread,
    updateThreadStatus
  }
}