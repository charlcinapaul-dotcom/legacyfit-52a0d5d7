## Replace BookOpen Icon with Official Logo

### What Changes

Replace the current BookOpen icon + "LegacyFit" text in the **header** (`SiteNavigation.tsx`) and **footer** (`SiteFooter.tsx`) with the uploaded logo image. The logo will be responsive across mobile, tablet, and desktop views and all pages 

### Steps

1. **Copy the uploaded logo** to `src/assets/legacyfit-logo.png` (replacing the existing file there).
2. **Update `SiteNavigation.tsx**` (header):
  - Remove the `BookOpen` icon import.
  - Import the logo from `@/assets/legacyfit-logo.png`.
  - Replace the gold circle + BookOpen icon + "LegacyFit" text with an `<img>` tag showing the logo.
  - Size the logo responsively: smaller on mobile (32px height), larger on desktop (40px height).
3. **Update `SiteFooter.tsx**` (footer):
  - Same replacement: remove BookOpen icon, import and display the logo image.
  - Sized appropriately for the footer context (~36px height).

### Responsive Behavior

- Mobile: Logo displays at a compact height so it fits the 64px nav bar.
- Desktop/Laptop: Logo displays slightly larger for better visibility.
- The logo replaces both the icon and text, so no separate "LegacyFit" label is needed.

### Technical Details

- The logo is imported as an ES module from `src/assets/` for proper Vite bundling and optimization.
- Files modified: `SiteNavigation.tsx`, `SiteFooter.tsx`.
- The logo file at `src/assets/legacyfit-logo.png` will be overwritten with the new upload.
- do not change anything except the header and footer. 