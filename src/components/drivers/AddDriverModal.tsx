
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useDrivers } from '@/hooks/useDrivers'
import { driverFormSchema, type DriverFormData } from './DriverFormSchema'

interface AddDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AddDriverModal: React.FC<AddDriverModalProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone')
  const [otpCode, setOtpCode] = useState('')
  const [verificationId, setVerificationId] = useState('')
  
  const { refetch } = useDrivers()

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_no: '',
      license_number: '',
      status: 'active'
    }
  })

  const sendOTP = async (phoneNumber: string) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: {
          channel: 'sms'
        }
      })

      if (error) {
        console.error('OTP send error:', error)
        toast.error(`Failed to send OTP: ${error.message}`)
        return
      }

      setVerificationId(phoneNumber)
      setStep('otp')
      toast.success('OTP sent successfully!')
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred while sending OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const verifyOTP = async () => {
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: verificationId,
        token: otpCode,
        type: 'sms'
      })

      if (error) {
        console.error('OTP verification error:', error)
        toast.error(`Failed to verify OTP: ${error.message}`)
        return
      }

      if (data.user) {
        // Set user role to driver
        const { error: roleError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            role: 'driver'
          })

        if (roleError) {
          console.error('Role error:', roleError)
          toast.error('Failed to set driver role')
          return
        }

        // Pre-fill phone number and move to details step
        form.setValue('phone_no', verificationId)
        setStep('details')
        toast.success('Phone verified successfully!')
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred during verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true)

    try {
      // Get current user (should be the verified driver)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('No authenticated user found')
        return
      }

      let profilePictureUrl = ''

      // Upload profile picture if provided
      if (data.profile_picture) {
        const fileExt = data.profile_picture.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('drivers-profile-pictures')
          .upload(fileName, data.profile_picture)

        if (uploadError) {
          console.error('Profile picture upload error:', uploadError)
          toast.error('Failed to upload profile picture, but driver will be created without it')
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('drivers-profile-pictures')
            .getPublicUrl(fileName)
          
          profilePictureUrl = publicUrl
        }
      }

      // Create driver profile in database
      const { error: insertError } = await supabase
        .from('drivers')
        .insert({
          id: user.id,
          full_name: data.full_name,
          email: data.email,
          phone_no: data.phone_no,
          license_number: data.license_number,
          profile_picture_url: profilePictureUrl || null,
          status: data.status,
          rating: 0.0,
          total_rides: 0
        })

      if (insertError) {
        console.error('Driver profile creation error:', insertError)
        toast.error(`Failed to create driver profile: ${insertError.message}`)
        return
      }

      toast.success('Driver created successfully!')
      refetch()
      handleClose()
    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('An unexpected error occurred while creating the driver')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
    setStep('phone')
    setOtpCode('')
    setVerificationId('')
  }

  const renderStepContent = () => {
    switch (step) {
      case 'phone':
        return (
          <Form {...form}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="phone_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter phone number (+1234567890)" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => sendOTP(form.getValues('phone_no'))}
                  disabled={isSubmitting || !form.getValues('phone_no')}
                >
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </Button>
              </DialogFooter>
            </div>
          </Form>
        )

      case 'otp':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Enter the 6-digit code sent to {verificationId}
              </p>
              <InputOTP
                value={otpCode}
                onChange={setOtpCode}
                maxLength={6}
                className="justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep('phone')}>
                Back
              </Button>
              <Button 
                type="button" 
                onClick={verifyOTP}
                disabled={isSubmitting || otpCode.length !== 6}
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </DialogFooter>
          </div>
        )

      case 'details':
        return (
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
                    <FormLabel>Email (Optional)</FormLabel>
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
                      <Input {...field} placeholder="Enter phone number" disabled />
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

              <FormField
                control={form.control}
                name="profile_picture"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Profile Picture (Optional)</FormLabel>
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
                  {isSubmitting ? 'Creating...' : 'Create Driver'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Driver</DialogTitle>
          <DialogDescription>
            {step === 'phone' && 'Enter phone number to start verification'}
            {step === 'otp' && 'Verify your phone number'}
            {step === 'details' && 'Complete driver profile'}
          </DialogDescription>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  )
}
