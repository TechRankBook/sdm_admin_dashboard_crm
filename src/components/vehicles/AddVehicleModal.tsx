
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useDrivers } from '@/hooks/useDrivers'
import { vehicleFormSchema, type VehicleFormData } from './VehicleFormSchema'

interface AddVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVehicleAdded: () => void
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ open, onOpenChange, onVehicleAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { drivers } = useDrivers()

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
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
    }
  })

  const uploadFile = async (file: File, bucket: string, path: string) => {
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file)

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }

  const handleSubmit = async (data: VehicleFormData) => {
    console.log('Submitting vehicle data:', data)
    setIsSubmitting(true)

    try {
      // First insert the vehicle to get the ID
      const vehicleData = {
        make: data.make,
        model: data.model,
        year: data.year,
        license_plate: data.license_plate,
        color: data.color,
        capacity: data.capacity,
        type: data.type,
        status: data.status,
        assigned_driver_id: data.assigned_driver_id === 'none' ? null : data.assigned_driver_id,
        last_service_date: data.last_service_date || null,
        next_service_due_date: data.next_service_due_date || null,
      }

      const { data: vehicle, error: insertError } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single()

      if (insertError) {
        console.error('Vehicle insert error:', insertError)
        toast.error(`Failed to create vehicle: ${insertError.message}`)
        return
      }

      const vehicleId = vehicle.id
      const updateData: any = {}

      // Upload files if provided
      if (data.image) {
        const imagePath = `${vehicleId}/image.${data.image.name.split('.').pop()}`
        const imageUrl = await uploadFile(data.image, 'vehicle-images', imagePath)
        updateData.image_url = imageUrl
      }

      if (data.insurance_document) {
        const docPath = `${vehicleId}/insurance.${data.insurance_document.name.split('.').pop()}`
        const docUrl = await uploadFile(data.insurance_document, 'vehicle-documents', docPath)
        updateData.insurance_document_url = docUrl
      }

      if (data.registration_document) {
        const docPath = `${vehicleId}/registration.${data.registration_document.name.split('.').pop()}`
        const docUrl = await uploadFile(data.registration_document, 'vehicle-documents', docPath)
        updateData.registration_document_url = docUrl
      }

      if (data.pollution_certificate) {
        const docPath = `${vehicleId}/pollution.${data.pollution_certificate.name.split('.').pop()}`
        const docUrl = await uploadFile(data.pollution_certificate, 'vehicle-documents', docPath)
        updateData.pollution_certificate_url = docUrl
      }

      // Update vehicle with file URLs if any files were uploaded
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('vehicles')
          .update(updateData)
          .eq('id', vehicleId)

        if (updateError) {
          console.error('Vehicle update error:', updateError)
          toast.error(`Failed to update vehicle with files: ${updateError.message}`)
          return
        }
      }

      toast.success('Vehicle created successfully!')
      onVehicleAdded()
      onOpenChange(false)
      form.reset()
    } catch (error) {
      console.error('Unexpected error creating vehicle:', error)
      toast.error('An unexpected error occurred while creating the vehicle')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>
            Enter vehicle details to register a new vehicle in the fleet.
          </DialogDescription>
        </DialogHeader>

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
                  <FormLabel>Assign Driver (Optional)</FormLabel>
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

            <div className="space-y-4">
              <h4 className="font-medium">File Uploads</h4>
              
              <FormField
                control={form.control}
                name="image"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Vehicle Image</FormLabel>
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

              <FormField
                control={form.control}
                name="insurance_document"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Insurance Document</FormLabel>
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

              <FormField
                control={form.control}
                name="registration_document"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Registration Document</FormLabel>
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

              <FormField
                control={form.control}
                name="pollution_certificate"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Pollution Certificate</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Vehicle'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
