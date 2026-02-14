## Conqueror-Style Stamp Grid Background for Landing Page Hero

### What We're Building

Replace the current single blurred coin background with a tiled grid of 12 real digital passport stamps from the database, similar to The Conqueror's medal mosaic hero. The stamps will fill the hero section as a repeating grid backdrop, appearing opaque but non-printable, ending before the "How it works" section.

### Approach

**New Component: `StampGridBackground.tsx**`

- Fetches 12 stamp images from the `milestones` table (stamp_image_url column, which contains base64 data)
- Renders them in a 4-column x 3-row CSS grid that fills the hero section
- Each stamp is displayed as an `<img>` element inside a grid cell
- Applies a slight opacity (0.35-0.45 range) so stamps are clearly visible but don't overpower text
- Applies CSS `print-color-adjust` and media query `@media print { display: none }` to prevent printing
- Dark overlay on top for text readability (same rgba(0,0,0,0.55))
- No blur -- stamps should be recognizable like the Conqueror medals

**Changes to `Landing.tsx**`

- Remove the current single-image background div
- Remove the `heroCoinBg` import (no longer needed)
- Insert the new `StampGridBackground` component as the first child of the hero section (absolute positioned, inset-0)
- Keep all hero text, buttons, and z-10 container completely untouched
- No color changes, no structural changes

**Styling Details**

- Grid: `grid grid-cols-3 md:grid-cols-4` to create a mosaic
- Each cell slightly rotated randomly (-5 to 5 degrees) for organic feel
- Stamps sized to fill cells with slight padding
- Layer order: stamps grid (bottom) -> dark overlay (middle) -> content z-10 (top)
- CSS property `-webkit-print-color-adjust: exact` plus `@media print { .stamp-grid { display: none !important; } }` to prevent printing

**Performance Note**

- The stamps are base64 data (~1MB+ each). To avoid blocking page load, the component will:
  - Fetch stamps via a React Query hook
  - Show the dark background immediately while stamps load
  - Fade stamps in once loaded

### Technical Changes


| File                                     | Change                                                               |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `src/components/StampGridBackground.tsx` | New component -- fetches 12 stamps from DB, renders as tiled grid    |
| `src/pages/Landing.tsx`                  | Replace single-image background with `StampGridBackground` component |
| `src/index.css`                          | Add `@media print` rule to hide stamp grid                           |


### What Stays the Same

- All hero text, buttons, badges, and CTA links
- All colors, fonts, and spacing
- All sections below the hero
- No backend or database changes