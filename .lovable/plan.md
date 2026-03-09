
## Fix: Hero Stamp Grid Alignment

### Root Cause
The `StampGridBackground` grid has three compounding issues:
1. **`p-1` padding** on each cell creates visible dark borders/seams between stamps
2. **Grid row height** isn't forced to fill — on different screen heights the 4-row grid (desktop) or 6-row grid (mobile) doesn't distribute evenly, causing rows to collapse
3. **`object-contain`** leaves empty space since stamps are circular images on transparent PNGs — the transparent corners show through as dark gaps

### Fix Plan

**1. Remove cell padding** — change `p-1` to `p-0` so stamps tile edge-to-edge with no seam

**2. Force rows to fill height** — add `auto-rows-fr` (fractional rows) so every row takes equal height regardless of total content height. Since stamps are square, also set `aspect-square` at cell level and make the outer grid use `content-stretch`

**3. Increase grid count per breakpoint** — 24 cells may not be enough to fill the full hero height on tall screens. Bump to 48 cells (mobile 4×12, desktop 6×8) to guarantee full coverage

**4. Fix image sizing** — switch from `w-full h-full object-contain` to `w-full h-full object-cover` so the circular stamp fills each cell without transparent-corner gaps. Since the stamps are on transparent PNGs, the better fix is to keep `object-contain` but ensure each cell has a matching parchment/neutral background to fill any gaps, or alternatively use `scale-110` to slightly overflow and hide corners

**Exact changes to `StampGridBackground.tsx`:**
- `GRID_COUNT` → 48
- Remove `p-1` from cell div
- Add `grid-rows-[repeat(12,1fr)] md:grid-rows-[repeat(8,1fr)]` to the grid div so rows distribute evenly
- Keep `object-contain` but set cell background to a neutral dark so transparent PNG corners don't show white

### Files to Change
- `src/components/StampGridBackground.tsx` — grid count, cell padding, row sizing
