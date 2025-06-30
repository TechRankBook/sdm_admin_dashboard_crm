
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useVehicles } from '@/hooks/useVehicles'
import { useDrivers } from '@/hooks/useDrivers'
import { driverFormSchema, type DriverFormData } from './DriverFormSchema'

interface AddDriverModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormStep = 'details' | 'otp_verification' | 'completing'

export const AddDriverModal: React.FC<AddDriverModalProps> = ({ open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>('details')
  const [otpCode, setOtpCode] = useState('')
  const [tempDriverData, setTempDriverData] = useState<DriverFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { vehicles } = useVehicles()
  const { createDriver, refetch } = useDrivers()

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_no: '',
      license_number: '',
      current_vehicle_id: '',
      auth_method: 'email'
    }
  })

  const watchAuthMethod = form.watch('auth_method')

  const handleInitialSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true)
    setTempDriverData(data)

    try {
      if (data.auth_method === 'phone') {
        // Phone OTP authentication
        const { error } = await supabase.auth.signInWithOtp({
          phone: data.phone_no,
          options: {
            data: {
              full_name: data.full_name,
              email: data.email,
              license_number: data.license_number
            }
          }
        })

        if (error) {
          console.error('Phone OTP error:', error)
          toast.error(`Failed to send OTP: ${error.message}`)
          return
        }

        toast.success('OTP sent to your phone. Please enter the verification code.')
        setCurrentStep('otp_verification')
      } else {
        // Email & Password authentication
        if (!data.password) {
          toast.error('Password is required for email authentication')
          return
        }

        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              phone_no: data.phone_no,
              license_number: data.license_number
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        })

        if (error) {
          console.error('Email signup error:', error)
          toast.error(`Failed to create account: ${error.message}`)
          return
        }

        if (authData.user?.id) {
          await createDriverProfile(authData.user.id, data)
        } else {
          toast.error('Failed to get user ID after signup')
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('An unexpected error occurred during authentication')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpVerification = async () => {
    if (!tempDriverData || !otpCode) {
      toast.error('Please enter the OTP code')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: authData, error } = await supabase.auth.verifyOtp({
        phone: tempDriverData.phone_no,
        token: otpCode,
        type: 'sms'
      })

      if (error) {
        console.error('OTP verification error:', error)
        toast.error(`OTP verification failed: ${error.message}`)
        return
      }

      if (authData.user?.id) {
        await createDriverProfile(authData.user.id, tempDriverData)
      } else {
        toast.error('Failed to get user ID after OTP verification')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('An unexpected error occurred during OTP verification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const createDriverProfile = async (userId: string, driverData: DriverFormData) => {
    setCurrentStep('completing')

    try {
      let profilePictureUrl = ''

      // Upload profile picture if provided
      if (driverData.profile_picture) {
        const fileExt = driverData.profile_picture.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('drivers-profile-pictures')
          .upload(fileName, driverData.profile_picture)

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
          id: userId, // This links to auth.users.id
          full_name: driverData.full_name,
          email: driverData.email,
          phone_no: driverData.phone_no,
          license_number: driverData.license_number,
          profile_picture_url: profilePictureUrl || null,
          current_vehicle_id: driverData.current_vehicle_id || null,
          status: 'active',
          rating: 0.0,
          total_rides: 0
        })

      if (insertError) {
        console.error('Driver profile creation error:', insertError)
        toast.error(`Failed to create driver profile: ${insertError.message}`)
        return
      }

      toast.success('Driver created successfully!')
      refetch() // Refresh the drivers list
      handleClose()
    } catch (error) {
      console.error('Profile creation error:', error)
      toast.error('An unexpected error occurred while creating the driver profile')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setCurrentStep('details')
    setOtpCode('')
    setTempDriverData(null)
    form.reset()
  }

  const renderDetailsStep = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-4">
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
          name="current_vehicle_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign Vehicle (Optional)</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
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

        <FormField
          control={form.control}
          name="auth_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authentication Method</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email">Authenticate with Email & Password</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone">Authenticate with Phone (OTP)</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchAuthMethod === 'email' && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter password (min 6 characters)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Driver Account'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )

  const renderOtpStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-4">
          We've sent a verification code to {tempDriverData?.phone_no}. Please enter it below.
        </p>
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>
      </div>
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep('details')}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button onClick={handleOtpVerification} disabled={isSubmitting || !otpCode}>
          {isSubmitting ? 'Verifying...' : 'Verify & Create Driver'}
        </Button>
      </DialogFooter>
    </div>
  )

  const renderCompletingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p>Creating driver profile...</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'details' && 'Add New Driver'}
            {currentStep === 'otp_verification' && 'Verify Phone Number'}
            {currentStep === 'completing' && 'Creating Driver'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'details' && 'Create a new driver profile with authentication setup.'}
            {currentStep === 'otp_verification' && 'Enter the verification code sent to your phone.'}
            {currentStep === 'completing' && 'Please wait while we create the driver profile.'}
          </DialogDescription>
        </DialogHeader>

        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'otp_verification' && renderOtpStep()}
        {currentStep === 'completing' && renderCompletingStep()}
      </DialogContent>
    </Dialog>
  )
}
