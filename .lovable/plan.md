
## Problem
The hero `<img>` on mobile uses `object-top` as its CSS `object-position`, which centers the image horizontally and anchors it to the top — showing the middle of the boarding pass design. The user wants the **left** portion visible on mobile (showing the "BOARDING PASS" vertical text and stamp designs), matching the attached screenshot.

## Fix
Single attribute change on line 40 of `src/pages/Landing.tsx`:

**Current:**
```
className="absolute inset-0 w-full h-full object-cover object-top md:object-center"
```

**New:**
```
className="absolute inset-0 w-full h-full object-cover object-left-top md:object-center"
```

`object-left-top` positions the image anchored to the top-left corner on mobile, revealing the boarding pass stamps/text on the left side. `md:object-center` keeps the desktop/tablet view unchanged.

### Files changed
- `src/pages/Landing.tsx` — 1 word change on line 40
