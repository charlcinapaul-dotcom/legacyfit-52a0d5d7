
## Pin "Currently Walking" Card Above "Your Challenges"

### What we're building
A single pinned card inserted between the hero stats block (line 412) and the "Your Challenges" heading (line 416). It renders only when `activeChallenge` is not null and `userChallenges.length > 0`.

### Insertion point
Between the closing `</div>` of the hero section at line 412 and the opening of the `{/* Active Challenges */}` div at line 415.

### Card contents
1. `"CURRENTLY WALKING"` — `text-xs uppercase tracking-widest text-muted-foreground`
2. Challenge title — `text-xl font-bold text-foreground`
3. Progress bar — filled width = `(milesLogged / totalMiles) * 100`% with percentage shown inline
4. `"X / Y miles"` — styled in gold (`text-primary`)
5. Next milestone line — use the same `.filter(m => m.miles_required > milesLogged).sort(...)[0]` pattern already in the challenge cards below (lines 484–497). The milestone data comes from `userChallenges` — find the entry where `uc.challenge.id === activeChallenge.challengeId`
6. "Continue Walking →" button — full-width, gold, navigates to `/challenge/${activeChallenge.slug}`

### Where milestone data comes from
`activeChallenge` from `useActiveChallenge()` does **not** include milestones. The `userChallenges` state array already fetches milestones (lines 236–241). So we find the matching entry:
```ts
const activeChallengeData = userChallenges.find(
  uc => uc.challenge.id === activeChallenge?.challengeId
);
```
Then use `activeChallengeData?.challenge?.milestones` for the next milestone logic.

### Files changed
| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add ~35 lines of JSX between line 412 and line 415. No imports needed — `Progress` from `@/components/ui/progress` is available; alternatively use the inline `div` pattern already used in the challenge cards (lines 471–478) to avoid a new import. Use the inline div pattern for consistency. |

### No other changes
- No new components, hooks, or queries
- The "Your Challenges" section below is untouched
- `activeChallenge.isCompleted` check: if the active challenge is already completed, hide the pinned card (only show for in-progress challenges)
