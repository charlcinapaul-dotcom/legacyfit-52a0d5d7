
## Goal
Update `generate-all-stamps` to:
1. **Scope to the 13 new challenges only** — join milestones with challenges and filter by the 13 new slugs (madam-cj-walker, charles-drew, mae-jemison, daniel-hale-williams, patricia-bath, harriet-pickens, benjamin-o-davis-sr, willa-brown, cornelius-coffey, jane-bolin, constance-baker-motley, garrett-morgan, matthew-henson)
2. **Use the exact storage upload pattern** from `generate-challenge-images` — decode base64 → binary → upload to `challenge-images` bucket as `stamps/<milestoneId>.png` → store public URL
3. **Use the precise vintage stamp prompt** matching the existing stamp design spec
4. **Use `google/gemini-3-pro-image-preview`** (same model as challenge cover images)
5. **Batch limit of 10** per invocation (stay within 150s timeout)
6. Add a **"Generate Passport Stamps"** section to `AdminValidate.tsx` mirroring the existing "Generate Challenge Images" block

---

## Stamp Prompt (locked to match existing stamps)

```
A single vintage passport stamp — circular shape, white/transparent background.

Outer ring: double concentric border (thin inner rule, thicker outer rule).
Between the rings: wheat or laurel wreath decorating the top arc; descriptive text
  "${milestone.stamp_copy || milestone.title}" curved along the bottom arc in small
  serif capitals; "LEGACYFIT" credit centered at the very bottom edge of the outer ring.
Center field: bold serif all-caps name "${milestone.stamp_title || milestone.title}"
  as the dominant text; one line below in smaller text:
  "${milestone.location_name || "Journey Milestone"}";
  a rectangular ribbon/banner across the lower center reading
  "${milestone.miles_required} MILES".

Ink color: deep navy blue OR burgundy red — single ink color, aged appearance.
Distressed look: uneven ink coverage, slight bleed, worn edges — rubber-stamped feel.
No photographic elements — pure illustrative stamp graphic.
Square canvas, stamp centered, transparent/white background.
```

---

## Files Changed

**`supabase/functions/generate-all-stamps/index.ts`**
- Join milestones to challenges: `milestones!inner(*, challenges!inner(slug))` filtered to the 13 new challenge slugs using `.in("challenges.slug", [13 slugs])` — only milestones where `stamp_image_url IS NULL`
- Add `stamp_title` to the select fields (used in prompt)
- Replace the vague existing prompt with the precise vintage circular stamp prompt above
- Replace direct base64 DB write with: decode base64 → `Uint8Array` → `supabase.storage.from('challenge-images').upload('stamps/<milestoneId>.png', binary, { upsert: true })` → `getPublicUrl` → store that URL
- Change model from `google/gemini-2.5-flash-image` → `google/gemini-3-pro-image-preview`
- Change default limit from `50` → `10`

**`src/pages/AdminValidate.tsx`**
- Add `stampGenLoading` and `stampGenResults` state vars (same shape as `imageGenResults`)
- Add `generateStamps()` handler — calls `generate-all-stamps` with `{ limit: 10 }` and admin Bearer token; mirrors `generateImages()` exactly
- Add a new section at line 587 (after the close of "Generate Challenge Images", before `</main>`) with:
  - Heading "Generate Passport Stamps" with a `Stamp` icon (use `Award` from lucide-react)
  - Description: "Generates AI vintage circular passport stamps for all 13 Black Pioneers challenge milestones that are currently missing one. Runs in batches of 10 — click multiple times to complete all 78 milestones. Already-stamped milestones are skipped."
  - Button "Generate Missing Stamps (batch of 10)"
  - Results list showing milestone title, pass/fail badge, and "View stamp" link — same structure as image gen results
