## Root cause

The user (e.g. `tfoster6@bellsouth.net` / "TeesFitJourney") has signed up but **has not enrolled (paid) in any challenge**. She has 1 stale `mile_entries` row for "Crispus Attucks" but no `user_challenges` row.

Two distinct symptoms result:

### 1. "Failed to log miles" error when she taps Log Steps

`StepLogger` shows its quick buttons and custom-step input to **everyone**, with no enrollment gate. When she taps a button, it calls `logMiles` which tries to INSERT into `mile_entries`. The RLS policy requires either:

- a `user_challenges` row with `payment_status = 'paid'`, **or**
- this is the user's first ever entry on this challenge

She has neither (already used her free entry), so Postgres rejects the insert and the toast shows "Failed to log miles. Please try again."

### 2. "Nothing comes up" when she taps Log Miles

`MileLogger` *does* gate the UI:

- `isFirstMileFreeWindow` = false (because `totalMiles > 0` for that challenge)
- `enrollment.isEnrolled` = false
- `freePreviewClaimed` = false (her `profiles.free_preview_claimed_at` was never stamped — likely the entry pre-dates the gate)

So she falls into the `freePreviewClaimed`-not-true branch and sees the **"Start Your Free 1 Mile Legacy Passport"** button that links to `/auth?redirect=...`. Since she's already signed in, that auth route bounces her right back — visually it looks like "nothing happens."

## The fix

### A. StepLogger: apply the same enrollment gate as MileLogger

`src/components/StepLogger.tsx` should mirror `MileLogger`'s gating logic. When the user is not enrolled and not in the first-mile free window, render an "Enroll to log steps" card with a button that calls `onScrollToPricing` (add it as a prop, same as MileLogger). This stops the failing INSERT entirely and gives a clear next step.

### B. MileLogger: fix the broken CTA for already-signed-in users

In the `!enrollment?.isEnrolled && !isFirstMileFreeWindow` branch, the "else" arm currently sends authenticated users to `/auth`. The condition should instead be: if the user is signed in but free preview was never properly claimed AND they have entries (i.e. their free mile is already used elsewhere), show the **"Enroll in This Challenge"** button (same as the `freePreviewClaimed` arm). The `/auth` link should only fire when `!isAuthenticated`, which is already handled in the earlier guard — so the `/auth` Link in this branch is effectively dead code and can be replaced with the Enroll CTA.

### C. Backfill `free_preview_claimed_at` for affected users (optional cleanup)

For users like TeesFitJourney who have a `mile_entries` row but a NULL `free_preview_claimed_at`, run a one-time migration to stamp `profiles.free_preview_claimed_at` from their earliest `mile_entries.created_at`. This makes the UI reflect reality (free preview consumed → enroll-required shown consistently).

fix this for all new users not just this user

## Files touched

- `src/components/StepLogger.tsx` — add enrollment gating + `onScrollToPricing` prop, plumb it from `ChallengeRoute.tsx`
- `src/components/MileLogger.tsx` — replace the misleading `/auth` link in the not-enrolled branch with the "Enroll in This Challenge" CTA
- `src/pages/ChallengeRoute.tsx` — pass `onScrollToPricing` into `<StepLogger />` (already passes it to `<MileLogger />`)
- One-time SQL migration to backfill `free_preview_claimed_at` from earliest `mile_entries` for users where it's NULL

## What this changes for the user

When the new user opens the challenge page:

- **Log Steps tab** → no broken buttons; instead a clear "Enroll in This Challenge" card
- **Log Miles tab** → same clear "Enroll in This Challenge" CTA (no more dead `/auth` redirect)
- Once she enrolls, both tabs work normally