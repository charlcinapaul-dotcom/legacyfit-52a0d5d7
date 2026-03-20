
-- Drop the existing broad INSERT policy
DROP POLICY IF EXISTS "Users can insert their own challenges" ON public.user_challenges;

-- Recreate INSERT policy:
--   WITH CHECK → user can only insert rows for themselves AND
--                payment_status must be NULL or 'pending' (never 'paid', 'failed', or 'refunded')
--                Only the service role (Stripe webhook) may set payment_status = 'paid'
CREATE POLICY "Users can insert their own challenges"
ON public.user_challenges
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (payment_status IS NULL OR payment_status = 'pending'::payment_status)
);
