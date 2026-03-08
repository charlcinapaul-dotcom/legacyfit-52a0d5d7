
## The Core Problem

When you remix a Lovable project, **only the code transfers — not the database data**. The remix gets a brand new, empty Lovable Cloud backend. All 12 challenges, 72 milestones, stamp images, and audio files live in the **original project's database** and storage buckets, not in code files. That's why the remixed app shows nothing.

## What's Missing in the Remix

| Asset | Count | Storage Location |
|---|---|---|
| Challenges | 12 | Database table `challenges` |
| Milestones | 72 | Database table `milestones` |
| Stamp images | 72 | `stamp_image_url` column as **base64 PNG data** (~180MB+ of inline data) |
| Audio files | 65 | `milestone-audio` Supabase storage bucket (public URLs pointing to original project) |
| Challenge cover images | 12 | `challenge-images` Supabase storage bucket (public URLs pointing to original project) |

## Critical Finding: Stamp Images

The stamp images are stored as **base64 `data:image/png` strings** directly inside the `stamp_image_url` column — not as storage bucket URLs. This means:

- ✅ They can be copied via SQL INSERT statements directly into the remix's database
- ❌ Each stamp is ~2MB+ of base64 text, making the SQL migration file very large (~150MB+)
- The audio and cover images ARE stored as URLs pointing to the original project's storage, so those URLs will still work from the remix (they're public buckets)

## The Solution: A SQL Seed Migration

I will generate a **seed migration file** (`supabase/migrations/TIMESTAMP_seed_challenges_and_milestones.sql`) containing:

1. `INSERT` statements for all 12 challenges with their exact IDs, titles, slugs, descriptions, image_urls, etc.
2. `INSERT` statements for all 72 milestones with their exact IDs, challenge_ids, stamp metadata, historical_event text, coordinates, audio_url (pointing to original storage — still public), and stamp_image_url (base64 data)

Because the IDs are preserved exactly, all relationships stay intact.

## What This Does NOT Solve

- **User data** (profiles, mile entries, purchases) — this is correct behavior; users need to re-register in the remix
- **Stripe integration** — the remix will need its own Stripe Price IDs configured separately
- **ElevenLabs API key** — needs to be re-added in the remix's Secrets settings
- **Resend API key** — same

## Plan Steps

1. **Generate seed migration** — Create `supabase/migrations/[timestamp]_seed_challenges_milestones.sql` with all 12 challenges and 72 milestones inserted using their original UUIDs and all column data, including the large base64 stamp images

2. The migration runs automatically in the remix when applied, populating all tables identically to the original

## Important Note on File Size

The stamp images stored as base64 make this migration file **extremely large** (~150–200MB). I will generate it as a valid SQL file using `ON CONFLICT DO NOTHING` so it can be safely re-run. This is the only way to move the stamp image data since there is no separate storage bucket for them.

## What You Need to Do in the Remix After

Once the migration runs, in the remixed project you will need to:

```text
1. Add secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY, ELEVENLABS_API_KEY
2. Update Stripe Price IDs in the challenges table (they're null in the original too)
3. The audio URLs and cover image URLs still point to the original project's public storage
   — they'll continue working since those buckets are public
```

## Audio & Cover Images

Both `milestone-audio` and `challenge-images` buckets are **public** in the original project. The URLs embedded in the database rows will continue resolving correctly even from the remix since they point to `utfexhdncajccdpvquky.supabase.co` (original project) — no action needed.
