import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'
import { useDrivers } from '@/hooks/useDrivers'
import { editVehicleFormSchema, type EditVehicleFormData } from './VehicleFormSchema'

interface EditVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onVehicleUpdated: () => void
}

export const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ 
  open, 
  onOpenChange, 
  vehicle, 
  onVehicleUpdated 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentFiles, setCurrentFiles] = useState({
    image_url: null as string | null,
    insurance_document_url: null as string | null,
    registration_document_url: null as string | null,
    pollution_certificate_url: null as string | null,
  })
  
  const { drivers } = useDrivers()

  const form = useForm<EditVehicleFormData>({
    resolver: zodResolver(editVehicleFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      license_plate: '',
      color: '',
      capacity: 1,
      type: 'sedan',
      status: 'active',
      assigned_driver_id: 'none',
      last_service_date: '',
      next_service_due_date: '',
      remove_image: false,
      remove_insurance_document: false,
      remove_registration_document: false,
      remove_pollution_certificate: false,
    }
  })

  // Load vehicle data when modal opens
  useEffect(() => {
    if (vehicle && open) {
      console.log('Loading vehicle data:', vehicle)
      setIsLoading(true)
      
      // Map database status values to form values
      let formStatus: 'active' | 'maintenance' | 'out_of_service' = 'active'
      if (vehicle.status === 'maintenance' || vehicle.status === 'in_maintenance') {
        formStatus = 'maintenance'
      } else if (vehicle.status === 'out_of_service' || vehicle.status === 'unavailable') {
        formStatus = 'out_of_service'
      } else if (vehicle.status === 'active') {
        formStatus = 'active'
      }
      
      form.reset({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        license_plate: vehicle.license_plate || '',
        color: vehicle.color || '',
        capacity: vehicle.capacity || 1,
        type: vehicle.type || 'sedan',
        status: formStatus,
        assigned_driver_id: vehicle.assigned_driver_id || 'none',
        last_service_date: vehicle.last_service_date || '',
        next_service_due_date: vehicle.next_service_due_date || '',
        remove_image: false,
        remove_insurance_document: false,
        remove_registration_document: false,
        remove_pollution_certificate: false,
      })
      
      setCurrentFiles({
        image_url: vehicle.image_url || null,
        insurance_document_url: vehicle.insurance_document_url || null,
        registration_document_url: vehicle.registration_document_url || null,
        pollution_certificate_url: vehicle.pollution_certificate_url || null,
      })
      
      setIsLoading(false)
    }
  }, [vehicle, open, form])

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  const deleteFile = async (bucket: string, path: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) {
      console.error(`Error deleting file from ${bucket}:`, error)
    }
  }

  const handleSubmit = async (data: EditVehicleFormData) => {
    if (!vehicle) {
      toast.error('No vehicle selected for editing')
      return
    }

    console.log('Submitting vehicle update:', data)
    setIsSubmitting(true)

    try {
      const vehicleId = vehicle.id
      
      // Map form status to database status
      let dbStatus = data.status
      if (data.status === 'maintenance') {
        dbStatus = 'maintenance'
      } else if (data.status === 'out_of_service') {
        dbStatus = 'out_of_service'
      }
      
      let updateData: any = {
        make: data.make,
        model: data.model,
        year: data.year,
        license_plate: data.license_plate,
        color: data.color,
        capacity: data.capacity,
        type: data.type,
        status: dbStatus,
        assigned_driver_id: data.assigned_driver_id === 'none' ? null : data.assigned_driver_id,
        last_service_date: data.last_service_date || null,
        next_service_due_date: data.next_service_due_date || null,
        updated_at: new Date().toISOString()
      }

      // Handle file removals
      if (data.remove_image && currentFiles.image_url) {
        updateData.image_url = null
        const imagePath = `${vehicleId}/image.${currentFiles.image_url.split('.').pop()}`
        await deleteFile('vehicle-images', imagePath)
      }

      if (data.remove_insurance_document && currentFiles.insurance_document_url) {
        updateData.insurance_document_url = null
        const docPath = `${vehicleId}/insurance.${currentFiles.insurance_document_url.split('.').pop()}`
        await deleteFile('vehicle-documents', docPath)
      }

      if (data.remove_registration_document && currentFiles.registration_document_url) {
        updateData.registration_document_url = null
        const docPath = `${vehicleId}/registration.${currentFiles.registration_document_url.split('.').pop()}`
        await deleteFile('vehicle-documents', docPath)
      }

      if (data.remove_pollution_certificate && currentFiles.pollution_certificate_url) {
        updateData.pollution_certificate_url = null
        const docPath = `${vehicleId}/pollution.${currentFiles.pollution_certificate_url.split('.').pop()}`
        await deleteFile('vehicle-documents', docPath)
      }

      // Handle file uploads
      if (data.image && !data.remove_image) {
        const imagePath = `${vehicleId}/image.${data.image.name.split('.').pop()}`
        const imageUrl = await uploadFile(data.image, 'vehicle-images', imagePath)
        updateData.image_url = imageUrl
      }

      if (data.insurance_document && !data.remove_insurance_document) {
        const docPath = `${vehicleId}/insurance.${data.insurance_document.name.split('.').pop()}`
        const docUrl = await uploadFile(data.insurance_document, 'vehicle-documents', docPath)
        updateData.insurance_document_url = docUrl
      }

      if (data.registration_document && !data.remove_registration_document) {
        const docPath = `${vehicleId}/registration.${data.registration_document.name.split('.').pop()}`
        const docUrl = await uploadFile(data.registration_document, 'vehicle-documents', docPath)
        updateData.registration_document_url = docUrl
      }

      if (data.pollution_certificate && !data.remove_pollution_certificate) {
        const docPath = `${vehicleId}/pollution.${data.pollution_certificate.name.split('.').pop()}`
        const docUrl = await uploadFile(data.pollution_certificate, 'vehicle-documents', docPath)
        updateData.pollution_certificate_url = docUrl
      }

      console.log('Update payload:', updateData)

      // Update vehicle in database
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(updateData)
        .eq('id', vehicleId)

      if (updateError) {
        console.error('Vehicle update error:', updateError)
        toast.error(`Failed to update vehicle: ${updateError.message}`)
        return
      }

      toast.success('Vehicle updated successfully!')
      onVehicleUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Unexpected error updating vehicle:', error)
      toast.error('An unexpected error occurred while updating the vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setCurrentFiles({
      image_url: null,
      insurance_document_url: null,
      registration_document_url: null,
      pollution_certificate_url: null,
    })
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle</DialogTitle>
          <DialogDescription>
            Update the vehicle's information and documents.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading vehicle data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Make</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Toyota" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Camry" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="e.g., 2022"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="license_plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., ABC-123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., White" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          placeholder="e.g., 4"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedan">Sedan</SelectItem>
                          <SelectItem value="suv">SUV</SelectItem>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="luxury">Luxury</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="out_of_service">Out of Service</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="assigned_driver_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Driver</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a driver" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No driver assigned</SelectItem>
                        {drivers.map((driver) => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.full_name} - {driver.phone_no}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="last_service_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Service Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_service_due_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Service Due Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* File Management Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Files & Documents</h4>
                
                {/* Vehicle Image */}
                <div className="space-y-2">
                  <Label>Vehicle Image</Label>
                  {currentFiles.image_url && (
                    <div className="flex items-center space-x-4">
                      <img 
                        src={currentFiles.image_url} 
                        alt="Vehicle" 
                        className="w-16 h-16 rounded object-cover"
                      />
                      <FormField
                        control={form.control}
                        name="remove_image"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remove current image</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            accept="image/*"
                            onChange={(e) => onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Insurance Document */}
                <div className="space-y-2">
                  <Label>Insurance Document</Label>
                  {currentFiles.insurance_document_url && (
                    <div className="flex items-center space-x-4">
                      <a 
                        href={currentFiles.insurance_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Current Document
                      </a>
                      <FormField
                        control={form.control}
                        name="remove_insurance_document"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remove current document</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="insurance_document"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Registration Document */}
                <div className="space-y-2">
                  <Label>Registration Document</Label>
                  {currentFiles.registration_document_url && (
                    <div className="flex items-center space-x-4">
                      <a 
                        href={currentFiles.registration_document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Current Document
                      </a>
                      <FormField
                        control={form.control}
                        name="remove_registration_document"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remove current document</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="registration_document"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pollution Certificate */}
                <div className="space-y-2">
                  <Label>Pollution Certificate</Label>
                  {currentFiles.pollution_certificate_url && (
                    <div className="flex items-center space-x-4">
                      <a 
                        href={currentFiles.pollution_certificate_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Current Document
                      </a>
                      <FormField
                        control={form.control}
                        name="remove_pollution_certificate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remove current document</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="pollution_certificate"
                    render={({ field: { onChange, value, ...field } }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => onChange(e.target.files?.[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
