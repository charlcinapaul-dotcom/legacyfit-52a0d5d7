
## What the user wants

Replace the Leaflet flat map in the "Passport Checkpoint" tab with a list of the 6 milestone Google Maps links — same lock/unlock logic as the Virtual Route "View on Map" button. Users get two access points to the same map links:
1. **Virtual Route** (already exists — "View on Map" button on each unlocked milestone)
2. **Passport Checkpoint tab** (replace Leaflet map with a milestone list + Google Maps links)

## What changes

**Only `src/pages/ChallengePassport.tsx`** needs to change.

The `stamps` array from `usePassportStamps` already has `latitude`, `longitude`, `location_name`, and `isUnlocked`. No hook or data changes needed.

### Replace the `<TabsContent value="checkpoint">` section

Remove: `<PassportCheckpointMap>` and its description paragraph.

Add: A styled list of all 6 milestones showing:
- Milestone number + name + miles required
- Location name (📍)
- If **unlocked**: amber "View on Map" button linking to Google Maps URL (same formula as Virtual Route)
- If **locked**: grayed-out "🔒 Reach X miles to unlock" note — no button

The card layout mirrors the Virtual Route style but fits the passport's amber/dark theme.

### Remove the unused import

Remove `PassportCheckpointMap` import and the `Map` icon import (replaced by `MapPin`).

## Layout sketch for the new Checkpoint tab

```text
┌─────────────────────────────────────────────────┐
│  Milestone 1 — Selma, Alabama           5 mi    │
│  📍 Edmund Pettus Bridge                         │
│  [🗺 View on Map]                    ← unlocked  │
├─────────────────────────────────────────────────┤
│  Milestone 2 — Memphis, Tennessee      12 mi    │
│  📍 National Civil Rights Museum                 │
│  🔒 Reach 12 miles to unlock          ← locked   │
└─────────────────────────────────────────────────┘
```

## Exact file change

**`src/pages/ChallengePassport.tsx`**

1. Remove import of `PassportCheckpointMap` (line 9) and `Map` from lucide (line 2); add `MapPin, Lock` to lucide imports.
2. Replace the entire `<TabsContent value="checkpoint">` block (lines 152–163) with the new milestone cards list.
3. Update the `TabsTrigger` label for "checkpoint" to use `MapPin` icon instead of `Map`.

No new files. No DB changes. No new dependencies. The `PassportCheckpointMap` component file can remain — it's just no longer imported here.
