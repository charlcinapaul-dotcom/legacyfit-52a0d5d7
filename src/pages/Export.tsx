import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, Database, Zap, Settings, GitBranch, CheckCircle2, Loader2 } from "lucide-react";

// ─── File bundles ──────────────────────────────────────────────────────────────

const FILES: Record<string, string> = {

// ── FRONTEND: Pages ────────────────────────────────────────────────────────────
"frontend/pages/Dashboard.tsx": `// Dashboard — shows user stats, active challenge, mile logger, referral card
// Key hooks: useActiveChallenge, useMileLogging
// Key components: MileLogger, StepLogger, ReferralCard, DigitalBib, CompletionCertificate
// Auth: redirects to /auth if no session
// Data: profiles, user_challenges (joined with challenges), user_milestones, user_passport_stamps
// See full source: src/pages/Dashboard.tsx`,

"frontend/pages/ChallengeRoute.tsx": `// ChallengeRoute — main challenge detail page
// URL: /challenge/:slug
// Key hooks: useChallengeBySlug, useEnrollmentStatus, useMilestoneAudio
// Key components: MileLogger, StepLogger, ChallengePricing, GroupChallenge, MapPreview
// Logic: maps DB milestones → display format, tracks unlocked count, plays audio on new unlock
// Color themes: gold (default), cyan, pride, pioneers — driven by challenge.edition field
// See full source: src/pages/ChallengeRoute.tsx`,

"frontend/pages/ChallengePassport.tsx": `// ChallengePassport — stamp collection passport page
// URL: /challenge/:slug/passport
// Key hooks: usePassportStamps, useChallengeBySlug, useEnrollmentStatus
// Key components: PassportStamp, MileLogger, EnrollmentBadge
// Tabs: Journey Stamps grid | Passport Checkpoint list (with Google Maps links)
// See full source: src/pages/ChallengePassport.tsx`,

"frontend/pages/Challenges.tsx": `// Challenges — browse all active challenges
// Key hooks: useQuery → supabase.from('challenges').select('*').eq('is_active', true)
// Links to /challenge/:slug for each
// See full source: src/pages/Challenges.tsx`,

"frontend/pages/Leaderboard.tsx": `// Leaderboard — ranked list of users by total miles
// Key functions: get_leaderboard_entries(p_since), get_weekly_consistency
// Displays: rank, display_name, bib_number, total_miles, challenges_completed
// See full source: src/pages/Leaderboard.tsx`,

"frontend/pages/Passport.tsx": `// Global Passport — all stamps across all challenges for current user
// See full source: src/pages/Passport.tsx`,

// ── FRONTEND: Components ───────────────────────────────────────────────────────
"frontend/components/MileLogger.tsx": `// MileLogger — core activity logging UI component
// Props: challengeId, challengeSlug, challengeName, onChallengeCompleted, onMaybeLater
// States:
//   - Unauthenticated → CTA to sign up
//   - Free first-mile preview (0 miles logged, not enrolled) → single +1 button
//   - Enrolled (paid) → quick buttons [+1,+3,+5,+7] + custom slider
//   - Pending payment → "payment processing" message
// Modals: MileLogConfirmDialog, StampUnlockModal, FirstMileGateModal
// Rate limiting: useDailyMilesLogged (max 10.5/day), useRateLimitCountdown (5/hour)
// See full source: src/components/MileLogger.tsx`,

"frontend/components/StampUnlockModal.tsx": `// Modal shown when user unlocks new passport stamps after logging miles
// Shows stamp image, title, copy text, audio playback
// Unenrolled users see share + purchase CTAs
// See full source: src/components/StampUnlockModal.tsx`,

"frontend/components/FirstMileGateModal.tsx": `// Modal shown after free first-mile stamp is earned
// Screens: share achievement | purchase full challenge
// See full source: src/components/FirstMileGateModal.tsx`,

"frontend/components/ChallengePricing.tsx": `// Pricing card shown on challenge page for non-enrolled users
// Tiers: Digital ($12.99) | Collector's Edition ($29.00)
// Calls create-checkout edge function → Stripe hosted checkout
// See full source: src/components/ChallengePricing.tsx`,

"frontend/components/PassportStamp.tsx": `// Individual stamp tile — shows image (or locked placeholder), title, miles
// See full source: src/components/PassportStamp.tsx`,

"frontend/components/MapPreview.tsx": `// Interactive Leaflet map showing milestone locations on challenge route
// Uses react-leaflet; pins colored by unlock status
// See full source: src/components/MapPreview.tsx`,

"frontend/components/GroupChallenge.tsx": `// Team creation & join UI; calls create-team and join-team edge functions
// See full source: src/components/GroupChallenge.tsx`,

"frontend/components/CompletionCertificate.tsx": `// Shows generated completion certificate image with download/share options
// See full source: src/components/CompletionCertificate.tsx`,

// ── FRONTEND: Hooks ────────────────────────────────────────────────────────────
"frontend/hooks/useMileLogging.ts": `import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MileEntry {
  miles: number;
  challengeId: string;
  notes?: string;
  source?: "manual" | "apple_health" | "google_fit";
}

export interface UnlockedStamp {
  milestoneId: string;
  title: string;
  stampTitle: string;
  stampCopy: string;
  milesRequired: number;
  locationName: string;
  stampImageUrl: string | null;
  audioUrl: string | null;
}

// Core mile-logging mutation hook
// Handles: free first-mile path (client-side), enrolled path (edge function)
// Validates enrollment, inserts mile_entry, calculates totals, triggers milestone unlock
// Detects challenge completion → generates certificate → sends email
// Returns: totalMiles, userChallenge, logMiles, isLogging,
//          newlyUnlockedStamps, clearUnlockedStamps, completionData, clearCompletionData
// See full source: src/hooks/useMileLogging.ts`,

"frontend/hooks/useActiveChallenge.ts": `// Returns the most recent user_challenge with joined challenge data
// Single source of truth for: challengeId, milesLogged, slug, title, totalMiles, imageUrl, isCompleted
// Used by: Dashboard, Landing hero progress bar
// See full source: src/hooks/useActiveChallenge.ts`,

"frontend/hooks/useDailyMilesLogged.ts": `// Fetches sum of miles logged today for a given challenge
// Enforces: MAX_SINGLE_ENTRY = 7, MAX_DAILY_AGGREGATE = 10.5
// Returns: dailyLogged, dailyRemaining, maxSingleEntry, maxDailyAggregate
// See full source: src/hooks/useDailyMilesLogged.ts`,

"frontend/hooks/useEnrollmentStatus.ts": `// Fetches user_challenges row for a given challengeId
// Returns: { isEnrolled, status, milesLogged }
// Used everywhere enrollment state affects UI (MileLogger, ChallengeRoute, ChallengePassport)
// See full source: src/hooks/useEnrollmentStatus.ts`,

"frontend/hooks/usePassportStamps.ts": `// Fetches all milestones for a challenge + user's unlocked stamps
// Merges into StampWithMilestone[] with isUnlocked, unlockedAt
// Returns: stamps[], unlockedCount, totalCount
// See full source: src/hooks/usePassportStamps.ts`,

"frontend/hooks/useChallengeBySlug.ts": `// Fetches challenge + milestones from DB by slug
// Returns: { challenge, milestones }
// See full source: src/hooks/useChallengeBySlug.ts`,

// ── BACKEND: Edge Functions ────────────────────────────────────────────────────
"backend/edge-functions/create-checkout.ts": `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// Price IDs (live mode)
const PRICE_IDS: Record<string, string> = {
  digital:      "price_1T8emA3JzkAB6gcFRznutdsG", // $12.99
  boarding_pass:"price_1T8emZ3JzkAB6gcFwP7KsM2F", // $29.00
};

// Flow:
// 1. Validate Bearer token → get user
// 2. Receive { challengeId, tier, slug }
// 3. Find/create Stripe customer by email
// 4. Create checkout.session with metadata: { user_id, challenge_id, tier }
// 5. Return { url } → client does window.location.href = url
// On success: /payment-success?session_id=...&challenge_id=...
// See full source: supabase/functions/create-checkout/index.ts`,

"backend/edge-functions/verify-payment.ts": `// Called by /payment-success page after Stripe redirect
// Flow:
// 1. Validate Bearer token (user must match session metadata.user_id)
// 2. Retrieve Stripe session → check payment_status === "paid"
// 3. Upsert user_challenges { payment_status: "paid" } ON CONFLICT (user_id, challenge_id)
// 4. Upsert payments { status: "paid" } ON CONFLICT (stripe_checkout_session_id)
// Idempotent: safe to call multiple times
// See full source: supabase/functions/verify-payment/index.ts`,

"backend/edge-functions/stripe-webhook.ts": `// Fallback enrollment handler — triggered by Stripe webhook on checkout.session.completed
// Validates STRIPE_WEBHOOK_SECRET signature
// Only processes payment_status === "paid" events
// Upserts user_challenges + payments (same idempotent logic as verify-payment)
// Handles cases where user closed browser before /payment-success redirect
// See full source: supabase/functions/stripe-webhook/index.ts`,

"backend/edge-functions/check-milestone-unlocks.ts": `// Called after mile logging for enrolled (paid) users
// Flow:
// 1. Verify auth token + user_id match (prevents impersonation)
// 2. Validate enrollment (payment_status = "paid") server-side
// 3. Fetch milestones where miles_required <= totalMiles
// 4. Compare against user_passport_stamps to find NEW unlocks
// 5. Insert user_passport_stamps + user_milestones for new unlocks
// 6. Fire-and-forget send-stamp-email for each new stamp
// Returns: { unlockedStamps[] }
// See full source: supabase/functions/check-milestone-unlocks/index.ts`,

"backend/edge-functions/generate-certificate.ts": `// Generates PNG completion certificate using canvas/html2canvas
// Stores in challenge-images storage bucket
// Inserts record into certificates table
// Called when user_challenge.miles_logged >= challenge.total_miles
// See full source: supabase/functions/generate-certificate/index.ts`,

"backend/edge-functions/send-certificate-email.ts": `// Sends completion certificate email via Resend
// Uses RESEND_API_KEY secret
// Called after generate-certificate completes
// See full source: supabase/functions/send-certificate-email/index.ts`,

"backend/edge-functions/send-stamp-email.ts": `// Sends passport stamp unlock notification email via Resend
// Called fire-and-forget from check-milestone-unlocks
// See full source: supabase/functions/send-stamp-email/index.ts`,

"backend/edge-functions/generate-milestone-audio.ts": `// Generates ElevenLabs TTS audio for a milestone's historical narrative
// Uses ELEVENLABS_API_KEY (connector-managed secret)
// Stores MP3 in milestone-audio storage bucket
// Updates milestones.audio_url
// Also triggered automatically via DB trigger on milestone INSERT (when audio_url IS NULL)
// See full source: supabase/functions/generate-milestone-audio/index.ts`,

"backend/edge-functions/legacy-guide.ts": `// AI-powered historical guide using Lovable AI (google/gemini-2.5-flash)
// Generates contextual narration for milestone locations
// Uses LOVABLE_API_KEY secret
// See full source: supabase/functions/legacy-guide/index.ts`,

// ── DATABASE: Schema ───────────────────────────────────────────────────────────
"database/schema.sql": `-- ╔══════════════════════════════════════════════╗
-- ║       LegacyFit Virtual Challenge Schema       ║
-- ╚══════════════════════════════════════════════╝

-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.mile_source AS ENUM ('manual', 'apple_health', 'google_fit');
CREATE TYPE public.fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered');

-- ── profiles ──────────────────────────────────────────────────────────────────
-- Created automatically via handle_new_user() trigger on auth.users INSERT
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  bib_number  text,          -- auto-generated as "LF-XXXXX" via generate_bib_number() trigger
  avatar_url  text,
  total_miles numeric DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── user_roles ────────────────────────────────────────────────────────────────
-- Stored separately from profiles to prevent privilege escalation
-- Default role 'user' inserted alongside profile in handle_new_user()
CREATE TABLE public.user_roles (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ── challenges ────────────────────────────────────────────────────────────────
CREATE TABLE public.challenges (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  edition          text NOT NULL,         -- e.g. "Women's History", "Pride History"
  slug             text UNIQUE,
  description      text,
  image_url        text,
  total_miles      numeric NOT NULL,
  is_active        boolean DEFAULT true,
  stripe_price_id  text,                  -- UNUSED (legacy); live price IDs hardcoded in create-checkout
  stripe_product_id text,
  price_cents      integer,               -- UNUSED (legacy)
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- ── milestones ────────────────────────────────────────────────────────────────
-- Each milestone = a historical figure/event at a mileage marker
-- audio_url is auto-generated via DB trigger → generate-milestone-audio edge function
CREATE TABLE public.milestones (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id          uuid NOT NULL REFERENCES public.challenges(id),
  title                 text NOT NULL,
  order_index           integer NOT NULL,
  miles_required        numeric NOT NULL,
  description           text,
  historical_event      text,
  location_name         text,
  latitude              numeric,
  longitude             numeric,
  stamp_title           varchar,
  stamp_copy            text,
  stamp_image_url       text,
  stamp_mileage_display varchar,
  audio_url             text,             -- ElevenLabs TTS audio
  created_at            timestamptz NOT NULL DEFAULT now()
);

-- ── user_challenges ───────────────────────────────────────────────────────────
-- Created by stripe-webhook or verify-payment when payment succeeds
-- Free-preview users do NOT have a row here (first-mile RLS policy allows this)
CREATE TABLE public.user_challenges (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL,
  challenge_id     uuid NOT NULL REFERENCES public.challenges(id),
  payment_status   payment_status DEFAULT 'pending',
  stripe_payment_id text,
  miles_logged     numeric DEFAULT 0,
  is_completed     boolean DEFAULT false,
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)          -- idempotent upsert key
);

-- ── mile_entries ──────────────────────────────────────────────────────────────
-- Individual activity log entries
-- RLS: INSERT allowed for (1) enrolled paid users OR (2) users with 0 entries (free preview)
-- validate_mile_entry() trigger enforces: max 7mi/entry, 10.5mi/day, 5 entries/hour
CREATE TABLE public.mile_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id),
  miles        numeric NOT NULL,
  notes        text,
  source       mile_source NOT NULL DEFAULT 'manual',
  logged_at    timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── user_passport_stamps ──────────────────────────────────────────────────────
-- Unlocked when user reaches milestone's miles_required threshold
-- Inserted by: check-milestone-unlocks (enrolled) or client-side (free first mile)
CREATE TABLE public.user_passport_stamps (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  milestone_id uuid NOT NULL REFERENCES public.milestones(id),
  unlocked_at  timestamptz NOT NULL DEFAULT now()
);

-- ── user_milestones ───────────────────────────────────────────────────────────
-- Parallel to user_passport_stamps; used for milestone count stats
CREATE TABLE public.user_milestones (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  milestone_id uuid NOT NULL REFERENCES public.milestones(id),
  unlocked_at  timestamptz NOT NULL DEFAULT now()
);

-- ── payments ─────────────────────────────────────────────────────────────────
-- Payment records; idempotent via UNIQUE (stripe_checkout_session_id)
CREATE TABLE public.payments (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    uuid NOT NULL,
  challenge_id               uuid REFERENCES public.challenges(id),
  amount_cents               integer NOT NULL,
  status                     payment_status DEFAULT 'pending',
  stripe_payment_id          text,
  stripe_checkout_session_id text UNIQUE,
  created_at                 timestamptz NOT NULL DEFAULT now()
);

-- ── certificates ─────────────────────────────────────────────────────────────
CREATE TABLE public.certificates (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id),
  image_url    text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── teams / team_members ──────────────────────────────────────────────────────
CREATE TABLE public.teams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id),
  name         text NOT NULL,
  invite_code  text NOT NULL DEFAULT encode(gen_random_bytes(6), 'hex'),
  password     text NOT NULL DEFAULT '',
  created_by   uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.team_members (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   uuid NOT NULL REFERENCES public.teams(id),
  user_id   uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- ── passport_stamp_images ─────────────────────────────────────────────────────
-- AI-generated stamp artwork; 1:1 with milestones
CREATE TABLE public.passport_stamp_images (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid UNIQUE REFERENCES public.milestones(id),
  image_url    text NOT NULL,
  generated_at timestamptz DEFAULT now()
);

-- ── referral_codes / referral_redemptions / reward_codes ─────────────────────
CREATE TABLE public.referral_codes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL UNIQUE,
  code       text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.referral_redemptions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id  uuid NOT NULL REFERENCES public.referral_codes(id),
  referred_user_id  uuid NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.reward_codes (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    uuid NOT NULL,
  code                       text NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  is_redeemed                boolean NOT NULL DEFAULT false,
  redeemed_at                timestamptz,
  redeemed_for_challenge_id  uuid REFERENCES public.challenges(id),
  created_at                 timestamptz NOT NULL DEFAULT now()
);

-- ── beta_codes / walk_reminders / subscriptions ───────────────────────────────
-- beta_codes: admin-issued access codes
-- walk_reminders: email capture for free-walk feature
-- subscriptions: Stripe subscription state (future use)`,

"database/rls-policies.md": `# Row-Level Security Policies

## Security Model Overview
- All tables use RLS (Row-Level Security) — enabled by default
- Role checks use \`has_role(auth.uid(), 'admin')\` SECURITY DEFINER function to avoid recursion
- User ID checks use \`auth.uid() = user_id\` (never trust client-supplied IDs)

## Key Policies

### mile_entries — INSERT
Allows insert if EITHER:
  (a) user has a paid enrollment in user_challenges for this challenge_id
  (b) user has NO prior entries for this challenge (free first-mile preview)
\`\`\`sql
(auth.uid() = user_id) AND (
  EXISTS (SELECT 1 FROM user_challenges uc
          WHERE uc.user_id = auth.uid()
            AND uc.challenge_id = mile_entries.challenge_id
            AND uc.payment_status = 'paid')
  OR NOT EXISTS (SELECT 1 FROM mile_entries me2
                 WHERE me2.user_id = auth.uid()
                   AND me2.challenge_id = mile_entries.challenge_id)
)
\`\`\`

### challenges — SELECT
Only active challenges visible to public:
\`is_active = true\`

### user_challenges — all operations
Scoped to \`auth.uid() = user_id\` (authenticated only)

### user_passport_stamps — INSERT/SELECT
Scoped to \`auth.uid() = user_id\`

### profiles — UPDATE
Scoped to \`auth.uid() = user_id\`; no DELETE allowed`,

"database/db-functions.md": `# Key Database Functions & Triggers

## Functions

### handle_new_user() — trigger on auth.users INSERT
Inserts into profiles (display_name from user metadata) + user_roles (default 'user')

### generate_bib_number() — trigger on profiles INSERT
Assigns sequential "LF-XXXXX" bib number starting from LF-00711

### validate_mile_entry() — trigger on mile_entries INSERT
Enforces:
  - Single entry ≤ 7 miles
  - Daily aggregate ≤ 10.5 miles (per challenge)
  - Max 5 entries per hour (per challenge)
Raises EXCEPTION with ERRCODE 'check_violation' on violation

### trigger_milestone_audio_generation() — trigger on milestones INSERT
When audio_url IS NULL, calls generate-milestone-audio edge function via net.http_post()
Uses pg_net extension for async HTTP calls from DB triggers

### has_role(user_id, role) — SECURITY DEFINER
Safe role check that bypasses RLS to prevent infinite recursion in policies

### get_leaderboard_entries(p_since?) — SECURITY DEFINER
Aggregates total miles per user from mile_entries, filtered by optional timestamp

### get_weekly_consistency(p_week_start, p_user_ids[]) — SECURITY DEFINER
Returns distinct walk days per user for a given week (streak/consistency tracking)`,

// ── CONFIG ─────────────────────────────────────────────────────────────────────
"config/env-template.txt": `# LegacyFit Environment Variables Template
# These are managed automatically — DO NOT edit .env directly
# Backend secrets are stored in Supabase secrets manager

# ── Auto-generated by Lovable Cloud (do not edit) ──
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>          # Safe to expose (client-side only)
VITE_SUPABASE_PROJECT_ID=<project-id>

# ── Backend secrets (Supabase secrets manager only — never in code) ──
STRIPE_SECRET_KEY=sk_live_...                      # Stripe live secret key
STRIPE_WEBHOOK_SECRET=whsec_...                   # Stripe webhook signing secret
RESEND_API_KEY=re_...                             # Resend transactional email
ELEVENLABS_API_KEY=<managed-by-connector>         # ElevenLabs TTS (connector-managed)
LOVABLE_API_KEY=<managed-by-lovable>              # Lovable AI for edge functions
SUPABASE_SERVICE_ROLE_KEY=<auto>                  # Auto-provided in edge functions
SUPABASE_ANON_KEY=<auto>                          # Auto-provided in edge functions
SUPABASE_URL=<auto>                               # Auto-provided in edge functions`,

"config/project-structure.md": `# LegacyFit Project Structure

\`\`\`
legacyfit-virtual/
├── src/
│   ├── pages/               # Route-level pages
│   │   ├── Landing.tsx      # Marketing homepage with hero, features, pricing CTA
│   │   ├── Auth.tsx         # Login / signup (email+password via Supabase Auth)
│   │   ├── Dashboard.tsx    # User home: stats, mile logger, challenge list
│   │   ├── ChallengeRoute.tsx  # Challenge detail: map, milestones, log miles
│   │   ├── ChallengePassport.tsx # Passport: stamp collection grid + checkpoint map
│   │   ├── Challenges.tsx   # Browse all active challenges
│   │   ├── Leaderboard.tsx  # Global / challenge-specific rankings
│   │   ├── Passport.tsx     # All stamps across all challenges
│   │   ├── FreeWalk.tsx     # Standalone free walk experience (no account needed)
│   │   ├── PaymentSuccess.tsx # Post-Stripe redirect; triggers verify-payment
│   │   └── AdminValidate.tsx  # Admin challenge validation tool
│   │
│   ├── components/
│   │   ├── MileLogger.tsx   # Mile logging UI (quick buttons + custom slider)
│   │   ├── StepLogger.tsx   # Step → mile conversion logger
│   │   ├── StampUnlockModal.tsx  # Celebration modal for new stamps
│   │   ├── FirstMileGateModal.tsx # Free-mile → purchase conversion modal
│   │   ├── ChallengePricing.tsx  # Pricing tiers with Stripe checkout CTA
│   │   ├── PassportStamp.tsx    # Stamp tile component
│   │   ├── MapPreview.tsx        # Leaflet map with milestone pins
│   │   ├── GroupChallenge.tsx    # Team create/join UI
│   │   ├── CompletionCertificate.tsx # Certificate display + download
│   │   ├── DigitalBib.tsx        # Race bib display
│   │   ├── LegacyGuide.tsx       # AI historical guide chat widget
│   │   ├── MilestoneMarker.tsx   # Individual milestone on route timeline
│   │   ├── PassportCheckpointMap.tsx # Map for passport checkpoint tab
│   │   ├── SiteNavigation.tsx    # Top nav bar
│   │   └── free-walk/           # Self-contained Free Walk mini-app
│   │       ├── FreeWalkApp.tsx
│   │       ├── ActiveWalkScreen.tsx
│   │       ├── FreeWalkPassport.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useMileLogging.ts      # Core mutation: log miles, unlock stamps, completion
│   │   ├── useActiveChallenge.ts  # Most recent user_challenge (global state)
│   │   ├── useDailyMilesLogged.ts # Daily limit tracking
│   │   ├── useEnrollmentStatus.ts # Enrollment check per challenge
│   │   ├── usePassportStamps.ts   # Stamp collection per challenge
│   │   ├── useChallengeBySlug.ts  # Challenge + milestones by URL slug
│   │   ├── useReferral.ts         # Referral code management
│   │   ├── useRateLimitCountdown.ts # Rate limit timer state
│   │   ├── useMilestoneAudio.ts   # ElevenLabs audio playback
│   │   ├── useGroupChallenge.ts   # Team management
│   │   └── useQueenNarration.ts   # Free Walk queen narration
│   │
│   ├── lib/
│   │   ├── utils.ts          # cn() class merge utility
│   │   └── health-sync.ts    # Apple Health / Google Fit sync utilities
│   │
│   ├── integrations/supabase/
│   │   ├── client.ts         # Supabase client (auto-generated, DO NOT edit)
│   │   └── types.ts          # Database TypeScript types (auto-generated, DO NOT edit)
│   │
│   └── index.css             # Global styles, design tokens (HSL CSS variables)
│
├── supabase/
│   ├── functions/            # Deno edge functions (auto-deployed)
│   │   ├── create-checkout/  # Stripe checkout session creation
│   │   ├── verify-payment/   # Post-payment enrollment (client redirect path)
│   │   ├── stripe-webhook/   # Fallback enrollment (server webhook path)
│   │   ├── check-milestone-unlocks/  # Stamp unlock logic for enrolled users
│   │   ├── generate-certificate/     # Completion certificate PNG generation
│   │   ├── generate-milestone-audio/ # ElevenLabs TTS for milestones
│   │   ├── generate-all-milestone-audio/ # Batch audio generation (admin)
│   │   ├── generate-stamp-image/     # AI stamp artwork generation
│   │   ├── generate-all-stamps/      # Batch stamp generation (admin)
│   │   ├── legacy-guide/             # AI historical guide (Lovable AI)
│   │   ├── send-certificate-email/   # Completion email via Resend
│   │   ├── send-stamp-email/         # Stamp unlock email via Resend
│   │   ├── send-bib-email/           # Bib number email via Resend
│   │   ├── create-team/              # Team creation
│   │   ├── join-team/                # Team join with invite code
│   │   ├── redeem-beta-code/         # Beta access code redemption
│   │   ├── redeem-reward-code/       # Referral reward redemption
│   │   ├── validate-challenge/       # Admin challenge validation
│   │   └── auth-email-hook/          # Custom Supabase auth email templates
│   │
│   ├── config.toml           # Edge function JWT config
│   └── migrations/           # SQL migration files (read-only)
│
├── public/                   # Static assets
├── tailwind.config.ts        # Design tokens + color palette
├── index.css                 # CSS custom properties (HSL design system)
└── vite.config.ts            # Vite + React + path aliases
\`\`\``,

"config/tech-stack.md": `# Technology Stack

## Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS (HSL design tokens, dark mode via CSS variables)
- shadcn/ui component library (Radix UI primitives)
- React Router v6 (lazy-loaded routes)
- TanStack Query v5 (server state management)
- Leaflet + react-leaflet (interactive maps)
- Framer Motion (animations — planned)
- Capacitor (iOS/Android native wrapper — in progress)

## Backend
- Supabase (PostgreSQL + Auth + Storage + Edge Functions + Realtime)
- Deno runtime for edge functions
- pg_net extension for async DB → edge function calls

## Payments
- Stripe Checkout (hosted payment page)
- Dual verification: verify-payment (client redirect) + stripe-webhook (fallback)
- Live mode price IDs hardcoded in create-checkout edge function

## AI & Media
- ElevenLabs TTS — milestone audio narration (connector-managed key)
- Lovable AI (google/gemini-2.5-flash) — legacy-guide historical AI chat
- html2canvas — completion certificate generation

## Email
- Resend — transactional emails (stamps, certificates, bibs)

## Design System
- Color palette: Black background, gold primary, cyan accent, muted warm grays
- All colors as HSL CSS variables in index.css + tailwind.config.ts
- Semantic tokens: --primary (gold), --accent (cyan), --background, --foreground, etc.`,

// ── ARCHITECTURE DIAGRAM ───────────────────────────────────────────────────────
"architecture/system-overview.md": `# LegacyFit System Architecture

\`\`\`
╔══════════════════════════════════════════════════════════════════╗
║                      USER'S BROWSER / APP                        ║
║                                                                  ║
║  ┌─────────────┐  ┌──────────────────┐  ┌───────────────────┐   ║
║  │  Landing /  │  │  Dashboard /     │  │  Challenge Route  │   ║
║  │  Marketing  │  │  Passport pages  │  │  /challenge/:slug │   ║
║  └──────┬──────┘  └────────┬─────────┘  └────────┬──────────┘   ║
║         │                  │                      │              ║
║         └──────────────────┼──────────────────────┘              ║
║                            │                                     ║
║              ┌─────────────▼──────────────┐                      ║
║              │   Supabase JS Client       │                      ║
║              │   (anon key, JWT auth)     │                      ║
║              └─────────────┬──────────────┘                      ║
╚════════════════════════════╪═════════════════════════════════════╝
                             │
         ┌───────────────────┼─────────────────────┐
         ▼                   ▼                     ▼
╔════════════════╗  ╔════════════════╗  ╔══════════════════════╗
║  Supabase Auth ║  ║  PostgreSQL DB ║  ║   Edge Functions     ║
║                ║  ║  (RLS-secured) ║  ║   (Deno runtime)     ║
║  - signup      ║  ║                ║  ║                      ║
║  - login       ║  ║  profiles      ║  ║  create-checkout ─►  Stripe
║  - JWT tokens  ║  ║  challenges    ║  ║  verify-payment  ◄─  Stripe redirect
║  - email hook  ║  ║  milestones    ║  ║  stripe-webhook  ◄─  Stripe webhook
╚════════════════╝  ║  mile_entries  ║  ║                      ║
                    ║  user_challenges║  ║  check-milestone-    ║
                    ║  user_passport_ ║  ║    unlocks           ║
                    ║    stamps       ║  ║  generate-           ║
                    ║  user_milestones║  ║    certificate  ─► Storage
                    ║  payments       ║  ║  generate-           ║
                    ║  teams          ║  ║    milestone-   ─► ElevenLabs
                    ║  team_members   ║  ║    audio        ─► Storage
                    ║  certificates   ║  ║  legacy-guide   ─► Lovable AI
                    ║  referral_codes ║  ║  send-*-email   ─► Resend
                    ║  reward_codes   ║  ╚══════════════════════╝
                    ╚════════════════╝
                            ▲
                    ┌───────┴──────────┐
                    │  DB Triggers     │
                    │                  │
                    │ handle_new_user  │ → creates profile + role on signup
                    │ generate_bib     │ → assigns "LF-XXXXX" bib number
                    │ validate_mile_   │ → enforces rate limits on INSERT
                    │   entry          │
                    │ trigger_         │ → calls generate-milestone-audio
                    │   milestone_     │    via pg_net when audio_url IS NULL
                    │   audio          │
                    └──────────────────┘

## Key Data Flows

### 1. Mile Logging (Enrolled User)
  Client → INSERT mile_entries (RLS validates enrollment)
         → validate_mile_entry() trigger (rate limits)
         → useMileLogging.ts calculates new total
         → UPDATE user_challenges.miles_logged
         → call check-milestone-unlocks edge fn
         → INSERT user_passport_stamps + user_milestones (for new unlocks)
         → fire-and-forget send-stamp-email
         → if total >= challenge.total_miles:
             UPDATE user_challenges.is_completed = true
             → call generate-certificate
             → call send-certificate-email

### 2. Free First-Mile Preview
  Client → INSERT mile_entries (RLS: no prior entries = allowed)
         → validate_mile_entry() trigger
         → Client fetches milestone WHERE miles_required = 1
         → INSERT user_passport_stamps (client-side, RLS allows for own user)
         → Show StampUnlockModal → FirstMileGateModal (purchase CTA)

### 3. Payment Flow
  Client → call create-checkout edge fn
         → Stripe hosted checkout (same tab)
         → Stripe redirects to /payment-success?session_id=...
         → verify-payment edge fn: validates JWT + session, UPSERT enrollment
  [Fallback]:
  Stripe → stripe-webhook edge fn (signature verified)
         → UPSERT user_challenges + payments (idempotent)

### 4. New User Signup
  Supabase Auth creates user →
  handle_new_user() trigger →
  INSERT profiles (display_name from metadata) +
  INSERT user_roles (role = 'user') +
  generate_bib_number() trigger → assigns bib
\`\`\``,
};

