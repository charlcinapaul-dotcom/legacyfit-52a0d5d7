

## Per-Milestone Audio Narration (Replacing Phase Scripts)

### What Changes

Replace the current 36 phase-based text scripts with 72 individual AI-generated audio files -- one unique narration per milestone, using the milestone's existing `stamp_copy` text from the database.

### Prerequisites

1. **ElevenLabs account** -- You'll need at least the Starter plan ($5/month). The total text for all 72 milestones is roughly 15,000-20,000 characters, which fits within Starter's 30,000 character monthly allowance. You only need the plan active long enough to generate the files once, then they're stored permanently.
2. **ElevenLabs API key** -- You'll provide this through a secure connector setup.

### How It Works

1. A backend function takes each milestone's `stamp_copy` text and sends it to ElevenLabs TTS API
2. The returned MP3 audio is uploaded to file storage in a `milestone-audio` bucket
3. The public URL is saved in a new `audio_url` column on the `milestones` table
4. A batch function loops through all 72 milestones and generates audio for any that don't have one yet
5. When a participant unlocks a stamp, the modal plays the stored MP3 instead of browser speech

### Database Changes

- Add `audio_url` (text, nullable) column to the `milestones` table
- Create a `milestone-audio` storage bucket for MP3 files

### Files Deleted

| File | Reason |
|------|--------|
| `src/lib/storytellerScripts.ts` | All 36 phase scripts removed -- replaced by per-milestone audio from database |

### Files Created

| File | Purpose |
|------|---------|
| `supabase/functions/generate-milestone-audio/index.ts` | Takes a milestone ID, fetches its `stamp_copy`, calls ElevenLabs TTS, uploads MP3 to storage, saves URL to `milestones.audio_url` |
| `supabase/functions/generate-all-milestone-audio/index.ts` | Batch function that loops all 72 milestones and calls the single-generation function for each |

### Files Modified

| File | Change |
|------|--------|
| `src/components/StampUnlockModal.tsx` | Remove all `speechSynthesis` code and `storytellerScripts` import. Replace with an HTML5 `<audio>` element that plays `milestone.audio_url`. Keep the speaker toggle button and animated audio bars UI |
| `src/hooks/useMileLogging.ts` | Include `audio_url` in the `UnlockedStamp` type so the modal has the URL available |

### What Stays the Same

- All milestone data, stamp images, and stamp copy text
- The Stamp Unlock Modal's visual design (amber theme, glow, share button, progress dots)
- The Legacy Guide UI card layout (speaker icon, phase label area repurposed for milestone title)
- Mile logging, milestone detection, and enrollment logic
- All other pages and components

### Audio Details

- Voice: A warm female English voice (e.g., "Matilda" or "Sarah" from ElevenLabs)
- Each clip will be 5-15 seconds long
- MP3 format at 44.1kHz/128kbps
- Files are small (under 100KB each), stored once, served instantly

### Step-by-Step Sequence

1. Connect ElevenLabs API key via connector
2. Create database migration (add `audio_url` column, create storage bucket)
3. Create the single-milestone audio generation edge function
4. Create the batch generation edge function
5. Run the batch function once to generate all 72 audio files
6. Update `StampUnlockModal` to play stored audio
7. Update `useMileLogging` to include `audio_url`
8. Delete `storytellerScripts.ts`

