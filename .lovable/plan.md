
## Root Cause

The hero `<section>` has no explicit height — it's only as tall as its padding + content (`pt-16 pb-20`). The `StampGridBackground` uses `absolute inset-0` so it fills that short section, leaving large empty areas.

Looking at the screenshot: the stamps should tile across the **full viewport height** of the hero, with the content centered in the middle — exactly like The Conqueror layout.

Two issues to fix:

**1. Hero section needs `min-h-screen`**  
Add `min-h-screen` to the hero `<section>` in `Landing.tsx` so it fills the full viewport. Content should be vertically centered inside it.

**2. Cell `aspect-square` must be removed**  
The `aspect-square` class on each grid cell (line 31 of `StampGridBackground.tsx`) conflicts with `grid-rows-3 h-full`. Each cell forces itself to be square (1/6 viewport width tall), then the 3 rows of squares don't fill the full height — leaving gaps. Removing `aspect-square` and using `w-full h-full` lets the grid distribute rows evenly across the full height.

### Changes

**`src/pages/Landing.tsx` — line 35:**
```
// From:
<section className="relative pt-16 pb-20 px-4 overflow-hidden w-full max-w-full">

// To:
<section className="relative min-h-screen flex flex-col justify-center pt-16 pb-20 px-4 overflow-hidden w-full max-w-full">
```

**`src/components/StampGridBackground.tsx` — line 31:**
```
// From:
<div key={i} className="aspect-square bg-black overflow-hidden">

// To:
<div key={i} className="w-full h-full bg-black overflow-hidden">
```

These two changes together make the hero fill the full viewport height and the stamp grid tile evenly across it with no gaps — matching the reference screenshot.

### Files to Change
- `src/pages/Landing.tsx` — line 35: add `min-h-screen flex flex-col justify-center`
- `src/components/StampGridBackground.tsx` — line 31: replace `aspect-square` with `w-full h-full`
