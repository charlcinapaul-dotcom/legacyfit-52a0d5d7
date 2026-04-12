

## Fix: "Loading your journey..." stuck screen for email/password users

### Root cause

When an email/password user logs in, the Dashboard calls `fetchProfile` which uses `.single()` to fetch from `profiles`. If no profile row exists (e.g., the `handle_new_user` trigger failed or didn't fire), `.single()` returns an error, the profile is never set, `loading` stays false but `profile` stays null, and the UI shows the spinner indefinitely.

Google OAuth works because those users are confirmed immediately and the trigger fires reliably.

### Solution

Modify `fetchProfile` in `src/pages/Dashboard.tsx` to **upsert** a profile row if none is found, ensuring every authenticated user always has a profile.

### Changes

| File | Change |
|---|---|
| `src/pages/Dashboard.tsx` | In `fetchProfile`: change `.single()` to `.maybeSingle()`. If no profile row is returned, upsert one using the user's ID, then re-fetch and continue. |

### Implementation detail

```typescript
const fetchProfile = async (userId: string) => {
  try {
    let { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      setLoading(false);
      return;
    }

    // Profile row missing — create one
    if (!data) {
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert({ user_id: userId }, { onConflict: "user_id" });

      if (upsertError) {
        console.error("Error creating profile:", upsertError);
        setLoading(false);
        return;
      }

      // Re-fetch after upsert
      const { data: newData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      data = newData;
    }

    setProfile(data);
    if (!data?.display_name) {
      navigate("/onboarding");
      return;
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    setLoading(false);
  }
};
```

This is a single-file change. No database migration needed -- the existing RLS policies already allow authenticated users to insert their own profile (`auth.uid() = user_id`).

