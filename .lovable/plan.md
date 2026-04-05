## Fix Hero Image Edge-to-Edge on All Screens

### Problem

The uploaded `LegacyFit_Hero.png` is a portrait-oriented image. On desktop/tablet (landscape viewports), `object-cover` stretches it but white/transparent borders on the image edges appear as gray bars through the dark overlay.

### Solution — Two changes

**1. Process the uploaded image (script)**

- Use the uploaded image in `public/LegacyFit_Hero.png`
- Run a Python script to detect and replace all white/near-white pixels (RGB > 240) with the parchment color (#B4966E) that matches the map's natural edge color
- This ensures no white areas remain that would appear gray through the overlay
- Center the image

**2. Add a fallback background color to the hero section**

- In `src/pages/Landing.tsx`, add a parchment-toned background color (`bg-[#B4966E]`) to the image container `div` so that if the image doesn't fully cover on any breakpoint, the exposed area blends seamlessly with the map edges instead of showing gray

### Files changed

- `src/pages/Landing.tsx` — add `bg-[#B4966E]` class to the image wrapper div (line 55)

### No changes to

- Mobile layout or styling
- Hero text, buttons, or overlay opacity
- Any other page or component