Looking at the current `generate-stamp-image` function, it directly saves the AI-returned base64 data URI to the database. The sister function `generate-all-stamps` already does this correctly (decode → upload → save URL). I'll port that pattern.

Note on path: user requested `stamp-images/{challenge_slug}/{milestone_id}.png` in the description, but their final-format example shows `stamps/{milestone_id}.png` (which matches `generate-all-stamps`). I'll need to clarify, but to stay consistent with the existing batch function and the example URL, I'll plan for `stamps/{milestone_id}.png` — and confirm before implementing.

## Plan

**File touched:** `supabase/functions/generate-stamp-image/index.ts` only.

**Changes inside the function (after AI call succeeds):**

1. Fetch milestone's `challenge_id` to derive `challenge_slug` (only if we use slug-based path).
2. Extract image from AI response: `aiResponse.choices[0].message.images[0].image_url.url`.
3. Detect format:
  - If starts with `data:image/...;base64,` → strip prefix, `atob()`, convert to `Uint8Array`.
  - Else (HTTP URL) → `fetch()` it, get `arrayBuffer()`, convert to `Uint8Array`.
4. Upload bytes to `challenge-images` bucket at path `stamps/{milestone_id}.png` with `contentType: "image/png"`, `upsert: true`.
5. Get public URL via `supabase.storage.from("challenge-images").getPublicUrl(path)`.
6. Upsert public URL (not base64) into `passport_stamp_images.image_url`.
7. Update `milestones.stamp_image_url` with public URL.
8. Return `{ imageUrl: publicUrl }` to caller.

**Untouched:** auth check, admin check, cache short-circuit, prompt, model, error handling shell, all other edge functions, all DB records.

**After deploy:** screenshot the updated file via `code--view` output (the user asked for a screenshot of the code).

### One clarification needed before implementing

The storage path differs between your description and your example URL.                                                                                                                                                                                       Use the path `stamps/{milestone_id}.png` inside the `challenge-images` bucket. This matches the existing `generate-all-stamps` function and the example URL format. You do not need the challenge slug in the path. Proceed with implementing the changes as planned.