import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Upload, Eye, Edit, Check, Trash2 } from 'lucide-react'
import { VehicleDocument } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface VehicleDocumentsTabProps {
  vehicleId: string
  documents: VehicleDocument[]
  onDocumentsUpdated: () => void
}

const documentTypes = [
  { value: 'registration', label: 'Registration Certificate' },
  { value: 'insurance', label: 'Insurance Policy' },
  { value: 'pollution_certificate', label: 'Pollution Certificate' },
  { value: 'fitness_certificate', label: 'Fitness Certificate' }
]

export const VehicleDocumentsTab: React.FC<VehicleDocumentsTabProps> = ({ 
  vehicleId, 
  documents, 
  onDocumentsUpdated 
}) => {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [editingDoc, setEditingDoc] = useState<VehicleDocument | null>(null)

  const getDocumentStatusBadge = (doc: VehicleDocument) => {
    if (!doc.expiry_date) {
      return <Badge variant="secondary">No Expiry</Badge>
    }

    const expiryDate = new Date(doc.expiry_date)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysUntilExpiry < 0) {
      return <Badge variant="destructive">Expired</Badge>
    } else if (daysUntilExpiry <= 30) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expiring Soon</Badge>
    } else if (daysUntilExpiry <= 90) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expires in {daysUntilExpiry} days</Badge>
    } else {
      return <Badge variant="outline" className="border-green-200 text-green-800">Valid</Badge>
    }
  }

  const extractStoragePath = (url?: string | null) => {
    if (!url) return null
    try {
      const u = new URL(url)
      const parts = u.pathname.split('/')
      const idx = parts.findIndex(p => p === 'vehicle-documents')
      if (idx === -1) return null
      return parts.slice(idx + 1).join('/')
    } catch {
      return null
    }
  }

  const resetUploadState = () => {
    setShowUploadModal(false)
    setSelectedFile(null)
    setSelectedType('')
    setIssueDate('')
    setExpiryDate('')
    setNotes('')
    setEditingDoc(null)
  }

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) {
      toast.error('Please select a file and document type')
      return
    }

    setIsUploading(true)

    try {
      // Upload file to storage
      const fileName = `${vehicleId}/${selectedType}-${Date.now()}.${selectedFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('vehicle-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-documents')
        .getPublicUrl(fileName)

      // Check if we're updating a legacy document
      const isLegacyDoc = editingDoc && editingDoc.id && editingDoc.id.startsWith('legacy-')

      if (isLegacyDoc) {
        // Update the vehicles table for legacy documents and also create a new document record
        const updateField = `${selectedType}_document_url`
        const { error: legacyUpdateErr } = await supabase
          .from('vehicles')
          .update({ [updateField]: publicUrl })
          .eq('id', vehicleId)
        if (legacyUpdateErr) throw legacyUpdateErr

        // Also create a new document record in the dedicated table
        const { error: newDocErr } = await supabase
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicleId,
            document_type: selectedType as any,
            document_url: publicUrl,
            issue_date: issueDate || null,
            expiry_date: expiryDate || null,
            notes: notes || null,
            verified: false
          })
        if (newDocErr) throw newDocErr
      } else if (editingDoc && editingDoc.id && !editingDoc.id.startsWith('legacy-')) {
        // Update existing document in the dedicated table
        const { error: updateErr } = await supabase
          .from('vehicle_documents')
          .update({
            document_url: publicUrl,
            issue_date: issueDate || null,
            expiry_date: expiryDate || null,
            notes: notes || null,
          })
          .eq('id', editingDoc.id)
        if (updateErr) throw updateErr
      } else {
        // Create new document record
        const { error: dbError } = await supabase
          .from('vehicle_documents')
          .insert({
            vehicle_id: vehicleId,
            document_type: selectedType as any,
            document_url: publicUrl,
            issue_date: issueDate || null,
            expiry_date: expiryDate || null,
            notes: notes || null,
            verified: false
          })
        if (dbError) throw dbError
      }

      toast.success(editingDoc ? 'Document replaced successfully' : 'Document uploaded successfully')
      resetUploadState()
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error uploading document:', error)
      toast.error('Failed to upload document')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (doc: VehicleDocument) => {
    try {
      // Attempt to delete storage file first (best-effort)
      const path = extractStoragePath(doc.document_url)
      if (path) {
        const { error: rmErr } = await supabase.storage
          .from('vehicle-documents')
          .remove([path])
        if (rmErr) console.warn('Storage delete warning:', rmErr.message)
      }

      const isLegacyDoc = doc.id && doc.id.startsWith('legacy-')

      if (isLegacyDoc) {
        // For legacy documents, clear the URL from the vehicles table
        const updateField = `${doc.document_type}_document_url`
        const { error } = await supabase
          .from('vehicles')
          .update({ [updateField]: null })
          .eq('id', vehicleId)
        if (error) throw error
      } else if (doc.id) {
        // For dedicated table documents, delete the record
        const { error } = await supabase
          .from('vehicle_documents')
          .delete()
          .eq('id', doc.id)
        if (error) throw error
      }

      toast.success('Document deleted')
      onDocumentsUpdated()
    } catch (e) {
      console.error('Delete document error:', e)
      toast.error('Failed to delete document')
    }
  }

  const startReplace = (docType: string, doc?: VehicleDocument | null) => {
    setSelectedType(docType)
    setSelectedFile(null) // Reset file selection
    if (doc) {
      setEditingDoc(doc)
      setIssueDate(doc.issue_date || '')
      setExpiryDate(doc.expiry_date || '')
      setNotes(doc.notes || '')
    } else {
      setEditingDoc(null)
      setIssueDate('')
      setExpiryDate('')
      setNotes('')
    }
    setShowUploadModal(true)
  }

  const toggleVerification = async (doc: VehicleDocument) => {
    if (!doc.id) return // do not toggle for legacy docs
    try {
      const { error } = await supabase
        .from('vehicle_documents')
        .update({ verified: !doc.verified })
        .eq('id', doc.id)

      if (error) throw error

      toast.success(`Document ${doc.verified ? 'unverified' : 'verified'}`)
      onDocumentsUpdated()

    } catch (error) {
      console.error('Error updating verification:', error)
      toast.error('Failed to update verification status')
    }
  }

  const groupedDocuments = documentTypes.map(type => ({
    ...type,
    document: documents.find(doc => doc.document_type === type.value)
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Vehicle Documents</h2>
        <Button onClick={() => { setEditingDoc(null); setSelectedType(''); setShowUploadModal(true) }}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupedDocuments.map(({ value, label, document }) => (
          <Card key={value} className={`relative ${
            document?.expiry_date && new Date(document.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              ? 'border-red-200 bg-red-50'
              : ''
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>{label}</span>
                </div>
                {document && (
                  <div className="flex items-center space-x-2">
                    {document.verified && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {getDocumentStatusBadge(document)}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document ? (
                <>
                  {document.issue_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Issue Date</label>
                      <p>{new Date(document.issue_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {document.expiry_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                      <p className={`font-medium ${
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
                      <label className="text-sm font-medium text-gray-500">Notes</label>
                      <p className="text-sm">{document.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    {document.document_url && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(document.document_url, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startReplace(value, document)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Replace
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(document)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    {!document.id?.startsWith('legacy-') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleVerification(document)}
                      >
                        {document.verified ? 'Unverify' : 'Verify'}
                      </Button>
                    )}
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
            <DialogTitle>
              {editingDoc ? 'Replace Document' : 'Upload Document'}
            </DialogTitle>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue-date">Issue Date</Label>
                <Input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
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
                {isUploading ? 'Uploading...' : (editingDoc ? 'Replace' : 'Upload')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}