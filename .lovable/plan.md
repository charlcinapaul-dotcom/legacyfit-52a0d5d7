
## Audit Summary

**Main site pages** (Landing, Challenges, Dashboard, Auth, About, FAQ, etc.): All use `PageLayout` → `SiteNavigation`, which correctly renders the logo in a fixed nav bar. No issues here.

**Free-walk screens** (`/free-walk`): This is a standalone mini-app that bypasses `PageLayout`. The current approach has two problems:
1. `SplashScreen` renders its own logo in its top bar, and the floating "← LEGACYFIT" button from `FreeWalkApp` overlaps it on mobile (confirmed in the screenshot).
2. `OnboardScreen`, `RouteScreen`, `ActiveWalkScreen`, `CompleteScreen`, and the Still screens have no logo at all — only the floating text-only back button.

---

## Plan

### 1. Create a shared `FreeWalkHeader` component
A single header component used on every free-walk screen. It will contain:
- The LegacyFit logo (linking back to `/`)
- A "FREE TRACK" badge on the right
- No fixed/floating positioning — it sits inline at the top of each screen so it can never overlap anything

### 2. Remove the floating `Link` button from `FreeWalkApp.tsx`
The global floating overlay that currently says "← LEGACYFIT" will be removed entirely. The header component will handle navigation back to the main site.

### 3. Update `SplashScreen.tsx`
Remove the logo and badge from the existing top bar, replace with `<FreeWalkHeader />`.

### 4. Update `OnboardScreen.tsx`
Add `<FreeWalkHeader />` at the top in place of the current header area (which has no logo).

### 5. Update `RouteScreen.tsx`
Add `<FreeWalkHeader />` at the top of the hero band section.

### 6. Update `ActiveWalkScreen.tsx`
Add `<FreeWalkHeader />` at the very top. The `pt-16` padding that was previously added to compensate for the floating button will be adjusted back down to a natural value.

### 7. Update `CompleteScreen.tsx`
Add `<FreeWalkHeader />` at the top.

### 8. Update Still screens (`StillHome`, `StillBefore`, `StillDuring`, `StillAfter`)
Add `<FreeWalkHeader />` to each one.

---

## Technical Details

**New file:** `src/components/free-walk/FreeWalkHeader.tsx`

```tsx
import { Link } from "react-router-dom";
import legacyFitLogo from "@/assets/legacyfit-logo.png";

export function FreeWalkHeader() {
  return (
    <div className="flex justify-between items-center px-6 md:px-[clamp(24px,6vw,72px)] pt-6 pb-4">
      <Link to="/" className="shrink-0">
        <img src={legacyFitLogo} alt="LegacyFit" className="h-10 w-auto" />
      </Link>
      <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-primary border border-primary/30 bg-primary/10 px-3.5 py-1.5">
        Free Track
      </span>
    </div>
  );
}
```

This header:
- Is part of the normal document flow (not fixed/floating), so it never overlaps content
- Shows the full logo on every screen
- The logo is a clickable link back to `/`, replacing the old "← LEGACYFIT" floating button
- The "FREE TRACK" badge provides context about where the user is

**Files changed:**
- `src/components/free-walk/FreeWalkHeader.tsx` (new)
- `src/components/free-walk/FreeWalkApp.tsx` — remove floating `Link`
- `src/components/free-walk/SplashScreen.tsx` — replace manual logo+badge with `<FreeWalkHeader />`
- `src/components/free-walk/OnboardScreen.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/RouteScreen.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/ActiveWalkScreen.tsx` — add `<FreeWalkHeader />`, fix padding
- `src/components/free-walk/CompleteScreen.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/still/StillHome.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/still/StillBefore.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/still/StillDuring.tsx` — add `<FreeWalkHeader />`
- `src/components/free-walk/still/StillAfter.tsx` — add `<FreeWalkHeader />`
