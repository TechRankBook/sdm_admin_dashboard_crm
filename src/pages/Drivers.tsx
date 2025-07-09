
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, Edit, Eye, Star, Trash2 } from 'lucide-react'
import { useDrivers } from '@/hooks/useDrivers'
import { AddDriverModal } from '@/components/drivers/AddDriverModal'
import { EditDriverModal } from '@/components/drivers/EditDriverModal'
import { DriverProfileModal } from '@/components/drivers/DriverProfileModal'
import { DeleteDriverModal } from '@/components/drivers/DeleteDriverModal'
import { Driver } from '@/types/database'

export const Drivers: React.FC = () => {
  const navigate = useNavigate()
  const { drivers, loading } = useDrivers()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'on_break':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.phone_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (driver.license_number || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const handleViewDriver = (driver: Driver) => {
    navigate(`/drivers/${driver.id}`)
  }

  const handleEditDriver = (driver: Driver) => {
    console.log('Edit driver:', driver)
    setSelectedDriver(driver)
    setShowEditModal(true)
  }

  const handleDeleteDriver = (driver: Driver) => {
    console.log('Delete driver:', driver)
    setSelectedDriver(driver)
    setShowDeleteModal(true)
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
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600">Manage and monitor all drivers</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Driver
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
                  placeholder="Search by name, phone, or license..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'inactive', 'on_break'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={driver.profile_picture_url || ''} />
                    <AvatarFallback>
                      {driver.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{driver.full_name}</h3>
                    <p className="text-sm text-gray-500">{driver.phone_no}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(driver.status || 'active')}>
                  {(driver.status || 'active').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(driver.rating || 0))}
                  <span className="text-sm text-gray-500 ml-2">({(driver.rating || 0).toFixed(1)})</span>
                </div>
                <p className="text-sm text-gray-600">
                  Total Rides: {driver.total_rides || 0}
                </p>
                {driver.license_number && (
                  <p className="text-sm text-gray-600">
                    License: {driver.license_number}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDriver(driver)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditDriver(driver)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteDriver(driver)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No drivers found matching your criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <AddDriverModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal}
      />
      
      <EditDriverModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        driver={selectedDriver}
      />
      
      <DriverProfileModal 
        open={showProfileModal} 
        onOpenChange={setShowProfileModal}
        driver={selectedDriver}
      />
      
      <DeleteDriverModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        driver={selectedDriver}
      />
    </div>
  )
}
