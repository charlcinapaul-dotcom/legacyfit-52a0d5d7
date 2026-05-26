
-- ── Finding #1: Restrict team_members SELECT to own row; expose roster via RPC ──
DROP POLICY IF EXISTS "Users can view their team memberships" ON public.team_members;

CREATE POLICY "Users can view their own membership"
ON public.team_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.get_team_members(_team_id uuid)
RETURNS TABLE(user_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tm.user_id
  FROM public.team_members tm
  WHERE tm.team_id = _team_id
    AND public.is_team_member(auth.uid(), _team_id);
$$;

-- ── Finding #2: Prevent self-escalation of completion/miles/payment fields ──
CREATE OR REPLACE FUNCTION public.get_user_challenge_protected(row_id uuid)
RETURNS TABLE(payment_status payment_status, miles_logged numeric, is_completed boolean, completed_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT payment_status, miles_logged, is_completed, completed_at
  FROM public.user_challenges
  WHERE id = row_id;
$$;

DROP POLICY IF EXISTS "Users can update their own challenges" ON public.user_challenges;

CREATE POLICY "Users can update their own challenges"
ON public.user_challenges
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND NOT (payment_status IS DISTINCT FROM (SELECT p.payment_status FROM public.get_user_challenge_protected(id) p))
  AND NOT (miles_logged IS DISTINCT FROM (SELECT p.miles_logged FROM public.get_user_challenge_protected(id) p))
  AND NOT (is_completed IS DISTINCT FROM (SELECT p.is_completed FROM public.get_user_challenge_protected(id) p))
  AND NOT (completed_at IS DISTINCT FROM (SELECT p.completed_at FROM public.get_user_challenge_protected(id) p))
);
