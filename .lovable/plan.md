## Goal

Fix the password visibility eye/eye-off toggle on the login form so it renders correctly inside the native iOS  and Android (Capacitor) WebView. No auth logic changes.

## File

`src/pages/Auth.tsx` — both the Sign In and Sign Up password fields (two identical toggle buttons).

## Current code (per field)

```tsx
<button
  type="button"
  onClick={() => setShowLoginPassword((v) => !v)}
  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
  aria-label={showLoginPassword ? "Hide password" : "Show password"}
  tabIndex={-1}
>
  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
</button>
```

## Changes

Apply the same change to both the login and signup password toggle buttons:

1. Give the button explicit dimensions and centering so it always reserves space, even if the icon SVG doesn't lay out as expected on iOS WKWebView:
  - Add `flex items-center justify-center w-6 h-6`.
2. Ensure it stacks above the input:
  - Add `z-10`.
3. Make the Lucide icons explicitly sized via both Tailwind class and the `size` prop (some iOS WKWebView rendering paths ignore CSS width/height on inline SVGs without intrinsic attributes):
  - `w-5 h-5` and `size={20}` on `<Eye />` / `<EyeOff />`.
4. Keep the input's right padding as `pr-10` (already set) so the icon never overlaps typed text.
5. No change to the surrounding `relative` wrapper — it already uses `relative` with no `overflow-hidden`, so no clipping concern, but we'll keep it as-is.
6. Apply the same fix to ensure the toggle also renders correctly in the Android Capacitor WebView.

Resulting button:

```tsx
<button
  type="button"
  onClick={() => setShowLoginPassword((v) => !v)}
  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
  aria-label={showLoginPassword ? "Hide password" : "Show password"}
  tabIndex={-1}
>
  {showLoginPassword
    ? <EyeOff className="w-5 h-5" size={20} />
    : <Eye className="w-5 h-5" size={20} />}
</button>
```

(Same edit applied to the signup field with `showSignupPassword` / `setShowSignupPassword`.)

## Out of scope

- No changes to `handleLogin`, `handleSignup`, validation, OAuth, or any state besides the existing `showLoginPassword` / `showSignupPassword` toggles.
- No changes to other forms (reset password, onboarding, etc.) in this task.