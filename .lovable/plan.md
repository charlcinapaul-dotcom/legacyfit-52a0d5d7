
## What Changed From the Previous Plan

The user amended item 3 of the original plan. Instead of just fixing the Passport card's navigation destination, the requirement is now:

- **Rename** the button card from "Passport" → **"Passport Stamp Vault"**
- **Replace** the existing `/passport` page with an upgraded view that matches the exact layout and structure of `ChallengePassport.tsx`, but shows stamps **accumulated across all enrolled challenges** (not scoped to one challenge)

---

## Full Plan for `src/pages/Dashboard.tsx`

### Change 1 — Remove Log Miles / Log Steps tabs
Lines 311–355: Delete the entire `{activeChallenge ? (<Tabs...>...</Tabs>) : (<Card...Explore Challenges.../Card>)}` block. Remove unused imports: `MileLogger`, `StepLogger`, `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.

### Change 2 — Add GroupChallenge below ReferralCard
After `<ReferralCard />` (line 494), insert:
```tsx
{activeChallenge && (
  <div className="mb-8">
    <GroupChallenge
      challengeId={activeChallenge.challengeId}
      totalMiles={activeChallenge.totalMiles}
      isEnrolled={true}
    />
  </div>
)}
```
Add `GroupChallenge` import.

### Change 3 — Rename Passport card and point to Stamp Vault
Lines 499–512: Update the card text from `"Passport"` / `"View your stamps"` → `"Passport Stamp Vault"` / `"All your earned stamps"`. Change `onClick` to navigate to `/passport/vault`.

---

## Full Plan for `src/pages/Passport.tsx` — Rewrite as Stamp Vault

Replace the current simple grid-only page with the full two-tab structure matching `ChallengePassport.tsx`.

**New layout:**
- Header: `Book` icon + **"Passport Stamp Vault"** title + back arrow
- Progress card: amber gradient, shows total unlocked stamps across ALL challenges / total stamps in all enrolled challenges
- Two tabs:
  1. **Journey Stamps** — grid of all stamps across all enrolled challenges (same `PassportStamp` grid as ChallengePassport, grouped by challenge name as a sub-header above each group)
  2. **Passport Checkpoint** — list of milestones across all enrolled challenges (same lock/unlock card style as ChallengePassport), grouped by challenge

**Data strategy:**
- Call `usePassportStamps()` with no `challengeId` argument (already supported — it fetches all milestones and all user stamps)
- The existing hook returns ALL milestones (no filter) + all user stamps when no `challengeId` is passed, so this requires zero hook changes

**Stamp detail modal:** identical to `ChallengePassport.tsx`'s modal — shows image (greyscale if locked), title, location, mileage badge, stamp copy, historical event, unlock date.

**Remove** from `Passport.tsx`: the `<MileLogger>` block and the challenge filter `<Select>` dropdown (the vault shows all stamps, no filtering needed).

**Keep** the route at `/passport` — add `/passport/vault` as an alias in `App.tsx` pointing to the same component, OR simply update the Dashboard button to navigate to `/passport` and rename the page header.

The cleanest approach: keep the route `/passport`, rename the page title inside it, and rewrite the content. Then in `Dashboard.tsx` the `onClick` stays `navigate("/passport")`.

---

## Files to Change

1. **`src/pages/Dashboard.tsx`**
   - Remove Log Miles / Log Steps tabs block + their imports
   - Add `<GroupChallenge>` after `<ReferralCard />`
   - Rename Passport card → "Passport Stamp Vault"

2. **`src/pages/Passport.tsx`**
   - Rewrite with two-tab layout (Journey Stamps + Passport Checkpoint)
   - Remove `MileLogger` and challenge `Select` filter
   - Show all enrolled-challenge stamps accumulated together
   - Add stamp detail modal matching `ChallengePassport.tsx`
   - Change page title to "Passport Stamp Vault"

No database changes, no hook changes, no new routes needed.
