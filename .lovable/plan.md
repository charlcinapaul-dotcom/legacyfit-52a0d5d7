
The user wants a permanent, codified ruleset document that must be followed every time a new challenge is added to LegacyFit. This is a documentation/enforcement task — not a UI change. The best place to write this is a new file that lives in the repo and acts as the authoritative source of truth for challenge creation standards.

The plan is to create one new file: `docs/NEW_CHALLENGE_STANDARDS.md` (or similar). This file will codify every rule currently enforced by the codebase, database schema, edge functions, and existing challenge data.

Rules to capture (from deep reading of the code):

**Database — challenges table:**
- `title`: Full proper name + theme word (e.g. "Ruth Bader Ginsburg Equality Journey")
- `slug`: URL-safe lowercase, unique (e.g. "ruth-bader-ginsburg")
- `edition`: Must match a known edition string — "Women's History", "Pride", etc. This is used in `getEditionColor()` and `getPricingEditionColor()` in ChallengeRoute.tsx to pick gold/pride/cyan color themes
- `total_miles`: Numeric. Must match the highest `miles_required` of the 6th milestone
- `description`: 1–2 sentences, public-facing copy
- `is_active`: false until fully seeded and verified
- `image_url`: Challenge backdrop image
- `stripe_price_id` / `stripe_product_id`: Not used for per-challenge pricing; checkout uses global `PRICE_IDS` in `create-checkout/index.ts`

**Database — milestones table (exactly 6 per challenge):**
- `order_index`: 1–6, sequential, no gaps
- `miles_required`: Even spacing across challenge total; milestone 1 MUST be at exactly `1` mile (required by first-mile gate logic in `useMileLogging.ts` — queries `eq("miles_required", 1)`)
- `title`: Person's name or event name (used as fallback label)
- `stamp_title`: Short, unique stamp display title — must be unique across ALL challenges (existing stamps: Sojourner Truth, Ida B. Wells, Eleanor Roosevelt, etc. from ROUTE_STOPS + all database milestones)
- `stamp_copy`: Short quote or phrase shown on stamp card
- `location_name`: Specific physical geographic location where the event happened (not generic)
- `historical_event`: **Exactly 3 sentences** — this is the ElevenLabs narration text. Voice: Matilda (voiceId `XrExE9yKIg1WjnnlVkGX`), auto-generated on insert via the `trigger_milestone_audio_generation` database trigger
- `audio_url`: null on insert — auto-populated by trigger → `generate-milestone-audio` edge function
- `stamp_image_url`: null on insert — manually generated via admin UI → `generate-stamp-image` edge function
- `latitude` / `longitude`: Coordinates of the physical location
- `stamp_mileage_display`: Display string e.g. "1 MILE", "10 MILES"
- `description`: Optional longer description (legacy field, superceded by `historical_event`)

**Audio rules (from `generate-milestone-audio/index.ts`):**
- Source text: `historical_event` column (falls back to `title`)
- Voice: ElevenLabs Matilda voice, `eleven_multilingual_v2` model
- Auto-triggered on milestone INSERT if `audio_url IS NULL`
- Stored in `milestone-audio` bucket at path `{challenge_id}/{milestone_id}.mp3`

**Stamp image rules (from `generate-stamp-image/index.ts`):**
- Generated via admin-only edge function call
- Style: vintage passport stamp, circular/rectangular with distressed edges
- Colors: deep blue, burgundy, or sepia — baked into PNG, not CSS-controlled
- Must include: title, location name, miles badge, LegacyFit brand mark
- Stored in `passport_stamp_images` table and mirrored to `milestones.stamp_image_url`
- Must be visually unique — no duplicate imagery across challenges

**First-mile gate (from `useMileLogging.ts`, memory):**
- Milestone at `miles_required = 1` MUST exist in every challenge
- RLS policy on `mile_entries` allows one free entry for unenrolled users (no prior entries)
- After the 1-mile stamp unlocks, StampUnlockModal shows "Continue Challenge" + "Share Achievement" (not the standard "Share / Continue" buttons)
- The Log Miles button text is "Start Your Free 1 Mile Legacy Passport" until the user reaches 1 mile unenrolled

**Pricing (from `create-checkout/index.ts`):**
- Two global price IDs (not per-challenge): Digital $12.99 and Collector's Edition $29.00
- No per-challenge Stripe products needed for new challenges — use the existing global price IDs
- `challenges.stripe_price_id` column exists but is not used by checkout

**Color themes (from `ChallengeRoute.tsx` `getEditionColor`):**
- `edition` containing "pride" → `"pride"` color (rainbow gradient)
- All others → `"gold"` theme
- `"cyan"` theme exists in `getColorStyles` but is not mapped to any edition yet

**Challenges page routing (from `Challenges.tsx`):**
- Women's History: any challenge where `slug !== "pride"` → shown in "Women's History Edition" section
- Pride: `slug === "pride"` → shown in "Pride Edition" section
- `is_active = false` → shown in "Past Editions" grayed out

**Implementation plan:**
1. Create `docs/NEW_CHALLENGE_STANDARDS.md` with all the rules above organized by section
2. Update `.lovable/plan.md` to reference this doc so future AI context always includes it

This is purely a documentation/reference file. No code changes. No database changes.
