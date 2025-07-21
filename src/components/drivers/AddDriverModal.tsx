
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
import { supabase,SUPABASE_URL } from '@/lib/supabase'
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
  const [phoneNumberForOtp, setPhoneNumberForOtp] = useState('') // Stores the phone number that received the OTP

  const { refetch } = useDrivers()

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_no: '', // This field will be pre-filled after OTP is sent/verified
      license_number: '',
      status: 'active',
      profile_picture: undefined, // Ensure this is handled correctly for file input
    }
  })

  /**
   * Handles sending the OTP to the provided phone number using a Supabase Edge Function.
   * This prevents client-side session interference.
   */
  const sendOTP = async () => {
    setIsSubmitting(true)
    const phoneNumber = form.getValues('phone_no') // Get phone number from the form

    if (!phoneNumber) {
      toast.error('Please enter a phone number.')
      setIsSubmitting(false)
      return
    }

    // Check if SUPABASE_URL is available from the imported lib/supabase
    if (!SUPABASE_URL) {
      toast.error('Supabase URL is not configured. Please check your Supabase client setup in lib/supabase.ts.')
      setIsSubmitting(false);
      return;
    }

    try {
      // Call the 'send-driver-otp' Edge Function using the imported SUPABASE_URL
      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-driver-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header needed here as the Edge Function uses Service Role Key
        },
        body: JSON.stringify({ phone_no: phoneNumber }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('OTP send error:', result.error)
        toast.error(`Failed to send OTP: ${result.error || 'Unknown error'}`)
        return
      }

      // Store the phone number that received the OTP for the next step
      setPhoneNumberForOtp(phoneNumber)
      setStep('otp') // Move to the OTP verification step
      toast.success('OTP sent successfully!')
    } catch (error) {
      console.error('Unexpected error during send OTP:', error)
      toast.error('An unexpected error occurred while sending OTP')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handles the final submission of driver details.
   * This function now also triggers the OTP verification via the 'create-driver' Edge Function.
   */
  const handleSubmit = async (data: DriverFormData) => {
    setIsSubmitting(true)

    // Ensure OTP is provided before attempting to create the driver
    if (otpCode.length !== 6) {
      toast.error('Please enter the 6-digit OTP.')
      setIsSubmitting(false)
      return
    }

    // Check if SUPABASE_URL is available from the imported lib/supabase
    if (!SUPABASE_URL) {
      toast.error('Supabase URL is not configured. Please check your Supabase client setup in lib/supabase.ts.')
      setIsSubmitting(false);
      return;
    }

    let profilePictureUrl = ''
    // Handle profile picture upload client-side to Supabase Storage
    if (data.profile_picture) {
      const fileExt = data.profile_picture.name.split('.').pop()
      // Create a unique file name to avoid collisions
      const fileName = `${Date.now()}-${data.profile_picture.name.replace(/\s/g, '_')}` 
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('drivers-profile-pictures')
        .upload(filePath, data.profile_picture, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Do not overwrite existing files with the same name
        })

      if (uploadError) {
        console.error('Profile picture upload error:', uploadError)
        toast.error('Failed to upload profile picture. Driver will be created without it.')
        profilePictureUrl = '' // Ensure URL is empty if upload fails
      } else {
        // Get the public URL of the uploaded picture
        const { data: { publicUrl } } = supabase.storage
          .from('drivers-profile-pictures')
          .getPublicUrl(filePath)
        
        profilePictureUrl = publicUrl
        toast.success('Profile picture uploaded successfully!')
      }
    }

    try {
      // Call the 'create-driver' Edge Function using the imported SUPABASE_URL
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No Authorization header needed here as the Edge Function uses Service Role Key
        },
        body: JSON.stringify({
          phone_no: phoneNumberForOtp, // Use the phone number that received the OTP
          otp_code: otpCode,
          full_name: data.full_name,
          email: data.email,
          license_number: data.license_number,
          status: data.status,
          profile_picture_url: profilePictureUrl, // Pass the uploaded URL
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Driver creation error:', result.error)
        toast.error(`Failed to create driver: ${result.error || 'Unknown error'}`)
        return
      }

      toast.success('Driver created successfully!')
      refetch() // Refetch driver data to update the UI
      handleClose() // Close modal and reset state
    } catch (error) {
      console.error('Unexpected error during driver creation:', error)
      toast.error('An unexpected error occurred while creating the driver')
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Resets the modal state and closes it.
   */
  const handleClose = () => {
    onOpenChange(false) // Call parent's onOpenChange to close the dialog
    form.reset() // Reset form fields to default values
    setStep('phone') // Go back to the first step
    setOtpCode('') // Clear OTP
    setPhoneNumberForOtp('') // Clear stored phone number for OTP
  }

  /**
   * Renders the content of the modal based on the current step.
   */
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
                  onClick={sendOTP} // Call the sendOTP function to trigger Edge Function
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
                Enter the 6-digit code sent to {phoneNumberForOtp}
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
                onClick={() => setStep('details')} // Simply move to details step, actual OTP verification is on final submit
                disabled={isSubmitting || otpCode.length !== 6}
              >
                Continue
              </Button>
            </DialogFooter>
          </div>
        )

      case 'details':
        return (
          <Form {...form}>
            {/* The form's onSubmit will now call handleSubmit, which in turn calls the Edge Function */}
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
                      {/* Display the phone number that received the OTP, make it disabled */}
                      <Input value={phoneNumberForOtp} placeholder="Enter phone number" disabled />
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