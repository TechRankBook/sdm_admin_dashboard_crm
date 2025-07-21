import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface NotificationTemplate {
  id: string
  name: string
  description?: string
  channel: 'in_app' | 'sms' | 'whatsapp' | 'call' | 'email'
  template_type: string
  subject?: string
  content: string
  variables: any[]
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface NotificationCampaign {
  id: string
  name: string
  description?: string
  template_id?: string
  target_criteria: any
  scheduled_at?: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
  total_recipients: number
  sent_count: number
  delivered_count: number
  failed_count: number
  created_by?: string
  created_at: string
  updated_at: string
  template?: NotificationTemplate
}

export interface Notification {
  id: string
  user_id?: string
  channel?: 'in_app' | 'sms' | 'whatsapp' | 'call' | 'email'
  title?: string
  message?: string
  sent_at?: string
  read: boolean
  created_at: string
  template_id?: string
  campaign_id?: string
  delivery_status: string
  delivery_attempts: number
  delivered_at?: string
  failed_reason?: string
  external_id?: string
  metadata: any
}

export interface NotificationAnalytics {
  total_sent: number
  total_delivered: number
  total_failed: number
  delivery_rate: number
  channel_breakdown: Array<{
    channel: string
    count: number
    delivered: number
    failed: number
  }>
  daily_stats: Array<{
    date: string
    sent: number
    delivered: number
  }>
}

export const useNotifications = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Notification[]
    }
  })

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as NotificationTemplate[]
    }
  })

  // Fetch campaigns
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['notification-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .select(`
          *,
          template:notification_templates(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as NotificationCampaign[]
    }
  })

  // Fetch analytics
  const { data: analytics } = useQuery({
    queryKey: ['notification-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_notification_analytics')
      
      if (error) throw error
      return data?.[0] as NotificationAnalytics
    }
  })

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (template: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert([template])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      toast({
        title: "Success",
        description: "Template created successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<NotificationTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      toast({
        title: "Success",
        description: "Template updated successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] })
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaign: Omit<NotificationCampaign, 'id' | 'created_at' | 'updated_at' | 'sent_count' | 'delivered_count' | 'failed_count'>) => {
      const { data, error } = await supabase
        .from('notification_campaigns')
        .insert([campaign])
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-campaigns'] })
      toast({
        title: "Success",
        description: "Campaign created successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (params: {
      user_id: string
      channel: string
      title: string
      message: string
      template_id?: string
      campaign_id?: string
      metadata?: any
    }) => {
      const { data, error } = await supabase
        .rpc('send_notification', {
          p_user_id: params.user_id,
          p_channel: params.channel,
          p_title: params.title,
          p_message: params.message,
          p_template_id: params.template_id || null,
          p_campaign_id: params.campaign_id || null,
          p_metadata: params.metadata || {}
        })
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast({
        title: "Success",
        description: "Notification sent successfully",
      })
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  })

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  return {
    // Data
    notifications,
    templates,
    campaigns,
    analytics,
    
    // Loading states
    notificationsLoading,
    templatesLoading,
    campaignsLoading,
    
    // Mutations
    createTemplate: createTemplateMutation.mutate,
    updateTemplate: updateTemplateMutation.mutate,
    deleteTemplate: deleteTemplateMutation.mutate,
    createCampaign: createCampaignMutation.mutate,
    sendNotification: sendNotificationMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    
    // Loading states for mutations
    isCreatingTemplate: createTemplateMutation.isPending,
    isUpdatingTemplate: updateTemplateMutation.isPending,
    isDeletingTemplate: deleteTemplateMutation.isPending,
    isCreatingCampaign: createCampaignMutation.isPending,
    isSendingNotification: sendNotificationMutation.isPending,
  }
}