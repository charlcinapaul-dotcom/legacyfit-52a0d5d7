## Remove Beta Access from the Platform

This removes all beta-specific messaging, the `BetaCodeRedemption` component. The `RewardCodeRedemption` (referral reward codes) is **kept** — it's a separate, permanent feature.

### Files to change

**1. `src/components/ChallengePricing.tsx**`

- Remove the `BetaCodeRedemption` import
- Remove the `hasOtherActiveChallenge` variable and its Alert banner ("Beta limit: You're currently enrolled in...")
- Remove the `<BetaCodeRedemption>` component from the JSX
- Remove the disabled state on the checkout buttons that referenced `hasOtherActiveChallenge`
- Keep `RewardCodeRedemption` untouched

**2. `src/pages/Challenges.tsx**`

- Remove the "Beta limit" Alert banner that shows when a user has an active challenge (lines ~163–179)
- Keep everything else (challenge listing, free walk card, locked states)

**3. `src/components/BetaCodeRedemption.tsx**`

- Delete this file entirely — it's only used in `ChallengePricing.tsx` and serves no purpose post-launch

### What is NOT changed

- `RewardCodeRedemption` component — referral reward codes remain
- `redeem-beta-code` edge function — left in place (harmless, not exposed in UI)
- `useActiveChallenge` hook — still used elsewhere for dashboard/progress display
- Challenge lock visuals for non-enrolled challenges — only the "beta limit" banner and beta code entry are removed
- One challenge at a time restriction
- All other platform files

### Technical summary

```text
ChallengePricing.tsx
  - Remove: import BetaCodeRedemption
  - Remove: hasOtherActiveChallenge derived variable
  - Remove: Alert banner block (lines ~122–139)
  - Remove: disabled={!!hasOtherActiveChallenge} from both buttons
  - Remove: "Challenge Limit Reached" button label conditionals
  - Remove: <BetaCodeRedemption> JSX block
  - Keep:   <RewardCodeRedemption> untouched

Challenges.tsx
  - Remove: the <section> containing the Alert with "Beta limit" text
  - Keep:   everything else

BetaCodeRedemption.tsx
  - Delete file
```