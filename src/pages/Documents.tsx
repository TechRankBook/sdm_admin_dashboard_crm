
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Eye, Check, X, AlertCircle, User, Upload } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export const Documents: React.FC = () => {
  const [searchParams] = useSearchParams()
  const driverFilter = searchParams.get('driver')
  
  const { drivers, loading, updateDriverKYCStatus } = useDocuments(driverFilter || undefined)
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadConfig, setUploadConfig] = useState<{
    driverId: string
    driverName: string
    documentType: 'license' | 'id_proof'
  } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const handleApprove = async (driverId: string, driverName: string) => {
    try {
      await updateDriverKYCStatus(driverId, 'approved')
    } catch (error) {
      console.error('Error approving document:', error)
    }
  }

  const handleReject = async () => {
    if (rejectionReason.trim() && selectedDocument) {
      try {
        await updateDriverKYCStatus(selectedDocument.driverId, 'rejected', rejectionReason.trim())
        setShowRejectModal(false)
        setRejectionReason('')
        setSelectedDocument(null)
      } catch (error) {
        console.error('Error rejecting document:', error)
      }
    }
  }

  const handleRequestResubmission = async (driverId: string) => {
    try {
      await updateDriverKYCStatus(driverId, 'resubmission_requested')
    } catch (error) {
      console.error('Error requesting resubmission:', error)
    }
  }

  const handleUploadDocument = (driverId: string, driverName: string, documentType: 'license' | 'id_proof') => {
    setUploadConfig({ driverId, driverName, documentType })
    setShowUploadModal(true)
  }

  const openDocumentPreview = (url: string) => {
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC & Document Management</h1>
        <p className="text-gray-600">Review and approve driver documents</p>
        {driverFilter && (
          <p className="text-sm text-blue-600 mt-1">
            Showing documents for selected driver
          </p>
        )}
      </div>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drivers" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Driver Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Driver Document Review</CardTitle>
              <CardDescription>
                Review and approve driver KYC documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {drivers.map((driver) => (
                  <div key={driver.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{driver.full_name}</h3>
                        <p className="text-sm text-gray-500">{driver.phone_no}</p>
                        <p className="text-xs text-gray-400">
                          Joined: {driver.joined_on ? new Date(driver.joined_on).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(driver.kyc_status || 'pending')}>
                        {getStatusIcon(driver.kyc_status || 'pending')}
                        <span className="ml-1">{(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* License Document */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">Driver's License</p>
                          <Badge className={`${getStatusColor(driver.license_document_url ? 'uploaded' : 'missing')} text-xs px-2 py-1`}>
                            {driver.license_document_url ? 'uploaded' : 'missing'}
                          </Badge>
                        </div>
                        {driver.license_document_url ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full text-xs px-2 py-1 h-7"
                              onClick={() => openDocumentPreview(driver.license_document_url!)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            {driver.kyc_status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                                  onClick={() => handleApprove(driver.id, driver.full_name)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 text-xs px-2 py-1 h-7"
                                  onClick={() => {
                                    setSelectedDocument({ driverId: driver.id, driverName: driver.full_name })
                                    setShowRejectModal(true)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {(driver.kyc_status === 'rejected' || driver.kyc_status === 'resubmission_requested') && (
                              <Button
                                variant="outline"
                                className="w-full text-xs px-2 py-1 h-7"
                                onClick={() => handleRequestResubmission(driver.id)}
                              >
                                Request Resubmission
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 mb-2">Not uploaded</p>
                            <Button
                              variant="outline"
                              className="w-full text-xs px-2 py-1 h-7"
                              onClick={() => handleUploadDocument(driver.id, driver.full_name, 'license')}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* ID Proof Document */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">ID Proof</p>
                          <Badge className={`${getStatusColor(driver.id_proof_document_url ? 'uploaded' : 'missing')} text-xs px-2 py-1`}>
                            {driver.id_proof_document_url ? 'uploaded' : 'missing'}
                          </Badge>
                        </div>
                        {driver.id_proof_document_url ? (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              className="w-full text-xs px-2 py-1 h-7"
                              onClick={() => openDocumentPreview(driver.id_proof_document_url!)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            {driver.kyc_status === 'pending' && (
                              <div className="flex space-x-1">
                                <Button
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-7"
                                  onClick={() => handleApprove(driver.id, driver.full_name)}
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  className="flex-1 text-xs px-2 py-1 h-7"
                                  onClick={() => {
                                    setSelectedDocument({ driverId: driver.id, driverName: driver.full_name })
                                    setShowRejectModal(true)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs text-gray-500 mb-2">Not uploaded</p>
                            <Button
                              variant="outline"
                              className="w-full text-xs px-2 py-1 h-7"
                              onClick={() => handleUploadDocument(driver.id, driver.full_name, 'id_proof')}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {driver.rejection_reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {driver.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {drivers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No drivers found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rejection Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Document</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter the reason for rejection..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Document Upload Modal */}
      {uploadConfig && (
        <DocumentUploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          driverId={uploadConfig.driverId}
          driverName={uploadConfig.driverName}
          documentType={uploadConfig.documentType}
        />
      )}
    </div>
  )
}
