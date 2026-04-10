

## Remove Apple Sign-In and Uninstall @capawesome/capacitor-apple-sign-in

### What changes

| File | Change |
|---|---|
| `src/pages/Auth.tsx` | Remove `Capacitor` import, remove comment on line 14, delete entire `handleAppleLogin` function (lines 225-273), remove Apple button from OAuth section (lines 527-538), change Google button grid from `grid-cols-2` to single full-width button |
| `package.json` | Remove `@capawesome/capacitor-apple-sign-in` from dependencies |
| `ios/App/CapApp-SPM/Package.swift` | Remove `CapawesomeCapacitorAppleSignIn` from both `.dependencies` and `.target.dependencies` |

### Details

**Auth.tsx:**
- Delete line 5 (`import { Capacitor } from "@capacitor/core"`) — no longer needed since Apple was the only native-platform check
- Delete line 14 (comment about SignInWithApple)
- Delete `handleAppleLogin` function (lines 225-273)
- Remove the Apple button (lines 527-538)
- Change `grid grid-cols-2 gap-4` to just a single Google button (no grid needed)

**package.json:**
- Remove `"@capawesome/capacitor-apple-sign-in": "^0.1.0"` from dependencies

**Package.swift:**
- Remove `.package(name: "CapawesomeCapacitorAppleSignIn", path: "../../../node_modules/@capawesome/capacitor-apple-sign-in")` from dependencies
- Remove `.product(name: "CapawesomeCapacitorAppleSignIn", package: "CapawesomeCapacitorAppleSignIn")` from target dependencies

### After pulling
1. `rm -rf node_modules package-lock.json`
2. `npm install`
3. `npm run build`
4. `npx cap sync ios`
5. Open `ios/App/App.xcodeproj`, Clean Build Folder, Archive

