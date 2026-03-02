
CREATE TABLE public.walk_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  miles NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.walk_reminders ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert a reminder
CREATE POLICY "Anyone can insert walk reminders"
  ON public.walk_reminders
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all reminders
CREATE POLICY "Admins can view walk reminders"
  ON public.walk_reminders
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));
