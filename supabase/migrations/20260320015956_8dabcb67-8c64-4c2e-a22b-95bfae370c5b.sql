-- Drop the existing permissive insert policy
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

-- Recreate with status restricted to NULL or 'pending' only.
-- The service role bypasses RLS entirely, so the Stripe webhook
-- (which uses SUPABASE_SERVICE_ROLE_KEY) can still write status = 'active'.
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (status IS NULL OR status = 'pending')
);