
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'

interface DeleteVehicleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: Vehicle | null
  onVehicleDeleted: () => void
}

export const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({ 
  open, 
  onOpenChange, 
  vehicle, 
  onVehicleDeleted 
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!vehicle) return

    console.log('Deleting vehicle:', vehicle)
    setIsDeleting(true)

    try {
      // Delete associated files from storage
      const vehicleId = vehicle.id
      const filesToDelete: string[] = []

      if (vehicle.image_url) {
        filesToDelete.push(`${vehicleId}/image.${vehicle.image_url.split('.').pop()}`)
      }

      if (filesToDelete.length > 0) {
        const { error: imageDeleteError } = await supabase.storage
          .from('vehicle-images')
          .remove(filesToDelete)
        
        if (imageDeleteError) {
          console.error('Error deleting vehicle images:', imageDeleteError)
        }
      }

      // Delete document files
      const docFilesToDelete: string[] = []
      
      if (vehicle.insurance_document_url) {
        docFilesToDelete.push(`${vehicleId}/insurance.${vehicle.insurance_document_url.split('.').pop()}`)
      }
      if (vehicle.registration_document_url) {
        docFilesToDelete.push(`${vehicleId}/registration.${vehicle.registration_document_url.split('.').pop()}`)
      }
      if (vehicle.pollution_certificate_url) {
        docFilesToDelete.push(`${vehicleId}/pollution.${vehicle.pollution_certificate_url.split('.').pop()}`)
      }

      if (docFilesToDelete.length > 0) {
        const { error: docDeleteError } = await supabase.storage
          .from('vehicle-documents')
          .remove(docFilesToDelete)
        
        if (docDeleteError) {
          console.error('Error deleting vehicle documents:', docDeleteError)
        }
      }

      // Update any drivers that might be assigned to this vehicle
      const { error: driverUpdateError } = await supabase
        .from('drivers')
        .update({ current_vehicle_id: null })
        .eq('current_vehicle_id', vehicleId)

      if (driverUpdateError) {
        console.error('Error updating drivers:', driverUpdateError)
        // Continue with deletion even if this fails
      }

      // Delete the vehicle record
      const { error: deleteError } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (deleteError) {
        console.error('Vehicle delete error:', deleteError)
        toast.error(`Failed to delete vehicle: ${deleteError.message}`)
        return
      }

      toast.success('Vehicle deleted successfully!')
      onVehicleDeleted()
      onOpenChange(false)
    } catch (error) {
      console.error('Unexpected error deleting vehicle:', error)
      toast.error('An unexpected error occurred while deleting the vehicle')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!vehicle) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Vehicle</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this vehicle? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <p><strong>Make & Model:</strong> {vehicle.make} {vehicle.model}</p>
            <p><strong>License Plate:</strong> {vehicle.license_plate}</p>
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Type:</strong> {vehicle.type}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete Vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
