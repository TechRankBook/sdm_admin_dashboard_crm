import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Plus, FileText, Eye, Calendar, DollarSign, MapPin } from 'lucide-react'
import { VehicleMaintenanceLog } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleServiceTabProps {
  vehicleId: string
  serviceLogs: VehicleMaintenanceLog[]
  onServiceUpdated: () => void
}

export const VehicleServiceTab: React.FC<VehicleServiceTabProps> = ({ 
  vehicleId, 
  serviceLogs, 
  onServiceUpdated 
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    service_type: 'regular',
    maintenance_date: '',
    description: '',
    work_performed: '',
    service_center: '',
    cost: '',
    performed_by: '',
    odometer_reading: '',
    next_service_due_date: '',
    next_service_due_km: '',
    bill_document: null as File | null
  })

  const serviceTypes = [
    { value: 'regular', label: 'Regular Service' },
    { value: 'major', label: 'Major Service' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'emergency', label: 'Emergency Repair' }
  ]

  const getServiceTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      regular: 'bg-blue-100 text-blue-800 border-blue-200',
      major: 'bg-purple-100 text-purple-800 border-purple-200',
      repair: 'bg-orange-100 text-orange-800 border-orange-200',
      inspection: 'bg-green-100 text-green-800 border-green-200',
      emergency: 'bg-red-100 text-red-800 border-red-200'
    }
    return variants[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const handleSubmit = async () => {
    if (!formData.maintenance_date) {
      toast.error('Maintenance date is required')
      return
    }

    setIsSubmitting(true)

    try {
      let billUrl = null

      // Upload bill document if provided
      if (formData.bill_document) {
        const fileName = `${vehicleId}/bills/${Date.now()}-${formData.bill_document.name}`
        const { error: uploadError } = await supabase.storage
          .from('vehicle-documents')
          .upload(fileName, formData.bill_document)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('vehicle-documents')
          .getPublicUrl(fileName)

        billUrl = publicUrl
      }

      // Save service record
      const { error } = await supabase
        .from('vehicle_maintenance_logs')
        .insert({
          vehicle_id: vehicleId,
          service_type: formData.service_type,
          maintenance_date: formData.maintenance_date,
          description: formData.description || null,
          work_performed: formData.work_performed || null,
          service_center: formData.service_center || null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          performed_by: formData.performed_by || null,
          odometer_reading: formData.odometer_reading ? parseInt(formData.odometer_reading) : null,
          next_service_due_date: formData.next_service_due_date || null,
          next_service_due_km: formData.next_service_due_km ? parseInt(formData.next_service_due_km) : null,
          bill_document_url: billUrl
        })

      if (error) throw error

      toast.success('Service record added successfully')
      setShowAddModal(false)
      setFormData({
        service_type: 'regular',
        maintenance_date: '',
        description: '',
        work_performed: '',
        service_center: '',
        cost: '',
        performed_by: '',
        odometer_reading: '',
        next_service_due_date: '',
        next_service_due_km: '',
        bill_document: null
      })
      onServiceUpdated()

    } catch (error) {
      console.error('Error adding service record:', error)
      toast.error('Failed to add service record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Service History</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service Record
        </Button>
      </div>

      {/* Service Records */}
      <div className="space-y-4">
        {serviceLogs.length > 0 ? (
          serviceLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <div>
                      <h3 className="font-semibold">
                        {log.service_type ? serviceTypes.find(t => t.value === log.service_type)?.label : 'Service'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(log.maintenance_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {log.cost && (
                      <Badge variant="outline">
                        ₹{log.cost.toLocaleString()}
                      </Badge>
                    )}
                    <Badge className={getServiceTypeBadge(log.service_type || 'regular')}>
                      {log.service_type || 'Service'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {log.odometer_reading && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Odometer Reading</label>
                      <p>{log.odometer_reading.toLocaleString()} km</p>
                    </div>
                  )}
                  
                  {log.service_center && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Center</label>
                      <p>{log.service_center}</p>
                    </div>
                  )}
                  
                  {log.performed_by && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Performed By</label>
                      <p>{log.performed_by}</p>
                    </div>
                  )}
                </div>

                {log.work_performed && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Work Performed</label>
                    <p className="text-sm">{log.work_performed}</p>
                  </div>
                )}

                {log.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{log.description}</p>
                  </div>
                )}

                {(log.next_service_due_date || log.next_service_due_km) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Next Service Due</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {log.next_service_due_date && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span>{new Date(log.next_service_due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {log.next_service_due_km && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{log.next_service_due_km.toLocaleString()} km</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {log.bill_document_url && (
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(log.bill_document_url!, '_blank')}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      View Bill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Records</h3>
              <p className="text-gray-500 mb-4">No service history found for this vehicle.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Service Record
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Service Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Service Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-type">Service Type</Label>
                <Select value={formData.service_type} onValueChange={(value) => setFormData({ ...formData, service_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="maintenance-date">Service Date*</Label>
                <Input
                  id="maintenance-date"
                  type="date"
                  value={formData.maintenance_date}
                  onChange={(e) => setFormData({ ...formData, maintenance_date: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Cost (₹)</Label>
                <Input
                  id="cost"
                  type="number"
                  placeholder="e.g., 3500"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="odometer-reading">Odometer Reading (km)</Label>
                <Input
                  id="odometer-reading"
                  type="number"
                  placeholder="e.g., 45000"
                  value={formData.odometer_reading}
                  onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service-center">Service Center</Label>
                <Input
                  id="service-center"
                  placeholder="e.g., AutoCare Service Center"
                  value={formData.service_center}
                  onChange={(e) => setFormData({ ...formData, service_center: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="performed-by">Performed By</Label>
                <Input
                  id="performed-by"
                  placeholder="e.g., John Mechanic"
                  value={formData.performed_by}
                  onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="work-performed">Work Performed</Label>
              <Textarea
                id="work-performed"
                placeholder="e.g., Oil change, filter replacement, brake check"
                value={formData.work_performed}
                onChange={(e) => setFormData({ ...formData, work_performed: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Additional Notes</Label>
              <Textarea
                id="description"
                placeholder="Any additional notes about the service"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="next-service-date">Next Service Due Date</Label>
                <Input
                  id="next-service-date"
                  type="date"
                  value={formData.next_service_due_date}
                  onChange={(e) => setFormData({ ...formData, next_service_due_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="next-service-km">Next Service Due (km)</Label>
                <Input
                  id="next-service-km"
                  type="number"
                  placeholder="e.g., 50000"
                  value={formData.next_service_due_km}
                  onChange={(e) => setFormData({ ...formData, next_service_due_km: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bill-document">Service Bill (Optional)</Label>
              <Input
                id="bill-document"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFormData({ ...formData, bill_document: e.target.files?.[0] || null })}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Service Record'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}