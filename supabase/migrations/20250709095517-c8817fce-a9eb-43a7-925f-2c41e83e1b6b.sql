-- Create communication threads table
CREATE TABLE public.communication_threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_type TEXT NOT NULL CHECK (thread_type IN ('chat', 'support', 'booking')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT,
  booking_id UUID REFERENCES public.bookings(id),
  customer_id UUID REFERENCES public.customers(id),
  driver_id UUID REFERENCES public.drivers(id),
  assigned_admin_id UUID REFERENCES public.admins(id),
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.communication_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('admin', 'customer', 'driver')),
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  read_by JSONB DEFAULT '[]',
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message attachments table
CREATE TABLE public.message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.communication_threads(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'driver_issue', 'customer_complaint', 'general')),
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  sla_due_date TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user activities table for timeline
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  activity_type TEXT NOT NULL CHECK (activity_type IN ('booking_created', 'booking_cancelled', 'driver_assigned', 'payment_completed', 'message_sent', 'ticket_created', 'admin_action')),
  description TEXT NOT NULL,
  metadata JSONB,
  booking_id UUID REFERENCES public.bookings(id),
  thread_id UUID REFERENCES public.communication_threads(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_communication_threads_customer_id ON public.communication_threads(customer_id);
CREATE INDEX idx_communication_threads_driver_id ON public.communication_threads(driver_id);
CREATE INDEX idx_communication_threads_booking_id ON public.communication_threads(booking_id);
CREATE INDEX idx_communication_threads_status ON public.communication_threads(status);
CREATE INDEX idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON public.user_activities(created_at);

-- Enable RLS
ALTER TABLE public.communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communication_threads
CREATE POLICY "Admins can manage all threads" ON public.communication_threads
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own threads" ON public.communication_threads
  FOR SELECT USING (
    auth.uid() = customer_id OR 
    auth.uid() = driver_id OR 
    auth.uid() = created_by OR
    get_user_role(auth.uid()) = 'admin'
  );

-- RLS Policies for messages
CREATE POLICY "Admins can manage all messages" ON public.messages
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view messages in their threads" ON public.messages
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM public.communication_threads 
      WHERE customer_id = auth.uid() OR driver_id = auth.uid() OR created_by = auth.uid()
    ) OR get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can create messages in their threads" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    (thread_id IN (
      SELECT id FROM public.communication_threads 
      WHERE customer_id = auth.uid() OR driver_id = auth.uid() OR created_by = auth.uid()
    ) OR get_user_role(auth.uid()) = 'admin')
  );

-- RLS Policies for message_attachments
CREATE POLICY "Users can view attachments in their messages" ON public.message_attachments
  FOR SELECT USING (
    message_id IN (
      SELECT m.id FROM public.messages m
      JOIN public.communication_threads t ON m.thread_id = t.id
      WHERE t.customer_id = auth.uid() OR t.driver_id = auth.uid() OR t.created_by = auth.uid()
    ) OR get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can manage all attachments" ON public.message_attachments
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- RLS Policies for support_tickets
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view tickets in their threads" ON public.support_tickets
  FOR SELECT USING (
    thread_id IN (
      SELECT id FROM public.communication_threads 
      WHERE customer_id = auth.uid() OR driver_id = auth.uid() OR created_by = auth.uid()
    ) OR get_user_role(auth.uid()) = 'admin'
  );

-- RLS Policies for user_activities
CREATE POLICY "Admins can manage all activities" ON public.user_activities
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own activities" ON public.user_activities
  FOR SELECT USING (auth.uid() = user_id OR get_user_role(auth.uid()) = 'admin');

-- Add triggers for updated_at
CREATE TRIGGER update_communication_threads_updated_at
  BEFORE UPDATE ON public.communication_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_num TEXT;
  counter INTEGER;
BEGIN
  -- Get the count of tickets created today
  SELECT COUNT(*) + 1 INTO counter
  FROM public.support_tickets
  WHERE DATE(created_at) = CURRENT_DATE;
  
  -- Generate ticket number: YYYY-MM-DD-XXX
  ticket_num := TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') || '-' || LPAD(counter::TEXT, 3, '0');
  
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION public.set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := public.generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_support_ticket_number
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_ticket_number();

-- Function to update thread last_message_at
CREATE OR REPLACE FUNCTION public.update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.communication_threads 
  SET last_message_at = NEW.created_at
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_last_message();