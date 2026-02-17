

## Completion Certificate, Digital BIB, and Email Delivery

### Overview
Three new features: (1) a unique AI-generated completion certificate emailed when a participant finishes a challenge, (2) a digital BIB card issued upon signup and displayed in the dashboard, and (3) an email with the BIB sent at registration.

---

### 1. Digital BIB Card

**What it does**: When a user signs up, they already get a `bib_number` (e.g., `LF-00711`) via the existing `generate_bib_number` database trigger. We will create a visual BIB component styled like a race bib -- dark/gold theme with the LegacyFit logo, user name, and bib number.

**New component**: `src/components/DigitalBib.tsx`
- Displays a styled race bib card with:
  - LegacyFit logo (from `src/assets/legacyfit-logo.png`)
  - User's display name
  - BIB number in large bold text
  - "LegacyFit Virtual Challenge" subtitle
  - Gold border, dark background, matching brand aesthetic
- Includes a "Download BIB" button that captures the card as an image (using html-to-canvas or a simple SVG approach)

**Dashboard integration**: Add the digital BIB to `src/pages/Dashboard.tsx` -- show it prominently in a collapsible section or card near the top.

---

### 2. BIB Email on Signup

**New edge function**: `supabase/functions/send-bib-email/index.ts`
- Sends a branded HTML email with the user's BIB number, display name, and LegacyFit branding
- Styled similarly to the existing stamp email (dark theme, gold accents, LegacyFit branding)
- Called from the existing `handle_new_user` database trigger (via a new database trigger that fires after profile creation), or invoked from the auth flow in the frontend after signup

**Trigger approach**: Create a new database function + trigger on the `profiles` table that fires on INSERT and calls the edge function with the new user's bib number and email. Alternatively, call from the frontend Auth page after successful signup for simplicity.

**Chosen approach**: Frontend-triggered -- after successful signup and profile creation, invoke the edge function from the Auth page. This is simpler and avoids modifying auth triggers.

---

### 3. Completion Certificate

**New edge function**: `supabase/functions/generate-certificate/index.ts`
- Uses the Lovable AI image generation API (same pattern as `generate-stamp-image`) to create a unique certificate
- Prompt includes: LegacyFit branding, challenge name, user name, total miles, completion date, ornate/prestigious design
- Stores the generated image URL in a new `certificates` table

**New edge function**: `supabase/functions/send-certificate-email/index.ts`
- Sends a branded HTML email with the certificate image, congratulations message, and challenge details
- Similar structure to the stamp email

**New database table**: `certificates`
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL)
- `challenge_id` (uuid, NOT NULL)
- `image_url` (text) -- URL of the AI-generated certificate
- `created_at` (timestamptz)
- RLS: users can view their own certificates

**Completion detection**: Modify the mile logging flow. After logging miles, if `miles_logged >= challenge.total_miles` and `is_completed` is false, mark the challenge as completed and trigger certificate generation + email.

**New component**: `src/components/CompletionCertificate.tsx`
- Displays the certificate in a modal or card when a user completes a challenge
- Shows the AI-generated certificate image with share/download options

---

### 4. Integration into Mile Logging Flow

Update `src/hooks/useMileLogging.ts` (or the check-milestone-unlocks edge function):
- After miles are logged, check if `total miles logged >= challenge total miles`
- If completed: update `user_challenges` set `is_completed = true`, `completed_at = now()`
- Call `generate-certificate` edge function
- Call `send-certificate-email` edge function
- Show `CompletionCertificate` modal in the UI

---

### Files to Create
1. `src/components/DigitalBib.tsx` -- visual BIB card component
2. `src/components/CompletionCertificate.tsx` -- certificate display component
3. `supabase/functions/send-bib-email/index.ts` -- BIB welcome email
4. `supabase/functions/generate-certificate/index.ts` -- AI certificate generation
5. `supabase/functions/send-certificate-email/index.ts` -- certificate email delivery
6. Database migration for `certificates` table

### Files to Modify
1. `src/pages/Dashboard.tsx` -- add Digital BIB section
2. `src/pages/ChallengeRoute.tsx` -- show certificate for completed challenges
3. `src/hooks/useMileLogging.ts` -- trigger completion flow
4. `supabase/config.toml` -- register new edge functions

### Dependencies
- Uses existing Lovable AI gateway for image generation (LOVABLE_API_KEY already configured)
- Uses Resend for email delivery (RESEND_API_KEY -- needs to be checked/added)

