import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  Smartphone,
  Plus,
  Search,
  Filter,
  BarChart3,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationTemplateModal } from '@/components/notifications/NotificationTemplateModal'
import { NotificationCampaignModal } from '@/components/notifications/NotificationCampaignModal'
import { SendNotificationModal } from '@/components/notifications/SendNotificationModal'
import { NotificationAnalytics } from '@/components/notifications/NotificationAnalytics'
import { NotificationsList } from '@/components/notifications/NotificationsList'

const channelIcons = {
  in_app: Bell,
  email: Mail,
  sms: MessageSquare,
  whatsapp: Phone,
  call: Smartphone
}

const channelColors = {
  in_app: 'bg-blue-500',
  email: 'bg-green-500',
  sms: 'bg-purple-500',
  whatsapp: 'bg-green-600',
  call: 'bg-orange-500'
}

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false)
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const {
    notifications,
    templates,
    campaigns,
    analytics,
    notificationsLoading,
    templatesLoading,
    campaignsLoading
  } = useNotifications()

  const filteredTemplates = templates?.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCampaigns = campaigns?.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const recentNotifications = notifications?.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Manage notifications, templates, and campaigns across all channels
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsSendModalOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Notification
          </Button>
          <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
          <Button variant="outline" onClick={() => setIsCampaignModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_sent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_delivered.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.delivery_rate.toFixed(1)}% delivery rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_failed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((analytics.total_failed / (analytics.total_sent || 1)) * 100).toFixed(1)}% failure rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {templates?.filter(t => t.is_active).length || 0} active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest notifications sent from the system</CardDescription>
              </CardHeader>
              <CardContent>
                <NotificationsList 
                  notifications={recentNotifications} 
                  loading={notificationsLoading}
                  showActions={false}
                />
              </CardContent>
            </Card>

            {/* Channel Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>Notifications by delivery channel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics?.channel_breakdown?.map((channel) => {
                  const Icon = channelIcons[channel.channel as keyof typeof channelIcons]
                  return (
                    <div key={channel.channel} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-2 rounded-md ${channelColors[channel.channel as keyof typeof channelColors]}`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="capitalize">{channel.channel.replace('_', ' ')}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{channel.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {((channel.delivered / channel.count) * 100).toFixed(1)}% delivered
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setIsTemplateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates?.map((template) => {
              const Icon = channelIcons[template.channel]
              return (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedTemplate(template)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${channelColors[template.channel]}`}>
                          <Icon className="h-3 w-3 text-white" />
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"}>
                          {template.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <div>Type: {template.template_type}</div>
                      <div>Variables: {template.variables?.length || 0}</div>
                      <div>Channel: {template.channel.replace('_', ' ')}</div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={() => setIsCampaignModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredCampaigns?.map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{campaign.name}</CardTitle>
                      {campaign.description && (
                        <CardDescription>{campaign.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant={
                      campaign.status === 'sent' ? 'default' :
                      campaign.status === 'failed' ? 'destructive' :
                      campaign.status === 'sending' ? 'secondary' :
                      'outline'
                    }>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Recipients</div>
                      <div className="font-medium">{campaign.total_recipients}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sent</div>
                      <div className="font-medium">{campaign.sent_count}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Delivered</div>
                      <div className="font-medium">{campaign.delivered_count}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Failed</div>
                      <div className="font-medium">{campaign.failed_count}</div>
                    </div>
                  </div>
                  {campaign.scheduled_at && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <NotificationAnalytics analytics={analytics} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <NotificationTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setIsTemplateModalOpen(false)
          setSelectedTemplate(null)
        }}
        template={selectedTemplate}
      />

      <NotificationCampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        templates={templates}
      />

      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        templates={templates}
      />
    </div>
  )
}