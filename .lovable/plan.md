

## Implement Required Email Verification for New Users

### Overview

Currently, after signup the user is immediately redirected to `/onboarding` and can use the app. We need to enforce email verification by:
1. Disabling auto-confirm on the auth system
2. Showing a "Check your email" screen after signup instead of redirecting to onboarding
3. Blocking unverified users from accessing protected pages

### 1. Disable Auto-Confirm Email Signups

Use the `configure_auth` tool to disable auto-confirm for email signups. This makes the backend require email confirmation before the user can sign in.

### 2. Create Email Verification Pending Page (`src/pages/VerifyEmail.tsx`)

A new page at `/verify-email` that shows:
- LegacyFit branded header (matching Auth.tsx styling)
- Message: "Please check your email to verify your account before continuing."
- The email address they signed up with (passed via state or query param)
- A **"Resend Verification Email"** button with a 60-second cooldown timer
- Calls `supabase.auth.resend({ type: 'signup', email })` on click
- Link back to sign in

### 3. Update Auth.tsx Signup Flow

After successful `signUp()`:
- Instead of `navigate("/onboarding")`, navigate to `/verify-email?email={email}`
- The user will NOT receive a session (since auto-confirm is off), so the `onAuthStateChange` listener won't redirect them

### 4. Update Auth.tsx Login Error Handling

The login flow already handles the "Email not confirmed" error (line 139). Keep this — it will now be triggered for unverified users trying to sign in.

### 5. Add Route in App.tsx

Add `/verify-email` route pointing to the new `VerifyEmail` page.

### 6. Dashboard and Protected Pages

No changes needed — the Dashboard already redirects to `/auth` when there's no session. Since unverified users can't sign in (auto-confirm is off), they can't access any protected pages.

### 7. Admin/Testing

Admins can manually verify test accounts by updating `auth.users.email_confirmed_at` via the backend database. This is already possible — no code changes needed.

### Files Changed

| File | Change |
|---|---|
| Auth config | Disable auto-confirm email signups |
| `src/pages/VerifyEmail.tsx` (new) | Verification pending screen with resend button |
| `src/pages/Auth.tsx` | Redirect to `/verify-email` after signup instead of `/onboarding` |
| `src/App.tsx` | Add `/verify-email` route |

### What This Does NOT Change
- Existing login flow (unchanged)
- Password reset flow (unchanged)
- OAuth/Apple sign-in (these providers auto-verify emails)
- Onboarding flow (still required after first verified login)
- RLS policies or database schema (no changes needed)

