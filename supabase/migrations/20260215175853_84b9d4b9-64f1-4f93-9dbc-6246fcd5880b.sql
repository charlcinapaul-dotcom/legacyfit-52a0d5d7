
-- Add audio_url column to milestones table
ALTER TABLE public.milestones ADD COLUMN audio_url text;

-- Create milestone-audio storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('milestone-audio', 'milestone-audio', true);

-- Allow public read access to milestone audio files
CREATE POLICY "Milestone audio is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'milestone-audio');

-- Allow service role to upload audio files (edge functions use service role)
CREATE POLICY "Service role can upload milestone audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'milestone-audio');

CREATE POLICY "Service role can update milestone audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'milestone-audio');
