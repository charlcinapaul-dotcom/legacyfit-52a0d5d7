## Add an Asset Library to /admin/validate

Add a way for admins to actually **see every digital stamp** and **play every milestone audio narration** in one place — plus inline previews per challenge and per‑challenge bulk download.

### What you'll get

**1. New "Asset Library" tab at the top of `/admin/validate`**
- Tab toggle: `Readiness | Asset Library`
- Asset Library view groups all challenges by edition (same dynamic grouping as readiness — Women's History, First Steps: Black Pioneers, Women in Sports, Pride, etc.)
- Each challenge card shows its 6 milestones in a grid:
  - Stamp thumbnail (click → opens full‑size image in a new tab)
  - Milestone title + mileage label (e.g. "1 MILE")
  - Inline `<audio controls>` player streaming the Matilda narration
  - Red "Missing" badge if `stamp_image_url` or `audio_url` is null
- Top‑of‑page summary: total stamps generated / missing, total audio generated / missing

**2. Expandable rows in the existing Readiness tab**
- Each challenge row gets a chevron toggle
- Expanding reveals the same 6‑milestone preview grid (stamps + audio) inline, without leaving the readiness dashboard
- Keeps current pass/fail UI exactly as it is — preview is purely additive

**3. Per‑challenge bulk download**
- "Download all assets" button on each challenge card (in both views)
- Generates a zip in the browser containing:
  - `{slug}/stamps/01-{stamp_title}.png` … `06-…png` (6 stamp images)
  - `{slug}/audio/01-{milestone_title}.mp3` … `06-…mp3` (6 narration files)
  - `{slug}/manifest.json` listing milestones, miles, titles, and source URLs
- Uses `jszip` (client‑side) — files are fetched directly from the public `challenge-images` and `milestone-audio` buckets, no edge function needed
- Skips any missing assets and notes them in the manifest

### Access & security
- Entire page already gated behind `has_role(auth.uid(), 'admin')` — no policy changes needed
- Both storage buckets (`challenge-images`, `milestone-audio`) are already public‑read, so audio playback and zip downloads work directly from the browser

### Technical notes
- Files touched: `src/pages/AdminValidate.tsx` (add tab state, asset library view, expandable rows), one new component `src/components/admin/ChallengeAssetCard.tsx` (milestone grid + download button)
- New dependency: `jszip` (add via `bun add jszip`)
- Data source: a single query `select id, slug, title, edition from challenges` joined with `select challenge_id, order_index, title, stamp_title, stamp_mileage_display, stamp_image_url, audio_url from milestones order by order_index` — no new tables, no migrations
- No edge functions added; existing `generate-all-stamps` / `generate-all-milestone-audio` stay as‑is for filling in missing assets

### Out of scope (can add later if you want)
- Per‑edition "download everything" zip
- Re‑generating a single stamp or audio file from the library view (today you'd use the existing batch generators)