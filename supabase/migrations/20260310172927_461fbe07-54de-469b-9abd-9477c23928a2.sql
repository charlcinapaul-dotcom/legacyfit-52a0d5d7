
-- Backfill user_streaks for all existing users from their mile_entries history.
-- Uses the same ISO week logic as the trigger function.
WITH weekly_activity AS (
  SELECT
    user_id,
    EXTRACT(ISOYEAR FROM logged_at)::integer AS iso_year,
    EXTRACT(WEEK FROM logged_at)::integer    AS iso_week
  FROM public.mile_entries
  GROUP BY user_id, iso_year, iso_week
),
ordered AS (
  SELECT
    user_id, iso_year, iso_week,
    LAG(iso_year) OVER (PARTITION BY user_id ORDER BY iso_year, iso_week) AS prev_year,
    LAG(iso_week) OVER (PARTITION BY user_id ORDER BY iso_year, iso_week) AS prev_week
  FROM weekly_activity
),
streaks AS (
  SELECT
    user_id, iso_year, iso_week,
    CASE
      WHEN prev_year IS NULL THEN 1
      WHEN prev_year = iso_year AND prev_week = iso_week - 1 THEN 1
      WHEN prev_year = iso_year - 1
        AND iso_week = 1
        AND prev_week = EXTRACT(WEEK FROM (make_date(iso_year, 1, 4) - interval '7 days'))::integer
        THEN 1
      ELSE 0
    END AS is_consecutive
  FROM ordered
),
run_ids AS (
  SELECT
    user_id, iso_year, iso_week,
    SUM(CASE WHEN is_consecutive = 0 THEN 1 ELSE 0 END)
      OVER (PARTITION BY user_id ORDER BY iso_year, iso_week) AS run_id
  FROM streaks
),
run_lengths AS (
  SELECT
    user_id, iso_year, iso_week, run_id,
    ROW_NUMBER() OVER (PARTITION BY user_id, run_id ORDER BY iso_year, iso_week) AS streak_len
  FROM run_ids
),
final AS (
  SELECT
    user_id,
    -- current streak = length of the last run
    MAX(streak_len) FILTER (
      WHERE (iso_year, iso_week) IN (
        SELECT MAX(iso_year), MAX(iso_week)
        FROM weekly_activity w2
        WHERE w2.user_id = run_lengths.user_id
      )
    ) AS current_streak,
    MAX(streak_len) AS longest_streak,
    MAX(iso_week) FILTER (
      WHERE iso_year = (SELECT MAX(iso_year) FROM weekly_activity w3 WHERE w3.user_id = run_lengths.user_id)
    ) AS last_week,
    MAX(iso_year) AS last_year
  FROM run_lengths
  GROUP BY user_id
)
INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_week, last_active_year, updated_at)
SELECT
  user_id,
  COALESCE(current_streak, 1),
  COALESCE(longest_streak, 1),
  last_week,
  last_year,
  now()
FROM final
ON CONFLICT (user_id) DO UPDATE SET
  current_streak   = EXCLUDED.current_streak,
  longest_streak   = EXCLUDED.longest_streak,
  last_active_week = EXCLUDED.last_active_week,
  last_active_year = EXCLUDED.last_active_year,
  updated_at       = now();
