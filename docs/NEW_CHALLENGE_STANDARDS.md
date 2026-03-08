# LegacyFit — New Challenge Creation Standards

> **This document is the authoritative source of truth.** Every new challenge added to LegacyFit MUST follow every rule in this file, no exceptions.

---

## 1. challenges Table

| Field | Rule |
|---|---|
| `title` | Full proper name + theme word. e.g. `"Ruth Bader Ginsburg Equality Journey"` |
| `slug` | URL-safe lowercase, globally unique. e.g. `"ruth-bader-ginsburg"` |
| `edition` | Must be `"Women's History"`, `"Pride"`, or `"First Black Pioneers"`. Controls color theme (see §6). |
| `total_miles` | Numeric. Must exactly equal `miles_required` of milestone 6. |
| `description` | 1–2 sentences. Public-facing copy shown on Challenges page. |
| `is_active` | Set to `false` on insert. Only set to `true` after all 6 milestones are fully seeded, audio generated, and stamp images generated. |
| `image_url` | Challenge backdrop image URL (displayed as hero on ChallengeRoute page). |
| `price_cents` | Leave null — global pricing applies (see §5). |
| `stripe_price_id` / `stripe_product_id` | Leave null — not used by checkout. Global `PRICE_IDS` in `create-checkout/index.ts` apply to all challenges. |

---

## 2. milestones Table — Exactly 6 Per Challenge

Every challenge MUST have **exactly 6 milestones**. No more, no fewer.

| Field | Rule |
|---|---|
| `order_index` | 1 through 6, sequential, no gaps. |
| `miles_required` | **Milestone 1 MUST be exactly `1` mile.** This is hard-wired into the free-first-mile gate in `useMileLogging.ts` (`eq("miles_required", 1)`). Milestones 2–6 should be evenly spaced across the total challenge distance. |
| `title` | Person's name or event name. Used as fallback label if `stamp_title` is missing. |
| `stamp_title` | Short, unique stamp display title. **Must be globally unique across ALL challenges** (check existing milestones before inserting). |
| `stamp_copy` | Short quote or phrase shown on the stamp card. 1 sentence max. |
| `location_name` | Specific physical geographic location where the historical event occurred. Must be a precise, real place — NOT a generic descriptor or award title. e.g. `"Tuskegee University, Alabama"` not `"NASA headquarters"`. |
| `historical_event` | **Exactly 3 sentences.** This is the ElevenLabs Matilda narration text. Sentence 1: introduce the person/event. Sentence 2: describe the significance. Sentence 3: connect to legacy or impact. |
| `audio_url` | Set to `null` on insert. Auto-populated by the `on_milestone_insert_generate_audio` database trigger → `generate-milestone-audio` edge function. |
| `stamp_image_url` | Set to `null` on insert. Manually generated after insert via admin UI → `generate-stamp-image` edge function. |
| `latitude` / `longitude` | Coordinates of the specific physical location. Required for map view. |
| `stamp_mileage_display` | Display string matching `miles_required`. e.g. `"1 MILE"`, `"10 MILES"`, `"26 MILES"`. |
| `description` | Optional. Legacy field superseded by `historical_event`. Can leave null. |

---

## 3. Audio Generation Rules

- **Trigger**: `on_milestone_insert_generate_audio` fires automatically on every milestone INSERT where `audio_url IS NULL`.
- **Source text**: `historical_event` column. Falls back to `title` if `historical_event` is null.
- **Voice**: ElevenLabs Matilda — voice ID `XrExE9yKIg1WjnnlVkGX`, model `eleven_multilingual_v2`.
- **Storage**: `milestone-audio` storage bucket at path `{challenge_id}/{milestone_id}.mp3`.
- **Action required**: No manual steps — audio is generated automatically on milestone insert. Verify `audio_url` is populated before setting `is_active = true`.

---

## 4. Stamp Image Generation Rules

- **Trigger**: NOT automatic — must be manually generated via the admin UI after insert.
- **Style**: Vintage passport stamp aesthetic. Circular or rectangular with worn/distressed edges.
- **Colors**: Deep blue, burgundy, or sepia. Baked into PNG — not controlled by CSS.
- **Required elements**: `stamp_title`, `location_name`, miles badge (`stamp_mileage_display`), small `LegacyFit` brand mark.
- **Uniqueness**: Every stamp image must be visually distinct. No duplicate imagery across challenges.
- **Storage**: Saved to `passport_stamp_images` table AND mirrored to `milestones.stamp_image_url`.
- **Action required**: After all 6 milestones are inserted, call `generate-stamp-image` for each via admin panel. Confirm all 6 images are set before activating the challenge.

