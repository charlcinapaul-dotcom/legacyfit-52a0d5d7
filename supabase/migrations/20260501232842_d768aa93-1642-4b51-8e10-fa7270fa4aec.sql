-- Add explicit edition metadata columns
ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS edition_name text,
  ADD COLUMN IF NOT EXISTS edition_color text;

-- Backfill edition_name from existing edition column
UPDATE public.challenges
SET edition_name = edition
WHERE edition_name IS NULL;

-- Backfill edition_color based on known editions
UPDATE public.challenges
SET edition_color = CASE
  WHEN edition = '250 Years of Independence – Unsung Edition' THEN '#B22234'
  WHEN edition = '250 Years of Independence – Patriots Edition' THEN '#B22234'
  WHEN edition = 'Women''s History' THEN '#7B1F2B'
  WHEN edition = 'First Steps: Black Pioneers' THEN '#B45309'
  WHEN edition = 'Pride' THEN '#A855F7'
  ELSE '#6B7280'
END
WHERE edition_color IS NULL;