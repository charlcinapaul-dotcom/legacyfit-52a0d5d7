# Generate Crispus Attucks Audio — Charlie P (Voice ID `DLvjJrjQopAT03aOblQr`)

## Goal
Use the remaining ~3,000 ElevenLabs credits to generate narration for the **Crispus Attucks – The First to Fall Journey** (challenge `e684bcdb-39fa-4bf3-8e7f-3a883ecdbb94`). All 6 milestones currently have `audio_url = NULL`.

## Credit budget check
Total `historical_event` text across the 6 milestones: **~3,108 characters**. ElevenLabs charges 1 credit per character, so this is right at the budget. Buffer plan below.

| # | Milestone | Chars |
|---|---|---|
| 1 | The Man From Two Worlds | 538 |
| 2 | Life on the Water | 509 |
| 3 | A City on Edge | 495 |
| 4 | The Night of March 5 | 526 |
| 5 | The First to Fall | 531 |
| 6 | The Name They Tried to Erase | 509 |
| **Total** |  | **~3,108** |

If the live ElevenLabs balance shows <3,108, we'll trim each script by ~5% (one tightened sentence) before generating — no narration meaning lost.

## Approach
Reuse the existing `generate-all-milestone-audio` edge function pattern (already uses Charlie P `DLvjJrjQopAT03aOblQr`), but scope it to a single `challengeId` so we don't accidentally consume credits on other editions.

### Changes

1. **`supabase/functions/generate-all-milestone-audio/index.ts`** — accept optional `challengeId` in body. When present, filter milestones to only that challenge (still skipping ones that already have `audio_url`). All other behavior (admin-only, Charlie P voice, storage upload, DB update, 1-second rate-limit delay) unchanged.

2. **`src/pages/AdminValidate.tsx`** — add a small "Generate Audio for This Challenge" button on the Crispus Attucks card (and reusable for any future challenge). On click:
   - Confirm dialog showing milestone count + estimated character cost.
   - Invokes `generate-all-milestone-audio` with `{ challengeId, limit: 6 }`.
   - Shows toast with success/failure count + remaining ElevenLabs warning if any segment returns 401/429.

3. **No script rewrites** — keep the existing `historical_event` text, which fits the budget.

## Out of scope
- No voice changes (Charlie P only, as requested).
- No edits to other challenges.
- No changes to the per-milestone `generate-milestone-audio` runtime fallback.

## Verification
- After running, query: `SELECT title, audio_url IS NOT NULL FROM milestones WHERE challenge_id='e684bcdb-…' ORDER BY order_index;` — all 6 should be `t`.
- Open the Attucks challenge in the app and confirm the audio plays on milestone 1.
