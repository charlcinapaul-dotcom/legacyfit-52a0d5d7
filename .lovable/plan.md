
## What Needs to Happen

The 13 new challenges all have `image_url = null` in the database, so the hero backdrop on `/challenge/:slug` falls back to a generic Unsplash photo (`line 182` of `ChallengeRoute.tsx`). The fix is to:

1. **Update `supabase/functions/generate-challenge-images/index.ts`** — add thematic AI prompts for all 13 new slugs so the function knows how to generate images for them.
2. **Add a "Generate Challenge Images" button to `AdminValidate.tsx`** — so the admin can trigger the edge function from the UI with one click. The function already handles uploading to `challenge-images` storage and updating `challenges.image_url` in the database. Once run, all 13 challenges will have their `image_url` populated and the hero backdrop will display correctly.

---

## The 13 New Prompts

Each prompt is tailored to the specific person/journey:

| Slug | Thematic Visual |
|---|---|
| `madam-cj-walker` | Hair care products, Victorian-era beauty salon, early 20th century entrepreneurship, warm gold tones |
| `charles-drew` | Blood plasma vials, Red Cross, medical laboratory, warm red and white tones |
| `mae-jemison` | Space shuttle launch, stars and Earth from orbit, STEM symbols, deep blues and cosmic purples |
| `daniel-hale-williams` | Surgical operating room, heart anatomy, pioneering medicine, cool blues and whites |
| `patricia-bath` | Laser light and eye diagrams, medical patents, inventor's lab, bright blues and whites |
| `harriet-pickens` | Naval uniform, American flag, ocean and ships, navy blues and gold |
| `benjamin-o-davis-sr` | Military medals and stars, WWII era, Tuskegee airfields, olive greens and golds |
| `willa-brown` | Vintage biplane in flight, open blue sky, aviator goggles and scarf, clear sky blues |
| `cornelius-coffey` | Aircraft engine mechanics, propeller planes, Harlem Airport hangar, industrial warmth |
| `jane-bolin` | Law books and justice scales, New York City courthouse, dignified navy and gold tones |
| `constance-baker-motley` | U.S. Supreme Court steps, NAACP, civil rights march, deep burgundy and marble white |
| `garrett-morgan` | Traffic signal invention, safety hood, Cleveland cityscape, amber and industrial tones |
| `matthew-henson` | Arctic polar expedition, dog sled, ice floes, North Pole flag, cool whites and blues |

---

## Files to Change

### 1. `supabase/functions/generate-challenge-images/index.ts`
Add 13 new entries to `challengeImagePrompts` record covering the new slugs.

### 2. `src/pages/AdminValidate.tsx`
Add a "Generate Challenge Images" section/button that calls the `generate-challenge-images` edge function and shows progress. This gives the admin a one-click way to trigger image generation for all challenges missing `image_url`, without needing to use the Supabase dashboard directly.

---

## How It Works End-to-End

1. Admin clicks "Generate Challenge Images" on `/admin/validate`
2. Front-end calls `generate-challenge-images` edge function (admin-auth gated)
3. Function loops through challenges, skips ones that already have `image_url`, generates AI images for the 13 new ones
4. Each image is uploaded to `challenge-images` storage bucket and `challenges.image_url` is updated
5. On next page load, `/challenge/madam-cj-walker` (etc.) renders the thematic backdrop instead of the Unsplash fallback

No database schema changes needed — `image_url` column already exists on the `challenges` table.
