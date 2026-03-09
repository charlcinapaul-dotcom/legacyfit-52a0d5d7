## Fix: Stamp Grid — 6 Columns × 4 Rows, Completely Static

### What the user wants

The reference shows **6 columns × 4 rows = 24 stamps**, each stamp large and clearly visible, filling the hero with no movement whatsoever. Nothing else changes

### Root Causes of Current Problems

**Movement / shifting on refresh:**

- `if (!stamps?.length) return null` — the entire component unmounts on first render (no stamps yet), then mounts again when data loads. This causes a layout shift/flash every page load.
- React Query re-renders can subtly trigger DOM changes.

**Wrong size — stamps too small:**

- `grid-cols-6 md:grid-cols-8` with `grid-rows-10` forces 80 stamps into a 10-row grid. Each cell ends up tiny.
- The user wants 6 cols × 4 rows = 24 cells, large stamps.

### Fix

`**src/components/StampGridBackground.tsx`:**

1. `GRID_COUNT = 24` (6 × 4)
2. Query limit → `24`
3. Remove `if (!stamps?.length) return null` — render a static black grid immediately; stamp images layer in when loaded (no layout shift)
4. Grid classes: `grid-cols-6` only (no `md:grid-cols-8`), `grid-rows-4` (not `grid-rows-10`)
5. Cell: `aspect-square bg-black overflow-hidden` — square cells sized by column width
6. Remove `absolute inset-0` from the inner grid div — let the grid size naturally to 6 cols × 4 rows. The outer wrapper stays `absolute inset-0` to anchor it.
7. Add `fetchpriority="high"` to images to avoid lazy-load flicker

`**tailwind.config.ts`:**

- Add `"4": "repeat(4, minmax(0, 1fr))"` to `gridTemplateRows` (alongside the existing `"10"`)

`**src/pages/Landing.tsx`:**

- No changes needed — hero section already has `relative overflow-hidden`

### Grid math check

```
6 cols × 4 rows = 24 stamps
Each stamp = (100vw / 6) wide ≈ ~167px on 1000px screen — large and visible ✓
Hero height ~420px → 4 rows × ~167px = ~668px → slightly overflows, which is correct (fills hero) ✓
```

### Files to Change

- `src/components/StampGridBackground.tsx` — GRID_COUNT=24, grid-cols-6, grid-rows-4, remove conditional null return
- `tailwind.config.ts` — add gridTemplateRows "4"

&nbsp;