import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Plus, CheckCircle, Calendar, Bell, Shield, FileText, Settings } from 'lucide-react'
import { VehicleAlert } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleAlertsTabProps {
  vehicleId: string
  alerts: VehicleAlert[]
  onAlertsUpdated: () => void
}

const alertTypes = [
  { value: 'service_due', label: 'Service Due', icon: Settings },
  { value: 'document_expiry', label: 'Document Expiry', icon: FileText },
  { value: 'insurance_expiry', label: 'Insurance Expiry', icon: Shield },
  { value: 'pollution_expiry', label: 'Pollution Certificate Expiry', icon: FileText },
  { value: 'fitness_expiry', label: 'Fitness Certificate Expiry', icon: FileText },
  { value: 'custom', label: 'Custom Alert', icon: Bell }
]

const priorityColors = {
  low: 'bg-gray-100 text-gray-800 border-gray-200',
  medium: 'bg-blue-100 text-blue-800 border-blue-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

export const VehicleAlertsTab: React.FC<VehicleAlertsTabProps> = ({ 
  vehicleId, 
  alerts, 
  onAlertsUpdated 
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    alert_type: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  })

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />
      case 'medium':
        return <Bell className="w-4 h-4 text-blue-600" />
      default:
        return <Bell className="w-4 h-4 text-gray-600" />
    }
  }

  const getAlertIcon = (alertType: string) => {
    const type = alertTypes.find(t => t.value === alertType)
    const Icon = type?.icon || Bell
    return <Icon className="w-4 h-4" />
  }

  const handleSubmit = async () => {
    if (!formData.alert_type || !formData.title) {
      toast.error('Alert type and title are required')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('vehicle_alerts')
        .insert({
          vehicle_id: vehicleId,
          alert_type: formData.alert_type as any,
          title: formData.title,
          description: formData.description || null,
          due_date: formData.due_date || null,
          priority: formData.priority as any
        })

      if (error) throw error

      toast.success('Alert created successfully')
      setShowAddModal(false)
      setFormData({
        alert_type: '',
        title: '',
        description: '',
        due_date: '',
        priority: 'medium'
      })
      onAlertsUpdated()

    } catch (error) {
      console.error('Error creating alert:', error)
      toast.error('Failed to create alert')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('vehicle_alerts')
        .update({ 
          is_resolved: true,
          resolved_date: new Date().toISOString()
        })
        .eq('id', alertId)

      if (error) throw error

      toast.success('Alert resolved')
      onAlertsUpdated()

    } catch (error) {
      console.error('Error resolving alert:', error)
      toast.error('Failed to resolve alert')
    }
  }

  // Group alerts by priority
  const criticalAlerts = alerts.filter(a => a.priority === 'critical')
  const highAlerts = alerts.filter(a => a.priority === 'high')
  const mediumAlerts = alerts.filter(a => a.priority === 'medium')
  const lowAlerts = alerts.filter(a => a.priority === 'low')

  const alertGroups = [
    { title: 'Critical Alerts', alerts: criticalAlerts, color: 'border-red-200 bg-red-50' },
    { title: 'High Priority', alerts: highAlerts, color: 'border-orange-200 bg-orange-50' },
    { title: 'Medium Priority', alerts: mediumAlerts, color: 'border-blue-200 bg-blue-50' },
    { title: 'Low Priority', alerts: lowAlerts, color: 'border-gray-200 bg-gray-50' }
  ].filter(group => group.alerts.length > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Maintenance Alerts</h2>
          <p className="text-gray-600">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Alert
        </Button>
      </div>

      {/* Alerts by Priority */}
      {alertGroups.length > 0 ? (
        <div className="space-y-6">
          {alertGroups.map((group) => (
            <Card key={group.title} className={group.color}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.alerts.map((alert) => (
                  <div key={alert.id} className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="mt-1">
                          {getAlertIcon(alert.alert_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <Badge className={priorityColors[alert.priority]}>
                              {alert.priority}
                            </Badge>
                          </div>
                          
                          {alert.description && (
                            <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                          )}
                          
                          {alert.due_date && (
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(alert.due_date).toLocaleDateString()}</span>
                              {new Date(alert.due_date) < new Date() && (
                                <span className="text-red-600 font-medium ml-2">(Overdue)</span>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-400 mt-2">
                            Created {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(alert.priority)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-500 mb-4">
              Great! This vehicle has no pending alerts or maintenance reminders.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Alert
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Alert Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="alert-type">Alert Type*</Label>
              <Select value={formData.alert_type} onValueChange={(value) => setFormData({ ...formData, alert_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  {alertTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                placeholder="e.g., Insurance renewal due"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Additional details about this alert"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="due-date">Due Date</Label>
                <Input
                  id="due-date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority*</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Alert'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}