// ─── Component ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    label: "Frontend",
    icon: FileCode,
    color: "text-cyan",
    files: Object.keys(FILES).filter((f) => f.startsWith("frontend/")),
  },
  {
    label: "Backend / Edge Functions",
    icon: Zap,
    color: "text-primary",
    files: Object.keys(FILES).filter((f) => f.startsWith("backend/")),
  },
  {
    label: "Database",
    icon: Database,
    color: "text-green-400",
    files: Object.keys(FILES).filter((f) => f.startsWith("database/")),
  },
  {
    label: "Architecture",
    icon: GitBranch,
    color: "text-purple-400",
    files: Object.keys(FILES).filter((f) => f.startsWith("architecture/")),
  },
  {
    label: "Config",
    icon: Settings,
    color: "text-muted-foreground",
    files: Object.keys(FILES).filter((f) => f.startsWith("config/")),
  },
];

export default function Export() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleDownload = async () => {
    setIsBuilding(true);
    setIsDone(false);

    try {
      const zip = new JSZip();

      // Add all files
      for (const [path, content] of Object.entries(FILES)) {
        zip.file(`legacyfit-export/${path}`, content);
      }

      // Add a README at root
      zip.file(
        "legacyfit-export/README.md",
        `# LegacyFit Virtual Challenge — Project Export

Generated: ${new Date().toLocaleString()}

## Contents

| Folder         | Description |
|----------------|-------------|
| frontend/      | React pages, components, and hooks |
| backend/       | Supabase Edge Function summaries |
| database/      | Schema SQL, RLS policies, DB functions |
| architecture/  | System architecture diagram + data flow |
| config/        | Env template, tech stack, project structure |

## Notes
- Secrets/private keys are NOT included in this export.
- Edge function summaries point to the full source files in \`supabase/functions/\`.
- Hook summaries point to the full source files in \`src/hooks/\`.
- The full live codebase is managed via Lovable.
`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `legacyfit-export-${new Date().toISOString().split("T")[0]}.zip`);
      setIsDone(true);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Project Export</h1>
          </div>
          <p className="text-muted-foreground">
            Downloads a ZIP with architecture docs, schema, edge function summaries, and key
            frontend code — with no secrets or private keys included.
          </p>
        </div>

        {/* Contents preview */}
        <div className="space-y-4 mb-8">
          {SECTIONS.map(({ label, icon: Icon, color, files }) => (
            <Card key={label} className="bg-card border-border">
              <CardHeader className="pb-2 pt-4 px-5">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                  <Badge variant="outline" className="ml-auto text-xs font-normal">
                    {files.length} files
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <ul className="space-y-1">
                  {files.map((f) => (
                    <li key={f} className="text-xs text-muted-foreground font-mono truncate">
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Download button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            className="w-full max-w-sm h-14 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleDownload}
            disabled={isBuilding}
          >
            {isBuilding ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Building ZIP...
              </>
            ) : isDone ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download ZIP
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            {Object.keys(FILES).length} files · No secrets included
          </p>
        </div>
      </div>
    </div>
  );
}
