export interface AdminSetting {
  setting_key: string
  setting_value: any
  setting_type: 'boolean' | 'string' | 'number' | 'json'
  display_name: string
  description: string
  is_active: boolean
}

export interface SettingUpdate {
  category: string
  setting_key: string
  setting_value: any
  updated_by: string
}