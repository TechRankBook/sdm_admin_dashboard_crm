
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { useVehicles } from '@/hooks/useVehicles'
import { useDrivers } from '@/hooks/useDrivers'

interface AddDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({ open, onOpenChange }) => {
  const { createDriver, uploadProfilePicture } = useDrivers()
  const { vehicles } = useVehicles()
  const [loading, setLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [formData, setFormData] = useState({
    full_name: '',
    phone_no: '',
    email: '',
    license_number: '',
    current_vehicle_id: ''
  })

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
    setLoading(true)

    try {
      let profile_picture_url = ''
      
      // Create driver first to get ID
      const newDriver = await createDriver({
        ...formData,
        current_vehicle_id: formData.current_vehicle_id || null
      })

      // Upload profile picture if provided
      if (profileImage && newDriver) {
        profile_picture_url = await uploadProfilePicture(profileImage, newDriver.id)
        
        // Update driver with profile picture URL
        await supabase
          .from('drivers')
          .update({ profile_picture_url })
          .eq('id', newDriver.id)
      }

      // Reset form
      setFormData({
        full_name: '',
        phone_no: '',
        email: '',
        license_number: '',
        current_vehicle_id: ''
      })
      setProfileImage(null)
      setProfileImagePreview('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating driver:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>Enter driver details to register a new driver</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileImagePreview} />
                <AvatarFallback>
                  <Camera className="h-8 w-8 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
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
            <Label htmlFor="vehicle">Assign Vehicle</Label>
            <Select
              value={formData.current_vehicle_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, current_vehicle_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
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
              {loading ? 'Creating...' : 'Create Driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
