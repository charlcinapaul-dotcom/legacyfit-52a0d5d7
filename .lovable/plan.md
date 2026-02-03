

# Plan: Generate Unique Challenge Cover Images

## Problem
All 10 challenges display the same fallback image because `image_url` is NULL in the database:

| Challenge | Current image_url |
|-----------|-------------------|
| Malala Yousafzai Journey | NULL |
| Maya Angelou Journey | NULL |
| Katherine Johnson Space Journey | NULL |
| Wilma Rudolph Olympic Journey | NULL |
| Eleanor Roosevelt Human Rights Journey | NULL |
| (all others) | NULL |

The fallback in `ChallengeRoute.tsx` line 80:
```
https://images.unsplash.com/photo-1488521787991-ed7bbaae773c
```
This is a generic photo of children, not thematic to each journey.

## Solution
Create and run an edge function to generate unique AI cover images for each challenge, then update the database.

## Thematic Image Concepts

| Challenge | Image Theme |
|-----------|-------------|
| Malala Yousafzai | Books, education, Pakistani mountains, empowerment |
| Maya Angelou | Poetry, stage lights, artistic expression, birds |
| Katherine Johnson | NASA rockets, space, mathematics, stars |
| Wilma Rudolph | Olympic track, running, gold medals, triumph |
| Eleanor Roosevelt | UN flags, diplomacy, human rights symbols |
| Sojourner Truth | Freedom trail, historical landmarks, strength |
| Ida B. Wells | Journalism, newspapers, justice scales |
| Fannie Lou Hamer | Voting booths, civil rights marches, Mississippi |
| Toni Morrison | Books, literary awards, storytelling |
| Pride History | Rainbow colors, Stonewall, pride flags |

## Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/generate-challenge-images/index.ts` | Edge function to generate and store cover images |

### Technical Steps

1. **Create Edge Function**
   - Use Lovable AI (gemini-3-pro-image-preview) to generate thematic images
   - Upload images to Supabase storage bucket
   - Update `challenges.image_url` with public URLs

2. **Create Storage Bucket**
   - Create `challenge-images` bucket for storing generated images
   - Set public read access

3. **Run Generation**
   - Deploy and invoke the edge function
   - Verify all 10 challenges have unique images

4. **Verify Frontend**
   - Confirm `ChallengeRoute.tsx` displays unique images
   - No code changes needed (already reads from `image_url`)

## Database Update Preview

After generation, the challenges table will have:
```text
Malala → https://[storage]/challenge-images/malala-cover.png
Maya → https://[storage]/challenge-images/maya-cover.png
Katherine → https://[storage]/challenge-images/katherine-cover.png
...
```

## Implementation Order

1. Create storage bucket for challenge images
2. Create `generate-challenge-images` edge function
3. Deploy and run the function
4. Verify images appear on challenge pages

