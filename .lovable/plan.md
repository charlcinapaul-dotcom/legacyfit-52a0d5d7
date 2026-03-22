## Investigation Answers + Implementation Plan

### Direct answers to your three questions

**1. Does `profiles` or any table have a `free_preview_used` column?**
No. The `profiles` table has only: `id, user_id, total_miles, display_name, avatar_url, bib_number, created_at, updated_at`. No boolean flag of any kind exists. No other table carries one either — confirmed by a full codebase search.

**2. Is `user_challenges` written for free (unpaid) users?**
No. The free-mile path explicitly bypasses `user_challenges`. From `useMileLogging.ts` and `check-milestone-unlocks/index.ts`: free preview records go only into `mile_entries` and `user_passport_stamps`. `user_challenges` is only written when payment is `paid` (via the Stripe webhook).

**3. Cleanest place to store the flag?**
A new column `free_preview_claimed_at timestamptz` on the `profiles` table. Reasons:

- `profiles` is the canonical account-level table (one row per user, always exists after signup via the `handle_new_user` trigger)
- A timestamp is more useful than a plain boolean — you know *when* it was claimed at no extra cost
- Using `profiles` avoids creating a new table or polluting `user_challenges` with a concept that has nothing to do with enrollment
- The flag is account-wide, which matches the desired behavior (one free preview total, not per-challenge)

---

### Full implementation plan

**Database migration**

- Add `free_preview_claimed_at timestamptz NULL` to `profiles`
- Users can already UPDATE their own profile row (RLS allows it), so no new policy needed

**Edge function: `check-milestone-unlocks**`
Inside the `isFirstMile` branch, after successfully inserting the stamp, set `free_preview_claimed_at = now()` on the user's `profiles` row using the service-role client.

**New client hook: `useHasClaimedFreePreview**`
A small `useQuery` hook that reads `profiles.free_preview_claimed_at` for the current user. Returns `{ hasClaimed: boolean, isLoading }`. This is the single source of truth for the UI gate.

`**MileLogger.tsx` — gate the free CTA**
Currently, `isFirstMileFreeWindow` is true when `totalMiles === 0 && !enrolled`. Add a second condition: `!hasClaimed`. So the free logger only shows if the user has zero miles *and has not already claimed the preview on any other challenge*.

If `hasClaimed` is true and the user is not enrolled, show the existing "Enrollment Required" / pricing path instead of the free CTA button.

`Challenges.tsx` **—**   
Once hasClaimed is true for the current user, change the "Your first mile is always free" banner to read: "Start your journey from $12.99"

**No changes needed to:**

- The stamp modal
- The Journey Map
- The Virtual Route
- Any Stripe or webhook logic
- `user_challenges`
-   useMileLogging.ts

---

### Files to change

```text
supabase/migrations/         ← add free_preview_claimed_at to profiles
supabase/functions/check-milestone-unlocks/index.ts  ← set flag after first stamp
src/hooks/useHasClaimedFreePreview.ts   ← new hook
src/components/MileLogger.tsx           ← gate isFirstMileFreeWindow on !hasClaimed
src/pages/Challenges.tsx                ← (optional) update banner copy
```

### What does NOT change

- `isFirstMile` logic in `useMileLogging.ts` stays the same — the gate lives in the UI layer (MileLogger) and the server layer (edge function sets the flag). The hook already has a server-side guard against double-inserting a stamp, so no duplicate stamps are possible even without the flag, but the flag cleanly prevents the UI from offering the free CTA again.