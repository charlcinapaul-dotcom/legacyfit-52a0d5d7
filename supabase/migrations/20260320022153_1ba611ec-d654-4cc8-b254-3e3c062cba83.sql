-- Drop the existing permissive update policy
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Recreate with status restricted to NULL or 'pending' only in WITH CHECK.
-- The service role bypasses RLS entirely, so the Stripe webhook
-- (which uses SUPABASE_SERVICE_ROLE_KEY) can still write status = 'active'.
CREATE POLICY "Users can update their own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND (status IS NULL OR status = 'pending')
);