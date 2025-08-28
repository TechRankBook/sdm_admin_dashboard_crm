import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Calculator, Settings, TrendingUp, Car, Plane, MapPin, Users, Clock, Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ServiceType, PricingRule, RentalPackage, ZonePricing } from '@/types/database'
import { AddPricingRuleModal } from '@/components/pricing/AddPricingRuleModal'
import { EditPricingRuleModal } from '@/components/pricing/EditPricingRuleModal'
import { AddCarRentalPackageModal } from '@/components/pricing/AddCarRentalPackageModal'
import { EditCarRentalPackageModal } from '@/components/pricing/EditCarRentalPackageModal'

export const Pricing: React.FC = () => {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [rentalPackages, setRentalPackages] = useState<RentalPackage[]>([])
  const [zonePricing, setZonePricing] = useState<ZonePricing[]>([])
  const [activeTab, setActiveTab] = useState('ride_later')
  const [loading, setLoading] = useState(true)
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false)
  const [editRuleModalOpen, setEditRuleModalOpen] = useState(false)
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null)

  const [fareEstimate, setFareEstimate] = useState({
    serviceType: '',
    vehicleType: '',
    zone: 'Bangalore' as 'Bangalore' | 'Mysuru',
    pickup: '',
    dropoff: '',
    distance: '10',
    duration: '30'
  })
  
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null)

  // Car Rental modals state
  const [addRentalOpen, setAddRentalOpen] = useState(false)
  const [editRentalOpen, setEditRentalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null)
  const ZONES = ['All', 'Bangalore', 'Mysuru'] as const
  const [rentalZoneFilter, setRentalZoneFilter] = useState<typeof ZONES[number]>('All')
  const [ruleZoneFilter, setRuleZoneFilter] = useState<typeof ZONES[number]>('All')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [serviceTypesRes, pricingRulesRes, rentalPackagesRes, zonePricingRes] = await Promise.all([
        supabase.from('service_types').select('*').eq('is_active', true),
        supabase.from('pricing_rules').select('*').eq('is_active', true),
        supabase.from('rental_packages').select('*').eq('is_active', true),
        supabase.from('zone_pricing').select('*').eq('is_active', true)
      ])

      if (serviceTypesRes.error) throw serviceTypesRes.error
      if (pricingRulesRes.error) throw pricingRulesRes.error
      if (rentalPackagesRes.error) throw rentalPackagesRes.error
      if (zonePricingRes.error) throw zonePricingRes.error

      // Debug logging
      console.log('📊 Pricing Data Debug:')
      console.log('Service Types:', serviceTypesRes.data)
      console.log('Pricing Rules:', pricingRulesRes.data)
      console.log('Rental Packages:', rentalPackagesRes.data)
      console.log('Zone Pricing:', zonePricingRes.data)

      setServiceTypes(serviceTypesRes.data || [])
      setPricingRules(pricingRulesRes.data || [])
      setRentalPackages(rentalPackagesRes.data || [])
      setZonePricing(zonePricingRes.data || [])
    } catch (error) {
      console.error('Error fetching pricing data:', error)
      toast.error('Failed to load pricing data')
    } finally {
      setLoading(false)
    }
  }

  const calculateFare = () => {
    if (!fareEstimate.serviceType || !fareEstimate.vehicleType) {
      toast.error('Please select service type and vehicle type')
      return
    }

    const serviceType = serviceTypes.find(s => s.name === fareEstimate.serviceType)
    if (!serviceType) return

    let fare = 0

    if (fareEstimate.serviceType === 'car_rental') {
      const package_ = rentalPackages.find(p => 
        p.vehicle_type === fareEstimate.vehicleType && (!p.zone || p.zone === fareEstimate.zone)
      )
      if (package_) {
        fare = package_.base_price
        const extraKm = Math.max(0, parseFloat(fareEstimate.distance) - package_.included_kilometers)
        fare += extraKm * package_.extra_km_rate
      }
    } else {
      const rule = pricingRules.find(r => 
        r.service_type_id === serviceType.id && 
        r.vehicle_type === fareEstimate.vehicleType &&
        ((r as any).zone ? (r as any).zone === fareEstimate.zone : true)
      )
      if (rule) {
        fare = rule.base_fare + (parseFloat(fareEstimate.distance) * rule.per_km_rate)
        if (rule.per_minute_rate && fareEstimate.duration) {
          fare += parseFloat(fareEstimate.duration) * rule.per_minute_rate
        }
        fare *= rule.surge_multiplier
        fare = Math.max(fare, rule.minimum_fare)
      }
    }

    setEstimatedFare(fare)
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'ride_later': return <Car className="h-5 w-5" />
      case 'car_rental': return <Clock className="h-5 w-5" />
      case 'airport': return <Plane className="h-5 w-5" />
      case 'outstation': return <MapPin className="h-5 w-5" />
      case 'sharing': return <Users className="h-5 w-5" />
      default: return <Car className="h-5 w-5" />
    }
  }

  const getActiveServicePricingRules = () => {
    const activeService = serviceTypes.find(s => s.name === activeTab)
    if (!activeService) {
      console.log('🚨 No active service found for tab:', activeTab)
      return []
    }
    const filtered = pricingRules.filter((r: any) => {
      if (r.service_type_id !== activeService.id) return false
      // Apply zone filter only for airport and ride_later
      if ((activeService.name === 'airport' || activeService.name === 'ride_later')) {
        if (ruleZoneFilter !== 'All') return r.zone === ruleZoneFilter
      }
      return true
    })
    console.log(`📋 Pricing Rules for ${activeService.display_name} (ID: ${activeService.id}) with zone filter ${ruleZoneFilter}:`, filtered)
    return filtered
  }

  const getActiveServiceRentalPackages = () => {
    const activeService = serviceTypes.find(s => s.name === activeTab)
    if (!activeService) {
      console.log('🚨 No active service found for tab:', activeTab)
      return []
    }
    const filtered = rentalPackages.filter(r => r.service_type_id === activeService.id)
    console.log(`📦 Rental Packages for ${activeService.display_name} (ID: ${activeService.id}):`, filtered)
    return filtered
  }

  const getActiveServiceZonePricing = () => {
    const activeService = serviceTypes.find(s => s.name === activeTab)
    if (!activeService) {
      console.log('🚨 No active service found for tab:', activeTab)
      return []
    }
    const filtered = zonePricing.filter(z => z.service_type_id === activeService.id)
    console.log(`🗺️ Zone Pricing for ${activeService.display_name} (ID: ${activeService.id}):`, filtered)
    return filtered
  }

  const handleAddRule = () => {
    // Use car rental modal only for car_rental tab
    if (activeTab === 'car_rental') {
      setAddRentalOpen(true)
      return
    }
    setAddRuleModalOpen(true)
  }

  const handleEditRule = (rule: PricingRule) => {
    setSelectedRule(rule)
    setEditRuleModalOpen(true)
  }

  const handleModalSuccess = () => {
    console.log('🔄 Modal success - refetching data...')
    fetchData()
  }

  // Car rental helpers
  const getCarRentalPackages = () => {
    // Only show active packages; when 'All' is selected, include all zones
    return rentalPackages.filter((p: any) => {
      if (!p.is_active) return false
      if (rentalZoneFilter === 'All') return true
      return !p.zone || p.zone === rentalZoneFilter
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fare & Pricing Management</h1>
        <p className="text-gray-600">Manage service-specific pricing rules and estimate fares</p>
        
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Overview Cards */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {serviceTypes.map((service) => (
              <Card 
                key={service.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setActiveTab(service.name)}
              >
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-2">
                    {getServiceIcon(service.name)}
                  </div>
                  <h3 className="font-semibold text-sm">{service.display_name}</h3>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {service.name === 'car_rental' 
                      ? rentalPackages.filter(r => r.service_type_id === service.id && r.is_active).length + ' packages'
                      : pricingRules.filter(r => r.service_type_id === service.id).length + ' rules'}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Management Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              {serviceTypes.map((service) => (
                <TabsTrigger key={service.name} value={service.name} className="text-xs">
                  {service.display_name.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {serviceTypes.map((service) => (
              <TabsContent key={service.name} value={service.name} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getServiceIcon(service.name)}
                        <span className="ml-2">{service.display_name} Pricing</span>
                      </div>
                      <Button size="sm" onClick={handleAddRule}>
                        <Plus className="h-4 w-4 mr-1" />
                        {service.name === 'car_rental' ? 'Add Package' : 'Add Rule'}
                      </Button>
                    </CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Standard Pricing Rules for non-car_rental services only */}
                    {service.name !== 'car_rental' && (
                      <div className="space-y-4">
                        <div className="flex items-end justify-between">
                          <h4 className="font-semibold">Pricing Rules</h4>
                          {(service.name === 'airport' || service.name === 'ride_later') && (
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Zone</Label>
                              <Select value={ruleZoneFilter} onValueChange={(v: any) => setRuleZoneFilter(v as any)}>
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder="Zone" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="All">All</SelectItem>
                                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                                  <SelectItem value="Mysuru">Mysuru</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                        {getActiveServicePricingRules().length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No pricing rules configured yet</p>
                        ) : (
                          getActiveServicePricingRules().map((rule) => (
                            <div key={rule.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium capitalize">{rule.vehicle_type}{(rule as any).zone ? ` • ${(rule as any).zone}` : ''}</h5>
                                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p><span className="font-medium">Base:</span> ₹{rule.base_fare}</p>
                                        <p><span className="font-medium">Per km:</span> ₹{rule.per_km_rate}</p>
                                        {rule.per_minute_rate && <p><span className="font-medium">Per min:</span> ₹{rule.per_minute_rate}</p>}
                                      </div>
                                      <div>
                                        <p><span className="font-medium">Minimum:</span> ₹{rule.minimum_fare}</p>
                                        <p><span className="font-medium">Surge:</span> {rule.surge_multiplier}x</p>
                                        {rule.waiting_charges_per_minute > 0 && (
                                          <p><span className="font-medium">Waiting:</span> ₹{rule.waiting_charges_per_minute}/min</p>
                                        )}
                                      </div>
                                    </div>
                                    {(rule.cancellation_fee > 0 || rule.no_show_fee > 0) && (
                                      <div className="mt-2 pt-2 border-t">
                                        {rule.cancellation_fee > 0 && <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">Cancellation: ₹{rule.cancellation_fee}</span>}
                                        {rule.no_show_fee > 0 && <span className="text-xs bg-gray-100 px-2 py-1 rounded">No Show: ₹{rule.no_show_fee}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Car Rental Packages Section */}
                    {service.name === 'car_rental' && (
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Car Rental Packages</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Zone</span>
                            <Select value={rentalZoneFilter} onValueChange={(v) => setRentalZoneFilter(v as any)}>
                              <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select zone" />
                              </SelectTrigger>
                              <SelectContent>
                                {ZONES.map(z => (<SelectItem key={z} value={z}>{z}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        {getCarRentalPackages().length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No car rental packages yet</p>
                        ) : (
                          getCarRentalPackages().map((pkg: any) => (
                            <div key={pkg.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">{pkg.name} • {(/suv/i.test(pkg.vehicle_type) ? 'SUV' : /sedan/i.test(pkg.vehicle_type) ? 'Sedan' : pkg.vehicle_type)}</h5>
                                  <div className="text-sm text-gray-600 space-y-1 mt-2">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p><span className="font-medium">Base:</span> ₹{pkg.base_price}</p>
                                        <p><span className="font-medium">Included:</span> {pkg.duration_hours}h / {pkg.included_kilometers}km</p>
                                      </div>
                                      <div>
                                        <p><span className="font-medium">Extra km:</span> ₹{pkg.extra_km_rate}</p>
                                        <p><span className="font-medium">Extra hour:</span> ₹{pkg.extra_hour_rate}</p>
                                      </div>
                                    </div>
                                    {(pkg.cancellation_fee > 0 || pkg.no_show_fee > 0) && (
                                      <div className="mt-2 pt-2 border-t">
                                        {pkg.cancellation_fee > 0 && <span className="text-xs bg-gray-100 px-2 py-1 rounded mr-2">Cancellation: ₹{pkg.cancellation_fee}</span>}
                                        {pkg.no_show_fee > 0 && <span className="text-xs bg-gray-100 px-2 py-1 rounded">No Show: ₹{pkg.no_show_fee}</span>}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPackage(pkg)
                                    setEditRentalOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Fare Calculator */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="h-5 w-5 mr-2" />
                Fare Calculator
              </CardTitle>
              <CardDescription>
                Estimate fares across all services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Service Type</Label>
                <Select value={fareEstimate.serviceType} onValueChange={(value) => setFareEstimate(prev => ({ ...prev, serviceType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vehicle Type</Label>
                <Select value={fareEstimate.vehicleType} onValueChange={(value) => setFareEstimate(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedan">Sedan</SelectItem>
                    <SelectItem value="suv">SUV</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="Tempo Traveller">Tempo Traveller</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(fareEstimate.serviceType === 'car_rental' || fareEstimate.serviceType === 'ride_later' || fareEstimate.serviceType === 'airport') && (
                <div>
                  <Label>Zone</Label>
                  <Select value={fareEstimate.zone} onValueChange={(value) => setFareEstimate(prev => ({ ...prev, zone: value as any }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Mysuru">Mysuru</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Pickup Location</Label>
                <Input
                  value={fareEstimate.pickup}
                  onChange={(e) => setFareEstimate(prev => ({ ...prev, pickup: e.target.value }))}
                  placeholder="Enter pickup address"
                />
              </div>

              <div>
                <Label>Dropoff Location</Label>
                <Input
                  value={fareEstimate.dropoff}
                  onChange={(e) => setFareEstimate(prev => ({ ...prev, dropoff: e.target.value }))}
                  placeholder="Enter dropoff address"
                />
              </div>

              <div>
                <Label>Distance (km)</Label>
                <Input
                  type="number"
                  value={fareEstimate.distance}
                  onChange={(e) => setFareEstimate(prev => ({ ...prev, distance: e.target.value }))}
                  placeholder="10"
                />
              </div>

              {fareEstimate.serviceType === 'ride_later' && (
                <div>
                  <Label>Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={fareEstimate.duration}
                    onChange={(e) => setFareEstimate(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="30"
                  />
                </div>
              )}

              <Button onClick={calculateFare} className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Fare
              </Button>

              {estimatedFare !== null && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Estimated Fare</h4>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{estimatedFare.toFixed(2)}
                    </div>
                    <div className="text-sm text-green-700 mt-2">
                      {fareEstimate.serviceType === 'car_rental' ? 
                        `For ${fareEstimate.distance}km trip` : 
                        `Base + ${fareEstimate.distance}km travel`
                      }
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Service Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Service Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {serviceTypes.map((service) => {
              const rules = pricingRules.filter(r => r.service_type_id === service.id)
              const avgBase = rules.length > 0 ? rules.reduce((sum, r) => sum + r.base_fare, 0) / rules.length : 0
              
              return (
                <div key={service.id} className="text-center">
                  <div className="flex justify-center mb-2">
                    {getServiceIcon(service.name)}
                  </div>
                  <p className="text-xl font-bold text-gray-900">₹{avgBase.toFixed(0)}</p>
                  <p className="text-sm text-gray-600">{service.display_name}</p>
                  <p className="text-xs text-gray-500">Avg. Base Fare</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddPricingRuleModal
        open={addRuleModalOpen}
        onOpenChange={setAddRuleModalOpen}
        serviceType={serviceTypes.find(s => s.name === activeTab) || serviceTypes[0]}
        onSuccess={handleModalSuccess}
      />

      <EditPricingRuleModal
        open={editRuleModalOpen}
        onOpenChange={setEditRuleModalOpen}
        rule={selectedRule}
        onSuccess={handleModalSuccess}
      />

      {/* Car Rental Modals */}
      <AddCarRentalPackageModal
        open={addRentalOpen}
        onOpenChange={setAddRentalOpen}
        onSuccess={handleModalSuccess}
        defaultZone={rentalZoneFilter as any}
      />
      <EditCarRentalPackageModal
        open={editRentalOpen}
        onOpenChange={setEditRentalOpen}
        pkg={selectedPackage}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}