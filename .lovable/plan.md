
## Goal
Replace the generic icon placeholders in the Free Walk passport and stamp unlock modal with real AI-generated stamp images from each Queen's individual challenge. Locked stamps show the image grayed out + a lock overlay. Unlocked stamps show the image in full color — matching exactly the `PassportStamp` component behavior used by the Women's History Edition.

---

## The Problem
`FreeWalkPassport.tsx` currently hardcodes `stampImageUrl: null` for every stamp, so the passport only shows lock icons and MapPin icons. The real stamp images exist in the `milestones` table under each Queen's individual paid challenge.

---

## Solution: Fetch Real Stamp Images

### Data Mapping
Each of the 11 ROUTE_STOPS maps to a challenge slug:

| ROUTE_STOP title        | Challenge slug          |
|-------------------------|-------------------------|
| Sojourner Truth         | sojourner               |
| Ida B. Wells            | ida                     |
| Eleanor Roosevelt       | eleanor                 |
| Wilma Rudolph           | wilma                   |
| Fannie Lou Hamer        | fannie                  |
| Maya Angelou            | maya                    |
| Katherine Johnson       | katherine               |
| Ruth Bader Ginsburg     | ruth-bader-ginsburg     |
| Malala Yousafzai        | malala                  |
| Toni Morrison           | toni                    |
| Jane Goodall            | jane-goodall            |

We'll use the **first milestone (order_index = 1)** of each challenge as the representative stamp image, since it has the "origin" stamp that represents the Queen herself.

---

## Files Changed

### 1. New hook: `src/hooks/useFreeWalkStampImages.ts`
A new `useQuery` hook that:
- Fetches milestones from the 11 Queen challenge slugs
- Joins `challenges` and `milestones` tables filtering `order_index = 1`
- Returns a `Map<string, string>` keyed by challenge slug → `stamp_image_url`
- Also maps the ROUTE_STOPS title to the stamp image URL for easy lookup

```typescript
// Query: get first milestone per queen challenge
SELECT c.slug, m.stamp_image_url
FROM challenges c
JOIN milestones m ON m.challenge_id = c.id
WHERE c.slug IN ('sojourner','ida','eleanor','wilma','fannie','maya',
                 'katherine','ruth-bader-ginsburg','malala','toni','jane-goodall')
  AND m.order_index = 1
```

No RLS changes needed — milestones are publicly readable (`Anyone can view milestones` policy is in place).

### 2. Update `src/components/free-walk/FreeWalkPassport.tsx`
- Import and call `useFreeWalkStampImages()`
- Map each stamp's `stampImageUrl` from the hook result instead of hardcoding `null`
- Replace the current locked/unlocked rendering with the **same visual pattern as `PassportStamp.tsx`**:
  - **Locked with image**: show `<img>` with `grayscale opacity-40` + lock icon overlay
  - **Unlocked with image**: show `<img>` in full color with `✓ EARNED` badge
  - **No image fallback**: keep current icon-based display

### 3. Update `src/hooks/useFreeWalkStamps.ts`
- Populate `stampImageUrl` in the `UnlockedStamp` objects generated for `StampUnlockModal`
- The modal (`StampUnlockModal`) already handles displaying images correctly when `stampImageUrl` is non-null, so no changes needed there

### 4. Update `src/components/free-walk/ActiveWalkScreen.tsx`  
- Pass stamp images into the `pendingStamps` so the unlock modal shows the real image when a queen milestone is crossed

---

## Visual Behavior (matching Women's History Edition)

| State | Behavior |
|-------|----------|
| Locked, has image | Image shown at `grayscale opacity-40` + lock icon centered on top |
| Locked, no image | Gray circle with lock icon (current fallback) |
| Unlocked, has image | Image in full color + gold `✓ EARNED` badge top-right |
| Unlocked, no image | Gold MapPin icon (current fallback) |

---

## Technical Details

- The hook uses `@tanstack/react-query` with `queryKey: ["free-walk-stamp-images"]`
- The title-to-slug mapping is a static lookup object defined in the hook file
- No database migrations or RLS changes required
- Images are already publicly accessible base64 data URLs stored in the `stamp_image_url` column
- `StampUnlockModal` already displays images correctly when `stampImageUrl` is non-null — the only gap was that we were passing `null`
