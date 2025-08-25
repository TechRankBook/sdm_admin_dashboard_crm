import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { Switch } from '@/components/ui/switch'

// Same package options
const PACKAGE_OPTIONS = [
  { label: '4hr / 40km', hours: 4, km: 40 },
  { label: '8hr / 80km', hours: 8, km: 80 },
  { label: '12hr / 120km', hours: 12, km: 120 },
] as const

const carRentalSchema = z.object({
  vehicle_type_id: z.string().min(1, 'Vehicle Type is required'),
  vehicle_type_name: z.string().min(1, 'Vehicle Type name is required'),
  name: z.enum(['4hr / 40km', '8hr / 80km', '12hr / 120km'], { required_error: 'Package Name is required' }),
  duration_hours: z
    .string()
    .min(1, 'Duration is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, 'Invalid duration'),
  included_kilometers: z
    .string()
    .min(1, 'Included KM is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Invalid kilometers'),
  base_price: z
    .string()
    .min(1, 'Base Price is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Invalid price'),
  extra_km_rate: z
    .string()
    .min(1, 'Extra KM Rate is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Invalid rate'),
  extra_hour_rate: z
    .string()
    .min(1, 'Extra Hour Rate is required')
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Invalid rate'),
  waiting_limit_minutes: z
    .string()
    .min(1)
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, 'Invalid minutes'),
  cancellation_fee: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? '0' : v)),
  no_show_fee: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === '' ? '0' : v)),
  is_active: z.boolean().default(true),
})

export type CarRentalFormData = z.infer<typeof carRentalSchema>

interface VehicleTypeOption {
  id: string
  name: string
}

export interface RentalPackageRow {
  id: string
  name: string
  vehicle_type_id: string | null
  vehicle_type: string
  duration_hours: number
  included_kilometers: number
  base_price: number
  extra_km_rate: number
  extra_hour_rate: number
  cancellation_fee: number | null
  no_show_fee: number | null
  waiting_limit_minutes: number | null
  is_active: boolean
}

interface EditCarRentalPackageModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: RentalPackageRow | null
  onSuccess: () => void
}

export const EditCarRentalPackageModal: React.FC<EditCarRentalPackageModalProps> = ({
  open,
  onOpenChange,
  pkg,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([])

  const form = useForm<CarRentalFormData>({
    resolver: zodResolver(carRentalSchema),
    defaultValues: {
      vehicle_type_id: '',
      vehicle_type_name: '',
      name: undefined as unknown as CarRentalFormData['name'],
      duration_hours: '',
      included_kilometers: '',
      base_price: '',
      extra_km_rate: '',
      extra_hour_rate: '',
      waiting_limit_minutes: '5',
      cancellation_fee: '0',
      no_show_fee: '0',
      is_active: true,
    },
  })

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('vehicle_types')
          .select('id, name')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
        if (error) throw error
        // Normalize to show only Sedan and SUV
        const filtered = (data || [])
          .filter((v) => /sedan|suv/i.test(v.name))
          .map((v) => ({ ...v, name: /suv/i.test(v.name) ? 'SUV' : 'Sedan' })) as VehicleTypeOption[]
        const seen = new Set<string>()
        const unique = filtered.filter(v => {
          if (seen.has(v.name)) return false
          seen.add(v.name)
          return true
        })
        setVehicleTypes(unique)
      } catch (e) {
        console.error('Failed to load vehicle types', e)
        toast.error('Failed to load vehicle types')
      }
    }
    if (open) fetchVehicleTypes()
  }, [open])

  // Load existing values on open
  useEffect(() => {
    if (!open || !pkg) return
    const vt = pkg.vehicle_type_id || ''
    form.reset({
      vehicle_type_id: vt,
      vehicle_type_name: pkg.vehicle_type || '',
      name: (pkg.name as CarRentalFormData['name']) || (undefined as any),
      duration_hours: String(pkg.duration_hours ?? ''),
      included_kilometers: String(pkg.included_kilometers ?? ''),
      base_price: String(pkg.base_price ?? ''),
      extra_km_rate: String(pkg.extra_km_rate ?? ''),
      extra_hour_rate: String(pkg.extra_hour_rate ?? ''),
      waiting_limit_minutes: String(pkg.waiting_limit_minutes ?? '5'),
      cancellation_fee: String(pkg.cancellation_fee ?? '0'),
      no_show_fee: String(pkg.no_show_fee ?? '0'),
      is_active: Boolean(pkg.is_active),
    })
  }, [open, pkg, form])

  const onSubmit = async (values: CarRentalFormData) => {
    if (!pkg) return
    setLoading(true)
    try {
      const updates = {
        name: values.name,
        vehicle_type_id: values.vehicle_type_id,
        vehicle_type: values.vehicle_type_name,
        duration_hours: Number(values.duration_hours),
        included_kilometers: Number(values.included_kilometers),
        base_price: Number(values.base_price),
        extra_km_rate: Number(values.extra_km_rate),
        extra_hour_rate: Number(values.extra_hour_rate),
        cancellation_fee: Number(values.cancellation_fee || '0'),
        no_show_fee: Number(values.no_show_fee || '0'),
        waiting_limit_minutes: Number(values.waiting_limit_minutes || '5'),
        is_active: values.is_active,
      }

      const { error } = await supabase
        .from('rental_packages')
        .update(updates)
        .eq('id', pkg.id)

      if (error) throw error
      toast.success('Car Rental package updated')
      onOpenChange(false)
      onSuccess()
    } catch (e) {
      console.error('Failed to update car rental package', e)
      toast.error('Failed to update package')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    if (!pkg) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('rental_packages')
        .update({ is_active: false })
        .eq('id', pkg.id)
      if (error) throw error
      toast.success('Package deactivated')
      onOpenChange(false)
      onSuccess()
    } catch (e) {
      console.error('Failed to deactivate package', e)
      toast.error('Failed to deactivate')
    } finally {
      setLoading(false)
    }
  }

  if (!pkg) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pricing Rule - Car Rental</DialogTitle>
          <DialogDescription>
            Update the pricing rule for Car Rental
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Type */}
              <FormField
                control={form.control}
                name="vehicle_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        const vt = vehicleTypes.find((v) => v.id === val)
                        form.setValue('vehicle_type_id', val, { shouldValidate: true })
                        form.setValue('vehicle_type_name', vt?.name || '')
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicleTypes.map((vt) => (
                          <SelectItem key={vt.id} value={vt.id}>{vt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Package Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PACKAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.label} value={opt.label}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Duration (Hours) */}
              <FormField
                control={form.control}
                name="duration_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Hours)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min={0} placeholder="4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Included KM */}
              <FormField
                control={form.control}
                name="included_kilometers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Included KM</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min={0} placeholder="40" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Base Price */}
              <FormField
                control={form.control}
                name="base_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} placeholder="800" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Extra KM Rate */}
              <FormField
                control={form.control}
                name="extra_km_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra KM Rate (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min={0} placeholder="12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Extra Hour Rate */}
              <FormField
                control={form.control}
                name="extra_hour_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Extra Hour Rate (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" min={0} placeholder="125" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Free Waiting Time */}
              <FormField
                control={form.control}
                name="waiting_limit_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Waiting Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min={0} placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cancellation Fee */}
              <FormField
                control={form.control}
                name="cancellation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* No Show Fee */}
              <FormField
                control={form.control}
                name="no_show_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Show Fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min={0} placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Is Active */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel>Is Active</FormLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={handleDeactivate} disabled={loading}>
                Deactivate
              </Button>
              <div className="space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Rule'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}