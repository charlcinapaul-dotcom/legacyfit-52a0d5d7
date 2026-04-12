

## Fix: Slow challenge loading and sign-out issues

### Problems identified

1. **Challenges page makes 3 unnecessary auth network calls when signed out.** `useActiveChallenge` and `useHasClaimedFreePreview` both call `supabase.auth.getUser()` (a network roundtrip) even when no user is logged in. This adds 2-4 seconds of latency before challenges render.

2. **Sign-out is sluggish.** The Dashboard `onAuthStateChange` handler fires `fetchProfile`, `fetchUserChallenges`, and `fetchCounts` via `setTimeout` even during sign-out events, causing race conditions and delayed navigation.

### Solution

#### 1. Gate auth-dependent hooks with session check (fast path for signed-out users)

**Files:** `src/hooks/useActiveChallenge.ts`, `src/hooks/useHasClaimedFreePreview.ts`

Replace `supabase.auth.getUser()` (network call) with `supabase.auth.getSession()` (reads from local storage, instant). If no session exists, return `null`/`false` immediately without any network request.

```typescript
// useActiveChallenge.ts — change queryFn
const { data: { session } } = await supabase.auth.getSession();
if (!session) return null;
// then use session.user.id instead of calling getUser()
```

Same pattern for `useHasClaimedFreePreview.ts`.

#### 2. Skip data fetches on sign-out event in Dashboard

**File:** `src/pages/Dashboard.tsx`

In the `onAuthStateChange` callback, check the event type. On `SIGNED_OUT`, navigate immediately without scheduling profile/challenge fetches:

```typescript
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    setSession(null);
    setUser(null);
    navigate("/auth");
    return; // don't fetch anything
  }
  // ... existing logic for other events
});
```

### Impact

- Signed-out users see challenges instantly (no auth network calls)
- Signed-in users see challenges faster (local session check vs network call)
- Sign-out navigates immediately without queuing dead fetches

### Files changed

| File | Change |
|---|---|
| `src/hooks/useActiveChallenge.ts` | Replace `getUser()` with `getSession()` |
| `src/hooks/useHasClaimedFreePreview.ts` | Replace `getUser()` with `getSession()` |
| `src/pages/Dashboard.tsx` | Short-circuit `onAuthStateChange` on `SIGNED_OUT` |

