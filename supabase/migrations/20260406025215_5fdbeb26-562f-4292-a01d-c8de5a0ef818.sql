
-- Drop existing overly permissive write policies on challenge-images bucket
DROP POLICY IF EXISTS "Allow public upload to challenge-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to challenge-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete to challenge-images" ON storage.objects;
DROP POLICY IF EXISTS "challenge-images insert" ON storage.objects;
DROP POLICY IF EXISTS "challenge-images update" ON storage.objects;
DROP POLICY IF EXISTS "challenge-images delete" ON storage.objects;

-- Drop existing overly permissive write policies on milestone-audio bucket
DROP POLICY IF EXISTS "Allow public upload to milestone-audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update to milestone-audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete to milestone-audio" ON storage.objects;
DROP POLICY IF EXISTS "milestone-audio insert" ON storage.objects;
DROP POLICY IF EXISTS "milestone-audio update" ON storage.objects;
DROP POLICY IF EXISTS "milestone-audio delete" ON storage.objects;

-- Create restricted write policies for challenge-images (authenticated + admin only)
CREATE POLICY "Admin insert challenge-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'challenge-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin update challenge-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'challenge-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin delete challenge-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'challenge-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Create restricted write policies for milestone-audio (authenticated + admin only)
CREATE POLICY "Admin insert milestone-audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'milestone-audio'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin update milestone-audio"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'milestone-audio'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admin delete milestone-audio"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'milestone-audio'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);
