import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { User, Eye, Check, X, AlertCircle, FileText } from 'lucide-react'
import { Driver } from '@/types/database'

interface DriverDocumentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver: Driver | null
  onApprove: (driverId: string, driverName: string) => void
  onReject: (driverId: string, driverName: string, reason: string) => void
  onRequestResubmission: (driverId: string) => void
}

export const DriverDocumentDetailModal: React.FC<DriverDocumentDetailModalProps> = ({
  open,
  onOpenChange,
  driver,
  onApprove,
  onReject,
  onRequestResubmission
}) => {
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)

  if (!driver) return null

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

  const handleApprove = () => {
    // Clear rejection reason in UI
    driver.rejection_reason = null
    driver.kyc_status = 'approved'

    // Call the parent approve function
    onApprove(driver.id, driver.full_name)

    // Close modal
    onOpenChange(false)
  }

  const handleReject = () => {
    if (!rejectionReason.trim()) return
    onReject(driver.id, driver.full_name, rejectionReason.trim())
    setRejectionReason('')
    setIsRejecting(false)
    onOpenChange(false)
  }

  const handleRequestResubmission = () => {
    onRequestResubmission(driver.id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
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
              <span>{driver.full_name} - Documents</span>
              <p className="text-sm font-normal text-gray-500">{driver.phone_no}</p>
            </div>
            <Badge className={getStatusColor(driver.kyc_status)}>
              {getStatusIcon(driver.kyc_status)}
              <span className="ml-1">
                {(driver.kyc_status || 'pending').replace('_', ' ').toUpperCase()}
              </span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Driver Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Driver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">License Number:</span>
                  <p>{driver.license_number || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Status:</span>
                  <p>{driver.status?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Rating:</span>
                  <p>{driver.rating || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Total Rides:</span>
                  <p>{driver.total_rides || 0}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Joined:</span>
                  <p>{driver.joined_on ? new Date(driver.joined_on).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* License Document */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Driver's License</span>
                  <Badge
                    className={`text-xs ${
                      driver.license_document_url
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driver.license_document_url ? 'Uploaded' : 'Missing'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driver.license_document_url ? (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(driver.license_document_url!, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No document uploaded</p>
                )}
              </CardContent>
            </Card>

            {/* ID Proof Document */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>ID Proof</span>
                  <Badge
                    className={`text-xs ${
                      driver.id_proof_document_url
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {driver.id_proof_document_url ? 'Uploaded' : 'Missing'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {driver.id_proof_document_url ? (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(driver.id_proof_document_url!, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Document
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No document uploaded</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rejection Reason — only if status is rejected */}
          {driver.kyc_status?.toLowerCase() === 'rejected' && driver.rejection_reason && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-base text-red-800">Rejection Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{driver.rejection_reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Rejection Input */}
          {isRejecting && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-base">Reject Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a detailed reason for rejection..."
                    rows={3}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={!rejectionReason.trim()}
                  >
                    Confirm Reject
                  </Button>
                  <Button variant="outline" onClick={() => setIsRejecting(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {(driver.license_document_url || driver.id_proof_document_url) && (
            <div className="flex justify-end space-x-2 pt-4 border-t">
              {driver.kyc_status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsRejecting(true)}
                    disabled={isRejecting}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button onClick={handleApprove}>
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
              {(driver.kyc_status === 'rejected' || driver.kyc_status === 'resubmission_requested') && (
                <Button variant="outline" onClick={handleRequestResubmission}>
                  Request Resubmission
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
