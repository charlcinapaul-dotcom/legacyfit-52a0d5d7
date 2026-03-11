
## Root Cause Analysis

The current `PATH_D = "M 30,180 C 80,160 110,130 160,110 S 240,85 300,70 S 380,52 440,38 S 490,24 530,15"` with `viewBox="0 0 620 196"` causes clipping at both ends:

- **First node (t=0)**: center at x≈30, y≈180. Circle left edge = x=10, barely inside viewBox. "Mi X" label below at y≈213 — **outside viewBox height of 196**. Clipped at bottom.
- **Last node (t=1)**: center at x≈530, y≈15. Circle top edge = y=-5. "Mi X" label above at y≈-10. **Both clipped at the top**.

## Exact Changes — `src/components/JourneyMap.tsx`

**Line 19** — New PATH_D with generous inset on all four edges:
```
const PATH_D = "M 55,195 C 110,172 150,148 200,128 S 280,100 340,84 S 415,62 475,48 S 525,36 565,28";
```
- First node at ~x=55, y=195: left edge at x=35 (safe), bottom label at y=228 (fits in 230)
- Last node at ~x=565, y=28: right edge at x=585 (fits in 620), top label at y=3 (tight but fits — adjusted to y=8 by label logic below)

**Line 94** — Container height 200→230:
```
style={{ height: 230 }}
```

**Line 97** — viewBox height 196→230, width stays 620:
```
viewBox="0 0 620 230"
```

**Line 206** — Mile label threshold and offset: `pt.y > 100` stays, but bump the below-label offset from `+13` to `+15` and above-label offset from `-5` to `-7` so labels have clean clearance:
```
y={pt.y > 100 ? pt.y + rN + 15 : pt.y - rN - 7}
```

No logic, no milestone state, no colors, no layout, no props changes.
