
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Calculator, Settings, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

export const Pricing: React.FC = () => {
  const [pricingParams, setPricingParams] = useState({
    baseFare: '50',
    perKmRate: '12',
    surgeFactor: '1.0'
  })
  
  const [fareEstimate, setFareEstimate] = useState({
    pickup: '',
    dropoff: '',
    rideType: '',
    distance: '10'
  })
  
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null)

  const handlePricingUpdate = () => {
    toast.success('Pricing parameters updated successfully')
  }

  const calculateFare = () => {
    const base = parseFloat(pricingParams.baseFare)
    const perKm = parseFloat(pricingParams.perKmRate)
    const surge = parseFloat(pricingParams.surgeFactor)
    const distance = parseFloat(fareEstimate.distance)
    
    const total = (base + (perKm * distance)) * surge
    setEstimatedFare(total)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fare & Pricing Control</h1>
        <p className="text-gray-600">Manage pricing parameters and estimate fares</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pricing Parameters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Pricing Parameters
            </CardTitle>
            <CardDescription>
              Set global pricing parameters for fare calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseFare">Base Fare (₹)</Label>
              <Input
                id="baseFare"
                type="number"
                value={pricingParams.baseFare}
                onChange={(e) => setPricingParams(prev => ({ ...prev, baseFare: e.target.value }))}
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum fare charged for every ride</p>
            </div>
            
            <div>
              <Label htmlFor="perKmRate">Per-km Rate (₹)</Label>
              <Input
                id="perKmRate"
                type="number"
                value={pricingParams.perKmRate}
                onChange={(e) => setPricingParams(prev => ({ ...prev, perKmRate: e.target.value }))}
                placeholder="12"
              />
              <p className="text-xs text-gray-500 mt-1">Rate charged per kilometer</p>
            </div>
            
            <div>
              <Label htmlFor="surgeFactor">Surge Pricing Factor</Label>
              <Input
                id="surgeFactor"
                type="number"
                step="0.1"
                value={pricingParams.surgeFactor}
                onChange={(e) => setPricingParams(prev => ({ ...prev, surgeFactor: e.target.value }))}
                placeholder="1.0"
              />
              <p className="text-xs text-gray-500 mt-1">Multiplier for peak hours (1.0 = no surge)</p>
            </div>
            
            <Button onClick={handlePricingUpdate} className="w-full">
              <DollarSign className="h-4 w-4 mr-2" />
              Save Pricing
            </Button>
          </CardContent>
        </Card>

        {/* Fare Estimation Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Fare Estimation Tool
            </CardTitle>
            <CardDescription>
              Calculate estimated fare for any route
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input
                id="pickup"
                value={fareEstimate.pickup}
                onChange={(e) => setFareEstimate(prev => ({ ...prev, pickup: e.target.value }))}
                placeholder="Enter pickup address"
              />
            </div>
            
            <div>
              <Label htmlFor="dropoff">Dropoff Location</Label>
              <Input
                id="dropoff"
                value={fareEstimate.dropoff}
                onChange={(e) => setFareEstimate(prev => ({ ...prev, dropoff: e.target.value }))}
                placeholder="Enter dropoff address"
              />
            </div>
            
            <div>
              <Label htmlFor="rideType">Ride Type</Label>
              <Select value={fareEstimate.rideType} onValueChange={(value) => setFareEstimate(prev => ({ ...prev, rideType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ride type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                value={fareEstimate.distance}
                onChange={(e) => setFareEstimate(prev => ({ ...prev, distance: e.target.value }))}
                placeholder="10"
              />
            </div>
            
            <Button onClick={calculateFare} className="w-full">
              <Calculator className="h-4 w-4 mr-2" />
              Estimate Fare
            </Button>
            
            {estimatedFare && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Estimated Fare Breakdown</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Fare:</span>
                      <span>₹{pricingParams.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance ({fareEstimate.distance} km):</span>
                      <span>₹{(parseFloat(pricingParams.perKmRate) * parseFloat(fareEstimate.distance)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Surge Factor:</span>
                      <span>{pricingParams.surgeFactor}x</span>
                    </div>
                    <hr className="border-blue-200" />
                    <div className="flex justify-between font-semibold text-blue-900">
                      <span>Total:</span>
                      <span>₹{estimatedFare.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Pricing Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Pricing Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{pricingParams.baseFare}</p>
              <p className="text-sm text-gray-600">Base Fare</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹{pricingParams.perKmRate}</p>
              <p className="text-sm text-gray-600">Per Km Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{pricingParams.surgeFactor}x</p>
              <p className="text-sm text-gray-600">Surge Factor</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">₹85</p>
              <p className="text-sm text-gray-600">Avg. Fare (10km)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
