
## Create Privacy Policy Page

**What we're building:** A dedicated `/privacy-policy` route with all 12 sections of the provided policy text, styled to match the existing Legal page pattern. No login required. Added to footer Legal column.

### Files to change

**1. Create `src/pages/PrivacyPolicy.tsx`**
- Mirror the structure of `Legal.tsx`: fixed header with Back link + LegacyFit logo, `pt-24 pb-12 px-4` main, `max-w-3xl` container
- Hero: `Shield` icon, "Privacy Policy" h1, "Effective Date: March 22, 2026" subtitle
- 12 numbered sections rendered as `bg-card rounded-xl border border-border p-6` cards, matching the Legal page card style
- Each section uses `h2` for the title and `text-sm text-muted-foreground` for body text
- Contact email as a `mailto:` link
- "Last updated: March 22, 2026" footer note
- No auth dependency — fully public, no `useQuery`, no Supabase calls

**2. Register route in `src/App.tsx`**
- Add lazy import: `const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));`
- Add route: `<Route path="/privacy-policy" element={<PrivacyPolicy />} />`

**3. Update `src/components/SiteFooter.tsx`**
- In the Legal column, add a new `<Link to="/privacy-policy">` entry for "Privacy Policy" below the existing "Terms & Privacy" link

### Technical notes
- Page uses the same standalone header pattern as `Legal.tsx` (not `PageLayout`) to keep the header minimal and clean
- Fully static — no backend calls, no auth, crawlable and indexable
- The live URL will be `https://legacyfitvirtual.com/privacy-policy` once published
- All 12 policy sections from the provided text will be included verbatim, organized into the card layout
