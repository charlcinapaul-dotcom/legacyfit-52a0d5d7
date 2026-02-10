
-- Tighten RLS on mile_entries: only allow inserts if user has a paid enrollment
DROP POLICY IF EXISTS "Users can insert their own mile entries" ON public.mile_entries;

CREATE POLICY "Users can insert miles for paid challenges"
ON public.mile_entries
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_challenges uc
    WHERE uc.user_id = auth.uid()
      AND uc.challenge_id = mile_entries.challenge_id
      AND uc.payment_status = 'paid'
  )
);
