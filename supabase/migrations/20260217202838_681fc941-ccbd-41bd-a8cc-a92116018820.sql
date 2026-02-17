
-- Fix overly permissive INSERT policy
DROP POLICY "Service can insert certificates" ON public.certificates;

CREATE POLICY "Users can insert their own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
