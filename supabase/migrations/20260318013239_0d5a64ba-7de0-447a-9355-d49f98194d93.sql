-- Add viewed_at column to certificates table
ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS viewed_at timestamptz DEFAULT NULL;

-- Allow users to update their own certificate (to stamp viewed_at)
CREATE POLICY "Users can update their own certificates"
  ON public.certificates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);