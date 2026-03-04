
## What's Wrong

**Table:** `user_challenges`  
**Key columns:** `is_completed` (boolean), `miles_logged`, `challenge_id`

The `useActiveChallenge` hook fetches the user's most recent challenge record but **never reads `is_completed`**. So when a challenge is finished, the hook still returns it as an active challenge, and the lock condition in `Challenges.tsx` fires for every other card.

```ts
// Current broken logic (Challenges.tsx line 66):
const isLocked = !!activeChallenge && !isCurrentChallenge;
// Locks everything whenever ANY challenge exists — completed or not
```

---

## Fix — Two Files Only

### File 1: `src/hooks/useActiveChallenge.ts`
- Add `is_completed` to the Supabase select query
- Add `isCompleted: boolean` to the `ActiveChallenge` interface
- Map it in the returned object

### File 2: `src/pages/Challenges.tsx` — both `ChallengeCard` and `WomensHistoryCard`
Change the lock condition in both components from:
```ts
const isLocked = !!activeChallenge && !isCurrentChallenge;
```
to:
```ts
const isLocked = !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;
```

This means other challenges only show as locked when the user has an **in-progress** (not completed) active challenge. Once `is_completed = true` in `user_challenges`, all challenge cards become selectable again.

**No schema changes, no migrations, no UI changes.**
