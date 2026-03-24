
## Why Challenges Load Slowly — Root Cause Analysis

There are **4 compounding problems** causing the slow load:

### Problem 1: Sequential waterfall queries (biggest issue)
`useChallengesWithMeta` fires **two Supabase requests back-to-back** in a single `queryFn`:
1. Fetch all challenges → wait for response
2. Only then fetch milestones for all those challenge IDs

The network logs confirm this: the milestones request doesn't start until the challenges request finishes. On a mobile network (the user is on 390px viewport = likely mobile) this chain adds real latency.

### Problem 2: Three parallel auth-gated queries on mount
When `/challenges` loads, it simultaneously fires:
- `useHasClaimedFreePreview` → `supabase.auth.getUser()` + profile query
- `useActiveChallenge` → `supabase.auth.getUser()` + user_challenges query
- `useChallengesWithMeta` → challenges + milestones (sequential)

Each of the first two calls `supabase.auth.getUser()` independently, adding extra auth round-trips before the data queries can start.

### Problem 3: No persistent cache (`staleTime` too short)
- `useChallengesWithMeta` has `staleTime: 60_000` (1 minute) but **no `gcTime`** — data is garbage collected after the default 5 minutes
- `useActiveChallenge` and `useHasClaimedFreePreview` have **no `staleTime` at all** (default 0 = always stale), so they refetch on every navigation to `/challenges`
- `QueryClient` is created with no default options, so no global cache tuning

### Problem 4: All challenge images load at once
Every `ChallengeCard` renders a cover image with `loading="lazy"` but with **25 challenges** visible on page, the browser fires 25 image requests simultaneously — flooding the network while data queries are still in-flight.

---

## Fix Plan

### 1. Split the waterfall into parallel fetches in `useChallengesWithMeta`
Replace the sequential `challenges → milestones` pattern with `Promise.all`:
```ts
const [challengesResult, milestonesResult] = await Promise.all([
  supabase.from("challenges").select(...),
  supabase.from("milestones").select("challenge_id, order_index, stamp_image_url").order("order_index")
]);
```
This eliminates the sequential delay — both queries fire at the same time.

### 2. Increase `staleTime` on all three hooks
- `useChallengesWithMeta`: raise from `60_000` to `5 * 60_000` (5 min) and add `gcTime: 10 * 60_000`
- `useActiveChallenge`: add `staleTime: 30_000` — user's active challenge rarely changes mid-session
- `useHasClaimedFreePreview`: add `staleTime: 5 * 60_000` — this is a one-time flag that never changes

### 3. Add global QueryClient defaults
In `App.tsx`, configure the QueryClient with sensible defaults so all queries benefit without individual tuning:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
    },
  },
});
```

### 4. Add skeleton loading cards to Challenges page
Currently the page shows plain text "Loading challenges..." while all queries run. Replace with a grid of skeleton cards (matching the `ChallengeCard` shape) so the page feels instant:
- Show 4 skeleton cards in a 2-column grid while `isLoading` is true
- Use the existing `Skeleton` component from `src/components/ui/skeleton.tsx`

### Files to change
| File | Change |
|------|--------|
| `src/hooks/useChallengesWithMeta.ts` | Run challenges + milestones queries in parallel via `Promise.all` |
| `src/hooks/useActiveChallenge.ts` | Add `staleTime: 30_000` |
| `src/hooks/useHasClaimedFreePreview.ts` | Add `staleTime: 5 * 60_000` |
| `src/App.tsx` | Add global QueryClient defaults |
| `src/pages/Challenges.tsx` | Replace text loading state with skeleton cards |

These changes together eliminate the waterfall, reduce redundant refetches on navigation, and give users immediate visual feedback while data loads.
