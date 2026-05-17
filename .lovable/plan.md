## Does the overall plan work?

**Yes, the lock behavior already works** — with one caveat about the specific `useEnrollmentStatus` edit you proposed.

### Why locking already works after a free mile

The edge function `check-milestone-unlocks` (FREE FIRST-MILE PATH) now inserts a `user_challenges` row with `payment_status: 'free'` when the first mile is logged. The lock logic in `ChallengeCard` is driven by `useActiveChallenge`, which queries the most recent `user_challenges` row **regardless of `payment_status**`:

```ts
// useActiveChallenge.ts — no payment_status filter
.from("user_challenges")
.select(...).eq("user_id", user.id)
.order("created_at", { ascending: false }).limit(1).maybeSingle();
```

`ChallengeCard` then locks every other challenge:

```ts
const isLocked = !!activeChallenge && !activeChallenge.isCompleted && !isCurrentChallenge;
```

So as soon as the free-mile row lands in `user_challenges`, all other challenges lock automatically. No additional code change is required for the lock behavior itself.

### Caveat on the requested `useEnrollmentStatus` edit

Your proposed change is mechanically safe (types compile, no other file consumes a `"free"` literal), **but it has one behavioral side effect** you should be aware of before approving.

Flipping `isEnrolled` to `true` for `payment_status === "free"` changes what a free-preview user sees on `ChallengeRoute.tsx`, because three branches gate on `enrollment?.isEnrolled`:


| Line | Branch                                                                     | Effect on a `free` user after the change                                                                               |
| ---- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 591  | `showReEngagementBanner && !enrollment?.isEnrolled`                        | Re-engagement "Your first mile is saved / unlock the full journey" banner **will no longer show**                      |
| 727  | `!enrollment?.isEnrolled` → renders `<ChallengePricing>`                   | Pricing/upsell section **will be hidden** from free users                                                              |
| 913  | `enrollment?.isEnrolled && progress complete` → `<SubscriptionUpsellCard>` | Subscription upsell **could appear** to a free user if they somehow hit 100% (not reachable on free, but worth noting) |


In short: with `isEnrolled: true` for free, the page treats a free-preview user as fully enrolled and **removes their path to purchase**. That breaks the preview-to-enrollment funnel.

`useMileLogging.ts` is unaffected — it computes `isEnrolledPaid` independently against `payment_status === "paid"` and does not read this hook.

`Dashboard.tsx` passes a hard-coded `isEnrolled={true}` and does not read this hook either.

## Recommended plan

### apply the type change only, keep `isEnrolled` strict

Make the status reportable so future UI can distinguish "free" from "pending", but do **not** treat free as enrolled for gating paid UI.

```ts
export type EnrollmentStatus = "paid" | "pending" | "not_enrolled" | "free";

const status: EnrollmentStatus =
  data.payment_status === "paid" ? "paid" :
  data.payment_status === "free" ? "free" : "pending";

return {
  status,
  milesLogged: data.miles_logged || 0,
  isEnrolled: status === "paid",   // unchanged — free is NOT enrolled
};
```

Result: lock behavior still works (driven by `useActiveChallenge`, not this hook), and the pricing/re-engagement banners on `ChallengeRoute` continue to show for free users.