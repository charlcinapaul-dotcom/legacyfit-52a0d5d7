-- Dedupe any pre-existing rows that share (user_id, challenge_id, logged_at),
-- keeping the row with the highest miles (then most recent) so no logged distance is lost.
WITH ranked AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, challenge_id, logged_at
      ORDER BY miles DESC, created_at DESC, id
    ) AS rn
  FROM public.mile_entries
)
DELETE FROM public.mile_entries
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- Add the unique constraint required by the Health Sync upsert
-- (onConflict: "user_id,challenge_id,logged_at").
ALTER TABLE public.mile_entries
  ADD CONSTRAINT mile_entries_user_challenge_logged_at_key
  UNIQUE (user_id, challenge_id, logged_at);