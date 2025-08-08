import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  Wallet,
  RefreshCw
} from 'lucide-react'
import { Booking } from '@/types/database'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'paid' | 'failed' | 'completed'
  transaction_id?: string
  currency?: string
  created_at: string
  gateway_response?: any
  razorpay_payment_id?: string
}

interface BookingPaymentInfoProps {
  booking: Booking
  onUpdate: (bookingId: string) => void
}

export const BookingPaymentInfo: React.FC<BookingPaymentInfoProps> = ({ booking, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [paymentStats, setPaymentStats] = useState({
    paidAmount: 0,
    remainingAmount: 0,
    paymentProgress: 0
  })

  useEffect(() => {
    fetchPayments()
  }, [booking.id])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', booking.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const fetchedPayments = data || []
      setPayments(fetchedPayments)
      calculatePaymentStats(fetchedPayments)
    } catch (error: any) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payment details')
    } finally {
      setLoading(false)
    }
  }

  const calculatePaymentStats = (paymentList: Payment[]) => {
    const paidAmount = paymentList
      .filter(payment => ['paid', 'completed'].includes(payment.status))
      .reduce((sum, payment) => sum + payment.amount, 0)
    
    const remainingAmount = Math.max(0, booking.fare_amount - paidAmount)
    const paymentProgress = booking.fare_amount > 0 ? (paidAmount / booking.fare_amount) * 100 : 0

    setPaymentStats({
      paidAmount,
      remainingAmount,
      paymentProgress: Math.min(100, paymentProgress)
    })
  }

  const handleMarkAsPaid = async () => {
    if (paymentStats.remainingAmount <= 0) {
      toast.error('No remaining amount to mark as paid')
      return
    }

    try {
      setLoading(true)
      
      // Create a manual payment record
      const { error } = await supabase
        .from('payments')
        .insert([{
          booking_id: booking.id,
          user_id: booking.user_id,
          amount: paymentStats.remainingAmount,
          status: 'paid',
          transaction_id: `MANUAL_${Date.now()}`,
          currency: 'INR'
        }])

      if (error) throw error

      // Update booking payment status
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking.id)

      if (bookingError) throw bookingError

      toast.success('Payment marked as paid successfully')
      fetchPayments()
      onUpdate(booking.id)
    } catch (error: any) {
      console.error('Error marking payment as paid:', error)
      toast.error('Failed to mark payment as paid')
    } finally {
      setLoading(false)
    }
  }

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
      {/* Enhanced Payment Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Payment Overview</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPayments}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Payment Progress</span>
              <span className="text-sm text-gray-500">
                {paymentStats.paymentProgress.toFixed(1)}% Complete
              </span>
            </div>
            <Progress 
              value={paymentStats.paymentProgress} 
              className="h-3"
            />
          </div>

          <Separator />

          {/* Payment Amount Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Fare</p>
                    <p className="text-2xl font-bold text-blue-600">₹{booking.fare_amount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">₹{paymentStats.paidAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${paymentStats.remainingAmount > 0 ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${paymentStats.remainingAmount > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <TrendingDown className={`w-5 h-5 ${paymentStats.remainingAmount > 0 ? 'text-orange-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${paymentStats.remainingAmount > 0 ? 'text-orange-800' : 'text-gray-800'}`}>
                      Remaining
                    </p>
                    <p className={`text-2xl font-bold ${paymentStats.remainingAmount > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                      ₹{paymentStats.remainingAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Payment Status & Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Payment Status</label>
              <div className="flex items-center space-x-2">
                {getPaymentStatusIcon(booking.payment_status || 'pending')}
                <Badge className={getPaymentStatusColor(booking.payment_status || 'pending')}>
                  {(booking.payment_status || 'pending').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">Payment Method</label>
              <p className="capitalize font-medium">{booking.payment_method || 'Not specified'}</p>
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
      {payments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5" />
                <span>Payment Transactions</span>
              </div>
              <Badge variant="outline">
                {payments.length} Transaction{payments.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getPaymentStatusIcon(payment.status)}
                        <div>
                          <Badge className={getPaymentStatusColor(payment.status)}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{payment.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{payment.currency || 'INR'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="text-gray-500">Transaction ID</label>
                        <p className="font-mono text-gray-900 break-all">
                          {payment.transaction_id || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-500">Payment Date</label>
                        <p className="text-gray-900">
                          {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>

                    {payment.razorpay_payment_id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <label className="text-xs text-gray-500">Razorpay Payment ID</label>
                        <p className="font-mono text-sm text-gray-900">{payment.razorpay_payment_id}</p>
                      </div>
                    )}

                    {payment.gateway_response && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Gateway Response
                        </label>
                        <pre className="text-xs text-gray-600 overflow-x-auto bg-white p-2 rounded border">
                          {JSON.stringify(payment.gateway_response, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-lg mb-2 text-gray-900">No Payment Records</h3>
            <p className="text-gray-500">
              No payment transactions have been recorded for this booking yet.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Payment Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStats.remainingAmount > 0 ? (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-orange-800">Payment Pending</h4>
                  <p className="text-sm text-orange-600">
                    ₹{paymentStats.remainingAmount.toFixed(2)} remaining to be paid
                  </p>
                </div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleMarkAsPaid}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark as Paid</span>
                    </div>
                  )}
                </Button>
                
                {booking.payment_status === 'failed' && (
                  <Button 
                    variant="outline"
                    disabled={loading}
                    onClick={() => {
                      toast.info('Payment retry functionality not yet implemented')
                    }}
                  >
                    Retry Payment
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium text-green-800">Payment Complete</h4>
                  <p className="text-sm text-green-600">
                    All payments have been received for this booking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {(booking.status === 'cancelled' || booking.status === 'completed') && paymentStats.paidAmount > 0 && (
            <div className="pt-4 border-t">
              <Button 
                variant="outline"
                disabled={loading}
                onClick={() => {
                  toast.info('Refund functionality not yet implemented')
                }}
                className="w-full"
              >
                Initiate Refund (₹{paymentStats.paidAmount.toFixed(2)})
              </Button>
            </div>
          )}
          
          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 text-center">
              Payment processing and gateway integration in development. 
              Currently showing manual payment management.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}