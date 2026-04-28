## Add map coordinate verification to the Asset Library

Make it easy for admins to confirm every milestone's `latitude` / `longitude` actually lands on a real place — directly inside `/admin/validate` (both the expandable Readiness rows and the Asset Library tab).

### What you'll see on each milestone tile

In `src/components/admin/ChallengeAssetCard.tsx`, each milestone card already shows the stamp, title, and audio. We'll add a compact "Location" block underneath:

- **Location name** (e.g. "Seneca Falls, NY") — pulled from `milestones.location_name`
- **Coordinates** rendered as monospace text: `42.9106, -76.7958` (4 decimals)
- **"View on Google Maps" link** — opens `https://www.google.com/maps/search/?api=1&query={lat},{lng}` in a new tab so you can visually confirm the pin
- **"Copy" button** that copies `lat,lng` to clipboard for quick pasting into other tools
- **Red "Missing coordinates" badge** when `latitude` or `longitude` is null (matches the existing "No stamp" / "No audio" badge style)

### Per-challenge coordinate health summary

At the top of each challenge's milestone grid (next to the existing "6 milestones" / "Download all assets" row), add a small status pill:

- Green: `Coordinates: 6/6` (all milestones have valid lat/lng)
- Amber: `Coordinates: 4/6` (some missing — clickable scrolls to first missing one is out of scope, just the count)
- Red: `Coordinates: 0/6`

### Library-wide summary (Asset Library tab only)

In `src/pages/AdminValidate.tsx`, in the Asset Library header strip that already shows totals, add one more counter:

- "Milestones with coordinates: X / Y"

So at a glance you know how many milestones across the whole platform are still missing a verifiable location.

### Out of scope

- Editing coordinates inline (still done in the database / via the challenge creation flow)
- Embedded mini-maps per tile (would slow down the page when 60+ milestones render at once)
- Reverse-geocoding to validate that the coords match `location_name` (would require an external API + key)

### Technical notes

- Files touched:
  - `src/components/admin/ChallengeAssetCard.tsx` — add `latitude`, `longitude`, `location_name` to the `MilestoneAsset` type and the `select(...)` query; render the new Location block + per-challenge coordinate count
  - `src/pages/AdminValidate.tsx` — add the library-wide "Milestones with coordinates" counter (will require a small query alongside the existing readiness data, or aggregate from cards via a shared callback — implementation can fetch a single `select count(*) ... where latitude is not null and longitude is not null` to keep it cheap)
- No new dependencies, no migrations, no edge functions, no RLS changes. `milestones` is already SELECT-able by anyone and `latitude` / `longitude` columns already exist.
- Map links use plain `https://www.google.com/maps/search/?api=1&query=...` (works in any browser, no API key). On the admin web view we open in a new tab via `target="_blank"` — no Capacitor `Browser.open` needed since `/admin/validate` is desktop-first.