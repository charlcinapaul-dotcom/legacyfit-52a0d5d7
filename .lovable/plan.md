
## What the user means

The Women's History Edition stamps are **unique per milestone** — each of the 6 milestones in a challenge has a distinct stamp image embedding that specific pioneer's name, the exact mileage, and the historical location. This is already what `generate-all-stamps` attempts to do (it passes `displayName`, `locationLine`, `mileageBanner` into the prompt per milestone). 

The problem is purely **visual**: the prompt says `"white background"` twice, producing flat white squares instead of the vintage parchment aesthetic. The local free-walk PNGs (sojourner-truth.png, etc.) are the reference for what the finished stamps should *look like* — deep navy/burgundy ink on aged parchment (#F5EDD8 warm cream) — not assets to be reused directly.

## Fix — 2 targeted changes only

### 1. Update the prompt in `supabase/functions/generate-all-stamps/index.ts`
Replace the two "white background" occurrences with aged parchment background matching the Women's History Edition style:

**Line 151** — change:
```
A single vintage passport stamp — circular shape, white background.
```
to:
```
A single vintage passport stamp — circular shape, aged parchment paper background (#F5EDD8 warm cream).
```

**Line 160** — change:
```
Square canvas, stamp centered on a white background.
```
to:
```
Square canvas on aged parchment paper (#F5EDD8 warm cream). The entire canvas must use the warm cream/tan parchment texture — no white, no grey, no transparent areas. Style must match vintage hand-crafted passport stamp artwork.
```

This ensures each generated stamp is:
- **Unique to the person** — `displayName` (e.g. "Madam C.J. Walker") is the dominant center text
- **Unique to the mile** — `mileageBanner` (e.g. "5 MILES") is in the ribbon banner
- **Unique to the location** — `locationLine` (e.g. "Indianapolis, Indiana") appears below the name
- On a **vintage parchment background** matching the Women's History Edition aesthetic

### 2. Add `bg-[#F5EDD8] rounded-lg` to stamp image containers in `PassportStamp.tsx`
For already-generated stamps with white backgrounds stored in the bucket, the parchment container background makes them visually consistent while the admin re-generates them:
- Line 29 (unlocked img `div` wrapper): add `bg-[#F5EDD8]`
- Line 58 (locked img `div` wrapper): add `bg-[#F5EDD8]`

### 3. Admin action needed (no code change)
After deployment, the admin goes to `/admin/validate` and uses the existing "Reset Stamp Images" / null-out capability to clear `stamp_image_url` for the 13 Pioneer challenge milestones, then re-triggers `generate-all-stamps`. The updated prompt will produce parchment-background stamps unique per person/mile/location.

### Files to change
1. `supabase/functions/generate-all-stamps/index.ts` — 2 prompt lines (151 and 160)
2. `src/components/PassportStamp.tsx` — add `bg-[#F5EDD8]` to 2 img wrapper divs (lines 29, 58)

No new files, no database changes, no new hooks.
