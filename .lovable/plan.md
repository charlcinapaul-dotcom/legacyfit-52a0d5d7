

## Fix: Make the Coin Background Visible on the Landing Page Hero

### Problem
The coin background image is technically present but nearly invisible because:
- The image itself is set to `opacity: 0.15` (very faint)
- A dark overlay (`rgba(0,0,0,0.55)`) is layered directly on top of it, blocking 55% of the remaining light
- The combined effective visibility is only about 7% -- virtually undetectable

### Solution
Restructure the background layers so the overlay does not sit on top of the coin image. Instead, place the dark overlay BEHIND the coin, and increase the coin's opacity so it reads as a clear, textured watermark.

### Changes (single file: `src/pages/Landing.tsx`)

1. **Swap the layer order**: Move the dark overlay div BEFORE the coin image div, so the overlay darkens the page background but the coin renders on top of it
2. **Increase coin opacity** from `0.15` to `0.22` so it's clearly visible as a subtle texture
3. **Reduce blur** from `8px` to `6px` so the coin shape is more recognizable

### Expected Result
The coin will appear as a soft, recognizable watermark on the right side of the hero -- visible enough to feel branded and premium, but not so strong it competes with the headline text.

