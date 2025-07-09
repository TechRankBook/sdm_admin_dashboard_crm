import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import type { AdminSetting } from '@/types/settings'

interface SettingItemProps {
  setting: AdminSetting
  onUpdate: (key: string, value: any) => Promise<void>
}

export const SettingItem: React.FC<SettingItemProps> = ({ setting, onUpdate }) => {
  const [value, setValue] = useState(setting.setting_value)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleChange = (newValue: any) => {
    setValue(newValue)
    setIsDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(setting.setting_key, value)
      setIsDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const renderInput = () => {
    switch (setting.setting_type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={handleChange}
            disabled={saving}
          />
        )
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            disabled={saving}
            className="w-32"
          />
        )
      case 'string':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={saving}
            className="w-64"
          />
        )
      default:
        return (
          <Input
            type="text"
            value={JSON.stringify(value)}
            onChange={(e) => {
              try {
                handleChange(JSON.parse(e.target.value))
              } catch {
                handleChange(e.target.value)
              }
            }}
            disabled={saving}
            className="w-64"
          />
        )
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <Label className="text-sm font-medium">{setting.display_name}</Label>
        {setting.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {setting.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {renderInput()}
        {setting.setting_type !== 'boolean' && isDirty && (
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            variant="outline"
          >
            <Save className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}