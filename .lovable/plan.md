## Goal

Ensure locked digital stamps reveal nothing beyond "locked + miles required". No grayed image, no `stamp_copy`, no `historical_event`, no share button.

The first-mile → active-challenge → others-locked flow already works (see findings above) and needs no changes.

## Change — single file: `src/pages/ChallengePassport.tsx`

In the `<Dialog>` block (lines ~228–292), gate every content branch on `selectedStamp.isUnlocked`:

1. **Image area (lines 238–254):** keep the unlocked image branch. For the locked branch, replace the grayed `<img>` and the `Book` fallback with a single neutral locked panel — a muted box containing a `Lock` icon and the line "Reach {miles_required} mi to unlock".
2. **Title + meta (lines 256–267):** keep `stamp_title`, `location_name`, and the mileage pill for both states (these are already visible on the grid card, so no new info is leaked).
3. **`stamp_copy` (lines 268–270):** render only when `selectedStamp.isUnlocked`.
4. **`historical_event` (lines 271–273):** render only when `selectedStamp.isUnlocked`.
5. **`unlockedAt` line (lines 274–278):** already gated — leave as is.
6. **`ShareMenu` (lines 281–288):** already gated — leave as is.

Additionally, as a belt-and-suspenders measure: in the `onClick` at line 141–143, the existing `if (stamp.isUnlocked) setSelectedStamp(stamp)` guard already prevents opening for locked stamps. No change needed there, but the modal-side gating above guarantees safety even if a future refactor opens the dialog for a locked stamp.

## What is NOT changing

- `src/components/PassportStamp.tsx` (the grid tile) — already correct.
- `supabase/functions/check-milestone-unlocks/index.ts` — already inserts the free `user_challenges` row.
- `src/hooks/useActiveChallenge.ts`, `useEnrollmentStatus.ts`, `useMileLogging.ts` — untouched.
- `src/components/challenges/ChallengeCard.tsx` — lock-other-challenges behavior already works.

## Verification

1. Log in as a user with zero stamps unlocked, open `/passport/<slug>`, tap a locked stamp tile → nothing happens (disabled button).
2. Manually force-open the dialog (e.g., via React devtools) on a locked stamp → only locked panel + title + mileage pill render. No `stamp_copy`, no `historical_event`, no image preview, no share button.
3. Unlocked stamps continue to show full image, copy, historical event, unlock date, and share menu.
