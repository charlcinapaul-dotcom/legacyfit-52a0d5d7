
-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Service role / edge functions can insert (via service key)
CREATE POLICY "Service can insert certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (true);

-- Admins can manage all certificates
CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));
