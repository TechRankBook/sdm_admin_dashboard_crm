import React, { useState, useEffect } from 'react'
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
import { PricingRule } from '@/types/database'

const pricingRuleSchema = z.object({
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  base_fare: z.string().min(1, 'Base fare is required'),
  per_km_rate: z.string().min(1, 'Per km rate is required'),
  per_minute_rate: z.string().optional(),
  minimum_fare: z.string().min(1, 'Minimum fare is required'),
  surge_multiplier: z.string().min(1, 'Surge multiplier is required'),
  cancellation_fee: z.string().optional(),
  no_show_fee: z.string().optional(),
  waiting_charges_per_minute: z.string().optional(),
  free_waiting_time_minutes: z.string().optional(),
})

type PricingRuleFormData = z.infer<typeof pricingRuleSchema>

interface EditPricingRuleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule: PricingRule | null
  onSuccess: () => void
}

export const EditPricingRuleModal: React.FC<EditPricingRuleModalProps> = ({
  open,
  onOpenChange,
  rule,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)

  const form = useForm<PricingRuleFormData>({
    resolver: zodResolver(pricingRuleSchema),
    defaultValues: {
      vehicle_type: '',
      base_fare: '',
      per_km_rate: '',
      per_minute_rate: '',
      minimum_fare: '',
      surge_multiplier: '',
      cancellation_fee: '',
      no_show_fee: '',
      waiting_charges_per_minute: '',
      free_waiting_time_minutes: '',
    }
  })

  useEffect(() => {
    if (rule && open) {
      form.reset({
        vehicle_type: rule.vehicle_type,
        base_fare: rule.base_fare.toString(),
        per_km_rate: rule.per_km_rate.toString(),
        per_minute_rate: rule.per_minute_rate?.toString() || '',
        minimum_fare: rule.minimum_fare.toString(),
        surge_multiplier: rule.surge_multiplier.toString(),
        cancellation_fee: rule.cancellation_fee.toString(),
        no_show_fee: rule.no_show_fee.toString(),
        waiting_charges_per_minute: rule.waiting_charges_per_minute?.toString() || '',
        free_waiting_time_minutes: rule.free_waiting_time_minutes?.toString() || '',
      })
    }
  }, [rule, open, form])

  const onSubmit = async (data: PricingRuleFormData) => {
    if (!rule) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({
          vehicle_type: data.vehicle_type,
          base_fare: parseFloat(data.base_fare),
          per_km_rate: parseFloat(data.per_km_rate),
          per_minute_rate: data.per_minute_rate ? parseFloat(data.per_minute_rate) : null,
          minimum_fare: parseFloat(data.minimum_fare),
          surge_multiplier: parseFloat(data.surge_multiplier),
          cancellation_fee: data.cancellation_fee ? parseFloat(data.cancellation_fee) : 0,
          no_show_fee: data.no_show_fee ? parseFloat(data.no_show_fee) : 0,
          waiting_charges_per_minute: data.waiting_charges_per_minute ? parseFloat(data.waiting_charges_per_minute) : 0,
          free_waiting_time_minutes: data.free_waiting_time_minutes ? parseInt(data.free_waiting_time_minutes) : 5,
        })
        .eq('id', rule.id)

      if (error) throw error

      toast.success('Pricing rule updated successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error updating pricing rule:', error)
      toast.error('Failed to update pricing rule')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!rule) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('pricing_rules')
        .update({ is_active: false })
        .eq('id', rule.id)

      if (error) throw error

      toast.success('Pricing rule deleted successfully')
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      toast.error('Failed to delete pricing rule')
    } finally {
      setLoading(false)
    }
  }

  if (!rule) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pricing Rule</DialogTitle>
          <DialogDescription>
            Update the pricing rule for {rule.vehicle_type}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sedan">Sedan</SelectItem>
                        <SelectItem value="suv">SUV</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

            <div className="flex justify-between pt-4">
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete Rule
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