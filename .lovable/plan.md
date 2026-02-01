
# Digital Passport Stamps - Full Implementation Plan

## Overview
Build a complete Digital Passport system with AI-generated unique passport-style stamps that unlock automatically at mileage milestones. Includes a Passport view page, milestone unlock logic, email delivery, and in-app animations.

## Database Changes

### 1. Update `milestones` Table
Add stamp metadata fields to existing milestones table:
```sql
ALTER TABLE milestones ADD COLUMN stamp_title VARCHAR(100);
ALTER TABLE milestones ADD COLUMN stamp_copy TEXT;
ALTER TABLE milestones ADD COLUMN stamp_mileage_display VARCHAR(20);
```

### 2. Create `passport_stamp_images` Table
Store AI-generated stamp images:
```sql
CREATE TABLE passport_stamp_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(milestone_id)
);
```

### 3. Enable RLS Policies
- `passport_stamp_images`: Read-only for authenticated users
- `user_passport_stamps`: Users can only read their own stamps

---

## Components to Create

### 1. Passport Page (`src/pages/Passport.tsx`)
Main passport view displaying all earned stamps in a passport book aesthetic:
- Gold/leather-textured background
- Grid of stamp slots (locked vs unlocked states)
- Filter by challenge/edition
- Stamp details modal on click
- Progress indicator showing stamps earned vs total

### 2. Stamp Component (`src/components/PassportStamp.tsx`)
Individual stamp display component:
- Locked state: Grayscale silhouette with "?" and required miles
- Unlocked state: Full-color AI-generated stamp with animation
- Click to view details modal

### 3. Stamp Unlock Modal (`src/components/StampUnlockModal.tsx`)
Celebratory modal when stamp is earned:
- Animated stamp "thunk" effect
- Stamp image with glow
- Milestone name + mileage achieved
- "You're building your LegacyFit legacy" message
- Share button option

### 4. Mile Logging Component (`src/components/MileLogger.tsx`)
Quick mile entry with presets:
- Quick buttons: 1, 3, 5, 10 miles
- Custom entry slider/input
- Activity type selector (walk, run, jog)
- Notes field
- On submit: Triggers stamp unlock check

---

## Edge Functions

### 1. `generate-stamp-image` Function
Generate unique passport-style stamps using AI:
```typescript
// Uses Lovable AI (google/gemini-2.5-flash-image) 
// Prompt includes: vintage passport stamp aesthetic, 
// transparent background, milestone name, mileage, 
// LegacyFit branding
```

**Stamp Design Specs:**
- Style: Vintage passport/travel stamp
- Elements: Circular or rectangular worn edges, postal marks
- Content: Milestone title, location, mileage number, LegacyFit branding
- Format: PNG with transparency

### 2. `check-milestone-unlocks` Function
Called after mile logging to check for new unlocks:
```typescript
// 1. Get user's total miles for challenge
// 2. Get all milestones for challenge
// 3. Find milestones where miles_required <= user_total_miles
// 4. Check which haven't been unlocked yet
// 5. Insert new records into user_passport_stamps
// 6. Return list of newly unlocked stamps
```

### 3. `send-stamp-email` Function
Send congratulatory email with stamp image:
```typescript
// Uses Resend API
// Subject: "You Earned a LegacyFit Passport Stamp!"
// Body: Stamp image, milestone name, mileage, encouragement
```

**Note:** Will need RESEND_API_KEY secret configured.

---

## Toni Morrison Stamp Data

| Mile | Stamp Title | Stamp Copy | Location |
|------|-------------|------------|----------|
| 0 (unlocks at 1) | Lorain, Ohio | Birthplace - Where a literary giant began | Ohio |
| 9 | Howard University | English & Classics - Finding her literary voice | Washington D.C. |
| 18 | Random House | First Black Female Editor - Changing the publishing world | New York |
| 27 | The Bluest Eye | First Novel Published - A new voice in literature | New York City, NY |
| 36 | Beloved | Pulitzer Prize Winner - Storytelling that reshaped history | Columbia University, NYC |
| 44 | Nobel Prize | Nobel Laureate - A legacy written in truth | Stockholm |

---

## Implementation Flow

```text
User logs miles
       |
       v
+------------------+
| Mile Entry Saved |
| to mile_entries  |
+------------------+
       |
       v
+------------------------+
| check-milestone-unlocks |
| Edge Function called   |
+------------------------+
       |
       v
+-------------------+     +--------------------+
| New stamps found? |---->| Insert into        |
| Yes               |     | user_passport_stamps|
+-------------------+     +--------------------+
       |                          |
       v                          v
+------------------+    +-------------------+
| Return unlocked  |    | send-stamp-email  |
| stamps to client |    | for each stamp    |
+------------------+    +-------------------+
       |
       v
+--------------------+
| Show StampUnlock   |
| Modal + toast      |
+--------------------+
```

---

## File Structure

```
src/
  pages/
    Passport.tsx (NEW)
  components/
    PassportStamp.tsx (NEW)
    StampUnlockModal.tsx (NEW)
    MileLogger.tsx (NEW)
  hooks/
    usePassportStamps.ts (NEW)
    useMileLogging.ts (NEW)
  lib/
    stamp-utils.ts (NEW)

supabase/functions/
  generate-stamp-image/index.ts (NEW)
  check-milestone-unlocks/index.ts (NEW)
  send-stamp-email/index.ts (NEW)
```

---

## Route Addition

Add to `src/App.tsx`:
```tsx
<Route path="/passport" element={<Passport />} />
```

---

## Technical Notes

### AI Image Generation
Using Lovable AI's `google/gemini-2.5-flash-image` model:
- No additional API key required
- Generates unique vintage passport stamp images
- Each stamp will be visually distinct based on milestone content
- Prompt engineering for consistent style across all stamps

### Retroactive Unlock Logic
When a user logs multiple miles at once (e.g., logs 10 miles when stamps exist at 1, 5, and 10):
- Query all milestones with `miles_required <= new_total_miles`
- Filter out already-unlocked stamps
- Unlock all applicable stamps in single transaction
- Send email for each newly unlocked stamp

### Email Delivery Requirements
- Will require RESEND_API_KEY secret to be configured
- User must have verified email domain on Resend
- Email includes embedded stamp image, milestone details, and branding

---

## Dependencies
- Existing: Supabase client, sonner (toasts), lucide-react
- New secret needed: RESEND_API_KEY (for email delivery)
