
-- =============================================
-- FIX ERROR #1: mile_entries - restrict SELECT to own entries
-- =============================================
DROP POLICY "Authenticated users can view all mile entries" ON public.mile_entries;
CREATE POLICY "Users can view their own mile entries" ON public.mile_entries
FOR SELECT USING (auth.uid() = user_id);

-- Create security-definer functions for leaderboard (bypasses mile_entries RLS)
CREATE OR REPLACE FUNCTION public.get_leaderboard_entries(p_since timestamptz DEFAULT NULL)
RETURNS TABLE(user_id uuid, total_miles numeric)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT me.user_id, SUM(me.miles)::numeric as total_miles
  FROM public.mile_entries me
  WHERE (p_since IS NULL OR me.logged_at >= p_since)
  GROUP BY me.user_id
  HAVING SUM(me.miles) > 0;
$$;

CREATE OR REPLACE FUNCTION public.get_weekly_consistency(p_week_start timestamptz, p_user_ids uuid[])
RETURNS TABLE(user_id uuid, distinct_days bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT me.user_id, COUNT(DISTINCT me.logged_at::date)::bigint as distinct_days
  FROM public.mile_entries me
  WHERE me.logged_at >= p_week_start
    AND me.user_id = ANY(p_user_ids)
  GROUP BY me.user_id;
$$;

-- =============================================
-- FIX ERROR #2: profiles - require authentication
-- =============================================
DROP POLICY "Users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- =============================================
-- FIX ERROR #3: leaderboard view - already has security_invoker=on
-- Since profiles now requires auth, leaderboard inherits that restriction. No change needed.
-- =============================================

-- =============================================
-- FIX WARN #1: team_members - restrict to same team
-- =============================================
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  );
$$;

DROP POLICY "Team members can view membership" ON public.team_members;
CREATE POLICY "Users can view their team memberships" ON public.team_members
FOR SELECT USING (
  auth.uid() = user_id 
  OR public.is_team_member(auth.uid(), team_id)
);

-- =============================================
-- FIX WARN #2: teams - hide password from direct SELECT
-- =============================================
-- Create RPC function to get team data without password
CREATE OR REPLACE FUNCTION public.get_team_for_member(_team_id uuid, _challenge_id uuid)
RETURNS TABLE(id uuid, name text, invite_code text, created_by uuid, challenge_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT t.id, t.name, t.invite_code, t.created_by, t.challenge_id
  FROM public.teams t
  JOIN public.team_members tm ON tm.team_id = t.id
  WHERE t.id = _team_id
    AND t.challenge_id = _challenge_id
    AND tm.user_id = auth.uid();
$$;

-- Restrict direct teams SELECT to creators only (members use RPC)
DROP POLICY "Team members can view their teams" ON public.teams;
CREATE POLICY "Team creators can view their teams" ON public.teams
FOR SELECT USING (auth.uid() = created_by);
