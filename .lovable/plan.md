
Four surgical edits to `src/components/ChallengePricing.tsx` — no logic changes, only renaming.

**Edit 1 — Line 77**: Rename function declaration
- `function extractWomanName(challengeName: string): string {` → `function extractFigureName(challengeName: string): string {`

**Edit 2 — Lines 77–84**: Update function body to also split on first word
- Current `.trim()` (line 83) becomes `.trim()` + `.split(' ')[0];` and the outer `return` wraps correctly. The function currently returns the full cleaned name; after this change it returns only the first word (first name).

**Edit 3 — Line 99**: Update call site variable name
- `const womanName = extractWomanName(challengeName);` → `const figureName = extractFigureName(challengeName);`

**Edit 4 — Line 223**: Update JSX interpolation
- `{womanName}` → `{firstName}` — note: the user's instruction says replace with `{firstName}`. This variable doesn't exist in scope; `figureName` is the renamed variable. I should flag this discrepancy.

**Important note on Edit 4**: The user says replace `{womanName}` with `{firstName}`, but `firstName` is not declared anywhere in `ChallengePricing.tsx`. The renamed variable will be `figureName`. Following the instructions literally would introduce a compile error. The safe interpretation is that the user intends `{figureName}` (matching the renamed variable from Edit 3). I will use `{figureName}` to keep the code valid, since `firstName` is undefined in this component's scope.

**Files changed**: `src/components/ChallengePricing.tsx` only.
