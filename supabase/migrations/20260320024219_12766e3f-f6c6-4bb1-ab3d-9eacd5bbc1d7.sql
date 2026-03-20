-- Drop the existing update policy (currently has no WITH CHECK)
DROP POLICY IF EXISTS "Users can update their own fulfillment" ON public.coin_fulfillment;

-- Recreate with coin ownership check.
-- USING:      users can only target their own rows.
-- WITH CHECK: after the update, coin_id must still refer to a coin
--             they own — prevents swapping coin_id to an unearned coin.
CREATE POLICY "Users can update their own fulfillment"
ON public.coin_fulfillment
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_coins uc
    WHERE uc.user_id = auth.uid()
      AND uc.coin_id = coin_fulfillment.coin_id
  )
);