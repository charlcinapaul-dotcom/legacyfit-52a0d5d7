-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "Users can insert their own fulfillment" ON public.coin_fulfillment;

-- Recreate with coin ownership check.
-- The EXISTS subquery verifies a row in user_coins where both
-- user_id = auth.uid() AND coin_id matches the row being inserted.
-- This prevents a user from filing a shipping request for a coin they don't own.
CREATE POLICY "Users can insert their own fulfillment"
ON public.coin_fulfillment
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_coins uc
    WHERE uc.user_id = auth.uid()
      AND uc.coin_id = coin_fulfillment.coin_id
  )
);