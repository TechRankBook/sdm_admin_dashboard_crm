
import { z } from 'zod'

export const vehicleFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  license_plate: z.string().min(1, 'License plate is required'),
  color: z.string().min(1, 'Color is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  type: z.enum(['sedan', 'suv', 'bike', 'luxury', 'van']),
  status: z.enum(['active', 'maintenance', 'out_of_service']),
  assigned_driver_id: z.string().optional(),
  last_service_date: z.string().optional(),
  next_service_due_date: z.string().optional(),
  image: z.instanceof(File).optional(),
  insurance_document: z.instanceof(File).optional(),
  registration_document: z.instanceof(File).optional(),
  pollution_certificate: z.instanceof(File).optional(),
})

export const editVehicleFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  license_plate: z.string().min(1, 'License plate is required'),
  color: z.string().min(1, 'Color is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  type: z.enum(['sedan', 'suv', 'bike', 'luxury', 'van']),
  status: z.enum(['active', 'maintenance', 'out_of_service']),
  assigned_driver_id: z.string(),
  last_service_date: z.string().optional(),
  next_service_due_date: z.string().optional(),
  image: z.instanceof(File).optional(),
  insurance_document: z.instanceof(File).optional(),
  registration_document: z.instanceof(File).optional(),
  pollution_certificate: z.instanceof(File).optional(),
  remove_image: z.boolean().optional(),
  remove_insurance_document: z.boolean().optional(),
  remove_registration_document: z.boolean().optional(),
  remove_pollution_certificate: z.boolean().optional(),
})

export const maintenanceLogFormSchema = z.object({
  maintenance_date: z.string().min(1, 'Maintenance date is required'),
  description: z.string().optional(),
  cost: z.number().min(0, 'Cost must be non-negative').optional(),
  performed_by: z.string().optional(),
})

export type VehicleFormData = z.infer<typeof vehicleFormSchema>
export type EditVehicleFormData = z.infer<typeof editVehicleFormSchema>
export type MaintenanceLogFormData = z.infer<typeof maintenanceLogFormSchema>
