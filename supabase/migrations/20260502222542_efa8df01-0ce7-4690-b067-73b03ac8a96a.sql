ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_challenges_archived ON public.challenges(archived);
UPDATE public.challenges SET archived = true WHERE edition = '250 Years of Independence – Patriots Edition';