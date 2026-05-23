
-- 1. Restrict user_challenges INSERT to payment_status = 'pending'
DROP POLICY IF EXISTS "Users can insert their own challenges" ON public.user_challenges;
CREATE POLICY "Users can insert their own challenges"
ON public.user_challenges
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND payment_status = 'pending');

-- 2. Restrict profiles SELECT to self
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public profile RPC (limited fields) for leaderboard/teams
CREATE OR REPLACE FUNCTION public.get_public_profiles(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, bib_number text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, p.avatar_url, p.bib_number
  FROM public.profiles p
  WHERE p.user_id = ANY(p_user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;

-- 3. user_milestones INSERT: require paid enrollment + miles
DROP POLICY IF EXISTS "Users can insert their own milestones" ON public.user_milestones;
CREATE POLICY "Users can insert their own milestones"
ON public.user_milestones
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.milestones m
    WHERE m.id = user_milestones.milestone_id
      AND EXISTS (
        SELECT 1 FROM public.user_challenges uc
        WHERE uc.user_id = auth.uid()
          AND uc.challenge_id = m.challenge_id
          AND uc.payment_status = 'paid'
      )
      AND (
        SELECT COALESCE(SUM(me.miles), 0)
        FROM public.mile_entries me
        WHERE me.user_id = auth.uid()
          AND me.challenge_id = m.challenge_id
      ) >= m.miles_required
  )
);

-- 4. user_passport_stamps INSERT: require paid enrollment + miles
DROP POLICY IF EXISTS "Users can insert their own stamps" ON public.user_passport_stamps;
CREATE POLICY "Users can insert their own stamps"
ON public.user_passport_stamps
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.milestones m
    WHERE m.id = user_passport_stamps.milestone_id
      AND EXISTS (
        SELECT 1 FROM public.user_challenges uc
        WHERE uc.user_id = auth.uid()
          AND uc.challenge_id = m.challenge_id
          AND uc.payment_status = 'paid'
      )
      AND (
        SELECT COALESCE(SUM(me.miles), 0)
        FROM public.mile_entries me
        WHERE me.user_id = auth.uid()
          AND me.challenge_id = m.challenge_id
      ) >= m.miles_required
  )
);
