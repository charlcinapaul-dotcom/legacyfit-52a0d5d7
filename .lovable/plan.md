
## Plan: Hero Section Copy & Mobile Layout Updates

### Changes to `src/pages/Landing.tsx` only

**1. Headline** (line 48–51)
- Remove the two-line split with `text-foreground` / `text-gradient-gold`
- Replace with a single `<h1>` where the full phrase "Walk Through History" is rendered entirely in gold (`text-gradient-gold`)

**2. Subtext** (line 53–55)
- Replace body copy with: `"Every milestone unlocks powerful stories from the trailblazers who changed the world."`

**3. "Learn More" button** (line 70–74)
- Change label from `Learn More` to `How It Works`
- Change `to="/about"` to `to="/how-it-works"`
- Keep the same `variant="outline"` styling

**4. "Start Your Journey" button** (line 58–62)
- Already gold-styled via `bg-primary` — no change needed to styling
- Label and route unchanged

**5. "Start your free 1 mile Legacy Passport" link** (line 76–83)
- Unchanged

**6. Mobile hero positioning** (line 47)
- The content container `div` currently has no mobile top padding
- Add `pt-20 md:pt-0` to the container `div` so on mobile the headline sits in the upper portion of the hero image (80px push from top of content area)
- The section already has `pt-16` (nav offset) and `justify-center` — on mobile `pt-20` on the inner container will push content up within the flex layout

**7. Hero full-bleed on mobile** (line 35)
- The `<section>` uses `min-h-[100vh]` which already covers full viewport height
- The background image is absolutely positioned on `inset-0` so it already fills the section top-to-bottom
- The `hero-boarding-bg` CSS class in `index.css` already handles `background-size: cover` and the small-mobile override at 160%
- No changes needed here — this requirement is already satisfied by existing CSS

### Summary of edits (all in `src/pages/Landing.tsx`)
| Line(s) | Change |
|---|---|
| 48–51 | New headline: single `<h1>` with full text in gold |
| 53–55 | New subtext copy |
| 70–74 | Button: label → "How It Works", route → `/how-it-works` |
| 47 | Container div: add `pt-20 md:pt-0` for mobile offset |

No CSS changes, no other files touched.