---

## 5. Pricing Rules

- LegacyFit uses **two global price tiers** for all challenges — there is no per-challenge pricing.
- `digital` tier → Stripe Price ID `price_1T8emA3JzkAB6gcFRznutdsG` → **$12.99 Digital Collection**
- `boarding_pass` tier → Stripe Price ID `price_1T8emZ3JzkAB6gcFwP7KsM2F` → **$29.00 Collector's Edition**
- These are defined in `supabase/functions/create-checkout/index.ts` `PRICE_IDS` constant.
- Do NOT create new Stripe products or prices for individual challenges.

---

## 6. Color Theme Rules

Determined by the `edition` field. Logic lives in `getEditionColor()` in `src/pages/ChallengeRoute.tsx`.

| edition value | Theme | Visual |
|---|---|---|
| Contains `"pride"` (case-insensitive) | `"pride"` | Rainbow gradient |
| Anything else (`"Women's History"`, etc.) | `"gold"` | Gold/amber tones |

> Note: A `"cyan"` theme exists in `getColorStyles()` but is not mapped to any edition yet.

---

## 7. Challenges Page Routing Rules

Logic lives in `src/pages/Challenges.tsx`.

| Condition | Displayed in |
|---|---|
| `slug !== "pride"` AND `is_active = true` | **Women's History Edition** section |
| `slug === "pride"` AND `is_active = true` | **Pride Edition** section |
| `is_active = false` | **Past Editions** (grayed out) |

---

## 8. Free First Mile Gate

Every challenge MUST support the free first-mile preview. This requires:

1. **Milestone 1 at exactly `miles_required = 1`** (hard requirement — queried by exact value).
2. The unenrolled user can log their first mile for free (RLS allows one `mile_entries` insert with no prior entries).
3. After the first mile, the 1-mile stamp unlocks and `StampUnlockModal` is shown.
4. The MileLogger button renders as **"Start Your Free 1 Mile Legacy Passport"** for unenrolled users with 0 miles logged.
5. After the free mile, unenrolled users are gated and shown the `ChallengePricing` upgrade flow.

---

## 9. Activation Checklist

Before setting `is_active = true`, confirm ALL of the following:

- [ ] Challenge row inserted with correct `slug`, `edition`, `total_miles`, `description`, `image_url`
- [ ] Exactly 6 milestones inserted with sequential `order_index` 1–6
- [ ] Milestone 1 has `miles_required = 1`
- [ ] All 6 milestones have `historical_event` with **exactly 3 sentences**
- [ ] All 6 `stamp_title` values are globally unique (no duplicates across any challenge)
- [ ] All 6 milestones have `location_name` as a specific, real geographic location
- [ ] All 6 milestones have valid `latitude` / `longitude` coordinates
- [ ] All 6 `audio_url` values are populated (auto-generated — verify not null)
- [ ] All 6 `stamp_image_url` values are populated (manually generated via admin UI)
- [ ] `stamp_mileage_display` set for all 6 milestones
- [ ] Challenge backdrop `image_url` is uploaded and accessible
- [ ] Challenge tested end-to-end: free mile logs → stamp unlocks → gate shown → payment flows → milestones unlock

---

## 10. Reference Files

| File | What it governs |
|---|---|
| `src/hooks/useMileLogging.ts` | Free first-mile gate, milestone unlock logic |
| `src/pages/ChallengeRoute.tsx` | Edition color themes, challenge page layout |
| `src/pages/Challenges.tsx` | Challenge list routing and section assignment |
| `src/components/ChallengePricing.tsx` | Pricing tiers and Stripe checkout trigger |
| `supabase/functions/create-checkout/index.ts` | Global Stripe price IDs |
| `supabase/functions/generate-milestone-audio/index.ts` | ElevenLabs audio generation |
| `supabase/functions/generate-stamp-image/index.ts` | Stamp image generation |
| `supabase/functions/check-milestone-unlocks/index.ts` | Enrolled user milestone unlock logic |
