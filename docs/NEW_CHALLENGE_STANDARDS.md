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
- **Generation model**: `google/gemini-3-pro-image-preview` via `generate-all-stamps` edge function.

### 4a. Parchment Background Standard (REQUIRED — matches Women's History Edition)

Every stamp MUST use the aged parchment aesthetic:

- **Canvas background**: Aged parchment paper — hex `#F5EDD8` warm cream/tan texture covering the **entire** square canvas. No white areas, no grey areas, no transparent corners.
- **Ink colors**: Deep Navy (`#1E3A5F`) or Burgundy Red (`#7A1E2C`) — distressed/worn look, not flat.
- **Prompt enforcement**: The generation prompt must explicitly state `"aged parchment paper background (#F5EDD8 warm cream). The entire canvas must use the warm cream/tan parchment texture — no white, no grey, no transparent areas."`.

### 4b. Required Visual Elements (ALL must be present)

| Element | Source field | Placement |
|---|---|---|
| **Pioneer/person name** | `stamp_title` or `milestones.title` | Center, bold serif all-caps, dominant text |
| **Mileage banner** | `stamp_mileage_display` | Horizontal ribbon/banner across stamp (e.g. `"5 MILES"`) |
| **Historical location** | `location_name` | Below the name, smaller subtitle text |
| **Double concentric outer ring** | — | Circular outer border with two rings |
| **Decorative wheat or laurel wreath** | — | Top arc of the stamp, above the name |
| **LEGACYFIT brand mark** | — | Bottom edge of stamp |

### 4c. Uniqueness Requirements

Every stamp is unique along **three dimensions**:
1. **Person** — the pioneer's name is the dominant center text.
2. **Mile** — the mileage banner reflects the exact `miles_required` of that milestone.
3. **Location** — the `location_name` appears below the name and should visually differ per stamp.

No two stamps across any challenges may share the same visual composition.

### 4d. Storage & Admin Workflow

- **Storage**: Saved to `challenge-images` bucket at path `stamps/{milestone_id}.png` → URL written to both `milestones.stamp_image_url` AND `passport_stamp_images` table.
- **UI containers**: Stamp image containers in `PassportStamp.tsx` use `bg-[#F5EDD8] rounded-lg` to provide visual fallback consistency while stamps load.
- **Admin reset**: If stamps were generated with incorrect backgrounds (white/grey), use the **"Reset Pioneers Stamps"** button on `/admin/validate` to null-out `stamp_image_url` for all milestones in the affected challenges, then re-trigger generation.
- **Action required**: After all 6 milestones are inserted, trigger `generate-all-stamps` (batch of 10) via admin panel. Confirm all 6 `stamp_image_url` values are populated before activating the challenge.

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
| Contains `"first black pioneers"` (case-insensitive) | `"pioneers"` | Amber/bronze tones |
| Anything else (`"Women's History"`, etc.) | `"gold"` | Gold/amber tones |

> Note: A `"cyan"` theme exists in `getColorStyles()` but is not mapped to any edition yet.

---

## 7. Challenges Page Routing Rules

Logic lives in `src/pages/Challenges.tsx`.

| Condition | Displayed in |
|---|---|
| `edition === "Women's History"` AND `is_active = true` | **Women's History Edition** section |
| `edition === "First Black Pioneers"` AND `is_active = true` | **First Black Pioneers Edition** section |
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

### Log Miles Section Display Logic (`src/components/MileLogger.tsx`)

The Log Miles card uses this exact rendering priority — **never deviate from this order**:

| State | What is shown |
|---|---|
| Loading (auth or enrollment check in progress) | Spinner only |
| **Not signed in** | Large gold "Start Your Free 1 Mile Legacy Passport" button — links to `/auth` |
| **Signed in, not enrolled, 0 miles logged** (free-mile window) | Full logger with single large gold "Start Your Free 1 Mile Legacy Passport" button that logs 1 mile |
| **Signed in, not enrolled, ≥ 1 mile logged** (past free window) | Large gold "Start Your Free 1 Mile Legacy Passport" button (no logging inputs) |
| **Signed in, payment pending** | "Your payment is being processed" message (no logging inputs) |
| **Signed in and enrolled (paid)** | Full mile logger: quick-add buttons (+1, +3, +5, +7), custom entry form, daily limit display |

