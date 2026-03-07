
## Understanding

The user wants: when a user has **unlocked** a milestone, a button appears on that milestone's card in the Virtual Route that opens **Google Maps** for that location. No other UI changes.

**Where milestones already have coordinates:** The `milestones` table has `latitude` and `longitude` columns. These are already fetched via `useChallengeBySlug` and mapped into `challenge.milestones` in `ChallengeRoute.tsx` (lines 96-103). However, the current milestone map in `ChallengeRoute.tsx` only carries `{ id, name, miles, location, description, stampImageUrl }` — **latitude and longitude are dropped** during the transform on lines 96-103.

**What "72 destinations" means:** Across all challenges, there are many milestones. Each challenge has ~6 milestones. The `latitude`/`longitude` data is already in the database for all of them. No new DB columns or migrations needed.

**Google Maps URL format** (no API key required — this is a free public link):
```
https://www.google.com/maps/search/?api=1&query={lat},{lng}
```
Or, if only a location name is available (fallback):
```
https://www.google.com/maps/search/?api=1&query={location_name}
```

## What changes

**Only `src/pages/ChallengeRoute.tsx`** needs to change:

1. **Pass `latitude` and `longitude` through the transform** (lines 96-103) so they survive into the milestone objects used in the render loop.

2. **In the Virtual Route render loop** (around line 402-406), after the unlocked description renders, add a "View on Map" button that:
   - Only appears when `isUnlocked === true`
   - Links to `https://www.google.com/maps/search/?api=1&query={lat},{lng}` if lat/lng exist, or falls back to `https://www.google.com/maps/search/?api=1&query={encodeURIComponent(milestone.location)}` if only a name is available
   - Opens in a new tab (`target="_blank"`)
   - Uses a small `MapPin` icon + "View on Map" label
   - Styled as a compact outline button matching the challenge's color theme

## Exact changes

**`src/pages/ChallengeRoute.tsx`**

**Change 1** — Lines 96-103, add `latitude` and `longitude` to the milestone transform:
```ts
milestones: dbMilestones.map((m, index) => ({
  id: index + 1,
  name: m.stamp_title || m.title,
  miles: Number(m.miles_required),
  location: m.location_name || "",
  description: m.stamp_copy || m.description || "",
  stampImageUrl: m.stamp_image_url,
  latitude: m.latitude,       // ADD
  longitude: m.longitude,     // ADD
})),
```

**Change 2** — After line 405 (where the unlocked description renders), add the map button inside the `isUnlocked` block:
```tsx
{isUnlocked && (milestone.latitude || milestone.location) && (
  <a
    href={
      milestone.latitude && milestone.longitude
        ? `https://www.google.com/maps/search/?api=1&query=${milestone.latitude},${milestone.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(milestone.location)}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="mt-2 inline-flex"
  >
    <Button
      variant="outline"
      size="sm"
      className={cn("gap-1.5 text-xs", colors.text)}
    >
      <MapPin className="w-3 h-3" />
      View on Map
    </Button>
  </a>
)}
```

No new files, no new dependencies, no DB changes, no API key required. The Google Maps search URL is a public link that works for any device.
