-- Allow authenticated users to insert their very first mile entry on any challenge
-- (no prior entries = free first mile preview; already paid = normal access)
DROP POLICY IF EXISTS "Users can insert miles for paid challenges" ON public.mile_entries;

CREATE POLICY "Users can insert miles for paid challenges" ON public.mile_entries
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND (
      -- Already enrolled (paid)
      EXISTS (
        SELECT 1 FROM public.user_challenges uc
        WHERE uc.user_id = auth.uid()
          AND uc.challenge_id = mile_entries.challenge_id
          AND uc.payment_status = 'paid'
      )
      OR
      -- Free first mile: user has no prior entries for this challenge yet
      NOT EXISTS (
        SELECT 1 FROM public.mile_entries me2
        WHERE me2.user_id = auth.uid()
          AND me2.challenge_id = mile_entries.challenge_id
      )
    )
  );