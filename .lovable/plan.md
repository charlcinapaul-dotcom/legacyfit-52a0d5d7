

## Add Copy Link to ShareMenu + Share Button on Dashboard Streak Row

### Changes

**1. ShareMenu.tsx — Add "Copy Link" as 5th option + accept optional `shareUrl` prop**

- Add a new optional `shareUrl` prop (defaults to `BASE_URL`) so callers can pass a specific URL to copy.
- Add a `Link` icon import from lucide-react.
- Add a 5th button after TikTok: "Copy Link" — calls `navigator.clipboard.writeText(shareUrl)` and shows `toast.success("Link copied to clipboard!")`.

**2. Dashboard.tsx — Restyle streak banner row to include a Share button**

Restructure lines 400–415 (the streak banner block) into a flex row with two items:

```text
┌──────────────────────────────────────┐  ┌──────────┐
│ 🔥 1-Week Streak                     │  │  Share   │
│ Keep it going — log miles today...   │  │          │
└──────────────────────────────────────┘  └──────────┘
```

- Wrap in a `flex gap-3` container.
- Streak banner: reduce border to `border border-primary/20 rounded-lg p-3` (smaller/thinner than current `border-primary/40 rounded-xl p-4`).
- Share button: its own bordered container (`border border-primary/20 rounded-lg p-3`) containing a `ShareMenu` component. Pass `stampName` as the active challenge name (e.g., the challenge title) and `shareUrl` as `https://legacyfitvirtual.com`. This gives users an option to share their progress / certificate link.
- Import `ShareMenu` into Dashboard.tsx.

### Files modified
| File | Change |
|---|---|
| `src/components/ShareMenu.tsx` | Add `shareUrl` prop, add "Copy Link" 5th entry with `Link` icon |
| `src/pages/Dashboard.tsx` | Restructure streak banner row, add Share button beside it, reduce border styling |

