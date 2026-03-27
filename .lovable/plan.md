

## Fix: Duplicate Story Text in Stamp Detail Modals

### Root Cause
The stamp detail modal renders two separate fields:
1. `stamp_copy` — displayed in italic with quotation marks
2. `historical_event` — displayed in regular text below it

For the "Cotton Fields" stamp (and likely others), both database columns contain the same text, causing the story to appear twice.

### Fix
In both `ChallengePassport.tsx` and `Passport.tsx`, update the modal to skip rendering `historical_event` if it matches `stamp_copy`. This avoids duplicate display while preserving both fields when they genuinely differ.

### Changes

**`src/pages/ChallengePassport.tsx`** (line ~274)
- Change the `historical_event` block to only render when `historical_event` exists **and** differs from `stamp_copy`:
  ```tsx
  {selectedStamp.historical_event && selectedStamp.historical_event !== selectedStamp.stamp_copy && (
  ```

**`src/pages/Passport.tsx`** (line ~267)
- Same change — add `&& selectedStamp.historical_event !== selectedStamp.stamp_copy` to the condition.

### No other changes
Both files keep all other modal content intact. Two lines changed total.

