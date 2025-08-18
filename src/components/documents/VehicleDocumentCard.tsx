import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Car, FileText, Check, X, AlertCircle, Eye } from 'lucide-react'
import { Vehicle, VehicleDocument } from '@/types/database'

interface VehicleDocumentCardProps {
  vehicle: Vehicle & { documents: VehicleDocument[] }
  onViewDocuments: (vehicle: Vehicle & { documents: VehicleDocument[] }) => void
}

export const VehicleDocumentCard: React.FC<VehicleDocumentCardProps> = ({ 
  vehicle, 
  onViewDocuments 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'maintenance':
      case 'in_maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_service':
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDocumentStatus = () => {
    const totalDocs = vehicle.documents.length
    const verifiedDocs = vehicle.documents.filter(doc => doc.verified).length
    const pendingDocs = totalDocs - verifiedDocs

    if (totalDocs === 0) {
      return { status: 'no-documents', color: 'bg-gray-100 text-gray-800', text: 'No Documents', count: '0/4' }
    } else if (verifiedDocs === totalDocs) {
      return { status: 'verified', color: 'bg-green-100 text-green-800', text: 'All Verified', count: `${totalDocs}/4` }
    } else if (pendingDocs > 0) {
      return { status: 'pending', color: 'bg-yellow-100 text-yellow-800', text: 'Pending Review', count: `${totalDocs}/4` }
    } else {
      return { status: 'partial', color: 'bg-orange-100 text-orange-800', text: 'Partial', count: `${totalDocs}/4` }
    }
  }

  const documentStatus = getDocumentStatus()

  const getDocumentStatusIcon = () => {
    switch (documentStatus.status) {
      case 'verified':
        return <Check className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'no-documents':
        return <X className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDocuments(vehicle)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
              {vehicle.image_url ? (
                <img 
                  src={vehicle.image_url} 
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-10 h-10 object-cover"
                />
              ) : (
                <Car className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{vehicle.make} {vehicle.model}</CardTitle>
              <p className="text-xs text-gray-500">{vehicle.license_plate}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={getStatusColor(vehicle.status || 'active')}>
              {(vehicle.status || 'active').replace('_', ' ').toUpperCase()}
            </Badge>
            <Badge className={documentStatus.color}>
              {getDocumentStatusIcon()}
              <span className="ml-1 text-xs">{documentStatus.text}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{documentStatus.count} documents</span>
          </div>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onViewDocuments(vehicle) }}>
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {vehicle.year && <span>Year: {vehicle.year} • </span>}
          {vehicle.type && <span>Type: {vehicle.type}</span>}
        </div>
      </CardContent>
    </Card>
  )
}