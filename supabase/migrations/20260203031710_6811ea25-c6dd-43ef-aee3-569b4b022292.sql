-- Create storage bucket for challenge cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('challenge-images', 'challenge-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Challenge images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'challenge-images');

-- Create policy for service role uploads (edge functions)
CREATE POLICY "Service role can upload challenge images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'challenge-images');

CREATE POLICY "Service role can update challenge images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'challenge-images');

CREATE POLICY "Service role can delete challenge images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'challenge-images');