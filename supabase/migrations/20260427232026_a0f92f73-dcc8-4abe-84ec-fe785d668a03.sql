ALTER TABLE public.beta_codes
ADD COLUMN IF NOT EXISTS code_type text NOT NULL DEFAULT 'generic';