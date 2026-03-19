
-- Helper: read existing payment_status for a given row without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_challenge_payment_status(row_id uuid)
RETURNS public.payment_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT payment_status FROM public.user_challenges WHERE id = row_id;
$$;

-- Drop the existing broad UPDATE policy
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.user_challenges;

-- Recreate UPDATE policy that:
--   USING  → user can only target their own rows
--   WITH CHECK → user cannot change payment_status (only service-role edge functions can)
CREATE POLICY "Users can update their own challenges"
ON public.user_challenges
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND payment_status IS NOT DISTINCT FROM public.get_user_challenge_payment_status(id)
);
