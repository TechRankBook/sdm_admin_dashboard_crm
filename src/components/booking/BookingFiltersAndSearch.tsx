import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Search, Filter, X, Calendar } from 'lucide-react'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export interface BookingFilters {
  search: string
  status: string
  serviceType: string
  timeRange: string
  assignmentStatus: string
  customDateRange?: DateRange
}

interface BookingFiltersAndSearchProps {
  filters: BookingFilters
  onFiltersChange: (filters: BookingFilters) => void
  serviceTypes: Array<{ id: string; name: string; display_name: string }>
  resultsCount: number
}

export const BookingFiltersAndSearch: React.FC<BookingFiltersAndSearchProps> = ({
  filters,
  onFiltersChange,
  serviceTypes,
  resultsCount
}) => {
  const handleFilterChange = (key: keyof BookingFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? '' : value
    })
  }

  const clearFilter = (key: keyof BookingFilters) => {
    onFiltersChange({
      ...filters,
      [key]: ''
    })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: '',
      serviceType: '',
      timeRange: '',
      assignmentStatus: ''
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by Booking ID, Customer/Driver Name, Vehicle Plate, Location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Status Filter */}
          <Select value={filters.status || undefined} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="started">Started/Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no_driver">No Driver</SelectItem>
            </SelectContent>
          </Select>

          {/* Service Type Filter */}
          <Select value={filters.serviceType || undefined} onValueChange={(value) => handleFilterChange('serviceType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {serviceTypes.map((service) => (
                <SelectItem key={service.id} value={service.name}>
                  {service.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Time Range Filter */}
          <Select value={filters.timeRange || undefined} onValueChange={(value) => handleFilterChange('timeRange', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past_7_days">Past 7 Days</SelectItem>
              <SelectItem value="past_30_days">Past 30 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {/* Assignment Status Filter */}
          <Select value={filters.assignmentStatus || undefined} onValueChange={(value) => handleFilterChange('assignmentStatus', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              <SelectItem value="assigned">Fully Assigned</SelectItem>
              <SelectItem value="partial">Partially Assigned</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            disabled={activeFiltersCount === 0}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            
            {filters.search && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Search: "{filters.search}"</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('search')}
                />
              </Badge>
            )}
            
            {filters.status && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Status: {filters.status}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('status')}
                />
              </Badge>
            )}
            
            {filters.serviceType && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Service: {serviceTypes.find(s => s.name === filters.serviceType)?.display_name}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('serviceType')}
                />
              </Badge>
            )}
            
            {filters.timeRange && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Time: {filters.timeRange.replace('_', ' ')}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('timeRange')}
                />
              </Badge>
            )}
            
            {filters.assignmentStatus && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <span>Assignment: {filters.assignmentStatus}</span>
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => clearFilter('assignmentStatus')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{resultsCount} booking{resultsCount !== 1 ? 's' : ''} found</span>
          {activeFiltersCount > 0 && (
            <span>{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}