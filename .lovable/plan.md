
# Generate AI Stamp Images for All Milestones

## Overview
Generate unique vintage passport-style stamps for all 38 milestones that are currently missing images using the existing `generate-stamp-image` edge function.

## Current Status
| Challenge | Total Milestones | With Images | Need Generation |
|-----------|------------------|-------------|-----------------|
| Eleanor | 6 | 1 | 5 |
| Fannie | 6 | 1 | 5 |
| Ida | 6 | 1 | 5 |
| Katherine | 6 | 1 | 5 |
| Pride | 6 | 1 | 5 |
| Sojourner | 6 | 0 | 6 |
| Wilma | 6 | 0 | 6 |
| **Total** | **42** | **4** | **38** |

## Implementation Approach

### Step 1: Fix Dashboard Navigation
Add click handler to the Passport card on the Dashboard so users can navigate to `/passport`.

### Step 2: Create Batch Image Generation Admin Tool
Create an admin page or edge function that can trigger image generation for all milestones missing images. This avoids manually calling the edge function 38 times.

**Option A - New Edge Function (Recommended)**
Create `generate-all-stamps` function that:
1. Queries all milestones without stamp_image_url
2. Iterates through each, calling the AI to generate images
3. Updates the database with generated images
4. Returns progress/status

**Option B - Admin UI Button**
Add a button in the Passport page (for admins) that triggers generation for remaining stamps.

### Step 3: Execute Generation
Call the batch generation function to create all 38 stamp images. Each stamp will be:
- Vintage passport-style design
- Include milestone title, location, and mileage
- Stored in both `passport_stamp_images` and `milestones.stamp_image_url`

## Technical Details

### Edge Function Structure
```text
generate-all-stamps/index.ts
├── Query milestones without images
├── For each milestone:
│   ├── Generate prompt with title/location/miles
│   ├── Call Lovable AI (google/gemini-2.5-flash-image)
│   ├── Store base64 image in database
│   └── Update milestone.stamp_image_url
└── Return summary of generated images
```

### Rate Limiting Consideration
- AI image generation may have rate limits
- Will add small delay between generations
- Function will log progress for monitoring

### Expected Time
- ~38 images × ~5 seconds each = ~3-4 minutes total

## Files to Create/Modify
1. **Create** `supabase/functions/generate-all-stamps/index.ts` - Batch generation function
2. **Modify** `src/pages/Dashboard.tsx` - Add navigation to Passport page

## Expected Outcome
- All 60 milestones across 10 challenges will have unique AI-generated stamp images
- Users can view their unlocked stamps in the Passport page
- The stamps follow the vintage passport aesthetic
