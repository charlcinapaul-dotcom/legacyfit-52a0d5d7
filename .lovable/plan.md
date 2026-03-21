
## Fix: Lock icon mile value must match the "Mi X" label below it

### What's wrong
In `src/components/JourneyMap.tsx` line 209, locked nodes render:
```
{miRemaining}mi   ← miles REMAINING (miles_required minus current progress)
```
But the label below each node shows `Mi {m.miles}` (the milestone's target mile).

For a user at 1 mile logged looking at the Mi 15 node:
- Inside lock: `14.0mi` (15 − 1 = 14 remaining)
- Label below: `Mi 15`

These never match unless the user has logged 0 miles.

### Fix
Change line 209 from:
```
{miRemaining}mi
```
to:
```
{m.miles}mi
```

This makes the number inside the lock show the milestone's actual target (e.g. `15mi`), which is identical to the `Mi 15` label below — and matches the stamp and virtual route values.

### Scope
- Single file: `src/components/JourneyMap.tsx`, line 209 only
- No database changes, no other component changes
