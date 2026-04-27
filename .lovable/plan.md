# 25 Single-Challenge Promo Beta Codes

## What you'll get
- 25 unique codes formatted `LEGACYFIT-XXXX` (4-char uppercase alphanumeric suffix)
- Each code: single-use, no expiration, unlocks **one** challenge of the redeemer's choice
- Codes do **not** touch subscriptions (`legacyfit.monthlypass`) or the $29 physical Boarding Pass
- Final list of all 25 codes printed in chat for you to copy/share

## Schema findings (no destructive changes needed)
- `beta_codes` already has: `code`, `is_active`, `max_uses` (default 50), `times_used`, `created_at`
- Per-user challenge access lives in **`user_challenges`** with `payment_status = 'paid'` — this is the correct unlock target (already used by `redeem-beta-code`)
- Subscriptions live in the separate `subscriptions` table; physical bundle goes through `create-checkout` with tier `boarding_pass`. **Neither flow accepts promo codes today**, so promo leakage is structurally impossible — no extra UI guard needed. We'll still add a server-side guard in `redeem-beta-code` that rejects use against subscription/bundle tiers if ever passed.

## Migration (schema)
Add one column to `beta_codes`:
- `code_type text not null default 'generic'` (existing rows backfill to `'generic'`; new promo rows use `'single_challenge_promo'`)

`max_uses` already exists — we'll just insert the new rows with `max_uses = 1`.

## Data insert
Generate 25 rows server-side with cryptographically random 4-char `[A-Z0-9]` suffixes, ensuring uniqueness against existing `code` values:
```
INSERT INTO beta_codes (code, max_uses, times_used, is_active, code_type)
VALUES ('LEGACYFIT-XXXX', 1, 0, true, 'single_challenge_promo'), ... (25 rows)
```

## Edge function changes — `redeem-beta-code/index.ts`
1. Continue requiring `challengeId` in the request body.
2. After loading the `betaCode` row, enforce:
   - `is_active = true`
   - `times_used < max_uses` (already there; for promos this means strictly 1 use)
3. New: if `code_type = 'single_challenge_promo'` and the request payload includes `tier === 'subscription'` or `tier === 'boarding_pass'` (defensive — not sent today), return:
   > "This promo code is valid for a single challenge only and cannot be applied here."
4. Unlock: upsert `user_challenges` row with `payment_status = 'paid'` and `stripe_payment_id = 'beta_<CODE>'` (existing logic — confirmed correct table).
5. Increment `times_used`. With `max_uses = 1`, the next attempt fails the existing max-uses check → effectively single-use.
6. Do **not** touch `subscriptions`, RevenueCat, or `shipping_orders`/`coin_fulfillment`.

## Output
After insertion, run a `SELECT code FROM beta_codes WHERE code_type='single_challenge_promo' ORDER BY created_at DESC LIMIT 25` and print the 25 codes as a plain numbered list in chat.

## Out of scope (explicitly untouched)
- `create-checkout`, Stripe price IDs, RevenueCat entitlements
- `subscriptions` table and monthly pass logic
- Physical Boarding Pass pricing or `shipping_orders`
- Existing 50-use generic beta codes (untouched; backfilled to `code_type='generic'`)

Approve and I'll run the migration, insert the 25 codes, update the edge function, and paste the code list.