import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TrendingUp, Plus, Gauge, Fuel, Calendar, MapPin } from 'lucide-react'
import { Vehicle, VehiclePerformance } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehiclePerformanceTabProps {
  vehicleId: string
  vehicle: Vehicle
  performance: VehiclePerformance[]
  onPerformanceUpdated: () => void
}

export const VehiclePerformanceTab: React.FC<VehiclePerformanceTabProps> = ({ 
  vehicleId, 
  vehicle,
  performance, 
  onPerformanceUpdated 
}) => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    recorded_date: new Date().toISOString().split('T')[0],
    odometer_reading: '',
    fuel_consumed: '',
    distance_traveled: '',
    notes: ''
  })

  // Calculate performance metrics
  const latestPerformance = performance[0]
  const avgFuelEconomy = performance.length > 0 
    ? performance.reduce((sum, p) => sum + (p.fuel_economy || 0), 0) / performance.filter(p => p.fuel_economy).length
    : null

  const totalDistance = performance.reduce((sum, p) => sum + (p.distance_traveled || 0), 0)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyDistance = performance
    .filter(p => {
      const recordDate = new Date(p.recorded_date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })
    .reduce((sum, p) => sum + (p.distance_traveled || 0), 0)

  const handleSubmit = async () => {
    if (!formData.recorded_date) {
      toast.error('Recorded date is required')
      return
    }

    setIsSubmitting(true)

    try {
      const odometerReading = formData.odometer_reading ? parseInt(formData.odometer_reading) : null
      const fuelConsumed = formData.fuel_consumed ? parseFloat(formData.fuel_consumed) : null
      const distanceTraveled = formData.distance_traveled ? parseFloat(formData.distance_traveled) : null

      // Calculate fuel economy if both fuel and distance are provided
      let fuelEconomy = null
      if (fuelConsumed && distanceTraveled && fuelConsumed > 0) {
        fuelEconomy = distanceTraveled / fuelConsumed
      }

      const { error } = await supabase
        .from('vehicle_performance')
        .insert({
          vehicle_id: vehicleId,
          recorded_date: formData.recorded_date,
          odometer_reading: odometerReading,
          fuel_consumed: fuelConsumed,
          distance_traveled: distanceTraveled,
          fuel_economy: fuelEconomy,
          notes: formData.notes || null
        })

      if (error) throw error

      // Update vehicle's current odometer if provided
      if (odometerReading) {
        const { error: vehicleError } = await supabase
          .from('vehicles')
          .update({ 
            current_odometer: odometerReading,
            average_fuel_economy: fuelEconomy || vehicle.average_fuel_economy,
            monthly_distance: monthlyDistance + (distanceTraveled || 0)
          })
          .eq('id', vehicleId)

        if (vehicleError) console.error('Error updating vehicle:', vehicleError)
      }

      toast.success('Performance record added successfully')
      setShowAddModal(false)
      setFormData({
        recorded_date: new Date().toISOString().split('T')[0],
        odometer_reading: '',
        fuel_consumed: '',
        distance_traveled: '',
        notes: ''
      })
      onPerformanceUpdated()

    } catch (error) {
      console.error('Error adding performance record:', error)
      toast.error('Failed to add performance record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Mileage & Performance</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Performance Record
        </Button>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Gauge className="w-4 h-4" />
              <span>Current Mileage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {vehicle.current_odometer?.toLocaleString() || latestPerformance?.odometer_reading?.toLocaleString() || 'N/A'} km
            </p>
            <p className="text-sm text-gray-500">Total distance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Fuel className="w-4 h-4" />
              <span>Avg Fuel Economy</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {avgFuelEconomy ? `${avgFuelEconomy.toFixed(1)} km/l` : 'N/A'}
            </p>
            <p className="text-sm text-gray-500">Average efficiency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Calendar className="w-4 h-4" />
              <span>Monthly Distance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {monthlyDistance.toLocaleString()} km
            </p>
            <p className="text-sm text-gray-500">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Total Tracked</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {totalDistance.toLocaleString()} km
            </p>
            <p className="text-sm text-gray-500">{performance.length} records</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
        </CardHeader>
        <CardContent>
          {performance.length > 0 ? (
            <div className="space-y-4">
              {performance.map((record) => (
                <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {new Date(record.recorded_date).toLocaleDateString()}
                    </h4>
                    {record.fuel_economy && (
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {record.fuel_economy.toFixed(1)} km/l
                        </p>
                        <p className="text-xs text-gray-500">Fuel economy</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    {record.odometer_reading && (
                      <div>
                        <label className="text-gray-500">Odometer</label>
                        <p className="font-medium">{record.odometer_reading.toLocaleString()} km</p>
                      </div>
                    )}
                    
                    {record.distance_traveled && (
                      <div>
                        <label className="text-gray-500">Distance</label>
                        <p className="font-medium">{record.distance_traveled} km</p>
                      </div>
                    )}
                    
                    {record.fuel_consumed && (
                      <div>
                        <label className="text-gray-500">Fuel Used</label>
                        <p className="font-medium">{record.fuel_consumed} L</p>
                      </div>
                    )}
                  </div>
                  
                  {record.notes && (
                    <div className="mt-2">
                      <label className="text-xs text-gray-500">Notes</label>
                      <p className="text-sm">{record.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
              <p className="text-gray-500 mb-4">Start tracking vehicle performance by adding records.</p>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Record
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Performance Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Performance Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recorded-date">Date*</Label>
              <Input
                id="recorded-date"
                type="date"
                value={formData.recorded_date}
                onChange={(e) => setFormData({ ...formData, recorded_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="odometer-reading">Odometer Reading (km)</Label>
              <Input
                id="odometer-reading"
                type="number"
                placeholder="e.g., 45000"
                value={formData.odometer_reading}
                onChange={(e) => setFormData({ ...formData, odometer_reading: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fuel-consumed">Fuel Consumed (L)</Label>
                <Input
                  id="fuel-consumed"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 50.5"
                  value={formData.fuel_consumed}
                  onChange={(e) => setFormData({ ...formData, fuel_consumed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="distance-traveled">Distance (km)</Label>
                <Input
                  id="distance-traveled"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 750"
                  value={formData.distance_traveled}
                  onChange={(e) => setFormData({ ...formData, distance_traveled: e.target.value })}
                />
              </div>
            </div>

            {formData.fuel_consumed && formData.distance_traveled && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
                  Calculated Fuel Economy: {
                    (parseFloat(formData.distance_traveled) / parseFloat(formData.fuel_consumed)).toFixed(1)
                  } km/l
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about this record"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Record'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}