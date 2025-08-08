import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Database, Shield, Wifi, HardDrive, User } from 'lucide-react'
import { useDataValidation } from '@/hooks/useDataValidation'

export const SystemHealthDashboard: React.FC = () => {
  const { systemHealth, loading, performSystemHealthCheck, runComprehensiveValidation } = useDataValidation()

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <div className="flex items-center space-x-2">
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        )}
        <Badge variant={status ? "default" : "destructive"}>
          {label}: {status ? "Healthy" : "Issues"}
        </Badge>
      </div>
    )
  }

  const handleHealthCheck = async () => {
    await performSystemHealthCheck()
  }

  const handleDataValidation = async () => {
    await runComprehensiveValidation()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>System Health Dashboard</span>
        </CardTitle>
        <CardDescription>
          Monitor system components and data integrity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Infrastructure Status</span>
            </h4>
            {getStatusBadge(systemHealth.database, "Database")}
            {getStatusBadge(systemHealth.authentication, "Authentication")}
            {getStatusBadge(systemHealth.storage, "Storage")}
            {getStatusBadge(systemHealth.realtime, "Realtime")}
            {getStatusBadge(systemHealth.rls, "Row Level Security")}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Health Actions</span>
            </h4>
            <div className="space-y-2">
              <Button 
                onClick={handleHealthCheck}
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Refresh Health Check
              </Button>
              <Button 
                onClick={handleDataValidation}
                disabled={loading}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Validate Data Integrity
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Running system checks...</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}