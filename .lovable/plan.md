
## Goal
Transform the `FreeWalkPassport` to match the Women's History Edition visual language, with two key upgrades:
1. **Locked stamps** show the image in **full color but blurred** (instead of grayscale) — protecting against printing while still teasing the art
2. **Background** uses a parchment/aged passport paper aesthetic with postal cancellation marks (matching the stamp reference image provided)

---

## What Changes

### 1. `src/components/free-walk/FreeWalkPassport.tsx` — Primary changes

**Locked stamp treatment (per user request):**
- Remove `grayscale` class
- Add `blur-sm` (CSS blur ~4px) so color is visible but image cannot be printed or clearly read
- Keep the lock icon overlay and mileage label on top

**Background — Parchment passport aesthetic:**
Replace the plain `bg-background/95` full-screen overlay with a layered passport page look:
- Outer wrapper: `bg-[#f5ead8]` (warm parchment/cream tone) — this is the aged paper color seen in the reference image
- Decorative postal cancellation lines (CSS/SVG stripes pattern) in the header area
- Corner decorative elements (small circles mimicking stamp registration marks)
- The stamp grid cells get a `border-dashed border-amber-900/30` treatment on a `bg-[#ede0c4]` base to evoke a passport booklet page
- Text colors flip to dark (`text-amber-950`, `text-amber-800`) since the background is now light/parchment

**Specific visual treatments:**

| Element | Current | New |
|---------|---------|-----|
| Full-screen bg | `bg-background/95` dark | `bg-[#f0e6ce]` parchment |
| Header bar | Dark `bg-background/90` | Warm `bg-[#e8d9b8]` with bottom border `border-amber-900/30` |
| Header text | Light foreground | `text-amber-950` dark ink |
| Progress card | `bg-primary/10` dark gradient | `bg-[#e0ceaa]/60 border-amber-800/30` |
| Locked stamp img | `grayscale opacity-40` | `blur-sm opacity-80` (full color, blurred) |
| Locked overlay | `bg-background/10` dark | `bg-amber-950/10` light tint |
| Lock icon | `text-white/70` | `text-amber-950/70` |
| Stamp cell border | `border-border/40` dark | `border-amber-800/40 border-dashed` |
| Unlocked border | `border-primary/60` | `border-amber-700 shadow-amber-800/30` |
| EARNED badge | `bg-primary` | `bg-amber-700 text-amber-50` |
| Close button | Light foreground | `text-amber-900 hover:text-amber-950` |
| Postal decoration | None | SVG wavy cancel lines in header top-right area |

**Postal cancellation marks decoration:**
Add a small inline SVG in the header region (top-right corner) mimicking the cancellation stripes seen in the reference image — parallel diagonal lines at low opacity. Pure CSS, no new dependencies.

**Corner registration marks:**
Small `○` circles in each corner of the passport page, styled as faint ink marks (`text-amber-800/20`), matching the reference image's decorative corner stamps.

### 2. `src/components/PassportStamp.tsx` — Sync the Women's History Edition locked behavior

The Women's History Edition currently uses `grayscale opacity-40` for locked stamps. Per the user's request, update the locked state here too:
- Change from `grayscale opacity-40` → `blur-sm opacity-80` (full color + blur)
- This ensures **all** stamps across both systems follow the same anti-print protection pattern

---

## Visual Reference (from attached image)

The attached stamp shows a vintage ink-seal design on aged parchment with:
- Warm beige/tan `#f0e6ce` paper background
- Faint horizontal postal cancellation lines (top-right)
- Small circular registration marks in corners
- Dark navy/brown ink tones

The LegacyFit Free Walk passport will adapt this in brand colors (gold/amber instead of navy) while keeping the same aged-paper texture feeling through CSS background gradients and patterns.

---

## Files Changed

1. **`src/components/free-walk/FreeWalkPassport.tsx`** — Full parchment redesign + blur-not-grayscale locked stamps
2. **`src/components/PassportStamp.tsx`** — Update locked stamp from grayscale → blur to sync both systems

No new dependencies, no database changes, no migrations needed.
