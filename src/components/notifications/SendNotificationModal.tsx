import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, User, Users } from 'lucide-react'
import { useNotifications, NotificationTemplate } from '@/hooks/useNotifications'
import { supabase } from '@/lib/supabase'

interface SendNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  templates?: NotificationTemplate[]
}

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' }
]

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  templates = []
}) => {
  const [sendType, setSendType] = useState<'single' | 'bulk'>('single')
  const [formData, setFormData] = useState({
    channel: 'in_app',
    title: '',
    message: '',
    template_id: '',
    user_id: '',
    user_search: '',
    bulk_criteria: 'all_users'
  })

  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  const { sendNotification, isSendingNotification } = useNotifications()

  const resetForm = () => {
    setFormData({
      channel: 'in_app',
      title: '',
      message: '',
      template_id: '',
      user_id: '',
      user_search: '',
      bulk_criteria: 'all_users'
    })
    setSearchResults([])
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (sendType === 'single' && formData.user_id) {
      sendNotification({
        user_id: formData.user_id,
        channel: formData.channel,
        title: formData.title,
        message: formData.message,
        template_id: formData.template_id || undefined
      })
    } else if (sendType === 'bulk') {
      await handleBulkSend()
    }
    
    handleClose()
  }

  const handleBulkSend = async () => {
    try {
      // Get target users based on criteria
      let userQuery = supabase.from('users').select('id')
      
      switch (formData.bulk_criteria) {
        case 'customers':
          userQuery = userQuery.eq('role', 'customer')
          break
        case 'drivers':
          userQuery = userQuery.eq('role', 'driver')
          break
        case 'recent_bookings':
          // Get users who made bookings in the last 30 days
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          
          const { data: recentBookings } = await supabase
            .from('bookings')
            .select('user_id')
            .gte('created_at', thirtyDaysAgo.toISOString())
          
          const userIds = [...new Set(recentBookings?.map(b => b.user_id))]
          userQuery = userQuery.in('id', userIds)
          break
        default:
          // all_users - no additional filter
          break
      }
      
      userQuery = userQuery.eq('status', 'active')
      
      const { data: targetUsers, error } = await userQuery
      
      if (error) throw error
      
      // Send notification to each user
      for (const user of targetUsers || []) {
        sendNotification({
          user_id: user.id,
          channel: formData.channel,
          title: formData.title,
          message: formData.message,
          template_id: formData.template_id || undefined
        })
      }
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
    }
  }

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setSearching(true)
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email, phone_no, role')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(10)
      
      if (error) throw error
      
      const mappedUsers = data?.map(user => ({
        id: user.id,
        name: user.full_name || user.email,
        email: user.email,
        role: user.role
      })) || []
      
      setSearchResults(mappedUsers as any)
    } catch (error) {
      console.error('Error searching users:', error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectedTemplate = templates.find(t => t.id === formData.template_id)

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        channel: template.channel,
        title: template.subject || prev.title,
        message: template.content
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>

        <Tabs value={sendType} onValueChange={(value) => setSendType(value as 'single' | 'bulk')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Single User
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Send
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="single" className="space-y-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label>Select User</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={formData.user_search}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, user_search: e.target.value }))
                      searchUsers(e.target.value)
                    }}
                    className="pl-8"
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {searchResults.map((user: any) => (
                      <div
                        key={user.id}
                        className={`p-2 cursor-pointer hover:bg-muted/50 ${
                          formData.user_id === user.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          user_id: user.id, 
                          user_search: `${user.name} (${user.email})` 
                        }))}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.email}</div>
                          </div>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={formData.bulk_criteria} onValueChange={(value) => setFormData(prev => ({ ...prev, bulk_criteria: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                    <SelectItem value="drivers">Drivers Only</SelectItem>
                    <SelectItem value="recent_bookings">Recent Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Use Template (Optional)</Label>
              <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.filter(t => t.is_active).map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center gap-2">
                        <span>{template.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {template.channel}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Channel Selection */}
            <div className="space-y-2">
              <Label>Channel</Label>
              <Select value={formData.channel} onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Content */}
            <div className="grid grid-cols-1 gap-4">
              {(formData.channel === 'email' || formData.channel === 'sms') && (
                <div className="space-y-2">
                  <Label htmlFor="title">Title/Subject</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="message">Message Content</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* Template Preview */}
            {selectedTemplate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Template Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge>{selectedTemplate.channel}</Badge>
                      <Badge variant="outline">{selectedTemplate.template_type}</Badge>
                    </div>
                    <div>
                      <Label className="text-xs">Variables:</Label>
                      <div className="text-muted-foreground">
                        {selectedTemplate.variables?.length ? 
                          selectedTemplate.variables.join(', ') : 
                          'No variables'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  isSendingNotification || 
                  (sendType === 'single' && !formData.user_id) ||
                  !formData.message.trim() ||
                  (formData.channel !== 'in_app' && !formData.title.trim())
                }
              >
                {isSendingNotification ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}