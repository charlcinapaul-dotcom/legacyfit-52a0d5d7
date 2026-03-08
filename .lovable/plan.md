
## What This Is

The "Free Walk Activity" section on the Dashboard (`src/pages/Dashboard.tsx`) reads Free Walk history from `localStorage` and displays a list of past Free Walk sessions — visible to any logged-in user. It also includes a "Walk Again" button that links to `/free-walk`.

This violates the rule that all Free Walk data must remain hidden.

## Everything to Remove

**State + constants (lines 24–32, 70):**
- `FREE_WALK_HISTORY_KEY` constant
- `FREE_WALK_PENDING_KEY` constant
- `FreeWalkEntry` interface
- `freeWalkHistory` state variable

**Logic (lines 78–153):**
- `useEffect` that loads free walk history from `localStorage` (lines 78–84)
- `savePendingFreeWalk` function (lines 125–153) — syncs pending free walk data to user profile on login
- The `savePendingFreeWalk(session.user.id)` call inside the auth state listener (line 102)

**UI section (lines 506–549):**
- The entire "Free Walk Activity" JSX block — the section heading, "Walk Again" button, and the mapped list of walk entries

**Unused imports (line 21):**
- `PersonStanding` icon (only used in the Free Walk Activity section)
- `Timer`, `Flame` icons (only used in the Free Walk Activity section)

## What Stays Untouched
Everything else — challenges, stats, BIB, referral card, certificate modal, mile loggers — remains exactly as-is.
