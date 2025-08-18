
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Car, FileText } from 'lucide-react'
import { useDocumentManagement } from '@/hooks/useDocumentManagement'
import { DriverDocumentCard } from '@/components/documents/DriverDocumentCard'
import { VehicleDocumentCard } from '@/components/documents/VehicleDocumentCard'
import { DriverDocumentDetailModal } from '@/components/documents/DriverDocumentDetailModal'
import { VehicleDocumentDetailModal } from '@/components/documents/VehicleDocumentDetailModal'
import { Driver, Vehicle, VehicleDocument } from '@/types/database'

export const Documents: React.FC = () => {
  const { 
    drivers, 
    vehicles, 
    loading, 
    updateDriverKYCStatus, 
    updateVehicleDocumentStatus,
    refetch
  } = useDocumentManagement()
  
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<(Vehicle & { documents: VehicleDocument[] }) | null>(null)
  const [showDriverModal, setShowDriverModal] = useState(false)
  const [showVehicleModal, setShowVehicleModal] = useState(false)

  // Sync selectedVehicle with updated vehicles data
  useEffect(() => {
    if (selectedVehicle && vehicles.length > 0) {
      const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id)
      if (updatedVehicle && JSON.stringify(updatedVehicle) !== JSON.stringify(selectedVehicle)) {
        setSelectedVehicle(updatedVehicle)
      }
    }
  }, [vehicles, selectedVehicle])

  // Sync selectedDriver with updated drivers data
  useEffect(() => {
    if (selectedDriver && drivers.length > 0) {
      const updatedDriver = drivers.find(d => d.id === selectedDriver.id)
      if (updatedDriver && JSON.stringify(updatedDriver) !== JSON.stringify(selectedDriver)) {
        setSelectedDriver(updatedDriver)
      }
    }
  }, [drivers, selectedDriver])

  const handleViewDriverDocuments = (driver: Driver) => {
    setSelectedDriver(driver)
    setShowDriverModal(true)
  }

  const handleViewVehicleDocuments = (vehicle: Vehicle & { documents: VehicleDocument[] }) => {
    setSelectedVehicle(vehicle)
    setShowVehicleModal(true)
  }

  const handleApproveDriver = async (driverId: string, driverName: string) => {
    try {
      await updateDriverKYCStatus(driverId, 'approved')
    } catch (error) {
      console.error('Error approving driver document:', error)
    }
  }

  const handleRejectDriver = async (driverId: string, driverName: string, reason: string) => {
    try {
      await updateDriverKYCStatus(driverId, 'rejected', reason)
    } catch (error) {
      console.error('Error rejecting driver document:', error)
    }
  }

  const handleRequestResubmission = async (driverId: string) => {
    try {
      await updateDriverKYCStatus(driverId, 'resubmission_requested')
    } catch (error) {
      console.error('Error requesting resubmission:', error)
    }
  }

  const handleApproveVehicleDocument = async (vehicleId: string, documentId: string) => {
    try {
      await updateVehicleDocumentStatus(vehicleId, documentId, true)
    } catch (error) {
      console.error('Error approving vehicle document:', error)
    }
  }

  const handleRejectVehicleDocument = async (vehicleId: string, documentId: string, reason: string) => {
    try {
      await updateVehicleDocumentStatus(vehicleId, documentId, false, reason)
    } catch (error) {
      console.error('Error rejecting vehicle document:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-100 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600">Review and approve driver and vehicle documents</p>
      </div>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drivers" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Driver Documents
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicle Documents
          </TabsTrigger>
        </TabsList>

        {/* Driver Documents Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Document Review</CardTitle>
              <CardDescription>
                Review and approve driver KYC documents. Click on a driver card to view and manage their documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {drivers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {drivers.map((driver) => (
                    <DriverDocumentCard
                      key={driver.id}
                      driver={driver}
                      onViewDocuments={handleViewDriverDocuments}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No drivers found</p>
                  <p className="text-gray-400">Driver documents will appear here once drivers are added to the system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Documents Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Document Review</CardTitle>
              <CardDescription>
                Review and approve vehicle documents including registration, insurance, and certificates. Click on a vehicle card to view and manage its documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map((vehicle) => (
                    <VehicleDocumentCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onViewDocuments={handleViewVehicleDocuments}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No vehicles found</p>
                  <p className="text-gray-400">Vehicle documents will appear here once vehicles are added to the system.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <DriverDocumentDetailModal
        open={showDriverModal}
        onOpenChange={setShowDriverModal}
        driver={selectedDriver}
        onApprove={handleApproveDriver}
        onReject={handleRejectDriver}
        onRequestResubmission={handleRequestResubmission}
      />

      <VehicleDocumentDetailModal
        open={showVehicleModal}
        onOpenChange={setShowVehicleModal}
        vehicle={selectedVehicle}
        onApprove={handleApproveVehicleDocument}
        onReject={handleRejectVehicleDocument}
        onDocumentsUpdated={refetch}
      />
    </div>
  )
}
