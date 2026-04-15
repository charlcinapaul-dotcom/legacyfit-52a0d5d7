

## Add Health Sync feature, hide GPS Walk tab

### Overview

Replace the "GPS Walk" tab on the challenge page with a "Health Sync" tab that syncs step data from Apple Health (iOS) or Google Health Connect (Android) using the `@capgo/capacitor-health` plugin. The GPS Walk code stays in the codebase but is hidden from the UI.

### Files to create

**1. `src/hooks/useHealthSync.ts`** — New hook that:
- Detects platform (iOS → Apple Health, Android → Health Connect, web → unavailable)
- Requests read permission for step data via `@capgo/capacitor-health`
- Queries past 7 days of step data
- Converts steps → miles (2000 steps = 1 mile)
- Accepts a `challengeId` and logs synced miles to `mile_entries` table via `useMileLogging`
- Tracks last sync timestamp (in-memory + localStorage) to prevent double-counting within the same day
- Returns: `{ sync, isSyncing, lastSyncAt, milesSynced, isAvailable, error, healthSource }`

**2. `src/components/HealthSyncTracker.tsx`** — New component replacing GpsWalkTracker in the tab:
- "Sync Health Data" button that calls `useHealthSync.sync()`
- Loading state with spinner while syncing
- Success state showing miles synced and timestamp
- Privacy notice: "LegacyFit reads your step data from [Apple Health / Google Health Connect] to credit miles toward challenges. Your health data is never stored on our servers — only the calculated miles."
- Error state for permission denied or unavailable platforms
- Same props interface as GpsWalkTracker for drop-in replacement

### Files to modify

**3. `src/pages/ChallengeRoute.tsx`** — Two changes:
- Replace the GPS Walk tab trigger label from "GPS Walk" to "Health Sync" with a different icon (e.g., `Activity` or `Heart` from lucide)
- Replace `<GpsWalkTracker>` with `<HealthSyncTracker>` in the `gps` tab content
- Remove the GpsWalkTracker import, add HealthSyncTracker import

### What stays untouched
- `src/hooks/useGpsWalk.ts` — no changes
- `src/components/GpsWalkTracker.tsx` — no changes
- All existing challenge/mile calculation logic
- No new database tables — miles logged via existing `mile_entries` table with source `"manual"` (existing enum)
- Dashboard — no changes (the GPS Walk button lives on the challenge page, not the dashboard)

### Anti-double-counting strategy
- On sync, query `mile_entries` for entries logged today with notes containing "Health Sync" for this challenge
- Subtract already-synced miles from the new total to only log the delta
- Store `lastSyncAt` in localStorage keyed by `challengeId`

### Plugin usage pattern
```typescript
import { CapacitorHealth } from "@capgo/capacitor-health";

// Request permission
await CapacitorHealth.requestAuthorization({ readPermissions: ["steps"] });

// Query steps for past 7 days
const result = await CapacitorHealth.queryAggregated({
  dataType: "steps",
  startDate: sevenDaysAgo.toISOString(),
  endDate: now.toISOString(),
  bucket: "day",
});
```

