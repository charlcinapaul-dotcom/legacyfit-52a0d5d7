
-- Drop and recreate the leaderboard view without SECURITY DEFINER
-- so it runs with the querying user's permissions and RLS applies correctly
DROP VIEW IF EXISTS public.leaderboard;

CREATE VIEW public.leaderboard
WITH (security_invoker = true)
AS
SELECT
  p.id,
  p.user_id,
  p.display_name,
  p.bib_number,
  p.avatar_url,
  p.total_miles,
  (
    SELECT count(*)
    FROM user_challenges uc
    WHERE uc.user_id = p.user_id
      AND uc.is_completed = true
  ) AS challenges_completed
FROM profiles p;
