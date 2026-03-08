
## What Needs to Change

**One database record** — update Charles Drew's `edition` field from `Women's History` to `First Steps: Black Pioneers`.

The existing filter logic in `Challenges.tsx` already handles this correctly:
- `womensHistory` = active challenges that are NOT `slug === "pride"` AND NOT `edition.includes("first steps: black pioneers")`
- `pioneers` = active challenges where `edition.includes("first steps: black pioneers")`

So once the DB field is updated, Charles Drew will automatically move from the Women's History section to the First Steps: Black Pioneers section on the `/challenges` page — no code changes needed.

## Change

**Database update (data operation — insert tool):**
```sql
UPDATE challenges
SET edition = 'First Steps: Black Pioneers'
WHERE slug = 'charles-drew';
```

Confirmed current value: `Women's History`  
Target value: `First Steps: Black Pioneers` (matches exact string used by all other Black Pioneers challenges)

No code changes. No migration. No other fields touched.
