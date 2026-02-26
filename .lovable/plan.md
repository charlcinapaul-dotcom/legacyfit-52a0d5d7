
# Integrate Free Starter Walking App — LegacyFit Theme

## What the Free Starter Is

The GitHub repository contains a self-contained 5-mile virtual walking experience called the "Free Track." It has 6 screens:

1. **SplashScreen** — Entry point / landing for the free walk
2. **OnboardScreen** — Name + fitness level + goal selection
3. **RouteScreen** — Preview of the 11 historical queens / 5-mile route
4. **ActiveWalkScreen** — Live timer, miles, steps, calories + queen milestone cards
5. **CompleteScreen** — Walk summary + options (walk another, enter Still)
6. **StillFeature** — 4-screen mindfulness companion (Home → Before → During → After)

It also includes:
- `src/data/queens.ts` — 11 historical women with quotes, domains, route stops
- `src/data/still.ts` — Affirmations, spoken words, breath phases, reflection prompts
- `src/hooks/useWalkTimer.ts` — Real-time walk timer (seconds → miles/steps/calories)
- `src/hooks/useSilenceTimer.ts` — 60-second silence timer for Still feature
- `src/components/ui-primitives.tsx` — Custom Mono label, BtnFill, BtnOutline, ArrowRight, StepTrack

The original app uses a warm terracotta/brown palette (`#1C1410`, `#BE5A30`, `#D4922A`, `#F4EDD8`). **All of these must be replaced** with the LegacyFit theme (black background, gold `hsl(45 67% 52%)`, cyan `hsl(193 100% 50%)`).

## Integration Strategy

The free starter will be added as a new route `/free-walk` within the existing LegacyFit app. It will be accessible from:
- The main navigation ("Free Walk" link)
- The landing page (a "Try Free" or "Start Free" CTA)
- The challenges page (as a free tier option)

The SplashScreen will use the LegacyFit logo, black background, and gold/cyan accents. The "Free Track" badge will remain but styled in gold. Upsell CTAs ("Upgrade to Full Challenge") will link to `/challenges`.

## Re-theming Rules

| Original color | LegacyFit replacement |
|---|---|
| `#1C1410` / `#110E0A` / `#261C12` (backgrounds) | `hsl(var(--background))` = `#000` / `hsl(var(--card))` |
| `#BE5A30` / `#C4562A` (primary accent — terracotta) | `hsl(var(--primary))` = gold `#D4AF37` |
| `#D4922A` / `#C88430` (secondary warm gold) | `hsl(var(--primary))` or slightly lighter gold |
| `#F4EDD8` (warm cream text) | `hsl(var(--foreground))` = white |
| `#9A8A6E` / `#7A6E5E` (muted text) | `hsl(var(--muted-foreground))` |
| `#4E6E4A` (green badge border) | `hsl(var(--border))` |
| `white/[0.06]` borders | `hsl(var(--border))` |
| Font serif + warm | Same font (Inter), gold gradients |

## Files to Create

### New data/hooks (copied and adapted from repo)
- `src/data/queens.ts` — queens data + ROUTE_STOPS (identical content, no color changes needed)
- `src/data/still.ts` — affirmations + spoken words (identical content)
- `src/hooks/useWalkTimer.ts` — walk timer hook (identical logic)
- `src/hooks/useSilenceTimer.ts` — silence timer hook

### New components (re-themed)
- `src/components/free-walk/ui-primitives.tsx` — Re-themed Mono, BtnFill, BtnOutline using CSS vars
- `src/components/free-walk/SplashScreen.tsx` — LegacyFit logo, black bg, gold accents
- `src/components/free-walk/OnboardScreen.tsx` — Dark bg, gold selection states
- `src/components/free-walk/RouteScreen.tsx` — Dark bg, gold queen stops
- `src/components/free-walk/ActiveWalkScreen.tsx` — Dark bg, gold pulse dot, cyan accent for stats
- `src/components/free-walk/CompleteScreen.tsx` — Dark bg, gold gradient, upsell CTA
- `src/components/free-walk/still/StillHome.tsx` — Dark bg, gold/cyan orb
- `src/components/free-walk/still/StillBefore.tsx` — Dark bg, gold accents
- `src/components/free-walk/still/StillDuring.tsx` — Dark bg, gold spoken word
- `src/components/free-walk/still/StillAfter.tsx` — Dark bg, gold reflection
- `src/components/free-walk/StillFeature.tsx` — Coordinator (minimal re-theme)
- `src/components/free-walk/FreeWalkApp.tsx` — Root coordinator (replaces repo's App.tsx logic)

### New page
- `src/pages/FreeWalk.tsx` — Simple wrapper that renders `<FreeWalkApp />`

### Modified files
- `src/App.tsx` — Add `<Route path="/free-walk" element={<FreeWalk />} />`
- `src/components/SiteNavigation.tsx` — Add "Free Walk" nav link (styled with gold/cyan badge)
- `src/pages/Landing.tsx` — Add "Try Free" button in hero CTA row

## Key Design Decisions

1. **No auth required** for the free walk — it is truly free, no sign-in gate
2. **Upsell moment** on CompleteScreen: a gold-bordered card saying "Ready to go further? Join the full 30-Day LegacyFit Challenge" with a link to `/challenges`
3. **"Free Track" badge** kept on the SplashScreen, styled in gold (`text-primary border-primary/30 bg-primary/10`)
4. **Navigation header** on each screen shows the LegacyFit logo (using the existing asset) + "Free Track" mono label
5. **Still feature** is retained intact — re-themed to black/gold

## Technical Notes

- The `useWalkTimer` simulates a 5-mile walk over 90 minutes (1 second = ~0.055 miles). This is a virtual/demo timer — no GPS needed.
- All inline hex color strings will be converted to Tailwind CSS variable-based classes or inline `hsl(var(--...))` styles.
- The `font-serif` class references used in the original will render as Inter (existing font) which is fine for this integration.
- The `still/StillBefore.tsx` and `still/StillAfter.tsx` files will also need to be fetched and re-themed (similar pattern).
