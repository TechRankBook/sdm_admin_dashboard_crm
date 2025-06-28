
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { useVehicles } from '@/hooks/useVehicles'
import { useDrivers } from '@/hooks/useDrivers'
import { Driver } from '@/types/database'

interface EditDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({ open, onOpenChange, driver }) => {
  const { updateDriver, uploadProfilePicture } = useDrivers()
  const { vehicles } = useVehicles()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    full_name: '',
    phone_no: '',
    email: '',
    license_number: '',
    current_vehicle_id: '',
    status: 'active' as const
  })

  useEffect(() => {
    if (driver) {
      setFormData({
        full_name: driver.full_name || '',
        phone_no: driver.phone_no || '',
        email: driver.email || '',
        license_number: driver.license_number || '',
        current_vehicle_id: driver.current_vehicle_id || '',
        status: driver.status || 'active'
      })
      setProfileImagePreview(driver.profile_picture_url || '')
    }
  }, [driver])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!driver) return

    setLoading(true)

    try {
      let profile_picture_url = driver.profile_picture_url

      // Upload new profile picture if provided
      if (profileImage) {
        profile_picture_url = await uploadProfilePicture(profileImage, driver.id)
      }

      await updateDriver(driver.id, {
        ...formData,
        profile_picture_url,
        current_vehicle_id: formData.current_vehicle_id || null
      })

      setProfileImage(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating driver:', error)
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
          <DialogDescription>Update driver information</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImagePreview} />
                <AvatarFallback>
                  {driver.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone_no">Phone Number *</Label>
            <Input
              id="phone_no"
              value={formData.phone_no}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_no: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="license_number">License Number *</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_break">On Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="vehicle">Assign Vehicle</Label>
            <Select
              value={formData.current_vehicle_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, current_vehicle_id: value }))}
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
