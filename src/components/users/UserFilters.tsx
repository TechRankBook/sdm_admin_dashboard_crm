import React, { useState } from 'react'
import { UserFilter } from '@/types/user-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Filter, Search, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface UserFiltersProps {
  filters: UserFilter
  onFiltersChange: (filters: UserFilter) => void
  onApply: () => void
  onClear: () => void
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onApply,
  onClear
}) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.dateRange?.from,
    to: filters.dateRange?.to
  })

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    if (range.from && range.to) {
      onFiltersChange({
        ...filters,
        dateRange: { from: range.from, to: range.to }
      })
    }
  }

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined })
    const { dateRange, ...restFilters } = filters
    onFiltersChange(restFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.role) count++
    if (filters.status) count++
    if (filters.dateRange) count++
    if (filters.search) count++
    return count
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Name, email, phone..."
                value={filters.search || ''}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select 
              value={filters.role || 'all'} 
              onValueChange={(value) => onFiltersChange({ 
                ...filters, 
                role: value === 'all' ? undefined : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select 
              value={filters.status || 'all'} 
              onValueChange={(value) => onFiltersChange({ 
                ...filters, 
                status: value === 'all' ? undefined : value 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Registration Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Select Date Range</span>
                    {dateRange.from && (
                      <Button variant="ghost" size="sm" onClick={clearDateRange}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
          </div>
          <Button onClick={onApply}>
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}