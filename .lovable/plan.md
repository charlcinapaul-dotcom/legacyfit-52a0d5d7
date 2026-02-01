
# Connect Database Challenges to Frontend Routes

## Overview
The frontend routing system (`/challenge/:slug`) currently uses hardcoded data in `ChallengeRoute.tsx`, while the database contains real challenge and milestone data with AI-generated stamps. This plan connects these systems so all challenge data flows from the database.

## Current State Analysis

### Frontend (Hardcoded)
- `ChallengeRoute.tsx`: Contains 10 challenges in a `challengeData` object, accessed by slug (e.g., "malala", "toni")
- `Landing.tsx`: Lists 9 Women's History challenges + 1 Pride challenge with hardcoded slugs and miles

### Database (Dynamic)
- `challenges` table: Has 3 records (Toni Morrison, Malala, Maya) with UUIDs - **no slug column**
- `milestones` table: Has 18 milestone records with stamp images
- `usePassportStamps.ts`: Already fetches milestones and challenges from database

### The Gap
Routes use slugs like `/challenge/malala`, but the database has no way to resolve these slugs to challenge records.

---

## Implementation Plan

### Step 1: Add Slug Column to Database
Add a `slug` column to the `challenges` table and update existing records.

**SQL Migration:**
```sql
ALTER TABLE public.challenges
ADD COLUMN slug text UNIQUE;

-- Update existing challenges with slugs
UPDATE public.challenges SET slug = 'toni' WHERE title ILIKE '%toni%';
UPDATE public.challenges SET slug = 'malala' WHERE title ILIKE '%malala%';
UPDATE public.challenges SET slug = 'maya' WHERE title ILIKE '%maya%';
```

### Step 2: Create Database Hook for Challenge Routes
Create a new hook `useChallengeBySlug` in `src/hooks/useChallengeBySlug.ts`.

**Features:**
- Fetch challenge by slug from database
- Fetch associated milestones
- Return combined data in the format expected by `ChallengeRoute`
- Handle loading and error states

### Step 3: Refactor ChallengeRoute.tsx
Replace hardcoded `challengeData` object with database queries.

**Changes:**
- Use `useChallengeBySlug(slug)` hook
- Keep color/theme logic as configuration (can be stored in DB later or derived from edition)
- Keep user progress logic (mock data for now, but structure supports real data)
- Add loading skeleton while fetching
- Maintain fallback for challenges not yet in database

### Step 4: Update Challenge Data Structure
Ensure database milestones match the expected structure:

| Frontend Field | Database Column |
|----------------|-----------------|
| `name` | `stamp_title` or `title` |
| `miles` | `miles_required` |
| `location` | `location_name` |
| `description` | `stamp_copy` or `description` |

### Step 5: Seed Remaining Challenges (Future)
The database currently has 3 of 10 challenges. The remaining 7 can be seeded later:
- Wilma Rudolph (42 mi)
- Eleanor Roosevelt (50 mi)
- Sojourner Truth (35 mi)
- Ida B. Wells (40 mi)
- Fannie Lou Hamer (32 mi)
- Katherine Johnson (38 mi)
- Pride History (50 mi)

---

## File Changes Summary

| File | Action |
|------|--------|
| `supabase/migrations/` | New migration for slug column |
| `src/hooks/useChallengeBySlug.ts` | New hook file |
| `src/pages/ChallengeRoute.tsx` | Refactor to use database |
| `src/integrations/supabase/types.ts` | Auto-updated after migration |

---

## Technical Details

### New Hook: useChallengeBySlug.ts
```typescript
export function useChallengeBySlug(slug: string | undefined) {
  // Query challenge by slug
  // Query milestones by challenge_id
  // Return combined data with loading/error states
}
```

### ChallengeRoute Changes
- Keep `getColorStyles()` helper (theme configuration)
- Remove hardcoded `challengeData` object
- Add conditional rendering for loading state
- Fallback to "Challenge Not Found" if slug doesn't exist in DB

### Backward Compatibility
- Challenges not in database will show "Challenge Not Found"
- Landing page links remain functional for seeded challenges
- Passport page continues working (already uses database)

---

## Benefits
1. Single source of truth for all challenge data
2. AI-generated stamp images display on challenge route pages
3. Real milestone data shown to users
4. Easy to add new challenges via database without code changes
5. User progress can be connected to real `user_challenges` and `mile_entries` tables
