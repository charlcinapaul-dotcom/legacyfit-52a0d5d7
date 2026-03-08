
## Problem

Line 129 of `src/pages/ChallengePassport.tsx` is literally `...` — a placeholder that was never replaced. The "Journey Stamps" `<TabsContent>` block is entirely missing, so clicking that tab renders nothing.

## Fix — One File, One Line Range

**`src/pages/ChallengePassport.tsx` — replace line 129 (`...`) with:**

```tsx
<TabsContent value="stamps">
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
    {stamps.length === 0 ? (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        No stamps available yet.
      </div>
    ) : (
      stamps.map((stamp) => (
        <PassportStamp
          key={stamp.id}
          stamp={stamp}
          onClick={() => setSelectedStamp(stamp)}
        />
      ))
    )}
  </div>
</TabsContent>
```

## Why This Works

- `usePassportStamps(challengeId)` is already called at the top of the page with the current challenge's ID — it already returns only the 6 milestones for that specific challenge
- `isUnlocked` is already computed by cross-referencing `user_passport_stamps` — locked stamps stay blurred (`blur-sm opacity-80`) exactly as on the `/passport` page, no change to `PassportStamp.tsx`
- Clicking a stamp opens the existing `selectedStamp` detail modal already wired up at the bottom of the file

## No Other Changes Needed

- `PassportStamp.tsx` — untouched, keeps blur behavior
- `usePassportStamps.ts` — untouched, already filters by `challengeId`
- No database changes, no edge functions
