
## What Is Actually Happening

The 11 stamp images (Sojourner Truth, Ida Wells, Eleanor Roosevelt, etc.) are **local PNG files** stored in `src/assets/stamps/free-walk/`. These PNGs contain the purple, green, orange, and teal colors you see — the colors are baked into the image files themselves, not CSS.

No amount of CSS changes will fix this. The PNG files must be **regenerated** with only burgundy red and navy blue ink.

## The Fix: Regenerate All 11 Stamp PNGs

Each of the 11 stamp PNG files will be regenerated using the Lovable AI image model with a strict color-locked prompt:

- **Only** burgundy red (`#7A1E2C`) and/or navy blue (`#1E3A5F`) ink
- Parchment/cream background (`#F5EDD8`)
- Vintage passport stamp aesthetic
- Same queen names and labels as current

The stamps will vary between:
- Some stamps in **burgundy red only**
- Some in **navy blue only**
- Some in a **combination of both**

## Files Changed

- `src/assets/stamps/free-walk/sojourner-truth.png` — regenerated
- `src/assets/stamps/free-walk/ida-wells.png` — regenerated
- `src/assets/stamps/free-walk/eleanor-roosevelt.png` — regenerated
- `src/assets/stamps/free-walk/wilma-rudolph.png` — regenerated
- `src/assets/stamps/free-walk/fannie-lou-hamer.png` — regenerated
- `src/assets/stamps/free-walk/maya-angelou.png` — regenerated
- `src/assets/stamps/free-walk/katherine-johnson.png` — regenerated
- `src/assets/stamps/free-walk/ruth-bader-ginsburg.png` — regenerated
- `src/assets/stamps/free-walk/malala-yousafzai.png` — regenerated
- `src/assets/stamps/free-walk/toni-morrison.png` — regenerated
- `src/assets/stamps/free-walk/jane-goodall.png` — regenerated

No changes to any component code, layouts, or logic — only the 11 PNG image files are replaced.

## Color Assignment Plan

| Queen | Ink Color |
|---|---|
| Sojourner Truth | Burgundy red |
| Ida B. Wells | Navy blue |
| Eleanor Roosevelt | Burgundy red + Navy blue combined |
| Wilma Rudolph | Navy blue |
| Fannie Lou Hamer | Burgundy red |
| Maya Angelou | Burgundy red + Navy blue combined |
| Katherine Johnson | Navy blue |
| Ruth Bader Ginsburg | Burgundy red + Navy blue combined |
| Malala Yousafzai | Navy blue |
| Toni Morrison | Burgundy red |
| Jane Goodall | Burgundy red + Navy blue combined |
