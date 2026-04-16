The user reports that on Android (web/app), after signup their full name was used as the username instead of being prompted to create one via Onboarding.

Looking at the code:

1. `**handle_new_user()` trigger** (in db-functions): On signup, it inserts into profiles with `display_name = NEW.raw_user_meta_data->>'full_name'`. For Google OAuth signups, `full_name` is populated from the Google profile, so the display_name is auto-set to the user's real name.
2. `**Onboarding.tsx**`: Checks `if (profile?.display_name) navigate("/dashboard")` — so if display_name was already set by the trigger (e.g., from Google's full_name), the user is skipped past onboarding entirely.
3. `**Auth.tsx**`: After SIGNED_IN, redirects directly to `/dashboard` (or the `redirect` query param), never to `/onboarding`. So even email/password users — whose `full_name` is null and would get a null display_name — never see the onboarding screen unless something else routes them there.

**Two bugs:**

- **Bug A (Google/OAuth users):** Trigger auto-fills display_name with Google's full name → Onboarding is skipped → user never picks a username.
- **Bug B (all users):** Auth.tsx never routes new signups to `/onboarding`. Even email signups skip it.

## Fix Plan

**1. `supabase/migrations/` — new migration:** Update `handle_new_user()` to NOT populate `display_name` from `raw_user_meta_data->>'full_name'`. Insert profile with `display_name = NULL` so every new user is forced through onboarding to choose a unique username.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name) VALUES (NEW.id, NULL);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;
```

**2. `src/pages/Auth.tsx`:** After SIGNED_IN, check if the user's profile has a `display_name`. If null/empty → navigate to `/onboarding`. Otherwise → navigate to the original `redirect` (default `/dashboard`). Apply this in the `onAuthStateChange` handler so it covers email/password sign-in, Google OAuth sign-in, and brand new signups uniformly.

**3. Backfill consideration (optional, ask user):** Existing Google users already have their full name as display_name. Do nothing to existing accounts — this fix only affects new signups going forward.

### Why this works on iOS + Android + Web

The fix lives in the database trigger (server-side) and Auth.tsx (shared code across all platforms — the same React app runs in the iOS Capacitor wrapper, Android Capacitor wrapper, and web). One fix covers all three.

### Files touched

- New migration file (drop & recreate `handle_new_user`)
- `src/pages/Auth.tsx` (add display_name check before redirect)

### Untouched

- `src/pages/Onboarding.tsx` — already correctly checks for display_name and enforces uniqueness
- All challenge / mile / payment logic                                                                                                                                                                                                                                                                                                   Do NOT change anything else.