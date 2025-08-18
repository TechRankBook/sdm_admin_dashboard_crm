import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Car, Eye, Check, X, AlertTriangle, FileText, Upload, Edit, Trash2, Shield, ShieldOff } from 'lucide-react'
import { Vehicle, VehicleDocument } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleDocumentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehicle: (Vehicle & { documents: VehicleDocument[] }) | null
  onApprove: (vehicleId: string, documentId: string) => void
  onReject: (vehicleId: string, documentId: string, reason: string) => void
  onDocumentsUpdated: () => void
}

export const VehicleDocumentDetailModal: React.FC<VehicleDocumentDetailModalProps> = ({
  open,
  onOpenChange,
  vehicle,
  onApprove,
  onReject,
  onDocumentsUpdated
}) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectingDocId, setRejectingDocId] = useState<string | null>(null)
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null)
  const [replacingDocId, setReplacingDocId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  if (!vehicle) return null

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

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'registration':
        return 'Registration Certificate'
      case 'insurance':
        return 'Insurance Policy'
      case 'pollution_certificate':
        return 'Pollution Certificate'
      case 'fitness_certificate':
        return 'Fitness Certificate'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getDocumentStatusBadge = (doc: VehicleDocument) => {
    if (doc.verified) {
      return <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
    }
    
    if (!doc.expiry_date) {
      return <Badge variant="secondary" className="text-xs">Pending Review</Badge>
    }

    const expiryDate = new Date(doc.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Expiring Soon</Badge>
    } else if (daysUntilExpiry <= 90) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Expires in {daysUntilExpiry} days</Badge>
    } else {
      return <Badge variant="outline" className="border-green-200 text-green-800 text-xs">Valid</Badge>
    }
  }

  const handleApprove = (documentId: string) => {
    onApprove(vehicle.id, documentId)
  }

  const handleReject = (documentId: string) => {
    if (!rejectionReason.trim()) return
    onReject(vehicle.id, documentId, rejectionReason.trim())
    setRejectionReason('')
    setRejectingDocId(null)
  }

  const handleUnverify = async (documentId: string) => {
    try {
      const isLegacyDoc = documentId.startsWith('legacy-')
      
      if (isLegacyDoc) {
        // For legacy documents, create a new record in vehicle_documents table with verified: false
        const documentType = documentId.split('-')[1] as 'insurance' | 'registration' | 'pollution_certificate'
        const documentUrl = documentType === 'insurance' ? vehicle.insurance_document_url :
                           documentType === 'registration' ? vehicle.registration_document_url :
                           vehicle.pollution_certificate_url

        const { error } = await supabase
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicle.id,
            document_type: documentType,
            document_url: documentUrl,
            verified: false,
            notes: 'Document unverified'
          })

        if (error) throw error
      } else {
        // Update existing document record
        const { error } = await supabase
          .from('vehicle_documents')
          .update({ 
            verified: false,
            updated_at: new Date().toISOString()
          })
          .eq('id', documentId)

        if (error) throw error
      }

      toast.success('Document unverified successfully')
      onDocumentsUpdated()
    } catch (error) {
      console.error('Error unverifying document:', error)
      toast.error('Failed to unverify document')
    }
  }

  const handleDelete = async (documentId: string) => {
    try {
      const isLegacyDoc = documentId.startsWith('legacy-')

      if (isLegacyDoc) {
        // For legacy documents, clear the URL from the vehicles table
        const documentType = documentId.split('-')[1] as 'insurance' | 'registration' | 'pollution_certificate'
        const updateField = `${documentType}_document_url`
        const { error } = await supabase
          .from('vehicles')
          .update({ [updateField]: null })
          .eq('id', vehicle.id)
        if (error) throw error
      } else {
        // For dedicated table documents, delete the record
        const document = vehicle.documents.find(doc => doc.id === documentId)
        if (document?.document_url) {
          // Try to delete from storage
          const path = extractStoragePath(document.document_url)
          if (path) {
            await supabase.storage
              .from('vehicle-documents')
              .remove([path])
          }
        }

        const { error } = await supabase
          .from('vehicle_documents')
          .delete()
          .eq('id', documentId)
        if (error) throw error
      }

      toast.success('Document deleted successfully')
      onDocumentsUpdated()
    } catch (error) {
      console.error('Error deleting document:', error)
      toast.error('Failed to delete document')
    }
  }

  const extractStoragePath = (url: string): string | null => {
    try {
      const urlParts = url.split('/')
      const bucketIndex = urlParts.findIndex(part => part === 'vehicle-documents')
      if (bucketIndex !== -1 && urlParts.length > bucketIndex + 1) {
        return urlParts.slice(bucketIndex + 1).join('/')
      }
    } catch (error) {
      console.error('Error extracting storage path:', error)
    }
    return null
  }

  const startUpload = (docType: string) => {
    setUploadingDocType(docType)
    setReplacingDocId(null)
    resetUploadForm()
  }

  const startReplace = (documentId: string, docType: string) => {
    const document = vehicle.documents.find(doc => doc.id === documentId)
    setReplacingDocId(documentId)
    setUploadingDocType(docType)
    
    if (document) {
      setIssueDate(document.issue_date || '')
      setExpiryDate(document.expiry_date || '')
      setNotes(document.notes || '')
    }
  }

  const resetUploadForm = () => {
    setSelectedFile(null)
    setIssueDate('')
    setExpiryDate('')
    setNotes('')
  }

  const cancelUpload = () => {
    setUploadingDocType(null)
    setReplacingDocId(null)
    resetUploadForm()
  }

  const handleUpload = async () => {
    if (!selectedFile || !uploadingDocType) {
      toast.error('Please select a file')
      return
    }

    setIsUploading(true)

    try {
      // Upload file to storage
      const fileName = `${vehicle.id}/${uploadingDocType}-${Date.now()}.${selectedFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('vehicle-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-documents')
        .getPublicUrl(fileName)

      // Check if we're replacing a document
      if (replacingDocId) {
        const isLegacyDoc = replacingDocId.startsWith('legacy-')

        if (isLegacyDoc) {
          // Update the vehicles table for legacy documents and create a new document record
          const updateField = `${uploadingDocType}_document_url`
          const { error: legacyUpdateErr } = await supabase
            .from('vehicles')
            .update({ [updateField]: publicUrl })
            .eq('id', vehicle.id)
          if (legacyUpdateErr) throw legacyUpdateErr

          // Create a new document record in the dedicated table
          const { error: newDocErr } = await supabase
            .from('vehicle_documents')
            .insert({
              vehicle_id: vehicle.id,
              document_type: uploadingDocType as any,
              document_url: publicUrl,
              issue_date: issueDate || null,
              expiry_date: expiryDate || null,
              notes: notes || null,
              verified: false
            })
          if (newDocErr) throw newDocErr
        } else {
          // Update existing document in the dedicated table
          const { error: updateErr } = await supabase
            .from('vehicle_documents')
            .update({
              document_url: publicUrl,
              issue_date: issueDate || null,
              expiry_date: expiryDate || null,
              notes: notes || null,
            })
            .eq('id', replacingDocId)
          if (updateErr) throw updateErr
        }
      } else {
        // Create new document record
        const { error: dbError } = await supabase
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicle.id,
            document_type: uploadingDocType as any,
            document_url: publicUrl,
            issue_date: issueDate || null,
            expiry_date: expiryDate || null,
            notes: notes || null,
            verified: false
          })
        if (dbError) throw dbError
      }

      toast.success(replacingDocId ? 'Document replaced successfully' : 'Document uploaded successfully')
      cancelUpload()
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const documentTypes = [
    'registration',
    'insurance', 
    'pollution_certificate',
    'fitness_certificate'
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
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
              <span>{vehicle.make} {vehicle.model} - Documents</span>
              <p className="text-sm font-normal text-gray-500">{vehicle.license_plate}</p>
            </div>
            <Badge className={getStatusColor(vehicle.status || 'active')}>
              {(vehicle.status || 'active').replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Vehicle Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">Make & Model:</span>
                  <p>{vehicle.make} {vehicle.model}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">License Plate:</span>
                  <p>{vehicle.license_plate}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Year:</span>
                  <p>{vehicle.year || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Type:</span>
                  <p>{vehicle.type || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Color:</span>
                  <p>{vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Capacity:</span>
                  <p>{vehicle.capacity ? `${vehicle.capacity} passengers` : 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <p>{(vehicle.status || 'active').replace('_', ' ')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTypes.map(docType => {
              const document = vehicle.documents.find(doc => doc.document_type === docType)
              const isRejecting = rejectingDocId === document?.id
              const isUploading = uploadingDocType === docType

              return (
                <Card key={docType} className={`relative ${
                  document?.expiry_date && new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ? 'border-red-200 bg-red-50'
                    : isUploading ? 'border-blue-200 bg-blue-50' : ''
                }`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{getDocumentTypeLabel(docType)}</span>
                      </div>
                      {document && getDocumentStatusBadge(document)}
                      {isUploading && <Badge variant="secondary" className="text-xs">Uploading</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isUploading ? (
                      // Upload Form
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`file-${docType}`} className="text-sm font-medium">
                            Select Document
                          </Label>
                          <Input
                            id={`file-${docType}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="mt-1"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`issue-${docType}`} className="text-xs">Issue Date</Label>
                            <Input
                              id={`issue-${docType}`}
                              type="date"
                              value={issueDate}
                              onChange={(e) => setIssueDate(e.target.value)}
                              className="text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`expiry-${docType}`} className="text-xs">Expiry Date</Label>
                            <Input
                              id={`expiry-${docType}`}
                              type="date"
                              value={expiryDate}
                              onChange={(e) => setExpiryDate(e.target.value)}
                              className="text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor={`notes-${docType}`} className="text-xs">Notes (Optional)</Label>
                          <Textarea
                            id={`notes-${docType}`}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes..."
                            rows={2}
                            className="text-xs"
                          />
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {isUploading ? 'Uploading...' : (replacingDocId ? 'Replace' : 'Upload')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelUpload}
                            disabled={isUploading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : document ? (
                      // Existing Document Display
                      <div className="space-y-3">
                        {document.issue_date && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Issue Date:</span>
                            <p className="text-sm">{new Date(document.issue_date).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {document.expiry_date && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Expiry Date:</span>
                            <p className={`text-sm font-medium ${
                              new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'text-red-600'
                                : 'text-green-600'
                            }`}>
                              {new Date(document.expiry_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {document.notes && (
                          <div>
                            <span className="text-xs font-medium text-gray-500">Notes:</span>
                            <p className="text-sm">{document.notes}</p>
                          </div>
                        )}

                        <div className="flex flex-col space-y-2">
                          {/* View Document Button */}
                          {document.document_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(document.document_url!, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}

                          {/* Action Buttons Row 1 */}
                          <div className="grid grid-cols-2 gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startReplace(document.id!, docType)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Replace
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(document.id!)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>

                          {/* Action Buttons Row 2 - Verification */}
                          {!isRejecting && (
                            <div className="grid grid-cols-2 gap-1">
                              {document.verified ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnverify(document.id!)}
                                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                  <ShieldOff className="w-3 h-3 mr-1" />
                                  Unverify
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(document.id!)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Verify
                                </Button>
                              )}
                              
                              {!document.verified && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setRejectingDocId(document.id!)}
                                >
                                  <X className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              )}
                            </div>
                          )}

                          {/* Rejection Input */}
                          {isRejecting && (
                            <div className="space-y-2 p-2 border border-red-200 rounded bg-red-50">
                              <Label htmlFor={`rejection-${document.id}`} className="text-xs text-red-800">
                                Rejection Reason
                              </Label>
                              <Textarea
                                id={`rejection-${document.id}`}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={2}
                                className="text-xs"
                              />
                              <div className="flex space-x-1">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleReject(document.id!)}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Confirm Reject
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRejectingDocId(null)
                                    setRejectionReason('')
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Verification Status */}
                          {document.verified && (
                            <div className="flex items-center space-x-2 text-green-600 text-xs bg-green-50 p-2 rounded">
                              <Shield className="w-4 h-4" />
                              <span>Document verified and approved</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // No Document - Upload Option
                      <div className="text-center py-6 space-y-3">
                        <div className="text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No document uploaded</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startUpload(docType)}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Document
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}