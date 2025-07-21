import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Eye } from 'lucide-react'
import { useNotifications, NotificationTemplate } from '@/hooks/useNotifications'

interface NotificationTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: NotificationTemplate | null
}

const CHANNEL_OPTIONS = [
  { value: 'in_app', label: 'In-App' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'call', label: 'Call' }
]

const TEMPLATE_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'transactional', label: 'Transactional' }
]

const COMMON_VARIABLES = [
  '{{user_name}}',
  '{{user_email}}',
  '{{user_phone}}',
  '{{booking_id}}',
  '{{driver_name}}',
  '{{vehicle_model}}',
  '{{pickup_address}}',
  '{{dropoff_address}}',
  '{{fare_amount}}',
  '{{booking_date}}',
  '{{booking_time}}'
]

export const NotificationTemplateModal: React.FC<NotificationTemplateModalProps> = ({
  isOpen,
  onClose,
  template
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    channel: 'in_app' as 'in_app' | 'email' | 'sms' | 'whatsapp' | 'call',
    template_type: 'standard',
    subject: '',
    content: '',
    variables: [] as string[],
    is_active: true
  })

  const [newVariable, setNewVariable] = useState('')
  const [previewData, setPreviewData] = useState<Record<string, string>>({})

  const { createTemplate, updateTemplate, deleteTemplate, isCreatingTemplate, isUpdatingTemplate } = useNotifications()

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        channel: template.channel,
        template_type: template.template_type,
        subject: template.subject || '',
        content: template.content,
        variables: template.variables || [],
        is_active: template.is_active
      })
    } else {
      setFormData({
        name: '',
        description: '',
        channel: 'in_app',
        template_type: 'standard',
        subject: '',
        content: '',
        variables: [],
        is_active: true
      })
    }
  }, [template])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (template) {
      updateTemplate({ id: template.id, ...formData })
    } else {
      createTemplate(formData)
    }
    
    onClose()
  }

  const addVariable = (variable: string) => {
    if (variable && !formData.variables.includes(variable)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, variable]
      }))
    }
    setNewVariable('')
  }

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }))
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = formData.content.substring(0, start) + variable + formData.content.substring(end)
      setFormData(prev => ({ ...prev, content: newContent }))
      
      // Add to variables if not already there
      addVariable(variable)
    }
  }

  const renderPreview = () => {
    let preview = formData.content
    formData.variables.forEach(variable => {
      const sampleValue = previewData[variable] || `[${variable.replace(/[{}]/g, '')}]`
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), sampleValue)
    })
    return preview
  }

  const handleDelete = () => {
    if (template && window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(template.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <Select value={formData.channel} onValueChange={(value) => setFormData(prev => ({ ...prev, channel: value as any }))}>
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

            <div className="space-y-2">
              <Label htmlFor="template_type">Template Type</Label>
              <Select value={formData.template_type} onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {(formData.channel === 'email' || formData.channel === 'sms') && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder={formData.channel === 'email' ? 'Email subject' : 'SMS title'}
              />
            </div>
          )}

          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="variables">Variables</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Message Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  placeholder="Enter your message content here. Use variables like {{user_name}} for dynamic content."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {COMMON_VARIABLES.map(variable => (
                  <Button
                    key={variable}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertVariable(variable)}
                  >
                    {variable}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="variables" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  placeholder="Add custom variable (e.g., {{custom_field}})"
                />
                <Button type="button" onClick={() => addVariable(newVariable)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Template Variables</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.map(variable => (
                    <Badge key={variable} variant="outline" className="flex items-center gap-1">
                      {variable}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeVariable(variable)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview Data (for testing)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formData.variables.map(variable => (
                    <div key={variable} className="flex gap-2 items-center">
                      <Label className="w-32 text-xs">{variable}</Label>
                      <Input
                        value={previewData[variable] || ''}
                        onChange={(e) => setPreviewData(prev => ({ ...prev, [variable]: e.target.value }))}
                        placeholder="Sample value"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.subject && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Subject:</Label>
                      <div className="text-sm text-muted-foreground">{formData.subject}</div>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap border rounded p-3 bg-muted/50">
                    {renderPreview()}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <div>
              {template && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete Template
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingTemplate || isUpdatingTemplate}
              >
                {template ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}