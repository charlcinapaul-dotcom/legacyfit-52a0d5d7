

## Fix GPS Walk imports and add Wake Lock

### Problems identified

1. **Wrong import**: Line 2 still imports from the removed `@capacitor-community/background-geolocation` package instead of `@capgo/background-geolocation`.

2. **Missing Wake Lock**: Screen may dim/lock during long walks, interrupting GPS tracking. Need to request Wake Lock when walk starts and release when ending/discarding.

### Changes

| File | Change |
|---|---|
| `src/hooks/useGpsWalk.ts` | Update import to `@capgo/background-geolocation` |
| `src/hooks/useGpsWalk.ts` | Add Wake Lock request in `startWalk` before `startWatch()` |
| `src/hooks/useGpsWalk.ts` | Add Wake Lock release in `endWalk` and `discardWalk` before `stopTracking()` |

### Implementation details

**1. Import fix (line 2):**
```typescript
import type { BackgroundGeolocationPlugin } from "@capgo/background-geolocation";
```

**2. Wake Lock in `startWalk` (before `startWatch()`):**
```typescript
try {
  (window as any)._wakeLock = await (navigator as any).wakeLock?.request("screen");
} catch (e) {
  console.warn("Wake lock unavailable", e);
}
```

**3. Wake Lock release in `endWalk` and `discardWalk` (before `stopTracking()`):**
```typescript
try {
  await (window as any)._wakeLock?.release();
  (window as any)._wakeLock = null;
} catch (e) {}
```

No other code changes required — these are surgical updates to fix the import and add screen wake functionality.

