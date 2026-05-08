# LegacyFit — Adding New Challenges

> No code changes are required to add a new challenge. The Challenges page automatically renders any active challenge from the database.

---

## Workflow Overview

1. Insert a row into `challenges`
2. Insert 6 rows into `milestones`
3. Upload stamp images to storage
4. Generate audio for each milestone
5. Set `is_active = true` to publish

---

## Step 1 — Insert a Challenge Row

Insert into the `challenges` table:

| Column                       | Value                                          | Notes                                                    |
| ---------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| `title`                      | `"Mae Jemison Pioneer Journey"`                | Full name + theme word                                   |
| `slug`                       | `"mae-jemison"`                                | URL-safe lowercase, globally unique                      |
| `edition`                    | `"First Black Pioneers"`                       | Controls color theme on the challenge page               |
| `description`                | 1–2 sentences                                  | Shown on the Challenges discovery page                   |
| `total_miles`                | e.g. `26`                                      | Must equal `miles_required` of milestone 6               |
| `category`                   | e.g. `"Science"`                               | Groups the challenge under Browse by Category            |
| `difficulty`                 | `"Beginner"` / `"Intermediate"` / `"Advanced"` | Shown as a badge on the challenge card                   |
| `featured`                   | `false`                                        | Set to `true` to show in the Featured Challenges section |
| `release_date`               | `now()`                                        | Cards released within 30 days show a "New" badge         |
| `image_url`                  | Public URL                                     | Hero backdrop shown on the challenge route page          |
| `featured_quote`             | Optional quote text                            | Renders as a left-bordered blockquote on the card        |
| `featured_quote_attribution` | Optional attribution                           | Shown in small muted text below the quote                |
| `is_active`                  | `false`                                        | Keep false until all milestones and assets are ready     |

**Edition values and their color themes:**

| Edition                  | Theme            |
| ------------------------ | ---------------- |
| `"Women's History"`      | Purple / gold    |
| `"First Black Pioneers"` | Amber / bronze   |
| `"Pride"`                | Rainbow gradient |

---

## Step 2 — Insert 6 Milestone Rows

Every challenge requires **exactly 6 milestones**. Insert each into the `milestones` table with `challenge_id` set to the UUID of the challenge created in Step 1.

| Column                  | Rule                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `order_index`           | 1 through 6, sequential, no gaps                                                                                                                                |
| `miles_required`        | Milestone 1 **must be exactly `1`** — this powers the free first-mile gate                                                                                      |
| `title`                 | Person's name or event name                                                                                                                                     |
| `stamp_title`           | Short stamp display title — **must be globally unique across ALL challenges**                                                                                   |
| `stamp_copy`            | 1-sentence quote shown on the stamp card                                                                                                                        |
| `location_name`         | Specific real geographic location (e.g. `"Tuskegee University, Alabama"`) — not a generic descriptor                                                            |
| `latitude`              | Coordinates of the location                                                                                                                                     |
| `longitude`             | Coordinates of the location                                                                                                                                     |
| `historical_event`      | **Exactly 3 sentences.** Sentence 1: introduce the person/event. Sentence 2: significance. Sentence 3: legacy or impact. This is the ElevenLabs narration text. |
| `stamp_mileage_display` | Display string matching `miles_required` — e.g. `"1 MILE"`, `"10 MILES"`                                                                                        |
| `stamp_image_url`       | Set to `null` on insert — populated after image generation                                                                                                      |
| `audio_url`             | Set to `null` on insert — auto-generated by trigger on insert                                                                                                   |

**Suggested milestone mileage distribution for a 26-mile challenge:**

| Milestone | `miles_required` | `stamp_mileage_display` |
| --------- | ---------------- | ----------------------- |
| 1         | 1                | `"1 MILE"`              |
| 2         | 5                | `"5 MILES"`             |
| 3         | 10               | `"10 MILES"`            |
| 4         | 15               | `"15 MILES"`            |
| 5         | 20               | `"20 MILES"`            |
| 6         | 26               | `"26 MILES"`            |

