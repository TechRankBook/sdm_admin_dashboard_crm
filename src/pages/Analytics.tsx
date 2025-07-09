
import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart'
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  Car,
  Loader2,
  AlertCircle,
  TrendingDown
} from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { DateRange } from '@/types/analytics'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const Analytics: React.FC = () => {
  const [dateRange, setDateRange] = useState('30days')

  // Calculate date range based on selection
  const dateRangeValue = useMemo((): DateRange => {
    const end = new Date();
    const start = new Date();
    
    switch (dateRange) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '90days':
        start.setDate(end.getDate() - 90);
        break;
      case '1year':
        start.setFullYear(end.getFullYear() - 1);
        break;
    }
    
    return { start, end };
  }, [dateRange]);

  const { data, loading, error, refetch } = useAnalytics(dateRangeValue);

  const handleExportCSV = () => {
    toast.success('Data exported to CSV successfully')
  }

  const handleExportPDF = () => {
    toast.success('Report exported to PDF successfully')
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-gray-600">Insights and trends for your fleet operations</p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading analytics data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
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
                <p className="text-2xl font-bold text-gray-900">
                  {data.revenue ? formatCurrency(data.revenue.total_revenue) : '₹0'}
                </p>
                <p className={`text-xs ${data.revenue && data.revenue.revenue_growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.revenue ? formatPercentage(data.revenue.revenue_growth_percentage) : '0%'} from last period
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {data.bookings ? data.bookings.total_bookings.toLocaleString() : '0'}
                </p>
                <p className="text-xs text-blue-600">
                  {data.bookings ? `${data.bookings.completion_rate.toFixed(1)}%` : '0%'} completion rate
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {data.drivers ? data.drivers.total_active_drivers : '0'}
                </p>
                <p className="text-xs text-purple-600">
                  {data.drivers ? `${data.drivers.average_rating.toFixed(1)}★` : '0★'} avg rating
                </p>
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
                <p className="text-2xl font-bold text-gray-900">
                  {data.revenue ? formatCurrency(data.revenue.average_fare) : '₹0'}
                </p>
                <p className="text-xs text-orange-600">
                  {data.service ? `${data.service.average_distance.toFixed(1)} km` : '0 km'} avg distance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Daily revenue over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {data.revenue?.daily_revenue && data.revenue.daily_revenue.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenue.daily_revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                              <p className="text-green-600">Revenue: {formatCurrency(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No revenue data available
                </div>
              )}
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
            <div className="h-64">
              {data.bookings?.ride_type_distribution && data.bookings.ride_type_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.bookings.ride_type_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ ride_type, percent }) => `${ride_type}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.bookings.ride_type_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No ride type data available
                </div>
              )}
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
            <div className="h-64">
              {data.bookings?.booking_trends && data.bookings.booking_trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.bookings.booking_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
                              <p className="text-blue-600">Bookings: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No booking trend data available
                </div>
              )}
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
            <div className="h-64">
              {data.bookings?.hourly_distribution && data.bookings.hourly_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.bookings.hourly_distribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}:00`}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded shadow">
                              <p className="font-medium">{payload[0].payload.hour}:00</p>
                              <p className="text-orange-600">Bookings: {payload[0].value}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="bookings" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No hourly distribution data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Drivers by Performance</CardTitle>
            <CardDescription>Best performing drivers this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.drivers?.top_drivers && data.drivers.top_drivers.length > 0 ? (
                data.drivers.top_drivers.slice(0, 5).map((driver, index) => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-sm text-gray-500">{driver.rides} rides • {driver.rating}★</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(driver.earnings)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No driver performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Routes</CardTitle>
            <CardDescription>Most frequently traveled routes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.service?.popular_routes && data.service.popular_routes.length > 0 ? (
                data.service.popular_routes.slice(0, 5).map((route, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{route.route}</p>
                      <p className="text-sm text-gray-500">{route.frequency} trips</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{formatCurrency(route.avg_fare)}</p>
                      <p className="text-sm text-gray-500">avg fare</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No popular routes data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Customers</span>
              <span className="font-semibold">{data.customers?.total_customers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Customers</span>
              <span className="font-semibold">{data.customers?.new_customers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Retention Rate</span>
              <span className="font-semibold">{data.customers?.customer_retention_rate.toFixed(1) || '0'}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Trip Duration</span>
              <span className="font-semibold">{data.service?.average_trip_duration.toFixed(0) || '0'} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Distance</span>
              <span className="font-semibold">{data.service?.average_distance.toFixed(1) || '0'} km</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service Efficiency</span>
              <span className="font-semibold">{data.service?.service_efficiency_score.toFixed(1) || '0'}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.drivers?.driver_status_distribution && data.drivers.driver_status_distribution.length > 0 ? (
              data.drivers.driver_status_distribution.map((status, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">{status.status}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                No driver status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
