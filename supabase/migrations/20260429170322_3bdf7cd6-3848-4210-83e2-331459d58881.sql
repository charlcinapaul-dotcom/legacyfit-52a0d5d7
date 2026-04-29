ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_health_total numeric NOT NULL DEFAULT 0;