
-- Create beta_codes table for managing beta access codes
CREATE TABLE public.beta_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  max_uses INTEGER NOT NULL DEFAULT 50,
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beta_codes ENABLE ROW LEVEL SECURITY;

-- Anyone can read active beta codes (needed for validation)
CREATE POLICY "Anyone can view active beta codes"
ON public.beta_codes
FOR SELECT
USING (is_active = true);

-- Only admins can manage beta codes
CREATE POLICY "Admins can manage beta codes"
ON public.beta_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert a default beta code for testing
INSERT INTO public.beta_codes (code, max_uses) VALUES ('LEGACY2025', 100);
INSERT INTO public.beta_codes (code, max_uses) VALUES ('BETAWALK', 50);
