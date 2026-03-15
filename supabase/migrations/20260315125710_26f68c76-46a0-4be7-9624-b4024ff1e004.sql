
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS difficulty text,
  ADD COLUMN IF NOT EXISTS release_date timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS featured_quote text,
  ADD COLUMN IF NOT EXISTS featured_quote_attribution text;
