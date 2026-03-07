-- Fix: Recreate leaderboard view with SECURITY INVOKER (not SECURITY DEFINER)
-- This ensures the view enforces RLS policies of the querying user, not the view creator.
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = on)
AS
SELECT
  p.id,
  p.user_id,
  p.display_name,
  p.bib_number,
  p.avatar_url,
  p.total_miles,
  (SELECT COUNT(*) FROM public.user_challenges uc WHERE uc.user_id = p.user_id AND uc.is_completed = true)::bigint AS challenges_completed
FROM public.profiles p;