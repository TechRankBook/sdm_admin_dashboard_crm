import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Search, User, Users, Check, ChevronsUpDown } from 'lucide-react'
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
  const [userOptions, setUserOptions] = useState<{ id: string; name: string; email?: string; phone?: string; role?: string }[]>([])
  const [initialUserOptions, setInitialUserOptions] = useState<{ id: string; name: string; email?: string; phone?: string; role?: string }[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [comboboxQuery, setComboboxQuery] = useState('')

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

  // Fetch initial users when modal opens
  useEffect(() => {
    const fetchInitialUsers = async () => {
      if (!isOpen) return
      setLoadingUsers(true)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email, phone_no, role')
          .eq('status', 'active')
          .order('full_name', { ascending: true })
          .limit(100)
        if (error) throw error
        const options = (data || []).map(u => ({
          id: u.id,
          name: u.full_name || u.email || u.id,
          email: u.email || undefined,
          phone: u.phone_no || undefined,
          role: u.role as any,
        }))
        setUserOptions(options)
        setInitialUserOptions(options)
      } catch (e) {
        console.error('Failed to load users:', e)
        setUserOptions([])
        setInitialUserOptions([])
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchInitialUsers()
  }, [isOpen])

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
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,phone_no.ilike.%${query}%`)
        .eq('status', 'active')
        .limit(20)
      
      if (error) throw error
      
      const mappedUsers = data?.map(user => ({
        id: user.id,
        name: user.full_name || user.email || user.id,
        email: user.email || undefined,
        phone: user.phone_no || undefined,
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
                {/* Combined search + dropdown (combobox) */}
                <Popover open={userPopoverOpen} onOpenChange={setUserPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {formData.user_id ? (
                        (() => {
                          const all = [...userOptions, ...searchResults]
                          const u = all.find(x => x.id === formData.user_id)
                          return u ? u.name : 'Select user'
                        })()
                      ) : (
                        loadingUsers ? 'Loading users...' : 'Select user'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput placeholder="Search users..." value={comboboxQuery} onValueChange={(v) => {
                        setComboboxQuery(v)
                        if (!v) {
                          setSearchResults([])
                          setUserOptions(initialUserOptions)
                        } else {
                          searchUsers(v)
                        }
                      }} />
                      <CommandList>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {(searchResults.length ? searchResults : userOptions).map((u: any) => (
                            <CommandItem key={u.id} value={u.id} onSelect={() => {
                              setFormData(prev => ({ ...prev, user_id: u.id }))
                              setUserPopoverOpen(false)
                            }}>
                              <div className="flex w-full items-center justify-between">
                                <div className="text-sm">
                                  <div className="font-medium">{u.name}</div>
                                  <div className="text-xs text-muted-foreground">({u.email || 'no email'}{u.phone ? `, ${u.phone}` : ''})</div>
                                </div>
                                {formData.user_id === u.id && <Check className="h-4 w-4" />}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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