> Adjust milestones 2–6 proportionally to match `total_miles`.

---

## Step 3 — Upload Stamp Images

For each milestone, generate and upload a stamp image following the parchment standard:

- **Canvas background:** Aged parchment — `#F5EDD8` warm cream/tan. No white, grey, or transparent pixels.
- **Ink color:** Deep Navy `#1E3A5F` or Burgundy Red `#7A1E2C` — distressed/worn style
- **Required elements:** Pioneer name (bold serif all-caps), mileage banner, location subtitle, double concentric outer ring, wheat/laurel wreath at top, `LEGACYFIT` brand mark at bottom
- **Storage path:** `challenge-images` bucket → `stamps/{milestone_id}.png`
- After upload, write the public URL to both `milestones.stamp_image_url` AND insert a row into `passport_stamp_images`

Use the **"Generate All Stamps"** function via the admin panel at `/admin/validate` to batch-generate all 6 stamps after milestones are inserted.

---

## Step 4 — Verify Audio Generation

Audio is **auto-generated** when each milestone row is inserted (via the `on_milestone_insert_generate_audio` database trigger).

- Voice: ElevenLabs Charlie P (`DLvjJrjQopAT03aOblQr`)
- Source text: `historical_event` column
- Storage path: `milestone-audio` bucket → `{challenge_id}/{milestone_id}.mp3`

After inserting all 6 milestones, verify that all 6 `audio_url` values are non-null before activating the challenge. If any are null, manually invoke the `generate-milestone-audio` edge function with `{ milestoneId: "<id>" }`.

---

## Step 5 — Publish the Challenge

Once all assets are confirmed:

1. Set `is_active = true` on the `challenges` row
2. Optionally set `featured = true` to promote it in the Featured section

The challenge will **automatically appear** in the correct section of the Challenges discovery page:

| Condition                          | Where it appears                     |
| ---------------------------------- | ------------------------------------ |
| `edition = "Women's History"`      | Women's History Edition section      |
| `edition = "First Black Pioneers"` | First Black Pioneers Edition section |
| `edition` contains `"pride"`       | Pride Edition section                |
| `featured = true`                  | Featured Challenges section          |
| Released within 30 days            | "New" badge on the card              |
| `is_active = false`                | Not shown (draft/past editions)      |

---

## Activation Checklist

Before setting `is_active = true`, confirm all of the following:

- [ ] Challenge row inserted with correct `slug`, `edition`, `total_miles`, `description`, `image_url`
- [ ] `total_miles` equals `miles_required` of milestone 6
- [ ] Exactly 6 milestones inserted with `order_index` 1–6
- [ ] Milestone 1 has `miles_required = 1`
- [ ] All 6 milestones have `historical_event` with **exactly 3 sentences**
- [ ] All 6 `stamp_title` values are globally unique across all challenges
- [ ] All 6 milestones have `location_name` as a specific real geographic location
- [ ] All 6 milestones have valid `latitude` / `longitude`
- [ ] All 6 `audio_url` values are non-null (auto-generated — verify after insert)
- [ ] All 6 `stamp_image_url` values are non-null (manually generated via admin UI)
- [ ] All 6 `stamp_mileage_display` values are set
- [ ] Challenge backdrop `image_url` is uploaded and publicly accessible
- [ ] Challenge tested end-to-end: free mile logs → stamp unlocks → gate shown → payment flows → milestones unlock

---

## No Code Required

The Challenges page (`/challenges`) queries all active challenges from the database and automatically:

- Groups them by edition with themed section headers
- Shows a "New" badge for recently released challenges
- Promotes featured challenges to the Featured section
- Displays the user's active challenge in the "Continue Your Journey" card
- Renders stamp previews, featured quotes, difficulty badges, and milestone counts from the database fields

Adding a new challenge is entirely a **data operation**.
