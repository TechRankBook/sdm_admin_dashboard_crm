import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { SettingItem } from './SettingItem'
import { useSettings } from '@/hooks/useSettings'

interface SettingsCategoryProps {
  category: string
}

export const SettingsCategory: React.FC<SettingsCategoryProps> = ({ category }) => {
  const { settings, loading, error, updateSetting } = useSettings(category)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Skeleton className="h-4 w-48 mb-2" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading settings: {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (settings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No settings available for this category
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {settings.map((setting) => (
        <SettingItem
          key={setting.setting_key}
          setting={setting}
          onUpdate={updateSetting}
        />
      ))}
    </div>
  )
}