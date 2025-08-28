import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ServiceType, PricingRule } from '@/types/database'

const pricingRuleSchema = z.object({
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  zone: z.enum(['Bangalore','Mysuru']).optional(),
  base_fare: z.string().min(1, 'Base fare is required'),
  per_km_rate: z.string().min(1, 'Per km rate is required'),
  per_minute_rate: z.string().min(1, 'Per minute rate is required'),
  minimum_fare: z.string().min(1, 'Minimum fare is required'),
  surge_multiplier: z.string().min(1, 'Surge multiplier is required'),
  cancellation_fee: z.string().optional(),
  no_show_fee: z.string().optional(),
  waiting_charges_per_minute: z.string().optional(),
  free_waiting_time_minutes: z.string().optional(),
})

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>

interface AddPricingRuleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceType: ServiceType
  onSuccess: () => void
}

export const AddPricingRuleModal: React.FC<AddPricingRuleModalProps> = ({
  open,
  onOpenChange,
  serviceType,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      vehicle_type: '',
      zone: 'Bangalore' as any,
      base_fare: '',
      per_km_rate: '',
      per_minute_rate: '2.0',
      minimum_fare: '',
      surge_multiplier: '1.0',
      cancellation_fee: '0',
      no_show_fee: '0',
      waiting_charges_per_minute: '0',
      free_waiting_time_minutes: '5',
    }
  })

  const onSubmit = async (data: PricingRuleFormData) => {
    setLoading(true)
    try {
      const insertData = {
        service_type_id: serviceType.id,
        vehicle_type: data.vehicle_type,
        zone: (data as any).zone || null,
        base_fare: parseFloat(data.base_fare),
        per_km_rate: parseFloat(data.per_km_rate),
        per_minute_rate: parseFloat(data.per_minute_rate),
        minimum_fare: parseFloat(data.minimum_fare),
        surge_multiplier: parseFloat(data.surge_multiplier),
        cancellation_fee: data.cancellation_fee ? parseFloat(data.cancellation_fee) : 0,
        no_show_fee: data.no_show_fee ? parseFloat(data.no_show_fee) : 0,
        waiting_charges_per_minute: data.waiting_charges_per_minute ? parseFloat(data.waiting_charges_per_minute) : 0,
        free_waiting_time_minutes: data.free_waiting_time_minutes ? parseInt(data.free_waiting_time_minutes) : 5,
        is_active: true
      }

      console.log('📋 Inserting pricing rule:', insertData)
      console.log('🔍 Service Type:', serviceType)

      const { data: result, error } = await supabase
        .from('pricing_rules')
        .insert(insertData)
        .select()
        .select()

      if (error) throw error

      console.log('✅ Pricing rule inserted successfully:', result)
      toast.success('Pricing rule added successfully')
      form.reset()
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('❌ Error adding pricing rule:', error)
      toast.error('Failed to add pricing rule')
    } finally {
      setLoading(false)
    }
  }

  const showZone = serviceType.name === 'airport' || serviceType.name === 'ride_later'

  // Autofill defaults from screenshot when vehicle or zone changes
  const vehicle = (form.watch('vehicle_type') || '') as 'sedan' | 'suv' | ''
  const zone = (form.watch('zone') || 'Bangalore') as 'Bangalore' | 'Mysuru'

  useEffect(() => {
    if (!showZone || !vehicle) return

    // Default map from screenshot
    const defaults: Record<'sedan' | 'suv', Record<'Bangalore' | 'Mysuru', any>> = {
      sedan: {
        Bangalore: {
          base_fare: '99',
          per_km_rate: '14',
          per_minute_rate: '1.50',
          minimum_fare: '299',
          surge_multiplier: '1.0',
          cancellation_fee: '100',
          no_show_fee: '150',
          waiting_charges_per_minute: '2.00',
          free_waiting_time_minutes: '5',
        },
        Mysuru: {
          base_fare: '99',
          per_km_rate: '12',
          per_minute_rate: '1.20',
          minimum_fare: '249',
          surge_multiplier: '1.0',
          cancellation_fee: '70',
          no_show_fee: '120',
          waiting_charges_per_minute: '1.50',
          free_waiting_time_minutes: '5',
        }
      },
      suv: {
        Bangalore: {
          base_fare: '119',
          per_km_rate: '19',
          per_minute_rate: '2.00',
          minimum_fare: '369',
          surge_multiplier: '1.0',
          cancellation_fee: '125',
          no_show_fee: '175',
          waiting_charges_per_minute: '2.50',
          free_waiting_time_minutes: '5',
        },
        Mysuru: {
          base_fare: '109',
          per_km_rate: '18',
          per_minute_rate: '1.75',
          minimum_fare: '319',
          surge_multiplier: '1.0',
          cancellation_fee: '100',
          no_show_fee: '140',
          waiting_charges_per_minute: '2.00',
          free_waiting_time_minutes: '5',
        }
      }
    }

    const d = defaults[vehicle]?.[zone]
    if (d) {
      // Only set fields if empty or previously autofilled to avoid overwriting user's manual edits unintentionally.
      const current = form.getValues()
      const next = { ...current, ...d }
      form.reset(next, { keepDefaultValues: false })
    }
  }, [vehicle, zone, showZone])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Pricing Rule - {serviceType.display_name}</DialogTitle>
          <DialogDescription>
            Create a new pricing rule for {serviceType.display_name} service
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicle_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showZone && (
                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Bangalore">Bangalore</SelectItem>
                          <SelectItem value="Mysuru">Mysuru</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="base_fare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fare (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="50.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="per_km_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Per KM Rate (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="10.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="per_minute_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Per Minute Rate (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="2.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minimum_fare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Fare (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="surge_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Surge Multiplier</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancellation_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="50.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="no_show_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No Show Fee (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waiting_charges_per_minute"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Waiting Charges/Min (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="2.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="free_waiting_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Free Waiting Time (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Rule'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}