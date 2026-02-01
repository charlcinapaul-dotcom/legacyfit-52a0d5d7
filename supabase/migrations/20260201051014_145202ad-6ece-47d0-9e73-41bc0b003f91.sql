-- Add stamp metadata columns to milestones table
ALTER TABLE public.milestones 
ADD COLUMN IF NOT EXISTS stamp_title VARCHAR(100),
ADD COLUMN IF NOT EXISTS stamp_copy TEXT,
ADD COLUMN IF NOT EXISTS stamp_mileage_display VARCHAR(20);

-- Create passport_stamp_images table for AI-generated stamp assets
CREATE TABLE IF NOT EXISTS public.passport_stamp_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(milestone_id)
);

-- Enable RLS on passport_stamp_images
ALTER TABLE public.passport_stamp_images ENABLE ROW LEVEL SECURITY;

-- Anyone can view stamp images (they're public collectibles)
CREATE POLICY "Anyone can view stamp images"
ON public.passport_stamp_images
FOR SELECT
USING (true);

-- Only admins can manage stamp images
CREATE POLICY "Admins can manage stamp images"
ON public.passport_stamp_images
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));