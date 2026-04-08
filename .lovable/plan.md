

## Fix Xcode Archive Failure — Stale Package.swift

### Root cause

The `ios/App/CapApp-SPM/Package.swift` file is out of sync with `package.json`. It still references two packages that no longer exist in `node_modules`:

1. **`CapacitorCommunityAppleSignIn`** — points to `@capacitor-community/apple-sign-in` which was replaced with `@capawesome/capacitor-apple-sign-in`
2. **`CapgoBackgroundGeolocation`** — points to `@capgo/background-geolocation` which was removed entirely

It's also missing the new packages: `@capawesome/capacitor-apple-sign-in` and `@revenuecat/purchases-capacitor`.

When Xcode tries to resolve these SPM dependencies during Archive, it fails because the paths don't exist.

### Fix

Update `Package.swift` to match the current `package.json` dependencies:

- Remove `CapacitorCommunityAppleSignIn` (old apple-sign-in)
- Remove `CapgoBackgroundGeolocation` (removed package)
- Add `CapawesomeCapacitorAppleSignIn` pointing to `@capawesome/capacitor-apple-sign-in`
- Add `RevenuecatPurchasesCapacitor` pointing to `@revenuecat/purchases-capacitor`
- Keep `CapacitorCommunityBackgroundGeolocation`, `CapacitorBrowser`, `CapacitorGeolocation`

### Files changed

| File | Change |
|---|---|
| `ios/App/CapApp-SPM/Package.swift` | Replace stale SPM entries with correct ones matching current package.json |

### After pulling

1. Run `npm install`
2. Run `npx cap sync` (will validate/regenerate Package.swift)
3. In Xcode: File → Packages → Reset Package Caches
4. Product → Clean Build Folder
5. Product → Archive

