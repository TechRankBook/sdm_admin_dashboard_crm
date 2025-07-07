import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Edit, Trash2, Car, FileText, AlertTriangle, TrendingUp, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Vehicle, Driver, VehicleDocument, VehicleMaintenanceLog, VehiclePerformance, VehicleAlert } from '@/types/database'
import { useVehicleUtils } from '@/hooks/useVehicleUtils'
import { toast } from 'sonner'
import { VehicleInfoTab } from './VehicleInfoTab'
import { VehicleDocumentsTab } from './VehicleDocumentsTab'
import { VehicleServiceTab } from './VehicleServiceTab'
import { VehiclePerformanceTab } from './VehiclePerformanceTab'
import { VehicleAlertsTab } from './VehicleAlertsTab'
import { EditVehicleModal } from './EditVehicleModal'
import { DeleteVehicleModal } from './DeleteVehicleModal'

export const VehicleDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [driver, setDriver] = useState<Driver | null>(null)
  const [documents, setDocuments] = useState<VehicleDocument[]>([])
  const [serviceLogs, setServiceLogs] = useState<VehicleMaintenanceLog[]>([])
  const [performance, setPerformance] = useState<VehiclePerformance[]>([])
  const [alerts, setAlerts] = useState<VehicleAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { getStatusColor, getTypeDisplayName, getStatusDisplayName } = useVehicleUtils()

  useEffect(() => {
    if (id) {
      fetchVehicleData()
    }
  }, [id])

  const fetchVehicleData = async () => {
    if (!id) return

    try {
      setLoading(true)

      // Fetch vehicle data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single()

      if (vehicleError) throw vehicleError
      setVehicle(vehicleData)

      // Fetch assigned driver
      if (vehicleData.assigned_driver_id) {
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', vehicleData.assigned_driver_id)
          .single()

        if (!driverError) setDriver(driverData)
      }

      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('vehicle_documents')
        .select('*')
        .eq('vehicle_id', id)
        .order('created_at', { ascending: false })

      if (!documentsError) setDocuments(documentsData || [])

      // Fetch service logs
      const { data: serviceData, error: serviceError } = await supabase
        .from('vehicle_maintenance_logs')
        .select('*')
        .eq('vehicle_id', id)
        .order('maintenance_date', { ascending: false })

      if (!serviceError) setServiceLogs(serviceData || [])

      // Fetch performance data
      const { data: performanceData, error: performanceError } = await supabase
        .from('vehicle_performance')
        .select('*')
        .eq('vehicle_id', id)
        .order('recorded_date', { ascending: false })

      if (!performanceError) setPerformance(performanceData || [])

      // Fetch alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from('vehicle_alerts')
        .select('*')
        .eq('vehicle_id', id)
        .eq('is_resolved', false)
        .order('priority', { ascending: false })

      if (!alertsError) setAlerts(alertsData || [])

    } catch (error) {
      console.error('Error fetching vehicle data:', error)
      toast.error('Failed to load vehicle data')
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleUpdated = () => {
    fetchVehicleData()
    setShowEditModal(false)
  }

  const handleVehicleDeleted = () => {
    setShowDeleteModal(false)
    navigate('/vehicles')
  }

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

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-6">The requested vehicle could not be found.</p>
          <Button onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
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
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h1>
                <p className="text-gray-600">{vehicle.license_plate}</p>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(vehicle.status || 'active')}>
            {getStatusDisplayName(vehicle.status || 'active')}
          </Badge>
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

      {/* Alert Summary */}
      {alerts.length > 0 && (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">
                {alerts.length} Active Alert{alerts.length > 1 ? 's' : ''}
              </span>
              <span className="text-orange-600">
                - {alerts.filter(a => a.priority === 'critical').length} critical, {alerts.filter(a => a.priority === 'high').length} high priority
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content - Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="info" className="flex items-center space-x-2">
            <Car className="w-4 h-4" />
            <span>Vehicle Info</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Documents</span>
          </TabsTrigger>
          <TabsTrigger value="service" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Service History</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts ({alerts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <VehicleInfoTab vehicle={vehicle} driver={driver} />
        </TabsContent>

        <TabsContent value="documents">
          <VehicleDocumentsTab 
            vehicleId={vehicle.id} 
            documents={documents} 
            onDocumentsUpdated={() => fetchVehicleData()} 
          />
        </TabsContent>

        <TabsContent value="service">
          <VehicleServiceTab 
            vehicleId={vehicle.id} 
            serviceLogs={serviceLogs} 
            onServiceUpdated={() => fetchVehicleData()} 
          />
        </TabsContent>

        <TabsContent value="performance">
          <VehiclePerformanceTab 
            vehicleId={vehicle.id} 
            vehicle={vehicle}
            performance={performance} 
            onPerformanceUpdated={() => fetchVehicleData()} 
          />
        </TabsContent>

        <TabsContent value="alerts">
          <VehicleAlertsTab 
            vehicleId={vehicle.id} 
            alerts={alerts} 
            onAlertsUpdated={() => fetchVehicleData()} 
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <EditVehicleModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        vehicle={vehicle}
        onVehicleUpdated={handleVehicleUpdated}
      />
      
      <DeleteVehicleModal 
        open={showDeleteModal} 
        onOpenChange={setShowDeleteModal}
        vehicle={vehicle}
        onVehicleDeleted={handleVehicleDeleted}
      />
    </div>
  )
}