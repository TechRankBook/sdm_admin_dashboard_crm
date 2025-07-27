import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Edit, Eye, Star, Trash2, Phone, MapPin } from 'lucide-react'
import { Driver } from '@/types/database'

interface DriversListViewProps {
  drivers: Driver[]
  getStatusColor: (status: string) => string
  onView: (driver: Driver) => void
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

export const DriversListView: React.FC<DriversListViewProps> = ({
  drivers,
  getStatusColor,
  onView,
  onEdit,
  onDelete
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <p className="text-gray-500">No drivers found matching your criteria</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[250px]">Driver</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[120px]">Rating</TableHead>
            <TableHead className="w-[100px]">Total Rides</TableHead>
            <TableHead className="w-[150px]">License</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver) => (
            <TableRow key={driver.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={driver.profile_picture_url || ''} />
                    <AvatarFallback>
                      {driver.full_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{driver.full_name}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-3 w-3 mr-1" />
                      {driver.phone_no}
                    </div>
                    {driver.email && (
                      <div className="text-xs text-gray-400">{driver.email}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(driver.status || 'active')}>
                  {(driver.status || 'active').replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                {renderStars(Math.floor(driver.rating || 0))}
              </TableCell>
              <TableCell>
                <span className="font-medium">{driver.total_rides || 0}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {driver.license_number || 'N/A'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onView(driver)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(driver)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDelete(driver)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}