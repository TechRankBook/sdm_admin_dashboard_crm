
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Driver } from '@/types/database'
import { useVehicles } from '@/hooks/useVehicles'
import { useDrivers } from '@/hooks/useDrivers'

interface EditDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({ open, onOpenChange, driver }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone_no: '',
    email: '',
    license_number: '',
    current_vehicle_id: '',
    status: 'active' as 'active' | 'suspended' | 'on_ride' | 'offline',
  })
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { vehicles } = useVehicles()
  const { updateDriver } = useDrivers()

  useEffect(() => {
    if (driver && open) {
      setFormData({
        full_name: driver.full_name,
        phone_no: driver.phone_no,
        email: driver.email || '',
        license_number: driver.license_number,
        current_vehicle_id: driver.current_vehicle_id || '',
        status: driver.status,
      })
    }
  }, [driver, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return

    setLoading(true)

    try {
      let profilePictureUrl = driver.profile_picture_url

      // Upload new profile picture if provided
      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('drivers-profile-pictures')
          .upload(fileName, profilePicture)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('drivers-profile-pictures')
          .getPublicUrl(fileName)
        
        profilePictureUrl = publicUrl
      }

      await updateDriver(driver.id, {
        ...formData,
        profile_picture_url: profilePictureUrl,
        current_vehicle_id: formData.current_vehicle_id || null,
      })

      toast.success('Driver updated successfully')
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating driver:', error)
      toast.error('Failed to update driver')
    } finally {
      setLoading(false)
    }
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update the driver's profile information and settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_no">Phone Number</Label>
            <Input
              id="phone_no"
              value={formData.phone_no}
              onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">License Number</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'suspended' | 'on_ride' | 'offline') => 
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="on_ride">On Ride</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_vehicle_id">Assign Vehicle</Label>
            <Select
              value={formData.current_vehicle_id}
              onValueChange={(value) => setFormData({ ...formData, current_vehicle_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No vehicle assigned</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile_picture">Update Profile Picture</Label>
            <Input
              id="profile_picture"
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
