## Analysis: Existing Logic (Must Not Break)

**Progress source of truth:**

- `useEnrollmentStatus(challengeId)` → queries `user_challenges.miles_logged` → returns `enrollment.milesLogged`
- `ChallengeRoute` uses `userProgress.milesLogged = enrollment?.milesLogged ?? 0`
- Milestone unlock is purely computed: `isUnlocked = userProgress.milesLogged >= milestone.miles`
- No database writes happen from the map — it's purely read + display
- The trigger on `mile_entries` handles streak logic separately, untouched

**What currently exists in the Virtual Route section (lines 551–645):**

- A vertical timeline list with lock/check icons, milestone names, location, description (only shown unlocked), audio replay, and View on Map buttons
- No visual canvas/SVG map showing milestones as nodes on a route

**What the reference image shows:**

- A dark card labeled "JOURNEY MAP" with "TAP 🔒 FOR DETAILS" 
- Milestone nodes plotted along a dashed route line
- Unlocked = gold crown, active/next = hourglass, locked = lock icon in a dashed circle
- A "YOU · 15.2mi" label floating at the user's current position
- Mileage labels (ex. Mi 6, Mi 13, Mi 20...) beneath each node must match current challenge's milestone/mileage 
- Legend row at the bottom:  👑 Unlocked · ⏳ Next stop · 🔒 Locked
- Tapping a locked node shows distance remaining

---

## Plan

Add a **Journey Map** visual component (SVG-based, no Leaflet) directly above the existing "Virtual Route" timeline in `ChallengeRoute.tsx`. The map will use the existing `challenge.milestones` array and `userProgress.milesLogged` — **zero changes to data-fetching, hooks, or DB logic**.

### What changes

**1. New component: `src/components/JourneyMap.tsx**`

- Pure SVG canvas (no external map library)
- Plots milestones as circles along a curved dashed route, spaced proportionally by mileage
- Renders 3 node states:
  - **Unlocked** — gold/primary filled circle with ✓ checkmark
  - **Next** (first locked) — pulsing border, hourglass-style indicator
  - **Locked** — dashed-border dim circle with lock icon
- Draws a solid gold line between unlocked nodes, dashed gray line for remaining route
- "YOU" marker at proportional position based on miles logged
- Node tap → shows a small popover/tooltip with milestone name + distance remaining (locked) or location (unlocked)
- Legend row below: ✓ Unlocked · Next stop · 🔒 Locked
- Adapts to mobile (390px) viewport — horizontal scroll or condensed layout

**2. Edit `src/pages/ChallengeRoute.tsx` (surgical)**

- Insert `<JourneyMap>` component between the "Progress Section" card (line ~495) and the "Virtual Route" section (line ~510)
- Pass: `milestones`, `milesLogged`, `totalMiles`, `colors`
- No changes to existing timeline list, no hooks changed, no data fetching changed

### Color mapping (matches existing palette)

- Unlocked node fill: `hsl(var(--primary))` (gold #D4AF37)
- Unlocked line: `hsl(var(--primary))`
- Locked node: `hsl(var(--border))` with opacity
- Next node: `hsl(var(--primary)/0.3)` pulsing border
- YOU marker: white circle with primary border
- Background card: `hsl(var(--card))` 
- Text labels: `hsl(var(--muted-foreground))`

### State for tap interaction

- `selectedMilestone: number | null` local state in `JourneyMap`
- Tap a node → set selected → show inline popover below the node
- Shows name, "X.X mi away" for locked, "✓ Unlocked" for unlocked

### What is NOT changed

- `useEnrollmentStatus` hook — untouched
- `useActiveChallenge` hook — untouched  
- `useChallengeBySlug` hook — untouched
- `mile_entries` trigger — untouched
- `user_challenges.miles_logged` update logic — untouched
- Existing Virtual Route timeline — stays in place below the new map
- All existing milestone unlock conditions — identical logic copied by reference

### Files changed

1. `src/components/JourneyMap.tsx` — new file
2. `src/pages/ChallengeRoute.tsx` — add ~5 lines to import and insert the component