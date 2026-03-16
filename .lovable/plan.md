
## Plan: Add mobile-only left-to-right gradient overlay for text readability

### Problem
The stamp artwork on the left side of the boarding pass is now visible on mobile (good), but it creates a busy background behind the centered gold headline and white subtext. The existing `rgba(0,0,0,0.65)` overlay is uniform — the user wants it untouched. We need an additional overlay layer only on mobile that darkens the center/left area where text sits, without obscuring the stamps too much.

### Approach
Add a third `div` between the existing dark overlay and the content, visible only on mobile (`md:hidden`), with a radial or linear gradient that darkens the center of the image behind the text block.

Since the text is center-aligned and the stamps are on the left, the best approach is a **vertical gradient from top** — darker at the top-center (where headline + subtext live) fading to transparent lower down. This keeps stamp visibility intact while making the text area noticeably darker.

Gradient: `linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)`

This stacks on top of the existing 0.65 overlay — the net result at the top is ~0.82 effective darkness, which will make gold and white text pop clearly.

### Single change — `src/pages/Landing.tsx` (line 45, after existing overlay div)

Add one new `div` after the existing overlay (line 44–45 block):

```tsx
{/* Mobile-only text-readability gradient — stacks on top of base overlay */}
<div
  className="absolute inset-0 pointer-events-none md:hidden"
  style={{
    background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)"
  }}
/>
```

- `md:hidden` — desktop/tablet never sees this layer, existing overlay handles them
- Does not touch the `rgba(0,0,0,0.65)` div
- Does not change image positioning, section layout, or any other styles
- Net overlay at headline area on mobile: ~0.82 opacity darkness — stamps still show through around the edges, text becomes clearly legible

### Files changed
- `src/pages/Landing.tsx` — insert 1 div (5 lines) after line 45
