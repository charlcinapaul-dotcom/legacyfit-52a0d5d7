## Fix Health Sync upsert error

**Error:** `there is no unique or exclusion constraint matching the ON CONFLICT specification`

### Root cause

The Health Sync logic lives in `src/hooks/useHealthSync.ts` (it's a client-side hook, not an edge function). It calls:

```ts
supabase.from("mile_entries").upsert(rowsToUpsert, {
  onConflict: "user_id,challenge_id,logged_at",
  ignoreDuplicates: false,
});
```

But `public.mile_entries` currently has **no unique constraint** on `(user_id, challenge_id, logged_at)`. Confirmed via `pg_constraint` — only the primary key on `id` and two foreign keys exist. Postgres needs a matching unique/exclusion constraint for `ON CONFLICT` to work, hence the failure.

The hook intentionally normalizes `logged_at` to midnight UTC of the sample's day so each user/challenge/day is a single row that gets updated in place on re-sync. That design only works with a real unique constraint backing it.

### Fix

Add a unique constraint to `mile_entries` matching the upsert's columns and order.

```sql
-- Backfill: collapse any pre-existing duplicate (user_id, challenge_id, logged_at) rows
-- by keeping the row with the highest miles value (safest for Health Sync data,
-- which represents a daily total rather than incremental entries).
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

-- Add the unique constraint that matches onConflict: "user_id,challenge_id,logged_at"
ALTER TABLE public.mile_entries
  ADD CONSTRAINT mile_entries_user_challenge_logged_at_key
  UNIQUE (user_id, challenge_id, logged_at);
```

### Why this is safe

- **Manual log entries:** Users typing in miles use `now()` as `logged_at` (sub-second precision), so duplicate `(user_id, challenge_id, logged_at)` collisions across manual entries are essentially impossible. The constraint won't block normal logging.
- **Health Sync entries:** Use a deterministic midnight-UTC timestamp per day. The constraint is exactly what makes the daily upsert idempotent — the original intent of the hook.
- **Backfill step:** The dedupe `DELETE` handles the (rare) case where a previous broken sync attempt or manual entry happens to share the exact `logged_at`. We keep the row with the highest miles to avoid losing logged distance.
- **No client code changes needed** — `onConflict: "user_id,challenge_id,logged_at"` already matches the new constraint's column list.

### Files / changes

- New migration: adds the dedupe + `ALTER TABLE ... ADD CONSTRAINT mile_entries_user_challenge_logged_at_key UNIQUE (user_id, challenge_id, logged_at)`.
- No edits to `src/hooks/useHealthSync.ts`, no edge function changes, no RLS changes.

### Out of scope

- Renaming/restructuring `mile_entries` columns.
- Changing how manual entries set `logged_at` (still `now()`).
- Edge function refactor (Health Sync is client-side; the user's reference to "edge function" was a misattribution — the bug and fix both live at the database level).
