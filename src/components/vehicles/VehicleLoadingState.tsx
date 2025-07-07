
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

export const VehicleLoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
