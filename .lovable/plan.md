
## What We're Building

Replace the `StampGridBackground` stamp mosaic in the hero section with the uploaded boarding pass image as a static full-cover background. Keep all hero text, buttons, and CTAs exactly as-is. Apply a `rgba(0,0,0,0.65)` overlay (slightly darker than the current 0.45 to maintain the muted look).

## Approach

The image needs to be copied to `src/assets/` and imported as an ES6 module. Then in `Landing.tsx`, replace `<StampGridBackground />` with a simple `<div>` containing:
1. The `<img>` tag with `object-cover` filling the full hero area absolutely
2. A dark overlay `div` at `rgba(0,0,0,0.65)`

The `StampGridBackground` component and its stamp-fetching logic are untouched — only removed from the hero section render.

## Files to Change

1. **Copy** `user-uploads://LF_Boarding_Pass.png` → `src/assets/boarding-pass-bg.png`

2. **`src/pages/Landing.tsx`** — lines 36:
   - Remove `<StampGridBackground />` and its import
   - Add the static image background in its place:
   ```tsx
   import boardingPassBg from "@/assets/boarding-pass-bg.png";
   
   // Replace line 36 <StampGridBackground /> with:
   <div className="absolute inset-0 overflow-hidden">
     <img
       src={boardingPassBg}
       alt=""
       className="absolute inset-0 w-full h-full object-cover"
       draggable={false}
     />
     <div
       className="absolute inset-0 pointer-events-none"
       style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
     />
   </div>
   ```
   - Also remove the `StampGridBackground` import on line 6

No other lines touched. All hero text, CTAs, and buttons remain exactly as they are.
