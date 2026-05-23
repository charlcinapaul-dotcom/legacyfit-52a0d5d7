
-- Certificates: only edge function (service role) should insert; client UPDATE viewed_at still allowed
DROP POLICY IF EXISTS "Users can insert their own certificates" ON public.certificates;

-- Subscriptions: only stripe-webhook / sync-iap-subscription (service role) should write
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- User coins: only server-side issuance after verified completion
DROP POLICY IF EXISTS "Users can insert their own coins" ON public.user_coins;

-- User roles: add explicit INSERT policy that blocks self-assignment.
-- The existing "Admins can manage all roles" ALL policy already covers admin inserts via service role / has_role();
-- adding an explicit restrictive INSERT policy makes the intent unambiguous and prevents any future permissive policy
-- from accidentally granting self-role-assignment.
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
