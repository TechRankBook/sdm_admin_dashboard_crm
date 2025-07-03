
import { z } from 'zod'

export const driverFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone_no: z.string().min(1, 'Phone number is required'),
  license_number: z.string().min(1, 'License number is required'),
  status: z.enum(['active', 'suspended', 'offline']),
  profile_picture: z.instanceof(File).optional(),
})

export const editDriverFormSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Valid email is required').optional().or(z.literal('')),
  phone_no: z.string().min(1, 'Phone number is required'),
  license_number: z.string().min(1, 'License number is required'),
  status: z.enum(['active', 'suspended', 'offline']),
  profile_picture: z.instanceof(File).optional(),
  remove_profile_picture: z.boolean().optional(),
})

export type DriverFormData = z.infer<typeof driverFormSchema>
export type EditDriverFormData = z.infer<typeof editDriverFormSchema>
