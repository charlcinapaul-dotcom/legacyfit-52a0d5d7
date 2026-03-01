
## Problem

The stamp card outer wrapper uses `border-2 border-border/30` for locked stamps. On a dark `bg-background` page, `border-border` resolves to a dark gray color, and at 30% opacity it becomes essentially invisible.

The user wants a visible outer frame around each stamp card — matching the Women's History Edition style — using a light color like `ring-2 ring-white/20` or `border-white/20`.

## Fix

One-line change on the outer stamp card `div` in `src/components/free-walk/FreeWalkPassport.tsx`:

**Line 108** — Change locked stamp border from:
```
: "border-border/30"
```
To:
```
: "border-white/20"
```

This gives every locked stamp a soft white frame that's clearly visible against the dark background, matching the subtle light border style used in the Women's History Edition passport stamps.

Unlocked stamps already have `border-amber-500/50` which is already visible — no change needed there.

## Files Changed

- **`src/components/free-walk/FreeWalkPassport.tsx`** — single border class update on the outer stamp card wrapper.

No layout, overlay, or inner image changes.
