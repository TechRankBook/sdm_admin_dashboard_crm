import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'
import type { AdminSetting, SettingUpdate } from '@/types/settings'

export const useSettings = (category: string) => {
  const [settings, setSettings] = useState<AdminSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_settings_by_category', {
        category_name: category
      })

      if (error) throw error
      setSettings(data || [])
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (settingKey: string, value: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase.rpc('update_admin_setting', {
        p_category: category,
        p_setting_key: settingKey,
        p_setting_value: value,
        p_updated_by: user.id
      })

      if (error) throw error

      toast({
        title: 'Setting updated',
        description: 'The setting has been updated successfully.',
      })

      // Refresh settings
      await fetchSettings()
    } catch (err) {
      console.error('Error updating setting:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update setting',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [category])

  return {
    settings,
    loading,
    error,
    updateSetting,
    refetch: fetchSettings
  }
}