import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Users, Target } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useNotifications, NotificationTemplate } from '@/hooks/useNotifications'

interface NotificationCampaignModalProps {
  isOpen: boolean
  onClose: () => void
  templates?: NotificationTemplate[]
}

const TARGET_CRITERIA_OPTIONS = [
  { value: 'all_users', label: 'All Users', description: 'Send to all active users' },
  { value: 'customers', label: 'Customers Only', description: 'Send to customers only' },
  { value: 'drivers', label: 'Drivers Only', description: 'Send to drivers only' },
  { value: 'recent_bookings', label: 'Recent Bookings', description: 'Users with bookings in last 30 days' },
  { value: 'inactive_users', label: 'Inactive Users', description: 'Users inactive for 30+ days' },
  { value: 'high_value', label: 'High Value Customers', description: 'Users with high booking frequency' },
  { value: 'custom', label: 'Custom Criteria', description: 'Define custom targeting rules' }
]

export const NotificationCampaignModal: React.FC<NotificationCampaignModalProps> = ({
  isOpen,
  onClose,
  templates = []
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template_id: '',
    target_criteria: 'all_users',
    custom_criteria: '',
    scheduled_at: null as Date | null,
    total_recipients: 0
  })

  const [estimatingRecipients, setEstimatingRecipients] = useState(false)

  const { createCampaign, isCreatingCampaign } = useNotifications()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const targetCriteria = formData.target_criteria === 'custom' 
      ? JSON.parse(formData.custom_criteria || '{}')
      : { type: formData.target_criteria }

    createCampaign({
      name: formData.name,
      description: formData.description,
      template_id: formData.template_id || null,
      target_criteria: targetCriteria,
      scheduled_at: formData.scheduled_at?.toISOString() || null,
      status: 'draft',
      total_recipients: formData.total_recipients
    })
    
    onClose()
  }

  const estimateRecipients = async () => {
    setEstimatingRecipients(true)
    // Simulate API call to estimate recipients
    setTimeout(() => {
      const estimates = {
        all_users: 1250,
        customers: 980,
        drivers: 150,
        recent_bookings: 432,
        inactive_users: 320,
        high_value: 89,
        custom: 0
      }
      setFormData(prev => ({ 
        ...prev, 
        total_recipients: estimates[formData.target_criteria as keyof typeof estimates] 
      }))
      setEstimatingRecipients(false)
    }, 1000)
  }

  const selectedTemplate = templates.find(t => t.id === formData.template_id)
  const selectedCriteria = TARGET_CRITERIA_OPTIONS.find(c => c.value === formData.target_criteria)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Template Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge>{selectedTemplate.channel}</Badge>
                    <Badge variant="outline">{selectedTemplate.template_type}</Badge>
                  </div>
                  {selectedTemplate.subject && (
                    <div>
                      <Label className="text-xs">Subject:</Label>
                      <div className="text-sm text-muted-foreground">{selectedTemplate.subject}</div>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs">Content:</Label>
                    <div className="text-sm text-muted-foreground max-h-20 overflow-y-auto">
                      {selectedTemplate.content}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Audience */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <Label>Target Audience</Label>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {TARGET_CRITERIA_OPTIONS.map(option => (
                <Card 
                  key={option.value}
                  className={cn(
                    "cursor-pointer transition-colors",
                    formData.target_criteria === option.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, target_criteria: option.value }))}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                      <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                        {formData.target_criteria === option.value && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {formData.target_criteria === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="custom_criteria">Custom Criteria (JSON)</Label>
                <Textarea
                  id="custom_criteria"
                  value={formData.custom_criteria}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_criteria: e.target.value }))}
                  rows={4}
                  placeholder={`{
  "role": "customer",
  "created_at": { "gte": "2024-01-01" },
  "total_bookings": { "gte": 5 }
}`}
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" onClick={estimateRecipients} disabled={estimatingRecipients}>
                <Users className="h-4 w-4 mr-2" />
                {estimatingRecipients ? 'Estimating...' : 'Estimate Recipients'}
              </Button>
              {formData.total_recipients > 0 && (
                <div className="text-sm text-muted-foreground">
                  Estimated recipients: <span className="font-medium">{formData.total_recipients.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-2">
            <Label>Schedule Campaign</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.scheduled_at && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_at ? format(formData.scheduled_at, "PPP") : "Send immediately"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_at || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_at: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingCampaign}>
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}