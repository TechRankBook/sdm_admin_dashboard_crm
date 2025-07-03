
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
import { Driver } from '@/types/database'
import { useDrivers } from '@/hooks/useDrivers'
import { editDriverFormSchema, type EditDriverFormData } from './DriverFormSchema'

interface EditDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
}

export const EditDriverModal: React.FC<EditDriverModalProps> = ({ open, onOpenChange, driver }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null)
  
  const { refetch } = useDrivers()

  const form = useForm<EditDriverFormData>({
    resolver: zodResolver(editDriverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_no: '',
      license_number: '',
      status: 'active',
      remove_profile_picture: false
    }
  })

  // Load driver data when modal opens
  useEffect(() => {
    if (driver && open) {
      console.log('Loading driver data:', driver)
      setIsLoading(true)
      
      // Map database status to form status
      let formStatus: 'active' | 'suspended' | 'offline' = 'active'
      if (driver.status === 'suspended') formStatus = 'suspended'
      else if (driver.status === 'offline') formStatus = 'offline'
      else formStatus = 'active'
      
      // Pre-populate form with existing driver data
      form.reset({
        full_name: driver.full_name || '',
        email: driver.email || '',
        phone_no: driver.phone_no || '',
        license_number: driver.license_number || '',
        status: formStatus,
        remove_profile_picture: false
      })
      
      setCurrentProfilePicture(driver.profile_picture_url || null)
      setIsLoading(false)
    }
  }, [driver, open, form])

  const handleSubmit = async (data: EditDriverFormData) => {
    if (!driver) {
      toast.error('No driver selected for editing')
      return
    }

    console.log('Submitting driver update:', data)
    setIsSubmitting(true)

    try {
      let profilePictureUrl = currentProfilePicture

      // Handle profile picture updates
      if (data.remove_profile_picture) {
        // Remove existing profile picture
        if (currentProfilePicture) {
          try {
            // Extract filename from URL to delete from storage
            const urlParts = currentProfilePicture.split('/')
            const fileName = urlParts[urlParts.length - 1]
            await supabase.storage
              .from('drivers-profile-pictures')
              .remove([fileName])
          } catch (error) {
            console.error('Error removing old profile picture:', error)
          }
        }
        profilePictureUrl = null
      } else if (data.profile_picture) {
        // Upload new profile picture
        const fileExt = data.profile_picture.name.split('.').pop()
        const fileName = `${driver.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('drivers-profile-pictures')
          .upload(fileName, data.profile_picture)

        if (uploadError) {
          console.error('Profile picture upload error:', uploadError)
          toast.error('Failed to upload new profile picture')
          return
        }

        // Remove old profile picture if it exists
        if (currentProfilePicture) {
          try {
            const urlParts = currentProfilePicture.split('/')
            const oldFileName = urlParts[urlParts.length - 1]
            await supabase.storage
              .from('drivers-profile-pictures')
              .remove([oldFileName])
          } catch (error) {
            console.error('Error removing old profile picture:', error)
          }
        }

        const { data: { publicUrl } } = supabase.storage
          .from('drivers-profile-pictures')
          .getPublicUrl(fileName)
        
        profilePictureUrl = publicUrl
      }

      // Prepare update payload
      const updatePayload = {
        full_name: data.full_name,
        email: data.email,
        phone_no: data.phone_no,
        license_number: data.license_number,
        status: data.status,
        profile_picture_url: profilePictureUrl,
        updated_at: new Date().toISOString()
      }

      console.log('Update payload:', updatePayload)

      // Update driver in database
      const { error: updateError } = await supabase
        .from('drivers')
        .update(updatePayload)
        .eq('id', driver.id)

      if (updateError) {
        console.error('Driver update error:', updateError)
        toast.error(`Failed to update driver: ${updateError.message}`)
        return
      }

      toast.success('Driver updated successfully!')
      refetch()
      onOpenChange(false)
    } catch (error) {
      console.error('Unexpected error updating driver:', error)
      toast.error('An unexpected error occurred while updating the driver')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setCurrentProfilePicture(null)
  }

  if (!driver) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
          <DialogDescription>
            Update the driver's profile information and settings.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading driver data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Enter email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter license number" />
                    </FormControl>
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
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {currentProfilePicture && (
                <div className="space-y-2">
                  <Label>Current Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={currentProfilePicture} 
                      alt="Current profile" 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <FormField
                      control={form.control}
                      name="remove_profile_picture"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remove current picture</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="profile_picture"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {currentProfilePicture ? 'Update Profile Picture' : 'Add Profile Picture'}
                    </FormLabel>
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
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
