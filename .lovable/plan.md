## Problem

The LEGACYFIT-* codes (e.g. `LEGACYFIT-4AQ6`) live in the `beta_codes` table with type `single_challenge_promo`. The "Have a reward code?" input on the challenge enrollment screen calls the `redeem-reward-code` edge function, which only checks the `reward_codes` table (referral rewards). So those promo codes always come back as "Invalid reward code."

There is currently no UI anywhere in the app that calls `redeem-beta-code`, so promo codes have no working entry point today.

## Fix

Update the `redeem-reward-code` edge function so the single existing input field works for both kinds of codes. No UI changes required.

### Edge function changes (`supabase/functions/redeem-reward-code/index.ts`)

1. Keep the current reward-code lookup as the first attempt (case-insensitive against `reward_codes.code`, scoped to the calling user).
2. If no reward code is found, fall back to a beta-code lookup:
   - `select * from beta_codes where code = upper(trim(input)) and is_active = true`.
   - Reject if `times_used >= max_uses`.
   - Enforce the existing "one active paid challenge at a time" rule (already done by `redeem-beta-code`) — block if the user is already enrolled paid in another challenge, and block if already paid in this one.
   - Enroll the user: upsert into `user_challenges` with `payment_status = 'paid'` and `stripe_payment_id = 'promo_<code>'`.
   - Increment `beta_codes.times_used` by 1.
3. If neither lookup matches, return the existing "Invalid reward code" error (with copy adjusted to "Invalid code" so it covers both flows).
4. Preserve all existing reward-code behavior (mark `is_redeemed`, set `redeemed_at`, set `redeemed_for_challenge_id`) when the code is a reward code.

### What does NOT change

- No DB migration. `beta_codes`, `reward_codes`, and `user_challenges` schemas stay as-is.
- No frontend changes. `RewardCodeRedemption.tsx` keeps its current UX, label, and success messaging.
- The standalone `redeem-beta-code` function is left in place untouched in case it is wired into other surfaces later.

### Result

Pasting any of the LEGACYFIT-* codes into the "Have a reward code?" box on a challenge enrollment screen will enroll the user in that challenge (subject to the one-active-challenge rule), and increment `times_used` on the beta code so each one can only be used once.
