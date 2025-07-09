import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, DollarSign, Receipt, CheckCircle, AlertCircle } from 'lucide-react'
import { Booking } from '@/types/database'
import { format } from 'date-fns'

interface BookingPaymentInfoProps {
  booking: Booking
  onUpdate: (bookingId: string) => void
}

export const BookingPaymentInfo: React.FC<BookingPaymentInfoProps> = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState(false)

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <CreditCard className="w-4 h-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Payment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Fare Amount</label>
              <p className="text-2xl font-bold text-green-600">₹{booking.fare_amount}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Status</label>
              <div className="flex items-center space-x-2 mt-1">
                {getPaymentStatusIcon(booking.payment_status || 'pending')}
                <Badge className={getPaymentStatusColor(booking.payment_status || 'pending')}>
                  {(booking.payment_status || 'pending').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Method</label>
              <p className="capitalize">{booking.payment_method || 'Not specified'}</p>
            </div>
          </div>

          {/* Extra Charges */}
          {(booking.extra_km_used > 0 || booking.extra_hours_used > 0 || booking.waiting_time_minutes > 0 || booking.upgrade_charges > 0) && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Additional Charges</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {booking.extra_km_used > 0 && (
                  <div>
                    <label className="text-gray-500">Extra KM</label>
                    <p>{booking.extra_km_used} km</p>
                  </div>
                )}
                {booking.extra_hours_used > 0 && (
                  <div>
                    <label className="text-gray-500">Extra Hours</label>
                    <p>{booking.extra_hours_used} hrs</p>
                  </div>
                )}
                {booking.waiting_time_minutes > 0 && (
                  <div>
                    <label className="text-gray-500">Waiting Time</label>
                    <p>{booking.waiting_time_minutes} min</p>
                  </div>
                )}
                {booking.upgrade_charges > 0 && (
                  <div>
                    <label className="text-gray-500">Upgrade Charges</label>
                    <p>₹{booking.upgrade_charges}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Records */}
      {booking.payments && booking.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="w-5 h-5" />
              <span>Payment Records</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {booking.payments.map((payment: any) => (
                <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getPaymentStatusIcon(payment.status)}
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="font-semibold">₹{payment.amount}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Transaction ID</label>
                      <p className="font-mono">{payment.transaction_id || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Currency</label>
                      <p>{payment.currency || 'INR'}</p>
                    </div>
                    <div>
                      <label className="text-gray-500">Created</label>
                      <p>{format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}</p>
                    </div>
                  </div>

                  {payment.gateway_response && (
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <label className="text-xs text-gray-500">Gateway Response</label>
                      <pre className="text-xs mt-1 overflow-x-auto">
                        {JSON.stringify(payment.gateway_response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Actions */}
      {booking.payment_status !== 'paid' && booking.payment_status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline"
                disabled={loading}
                onClick={() => {
                  // TODO: Implement mark as paid functionality
                  console.log('Mark as paid')
                }}
              >
                Mark as Paid
              </Button>
              
              {booking.payment_status === 'failed' && (
                <Button 
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    // TODO: Implement retry payment functionality
                    console.log('Retry payment')
                  }}
                >
                  Retry Payment
                </Button>
              )}
              
              {(booking.status === 'cancelled' || booking.status === 'completed') && (
                <Button 
                  variant="outline"
                  disabled={loading}
                  onClick={() => {
                    // TODO: Implement refund functionality
                    console.log('Initiate refund')
                  }}
                >
                  Initiate Refund
                </Button>
              )}
            </div>
            
            <p className="text-sm text-gray-500">
              Payment gateway integration required for automated payment processing.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}