
import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'
import { maintenanceLogFormSchema, type MaintenanceLogFormData } from './VehicleFormSchema'
import { Edit, Trash2, Plus } from 'lucide-react'

interface VehicleMaintenanceLog {
  id: string
  vehicle_id: string
  maintenance_date: string
  description: string | null
  cost: number | null
  performed_by: string | null
  created_at: string
  updated_at: string
}

interface ServiceLogsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
}

export const ServiceLogsModal: React.FC<ServiceLogsModalProps> = ({ open, onOpenChange, vehicle }) => {
  const [logs, setLogs] = useState<VehicleMaintenanceLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLog, setEditingLog] = useState<VehicleMaintenanceLog | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<MaintenanceLogFormData>({
    resolver: zodResolver(maintenanceLogFormSchema),
    defaultValues: {
      maintenance_date: '',
      description: '',
      cost: 0,
      performed_by: '',
    }
  })

  useEffect(() => {
    if (vehicle && open) {
      fetchLogs()
    }
  }, [vehicle, open])

  const fetchLogs = async () => {
    if (!vehicle) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vehicle_maintenance_logs')
        .select('*')
        .eq('vehicle_id', vehicle.id)
        .order('maintenance_date', { ascending: false })

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Error fetching maintenance logs:', error)
      toast.error('Failed to fetch maintenance logs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: MaintenanceLogFormData) => {
    if (!vehicle) return

    console.log('Submitting maintenance log:', data)
    setIsSubmitting(true)

    try {
      const logData = {
        vehicle_id: vehicle.id,
        maintenance_date: data.maintenance_date,
        description: data.description || null,
        cost: data.cost || null,
        performed_by: data.performed_by || null,
      }

      if (editingLog) {
        // Update existing log
        const { error } = await supabase
          .from('vehicle_maintenance_logs')
          .update({ ...logData, updated_at: new Date().toISOString() })
          .eq('id', editingLog.id)

        if (error) throw error
        toast.success('Maintenance log updated successfully!')
      } else {
        // Create new log
        const { error } = await supabase
          .from('vehicle_maintenance_logs')
          .insert(logData)

        if (error) throw error
        toast.success('Maintenance log added successfully!')
      }

      fetchLogs()
      resetForm()
    } catch (error) {
      console.error('Error saving maintenance log:', error)
      toast.error('Failed to save maintenance log')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (log: VehicleMaintenanceLog) => {
    setEditingLog(log)
    form.reset({
      maintenance_date: log.maintenance_date,
      description: log.description || '',
      cost: log.cost || 0,
      performed_by: log.performed_by || '',
    })
    setShowAddForm(true)
  }

  const handleDelete = async (log: VehicleMaintenanceLog) => {
    if (!confirm('Are you sure you want to delete this maintenance log?')) return

    try {
      const { error } = await supabase
        .from('vehicle_maintenance_logs')
        .delete()
        .eq('id', log.id)

      if (error) throw error
      toast.success('Maintenance log deleted successfully!')
      fetchLogs()
    } catch (error) {
      console.error('Error deleting maintenance log:', error)
      toast.error('Failed to delete maintenance log')
    }
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingLog(null)
    form.reset({
      maintenance_date: '',
      description: '',
      cost: 0,
      performed_by: '',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Service Logs - {vehicle.make} {vehicle.model}</DialogTitle>
          <DialogDescription>
            License Plate: {vehicle.license_plate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add New Log Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Maintenance History</h3>
            <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service Log
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingLog ? 'Edit' : 'Add'} Maintenance Log</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maintenance_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maintenance Date</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cost (INR)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01" 
                                placeholder="0.00"
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="performed_by"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Performed By</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Service center or mechanic name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Details about the maintenance work" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : editingLog ? 'Update Log' : 'Add Log'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Logs List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading maintenance logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No maintenance logs found for this vehicle</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">
                            {new Date(log.maintenance_date).toLocaleDateString()}
                          </Badge>
                          {log.cost && (
                            <Badge variant="secondary">
                              {formatCurrency(log.cost)}
                            </Badge>
                          )}
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-600">{log.description}</p>
                        )}
                        {log.performed_by && (
                          <p className="text-xs text-gray-500">Performed by: {log.performed_by}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(log)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
