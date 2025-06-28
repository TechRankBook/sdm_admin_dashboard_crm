
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Upload, FileText } from 'lucide-react'
import { useDocuments } from '@/hooks/useDocuments'

interface DocumentUploadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverId: string
  driverName: string
  documentType: 'license' | 'id_proof'
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onOpenChange,
  driverId,
  driverName,
  documentType
}) => {
  const { uploadDocument } = useDocuments()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    try {
      await uploadDocument(file, driverId, documentType)
      setFile(null)
      onOpenChange(false)
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setLoading(false)
    }
  }

  const documentTypeName = documentType === 'license' ? "Driver's License" : 'ID Proof'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload {documentTypeName}</DialogTitle>
          <DialogDescription>
            Upload {documentTypeName.toLowerCase()} for {driverName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="document">Select Document</Label>
            <div className="mt-2">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <FileText className="w-10 h-10 mb-3 text-green-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">{file.name}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, PDF up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    id="document"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
