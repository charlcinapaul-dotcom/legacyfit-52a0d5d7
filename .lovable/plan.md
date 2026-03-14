
## Problem

All three card variants (`WomensHistoryCard`, `PrideCard`, `PioneersCard`) use `absolute top-6 right-6` to position the "Active" badge, "Locked" label, and `ChevronRight` icon. The card title `<h3>` has no right padding, so on mobile with long titles, the text flows under the absolutely-positioned element — hiding the badge and clipping the title.

**Screenshot confirms:** "Eleanor Roosevelt Human Rights Journey" title text runs directly behind the "Active" pill badge.

## Fix — `src/pages/Challenges.tsx` only

Add `pr-20` (right padding) to the `<h3>` title element in all three card components. This pushes the title text away from the right edge, ensuring it never flows behind the badge, lock label, or chevron.

Current:
```tsx
<h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-[#C084FC] transition-colors">
```

Fixed:
```tsx
<h3 className="text-xl font-semibold text-foreground mb-2 pr-20 group-hover:text-[#C084FC] transition-colors">
```

Apply `pr-20` to the `<h3>` in all three card components: `WomensHistoryCard`, `PrideCard`, and `PioneersCard`.

No other changes. No logic, structure, or styling changes anywhere else.
