
import { z } from 'zod'

export const driverFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  current_vehicle_id: z.string().optional(),
  profile_picture: z.instanceof(File).optional(),
  auth_method: z.enum(['phone', 'email'], {
    required_error: 'Please select an authentication method'
  }),
  password: z.string().optional()
}).refine((data) => {
  // If email authentication is selected, password is required
  if (data.auth_method === 'email') {
    return data.password && data.password.length >= 6
  }
  return true
}, {
  message: 'Password must be at least 6 characters when using email authentication',
  path: ['password']
})

export const editDriverFormSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone_no: z.string().min(10, 'Phone number must be at least 10 digits'),
  license_number: z.string().min(5, 'License number must be at least 5 characters'),
  current_vehicle_id: z.string(),
  profile_picture: z.instanceof(File).optional(),
  status: z.enum(['active', 'inactive', 'on_break']),
  remove_profile_picture: z.boolean().optional()
})

export type DriverFormData = z.infer<typeof driverFormSchema>
export type EditDriverFormData = z.infer<typeof editDriverFormSchema>