**Rules:**
- The text "Sign In to Log Miles" or "Enrollment Required" must **never** appear anywhere in MileLogger.
- The gold CTA button must always use `bg-primary text-primary-foreground` — never hardcoded colors.
- The regular logging interface (quick buttons + custom form) is shown **only** after `enrollment.isEnrolled === true`.
- A latch (`wasInFreeWindowRef`) keeps the logger visible during the free-mile flow until `StampUnlockModal` is dismissed, preventing premature flip to the unenrolled state.

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

## 10. Challenge Passport Page — `/challenge/:slug/passport`

Each challenge has a dedicated passport page at `/challenge/:slug/passport` with two tabs.

### Tab 1 — Journey Stamps

Displays a **responsive 2-column (mobile) / 3-column (desktop) grid** of the 6 challenge-specific stamps.

- Data source: `usePassportStamps(challengeId)` — returns all 6 milestones for the challenge, each with an `isUnlocked` boolean computed by cross-referencing `user_passport_stamps`.
- **Locked stamps**: rendered with `blur-sm opacity-80` via `PassportStamp` component — artwork is hidden until the milestone mile threshold is reached.
- **Unlocked stamps**: rendered at full resolution and full opacity.
- Clicking any stamp (locked or unlocked) opens a detail modal (`selectedStamp`) showing:
  - Full stamp image (grayscale + 50% opacity if locked)
  - `stamp_title`, `location_name`, `stamp_mileage_display`
  - `stamp_copy` (italic quote)
  - `historical_event` text
  - Unlock date (unlocked stamps only)
- Implementation lives in `src/pages/ChallengePassport.tsx` → `<TabsContent value="stamps">`.

### Tab 2 — Passport Checkpoint

Displays an ordered list of the 6 milestones as cards.

- Unlocked milestones show a **"View on Map"** button linking to `https://www.google.com/maps/search/?api=1&query={lat},{lng}`.
- Locked milestones show a lock icon and "Reach X mi" label.
- Implementation lives in `src/pages/ChallengePassport.tsx` → `<TabsContent value="checkpoint">`.

### Stamp Visual Design Standard

All stamp images follow a vintage passport aesthetic:
- **Shape**: Circular with double concentric outer ring
- **Top arc**: Decorative wheat or laurel wreath
- **Bottom edge**: `LEGACYFIT` brand mark
- **Typography**: Bold serif all-caps name + location subtitle + rectangular mileage banner
- **Ink style**: Worn/distressed aesthetic
- **Colors**: Burgundy Red or Navy Blue (baked into PNG — not controlled by CSS)
- **Generation**: AI via `google/gemini-3-pro-image-preview` → stored in `challenge-images` storage bucket at `stamps/` path → URL written to `milestones.stamp_image_url` and `passport_stamp_images` table

---

## 11. Reference Files

| File | What it governs |
|---|---|
| `src/hooks/useMileLogging.ts` | Free first-mile gate, milestone unlock logic |
| `src/pages/ChallengeRoute.tsx` | Edition color themes, challenge page layout |
| `src/pages/ChallengePassport.tsx` | Challenge passport page, Journey Stamps + Checkpoint tabs |
| `src/pages/Challenges.tsx` | Challenge list routing and section assignment |
| `src/components/PassportStamp.tsx` | Stamp card component — blur/unlock rendering |
| `src/hooks/usePassportStamps.ts` | Fetches challenge milestones with `isUnlocked` state |
| `src/components/ChallengePricing.tsx` | Pricing tiers and Stripe checkout trigger |
| `supabase/functions/create-checkout/index.ts` | Global Stripe price IDs |
| `supabase/functions/generate-milestone-audio/index.ts` | ElevenLabs audio generation |
| `supabase/functions/generate-stamp-image/index.ts` | Stamp image generation |
| `supabase/functions/check-milestone-unlocks/index.ts` | Enrolled user milestone unlock logic |
