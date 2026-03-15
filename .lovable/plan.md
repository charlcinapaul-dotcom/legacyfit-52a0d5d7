
## Two problems to fix

**Problem 1: Image cuts off on mobile** — The hero section uses `min-h-[100vh]` with `background-size: cover`. On mobile (390px wide), the all-content including buttons and the "Start your free 1 mile" link pushes the section taller than 100vh. Because the background is `cover` with `center top`, the image only fills the viewport height — any content below that point has no background image, just the black overlay. The fix is to make the background image `<img>` an absolutely positioned element that stretches to the full section height rather than relying on CSS background-size. Alternatively, the simplest fix is to use an `<img>` tag with `object-fit: cover` that fills the `absolute inset-0` div, so it always covers the entire section height regardless of how tall it grows.

**Problem 2: Content still centered not top-aligned on mobile** — The section has `justify-center` via `flex flex-col justify-center`. The inner container has `pt-20 md:pt-0` but `justify-center` on the flex parent keeps the whole block centered vertically. On mobile, `justify-center` needs to become `justify-start` (or `items-start`), or the section needs `md:justify-center` so on mobile it aligns to the top. Tailwind approach: change `justify-center` to `justify-start pt-16 md:justify-center`.

### Exact changes to `src/pages/Landing.tsx`

**Fix 1 — Image fills full section height (line 36–40):**
Replace the CSS background-image div with an `<img>` tag using `object-fit: cover` and `object-position: center top` that absolutely fills the wrapper. This guarantees the image covers the full section height on all screen sizes.

```tsx
<div className="absolute inset-0 overflow-hidden">
  <img
    src={boardingPassBg}
    alt=""
    className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
  />
  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: "rgba(0,0,0,0.65)" }} />
</div>
```

**Fix 2 — Top-align content on mobile (line 35):**
Change `justify-center` to `justify-start md:justify-center` on the `<section>`. The inner container's `pt-20 md:pt-0` then places content 80px from the top on mobile, and centered on tablet/desktop.

Current:
```
className="relative min-h-[100vh] flex flex-col justify-center pt-16 pb-20 px-4 overflow-hidden w-full max-w-full"
```
New:
```
className="relative min-h-[100vh] flex flex-col justify-start md:justify-center pt-16 pb-20 px-4 overflow-hidden w-full max-w-full"
```

Also update the inner container (line 47) to keep `pt-20 md:pt-0` — no change needed there, it stays as is.

### Files changed
- `src/pages/Landing.tsx` only — 2 targeted edits (lines 35–39 and 47 area)
- No CSS changes needed
