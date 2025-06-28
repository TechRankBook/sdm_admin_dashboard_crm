import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Eye, Check, X, AlertCircle, User, Car } from 'lucide-react'
import { toast } from 'sonner'

export const Documents: React.FC = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  const driverDocuments = [
    {
      id: 1,
      driverName: 'Rajesh Kumar',
      phone: '+91-9876543210',
      status: 'pending',
      documents: {
        license: { uploaded: true, url: '#', status: 'pending' },
        idProof: { uploaded: true, url: '#', status: 'pending' },
        profile: { uploaded: false, url: null, status: 'missing' }
      },
      submittedAt: '2024-01-15'
    },
    {
      id: 2,
      driverName: 'Amit Singh',
      phone: '+91-9876543211',
      status: 'approved',
      documents: {
        license: { uploaded: true, url: '#', status: 'approved' },
        idProof: { uploaded: true, url: '#', status: 'approved' },
        profile: { uploaded: true, url: '#', status: 'approved' }
      },
      submittedAt: '2024-01-10'
    },
    {
      id: 3,
      driverName: 'Suresh Patel',
      phone: '+91-9876543212',
      status: 'rejected',
      documents: {
        license: { uploaded: true, url: '#', status: 'rejected' },
        idProof: { uploaded: true, url: '#', status: 'approved' },
        profile: { uploaded: false, url: null, status: 'missing' }
      },
      submittedAt: '2024-01-12',
      rejectionReason: 'License document is unclear and expired'
    }
  ]

  const vehicleDocuments = [
    {
      id: 1,
      vehicleName: 'Toyota Camry - ABC-123',
      make: 'Toyota',
      model: 'Camry',
      licensePlate: 'ABC-123',
      status: 'pending',
      documents: {
        insurance: { uploaded: true, url: '#', status: 'pending' },
        registration: { uploaded: true, url: '#', status: 'approved' },
        pollution: { uploaded: false, url: null, status: 'missing' }
      },
      submittedAt: '2024-01-14'
    },
    {
      id: 2,
      vehicleName: 'Honda City - XYZ-456',
      make: 'Honda',
      model: 'City',
      licensePlate: 'XYZ-456',
      status: 'approved',
      documents: {
        insurance: { uploaded: true, url: '#', status: 'approved' },
        registration: { uploaded: true, url: '#', status: 'approved' },
        pollution: { uploaded: true, url: '#', status: 'approved' }
      },
      submittedAt: '2024-01-08'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'missing':
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleApprove = (type: string, itemId: number, docType?: string) => {
    toast.success(`${type} document${docType ? ` (${docType})` : ''} approved successfully`)
  }

  const handleReject = () => {
    if (rejectionReason.trim()) {
      toast.success('Document rejected with reason')
      setShowRejectModal(false)
      setRejectionReason('')
      setSelectedDocument(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC & Document Management</h1>
        <p className="text-gray-600">Review and approve driver and vehicle documents</p>
      </div>

      <Tabs defaultValue="drivers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="drivers" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Driver Documents
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            Vehicle Documents
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
                {driverDocuments.map((driver) => (
                  <div key={driver.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{driver.driverName}</h3>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                        <p className="text-xs text-gray-400">Submitted: {driver.submittedAt}</p>
                      </div>
                      <Badge className={getStatusColor(driver.status)}>
                        {getStatusIcon(driver.status)}
                        <span className="ml-1">{driver.status.toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {Object.entries(driver.documents).map(([docType, doc]) => (
                        <div key={docType} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm capitalize">
                              {docType === 'idProof' ? 'ID Proof' : docType}
                            </p>
                            <Badge className={`${getStatusColor(doc.status)} text-xs px-2 py-1`}>
                              {doc.status}
                            </Badge>
                          </div>
                          {doc.uploaded ? (
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              {doc.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove('Driver', driver.id, docType)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                      setSelectedDocument({ type: 'driver', id: driver.id, docType })
                                      setShowRejectModal(true)
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Not uploaded</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {driver.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {driver.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Document Review</CardTitle>
              <CardDescription>
                Review and approve vehicle registration and insurance documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {vehicleDocuments.map((vehicle) => (
                  <div key={vehicle.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.vehicleName}</h3>
                        <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</p>
                        <p className="text-xs text-gray-400">Submitted: {vehicle.submittedAt}</p>
                      </div>
                      <Badge className={getStatusColor(vehicle.status)}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1">{vehicle.status.toUpperCase()}</span>
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(vehicle.documents).map(([docType, doc]) => (
                        <div key={docType} className="border border-gray-100 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm capitalize">{docType}</p>
                            <Badge className={`${getStatusColor(doc.status)} text-xs px-2 py-1`}>
                              {doc.status}
                            </Badge>
                          </div>
                          {doc.uploaded ? (
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              {doc.status === 'pending' && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove('Vehicle', vehicle.id, docType)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={() => {
                                      setSelectedDocument({ type: 'vehicle', id: vehicle.id, docType })
                                      setShowRejectModal(true)
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Not uploaded</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
    </div>
  )
}
