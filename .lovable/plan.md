
## Fix `currentStop` Find Logic in `ActiveWalkScreen.tsx`

### The Problem

Line 37 uses a forward `find()` that returns the **first** stop where `currentMiles <= stop.dist`. This means:

- At 0.0 miles → correctly returns stop 01 (Sojourner Truth at 0.5 mi) ✓
- At 0.6 miles → incorrectly returns stop 02 (Ida B. Wells at 1.0 mi), skipping Sojourner Truth ✗
- The walker appears to be "at" a stop they haven't reached yet

The fix reverses the array and uses `>=` so the walker is placed at the **last stop they've actually passed**.

### The Fix

**Line 37 only** — one-line change:

```typescript
// Before (wrong — forward find, finds first stop ahead)
const currentStop = ROUTE_STOPS.find((s) => currentMiles <= parseFloat(s.dist)) ?? ROUTE_STOPS[0];

// After (correct — reverse find, finds last stop reached)
const currentStop = [...ROUTE_STOPS].reverse().find(
  (s) => currentMiles >= parseFloat(s.dist)
) ?? ROUTE_STOPS[0];
```

### Downstream Impact

Everything else (`currentStopIndex`, `nextStop`, `currentQueenFull`, narration, celebration overlay) derives from `currentStop`, so they all benefit from the corrected value automatically — no other changes needed.

### File Changed
- `src/components/free-walk/ActiveWalkScreen.tsx` — line 37 only
