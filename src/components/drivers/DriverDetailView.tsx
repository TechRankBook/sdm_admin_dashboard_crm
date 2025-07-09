import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Edit, Trash2, User, FileText, AlertTriangle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Driver, Vehicle } from '@/types/database'
import { toast } from 'sonner'
import { DriverInfoTab } from './DriverInfoTab'
import { DriverDocumentsTab } from './DriverDocumentsTab'
import { DriverPerformanceTab } from './DriverPerformanceTab'
import { EditDriverModal } from './EditDriverModal'
import { DeleteDriverModal } from './DeleteDriverModal'

export const DriverDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (id) {
      fetchDriverData()
    }
  }, [id])

  const fetchDriverData = async () => {
    if (!id) return

    try {
      setLoading(true)

      // Fetch driver data
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single()

      if (driverError) throw driverError
      setDriver(driverData)

      // Fetch assigned vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('assigned_driver_id', id)
        .maybeSingle()

      if (!vehicleError) setAssignedVehicle(vehicleData)

    } catch (error) {
      console.error('Error fetching driver data:', error)
      toast.error('Failed to load driver data')
    } finally {
      setLoading(false)
    }
  }

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

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'resubmission_requested':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Handle modal events via useDrivers hook refresh
  useEffect(() => {
    // Refresh data when modals close
    if (!showEditModal && !showDeleteModal) {
      fetchDriverData()
    }
  }, [showEditModal, showDeleteModal])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Driver Not Found</h1>
          <p className="text-gray-600 mb-6">The requested driver could not be found.</p>
          <Button onClick={() => navigate('/drivers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Drivers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/drivers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={driver.profile_picture_url || ''} />
                <AvatarFallback>
                  {driver.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {driver.full_name}
                </h1>
                <p className="text-gray-600">{driver.phone_no}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-2">
            <Badge className={getStatusColor(driver.status || 'active')}>
              {(driver.status || 'active').replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={getKYCStatusColor(driver.kyc_status || 'pending')}>
              KYC: {(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* KYC Alert */}
      {driver.kyc_status === 'rejected' && driver.rejection_reason && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="font-medium text-red-800">
                KYC Rejected
              </span>
              <span className="text-red-600">
                - {driver.rejection_reason}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Driver Info</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <DriverInfoTab driver={driver} assignedVehicle={assignedVehicle} />
        </TabsContent>

        <TabsContent value="documents">
          <DriverDocumentsTab 
            driverId={driver.id} 
            driver={driver}
            onDocumentsUpdated={() => fetchDriverData()} 
          />
        </TabsContent>

        <TabsContent value="performance">
          <DriverPerformanceTab 
            driverId={driver.id} 
            driver={driver}
            onPerformanceUpdated={() => fetchDriverData()} 
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditDriverModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        driver={driver}
      />
      
      <DeleteDriverModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        driver={driver}
      />
    </div>
  )
}