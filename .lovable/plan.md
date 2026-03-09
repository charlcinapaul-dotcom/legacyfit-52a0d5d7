
## Root Cause

Two bugs in `StampGridBackground.tsx`:

**1. Overlapping stamps:**
The cell div uses `aspect-square` while the grid uses `grid-rows-4 h-full`. These two constraints fight each other. `aspect-square` forces each cell to be as tall as it is wide (~1/6 of viewport width), but `grid-rows-4 h-full` forces the grid to stretch to full container height and distributes rows evenly. The cell's intrinsic `aspect-square` size and the grid's forced row height don't agree — cells overflow their grid tracks and overlap neighbors.

**Fix:** Remove `aspect-square` from the cell. The grid already distributes rows via `grid-rows-4 h-full`, so cells will naturally fill their track. No need for `aspect-square` at all.

**2. One stamp different size:**
The query fetches stamps filtered by `stamp_image_url IS NOT NULL` and ordered by `order_index`, then wraps with `i % stamps.length`. If fewer than 24 stamps exist in the DB (e.g. 23), the modulo wraps one slot back to index 0 — that stamp gets rendered twice. One of the two copies of the same stamp might have a different rendered dimension due to its natural image dimensions conflicting with the cell size.

More likely: with `aspect-square` removed but `object-contain` kept, stamp images that have different natural aspect ratios (e.g. one that is more rectangular) will render at a different visible size within the cell. The fix is `object-cover` so every image fills its cell identically regardless of source dimensions — OR keep `object-contain` but give all cells identical dimensions via the grid layout.

**Combined Fix:**
- Remove `aspect-square` from the cell `div` — cells size to grid track height
- Add `w-full h-full` explicitly to the cell `div` to ensure it fills its grid track completely
- Keep `object-contain` on img with `w-full h-full` — stamps are circular PNGs so `object-contain` keeps them correctly proportioned inside a square cell

### Exact Change — `src/components/StampGridBackground.tsx`

**Line 31:** Change cell div from:
```tsx
<div key={i} className="aspect-square bg-black overflow-hidden">
```
To:
```tsx
<div key={i} className="bg-black overflow-hidden w-full h-full">
```

That's the only change needed. The grid is `grid-cols-6 grid-rows-4 h-full w-full` — each of the 24 cells will occupy exactly 1/6 width × 1/4 height of the container, evenly, with no overlap and uniform sizing.

### Files to Change
- `src/components/StampGridBackground.tsx` — remove `aspect-square`, add `w-full h-full` on cell div (line 31 only)
