
## Root Cause

The Collector's Edition card (right card) is missing its right-side border. Looking at line 246–251:

```tsx
<div
  className={cn(
    "relative rounded-xl bg-card p-5 sm:p-6 flex flex-col min-w-0",
    accent.ring,
  )}
>
```

The `accent.ring` value for gold (default) is `"ring-2 ring-primary/30 border-primary/30"`. This uses Tailwind's **`ring`** utility (box-shadow based), **not** a CSS `border`. However, `border-primary/30` is also included — but there's no `border` width class (like `border` or `border-2`) on the element itself, so the border color is set but no border is actually drawn on any side. The left card (line 207) uses `border border-border` which explicitly has the `border` class.

The `ring-2` utility renders via `box-shadow` and should be visible on all sides — but without a `border` class, the right-side border isn't rendered because Tailwind's ring sometimes gets clipped by parent `overflow-hidden` or the `min-w-0` + grid layout on certain screen widths.

### Fix

On the Collector's Edition card div, add `border` to the className alongside `accent.ring`. This ensures the border renders as a true CSS border on all 4 sides:

**Line 248 — change from:**
```tsx
"relative rounded-xl bg-card p-5 sm:p-6 flex flex-col min-w-0",
```
**To:**
```tsx
"relative rounded-xl border bg-card p-5 sm:p-6 flex flex-col min-w-0",
```

This adds a `border` class (1px solid) which works together with `border-primary/30` already present in `accent.ring` to draw the colored border on all four sides consistently, matching how the left card uses `border border-border`.

### File to Change
- `src/components/ChallengePricing.tsx` — line 248, add `border` to the Collector's Edition card className
