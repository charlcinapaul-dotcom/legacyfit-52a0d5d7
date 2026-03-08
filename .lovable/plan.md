
## Problem
The "Start Your Free 1 Mile Legacy Passport" button text is overflowing the button bounds on mobile. It appears in three places in `MileLogger.tsx`:
1. Line 150–152: Guest/unauthenticated user card
2. Line 185–188: Non-enrolled user (post-auth, no free window) card
3. Line 226/231: The logged-in free-window quick-log button

All three use `h-12` (fixed height = 48px) with `text-base font-bold`, which forces the long text to clip or overflow when the button is narrow on mobile.

## Fix
Three targeted changes in `src/components/MileLogger.tsx`:

1. **Lines 150–152** — add `whitespace-normal leading-tight py-3 h-auto` to replace `h-12`, allowing the text to wrap inside the button naturally:
   ```
   className="w-full py-3 h-auto text-sm font-bold leading-tight whitespace-normal bg-primary ..."
   ```

2. **Lines 185–188** — same fix.

3. **Lines 226/231** — the quick-log button in free-window mode: same `h-auto py-3 text-sm leading-tight whitespace-normal` treatment so the label wraps instead of overflowing.

The key changes per button:
- `h-12` → `h-auto`
- `text-base` → `text-sm`
- Add `py-3 leading-tight whitespace-normal`

This keeps the button full-width and gold, but lets the label reflow to two lines cleanly without any text escaping the container.
