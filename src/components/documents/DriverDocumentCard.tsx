import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { User, FileText, Check, X, AlertCircle, Eye } from 'lucide-react'
import { Driver } from '@/types/database'

interface DriverDocumentCardProps {
  driver: Driver
  onViewDocuments: (driver: Driver) => void
}

export const DriverDocumentCard: React.FC<DriverDocumentCardProps> = ({ 
  driver, 
  onViewDocuments 
}) => {
  const getStatusColor = (status?: string) => {
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

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      case 'pending':
      case 'resubmission_requested':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getDocumentCount = () => {
    let count = 0
    if (driver.license_document_url) count++
    if (driver.id_proof_document_url) count++
    return count
  }

  const documentCount = getDocumentCount()

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onViewDocuments(driver)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              {driver.profile_picture_url ? (
                <img 
                  src={driver.profile_picture_url} 
                  alt={driver.full_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-medium">{driver.full_name}</CardTitle>
              <p className="text-xs text-gray-500">{driver.phone_no}</p>
            </div>
          </div>
          <Badge className={getStatusColor(driver.kyc_status)}>
            {getStatusIcon(driver.kyc_status)}
            <span className="ml-1 text-xs">
              {(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>{documentCount}/2 documents uploaded</span>
          </div>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onViewDocuments(driver) }}>
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
        {driver.joined_on && (
          <p className="text-xs text-gray-400 mt-2">
            Joined: {new Date(driver.joined_on).toLocaleDateString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}