## What We're Building

Replace the plain "Welcome back" text block in `src/pages/Dashboard.tsx` with a full-width hero card that matches the challenge page hero exactly — background image from the active challenge, dark gradient overlay, and white text on top. The stats cards stay below as-is. Keep the text as is. Change only the background from black to the image 

## Where the Image Comes From

`activeChallenge.imageUrl` is already fetched via `useActiveChallenge()` and available in the component. No new data fetching needed. If the user has no active challenge, fall back to a solid gradient (same as the current empty-state card).

## Exact Changes — `src/pages/Dashboard.tsx`

**Replace lines 248–258** (the `{/* Welcome Section */}` div) with a hero card built to match the ChallengeRoute pattern:

```tsx
{/* Hero Section */}
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary via-card to-secondary border border-border mb-8">
  {/* Dark gradient overlay — same as ChallengeRoute */}
  <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
  
  {/* Background image from active challenge */}
  {activeChallenge?.imageUrl && (
    <img
      src={activeChallenge.imageUrl}
      alt=""
      className="absolute inset-0 w-full h-full object-cover opacity-30"
    />
  )}

  {/* Content */}
  <div className="relative z-20 p-6 md:p-10">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
      Welcome back, {profile?.display_name || "Explorer"}!
    </h1>
    <p className="text-muted-foreground">
      Ready to unlock more history today?
    </p>
  </div>
</div>
```

This is the exact same structure as lines 318–382 of `ChallengeRoute.tsx`, trimmed to just the greeting content. The `container mx-auto px-4` wrapper on `<main>` means the card will be full width within the page's max-width container, consistent with the challenge page.

## Files to Change

- `src/pages/Dashboard.tsx` — lines 248–258: replace plain welcome div with hero card