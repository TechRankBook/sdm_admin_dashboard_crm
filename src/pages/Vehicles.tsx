
import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, FileText, Car, Eye, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Vehicle } from '@/types/database'
import { toast } from 'sonner'
import { AddVehicleModal } from '@/components/vehicles/AddVehicleModal'
import { EditVehicleModal } from '@/components/vehicles/EditVehicleModal'
import { DeleteVehicleModal } from '@/components/vehicles/DeleteVehicleModal'
import { ServiceLogsModal } from '@/components/vehicles/ServiceLogsModal'

export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showServiceLogsModal, setShowServiceLogsModal] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to fetch vehicles')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_service':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeDisplayName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'out_of_service':
        return 'Out of Service'
      case 'maintenance':
        return 'Maintenance'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = (vehicle.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehicle.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEditVehicle = (vehicle: Vehicle) => {
    console.log('Edit vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowEditModal(true)
  }

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    console.log('Delete vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowDeleteModal(true)
  }

  const handleViewServiceLogs = (vehicle: Vehicle) => {
    console.log('View service logs for vehicle:', vehicle)
    setSelectedVehicle(vehicle)
    setShowServiceLogsModal(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600">Manage and monitor all vehicles in your fleet</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Vehicle
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by make, model, or license plate..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'maintenance', 'out_of_service'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All' : getStatusDisplayName(status)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {vehicle.image_url ? (
                      <img 
                        src={vehicle.image_url} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Car className="h-6 w-6 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-500">{vehicle.license_plate}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(vehicle.status || 'active')}>
                  {getStatusDisplayName(vehicle.status || 'active')}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                {vehicle.year && (
                  <p className="text-sm text-gray-600">Year: {vehicle.year}</p>
                )}
                {vehicle.color && (
                  <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
                )}
                {vehicle.capacity && (
                  <p className="text-sm text-gray-600">Capacity: {vehicle.capacity} passengers</p>
                )}
                {vehicle.type && (
                  <p className="text-sm text-gray-600">Type: {getTypeDisplayName(vehicle.type)}</p>
                )}
                {vehicle.last_service_date && (
                  <p className="text-sm text-gray-600">
                    Last Service: {new Date(vehicle.last_service_date).toLocaleDateString()}
                  </p>
                )}
                {vehicle.next_service_due_date && (
                  <p className="text-sm text-gray-600">
                    Next Service Due: {new Date(vehicle.next_service_due_date).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditVehicle(vehicle)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewServiceLogs(vehicle)}>
                  <FileText className="h-4 w-4 mr-1" />
                  Service Logs
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteVehicle(vehicle)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No vehicles found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddVehicleModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
        onVehicleAdded={fetchVehicles}
      />
      
      <EditVehicleModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        vehicle={selectedVehicle}
        onVehicleUpdated={fetchVehicles}
      />
      
      <DeleteVehicleModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        vehicle={selectedVehicle}
        onVehicleDeleted={fetchVehicles}
      />
      
      <ServiceLogsModal 
        open={showServiceLogsModal} 
        onOpenChange={setShowServiceLogsModal}
        vehicle={selectedVehicle}
      />
    </div>
  )
}
