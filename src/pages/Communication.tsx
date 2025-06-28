
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Search, Phone, MessageCircle, Send, AlertTriangle, Users } from 'lucide-react'
import { toast } from 'sonner'

export const Communication: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [messageTemplate, setMessageTemplate] = useState('')
  const [customMessage, setCustomMessage] = useState('')

  const contacts = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      type: 'driver',
      status: 'active',
      issues: ['Late arrival complaint']
    },
    {
      id: 2,
      name: 'Priya Sharma',
      phone: '+91-9876543211',
      type: 'customer',
      status: 'active',
      issues: []
    },
    {
      id: 3,
      name: 'Amit Singh',
      phone: '+91-9876543212',
      type: 'driver',
      status: 'suspended',
      issues: ['Multiple cancellations', 'Customer complaint']
    },
    {
      id: 4,
      name: 'Sunita Patel',
      phone: '+91-9876543213',
      type: 'customer',
      status: 'active',
      issues: ['Payment dispute']
    }
  ]

  const messageTemplates = {
    'booking_confirmation': 'Your booking has been confirmed. Driver will arrive shortly.',
    'driver_arriving': 'Your driver is arriving in 2-3 minutes. Please be ready.',
    'complaint_followup': 'We have received your complaint and are investigating the matter.',
    'payment_reminder': 'Please complete your pending payment for the recent ride.',
    'driver_warning': 'This is a warning regarding your recent performance issues.'
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone.includes(searchTerm)
  )

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
    toast.success('Opening phone dialer...')
  }

  const handleWhatsApp = (phone: string, message?: string) => {
    const text = message || 'Hello from Fleet Management Team'
    const url = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    toast.success('Opening WhatsApp...')
  }

  const handleSendMessage = () => {
    const message = messageTemplate ? messageTemplates[messageTemplate as keyof typeof messageTemplates] : customMessage
    if (selectedContact && message) {
      handleWhatsApp(selectedContact.phone, message)
      setShowMessageModal(false)
      setMessageTemplate('')
      setCustomMessage('')
      setSelectedContact(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customer & Driver Communication</h1>
        <p className="text-gray-600">Manage communication with customers and drivers</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              All Contacts ({filteredContacts.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <Card>
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <CardDescription>
            Click on actions to communicate with customers and drivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No contacts found matching your search
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                        <Badge variant={contact.type === 'driver' ? 'default' : 'secondary'}>
                          {contact.type.toUpperCase()}
                        </Badge>
                        {contact.issues.length > 0 && (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Issues
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{contact.phone}</p>
                      {contact.issues.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-700 mb-1">Flagged Issues:</p>
                          <ul className="text-sm text-red-600">
                            {contact.issues.map((issue, index) => (
                              <li key={index} className="ml-4 list-disc">{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCall(contact.phone)}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsApp(contact.phone)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setSelectedContact(contact)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Message
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Send Message</DialogTitle>
                            <DialogDescription>
                              Send a message to {selectedContact?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Message Template</Label>
                              <Select value={messageTemplate} onValueChange={setMessageTemplate}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a template" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="booking_confirmation">Booking Confirmation</SelectItem>
                                  <SelectItem value="driver_arriving">Driver Arriving</SelectItem>
                                  <SelectItem value="complaint_followup">Complaint Follow-up</SelectItem>
                                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                                  <SelectItem value="driver_warning">Driver Warning</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>Custom Message</Label>
                              <Textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Type your custom message here..."
                                rows={3}
                              />
                            </div>
                            
                            {messageTemplate && (
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-900">
                                  <strong>Template Preview:</strong><br />
                                  {messageTemplates[messageTemplate as keyof typeof messageTemplates]}
                                </p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSendMessage}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Message
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
