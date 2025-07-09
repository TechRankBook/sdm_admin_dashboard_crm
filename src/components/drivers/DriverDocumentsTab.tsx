import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { FileText, Upload, Eye, Check, X, AlertCircle } from 'lucide-react'
import { Driver } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface DriverDocumentsTabProps {
  driverId: string
  driver: Driver
  onDocumentsUpdated: () => void
}

const documentTypes = [
  { value: 'license', label: 'Driver License', field: 'license_document_url' },
  { value: 'id_proof', label: 'ID Proof', field: 'id_proof_document_url' }
]

export const DriverDocumentsTab: React.FC<DriverDocumentsTabProps> = ({ 
  driverId, 
  driver,
  onDocumentsUpdated 
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [notes, setNotes] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const getDocumentStatusBadge = (documentUrl: string | null, kycStatus: string) => {
    if (!documentUrl) {
      return <Badge variant="destructive">Not Uploaded</Badge>
    }

    switch (kycStatus) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'resubmission_requested':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Resubmission Required</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Review</Badge>
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      toast.error('Please select a file and document type')
      return
    }

    setIsUploading(true)

    try {
      const fileName = `${driverId}/${selectedType}-${Date.now()}.${selectedFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('drivers-kyc-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('drivers-kyc-documents')
        .getPublicUrl(fileName)

      const fieldName = documentTypes.find(t => t.value === selectedType)?.field
      if (!fieldName) throw new Error('Invalid document type')

      const { error: dbError } = await supabase
        .from('drivers')
        .update({
          [fieldName]: publicUrl,
          kyc_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (dbError) throw dbError

      toast.success('Document uploaded successfully')
      setShowUploadModal(false)
      setSelectedFile(null)
      setSelectedType('')
      setNotes('')
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleApproval = async (approved: boolean) => {
    try {
      const updates: any = {
        kyc_status: approved ? 'approved' : 'rejected',
        updated_at: new Date().toISOString()
      }

      if (!approved && rejectionReason.trim()) {
        updates.rejection_reason = rejectionReason.trim()
      }

      const { error } = await supabase
        .from('drivers')
        .update(updates)
        .eq('id', driverId)

      if (error) throw error

      toast.success(`KYC ${approved ? 'approved' : 'rejected'} successfully`)
      setShowApprovalModal(false)
      setRejectionReason('')
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error updating KYC status:', error)
      toast.error('Failed to update KYC status')
    }
  }

  const handleRequestResubmission = async () => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          kyc_status: 'resubmission_requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId)

      if (error) throw error

      toast.success('Resubmission requested successfully')
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error requesting resubmission:', error)
      toast.error('Failed to request resubmission')
    }
  }

  const groupedDocuments = documentTypes.map(type => ({
    ...type,
    documentUrl: driver[type.field as keyof Driver] as string | null
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Driver Documents & KYC</h2>
        <div className="flex space-x-2">
          {driver.kyc_status === 'pending' && (
            <Button onClick={() => setShowApprovalModal(true)}>
              <Check className="w-4 h-4 mr-2" />
              Review KYC
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowUploadModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* KYC Status Card */}
      <Card className={`${
        driver.kyc_status === 'rejected' ? 'border-red-200 bg-red-50' :
        driver.kyc_status === 'approved' ? 'border-green-200 bg-green-50' :
        'border-yellow-200 bg-yellow-50'
      }`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>KYC Verification Status</span>
            <Badge className={
              driver.kyc_status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
              driver.kyc_status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
              driver.kyc_status === 'resubmission_requested' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              'bg-yellow-100 text-yellow-800 border-yellow-200'
            }>
              {(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {driver.rejection_reason && (
            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                <strong>Rejection Reason:</strong> {driver.rejection_reason}
              </p>
            </div>
          )}
          {driver.kyc_status === 'pending' && (
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleApproval(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve KYC
              </Button>
              <Button 
                variant="destructive"
                onClick={() => setShowApprovalModal(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Reject KYC
              </Button>
              <Button 
                variant="outline"
                onClick={handleRequestResubmission}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Resubmission
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupedDocuments.map(({ value, label, documentUrl }) => (
          <Card key={value}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                {getDocumentStatusBadge(documentUrl, driver.kyc_status || 'pending')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentUrl ? (
                <>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(documentUrl, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Document
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedType(value)
                        setShowUploadModal(true)
                      }}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Replace
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No document uploaded</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => {
                      setSelectedType(value)
                      setShowUploadModal(true)
                    }}
                  >
                    Upload {label}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document-file">Document File</Label>
              <Input
                id="document-file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about the document"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject KYC Documents</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleApproval(false)}
                disabled={!rejectionReason.trim()}
              >
                Reject KYC
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}