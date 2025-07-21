-- Add email to notification channels
ALTER TYPE notification_channel_enum ADD VALUE 'email';

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  channel notification_channel_enum NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'standard', -- 'standard', 'marketing', 'transactional'
  subject TEXT, -- For email/SMS
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Template variables like {{user_name}}, {{booking_id}}
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification campaigns table for bulk messaging
CREATE TABLE public.notification_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.notification_templates(id),
  target_criteria JSONB NOT NULL, -- JSON criteria for user targeting
  scheduled_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance notifications table for better tracking
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.notification_templates(id);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.notification_campaigns(id);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending'; -- 'pending', 'sent', 'delivered', 'failed', 'read'
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER DEFAULT 0;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS failed_reason TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS external_id TEXT; -- For tracking with external services
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create delivery logs table for detailed tracking
CREATE TABLE public.notification_delivery_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'
  provider TEXT, -- 'whatsapp', 'sms_provider', 'email_provider'
  provider_response JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can manage notification templates" ON public.notification_templates
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

CREATE POLICY "Admin can manage notification campaigns" ON public.notification_campaigns
  FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

CREATE POLICY "Admin can view delivery logs" ON public.notification_delivery_logs
  FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::user_role_enum);

CREATE POLICY "System can insert delivery logs" ON public.notification_delivery_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_channel ON public.notifications(channel);
CREATE INDEX idx_notifications_delivery_status ON public.notifications(delivery_status);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_templates_channel ON public.notification_templates(channel);
CREATE INDEX idx_notification_campaigns_status ON public.notification_campaigns(status);
CREATE INDEX idx_delivery_logs_notification_id ON public.notification_delivery_logs(notification_id);

-- Create updated_at trigger for templates
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON public.notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for campaigns
CREATE TRIGGER update_notification_campaigns_updated_at
  BEFORE UPDATE ON public.notification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to send notification
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_channel notification_channel_enum,
  p_title TEXT,
  p_message TEXT,
  p_template_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    channel,
    title,
    message,
    template_id,
    campaign_id,
    delivery_status,
    metadata
  ) VALUES (
    p_user_id,
    p_channel,
    p_title,
    p_message,
    p_template_id,
    p_campaign_id,
    'pending',
    p_metadata
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Function to get notification analytics
CREATE OR REPLACE FUNCTION public.get_notification_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
  end_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  delivery_rate NUMERIC,
  channel_breakdown JSONB,
  daily_stats JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending') as total_sent,
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'delivered') as total_delivered,
    (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'failed') as total_failed,
    (
      CASE 
        WHEN (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending') > 0
        THEN (SELECT COUNT(*)::numeric FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status = 'delivered') * 100.0 / 
             (SELECT COUNT(*) FROM public.notifications WHERE created_at BETWEEN start_date AND end_date AND delivery_status != 'pending')
        ELSE 0
      END
    ) as delivery_rate,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'channel', channel,
          'count', count(*),
          'delivered', SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END),
          'failed', SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END)
        )
      )
      FROM public.notifications 
      WHERE created_at BETWEEN start_date AND end_date 
      GROUP BY channel
    ) as channel_breakdown,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'date', date,
          'sent', sent_count,
          'delivered', delivered_count
        ) ORDER BY date
      )
      FROM (
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as sent_count,
          SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count
        FROM public.notifications
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      ) daily
    ) as daily_stats;
END;
$$;