
import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Car } from 'lucide-react'
import { toast } from 'sonner'

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days')

  const handleExportCSV = () => {
    toast.success('Data exported to CSV successfully')
  }

  const handleExportPDF = () => {
    toast.success('Report exported to PDF successfully')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
          <p className="text-gray-600">Insights and trends for your fleet operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="1year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹1,24,500</p>
                <p className="text-xs text-green-600">+12% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">1,845</p>
                <p className="text-xs text-green-600">+8% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
                <p className="text-xs text-red-600">-2% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Fare</p>
                <p className="text-2xl font-bold text-gray-900">₹67</p>
                <p className="text-xs text-green-600">+3% from last period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Earnings Trends
            </CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Earnings Chart</p>
                <p className="text-sm text-gray-400">Chart library integration (Recharts/Chart.js)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Volume by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Volume by Type</CardTitle>
            <CardDescription>Distribution of ride types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Booking Types Chart</p>
                <p className="text-sm text-gray-400">Bar chart showing ride type distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Volume Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Volume Over Time</CardTitle>
            <CardDescription>Ride bookings trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Volume Trend Chart</p>
                <p className="text-sm text-gray-400">Line chart showing booking trends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Hours</CardTitle>
            <CardDescription>Bookings by hour of day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Peak Hours Chart</p>
                <p className="text-sm text-gray-400">Bar chart showing hourly booking distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Drivers by Rides</CardTitle>
            <CardDescription>Best performing drivers this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Rajesh Kumar', rides: 156, earnings: '₹10,450' },
                { name: 'Amit Singh', rides: 142, earnings: '₹9,850' },
                { name: 'Suresh Patel', rides: 138, earnings: '₹9,200' },
                { name: 'Vikram Shah', rides: 129, earnings: '₹8,750' },
                { name: 'Ravi Sharma', rides: 125, earnings: '₹8,500' }
              ].map((driver, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-500">{driver.rides} rides</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{driver.earnings}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Service Zones</CardTitle>
            <CardDescription>Most active pickup areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { zone: 'Airport Area', bookings: 245, percentage: '18%' },
                { zone: 'City Center', bookings: 198, percentage: '15%' },
                { zone: 'Railway Station', bookings: 167, percentage: '12%' },
                { zone: 'Shopping Mall', bookings: 143, percentage: '11%' },
                { zone: 'Business District', bookings: 128, percentage: '9%' }
              ].map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{zone.zone}</p>
                    <p className="text-sm text-gray-500">{zone.bookings} bookings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{zone.percentage}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
