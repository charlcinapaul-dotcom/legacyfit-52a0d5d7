Goal: make Health Sync work reliably on native iOS and Android, while keeping the web app safe and user-friendly.

1. Confirm the root cause and stop chasing a web-only fix

- The error shown in image 2 (`'@capgo/capacitor-health' does not resolve to a valid URL`) is a browser/runtime error, not a HealthKit permission error.
- `@capgo/capacitor-health` is a native Capacitor plugin. It cannot run in a normal website, Safari, Chrome, or an installable browser shortcut.
- `requestAuthorization()` exists only when the app is running inside the native Capacitor shell after native dependencies have been synced.

2. Use a dual-system approach

- Native app:
  - enable Health Sync
  - request permission
  - read steps + distance
  - sync walking data into the database
- Web app:
  - never import or call the health plugin
  - show a gentle message that Health Sync is available only in the mobile app
  - keep manual logging as the web fallback

3. Harden the native-only loading path

- Update `src/hooks/useHealthSync.ts` so the plugin is loaded only after a strict native check.
- Use a bundler-safe native loader pattern so the browser never tries to resolve `@capgo/capacitor-health`.
- Expand the permission request to ask for read access to:
  - steps
  - distance
- Handle denied permission with a calm user-facing message instead of a raw module error.

4. Add app-load permission flow for signed-in users

- Create a new hook, following the existing `useIAPSync()` pattern in `src/hooks/useIAPSync.ts`.
- Hook behavior:
  - run only on native iOS/Android
  - wait until a user is logged in
  - load the health plugin natively
  - check availability
  - request read permissions for steps and distance
  - if denied, store a dismissed/denied state locally so users are not nagged repeatedly
  - show a gentle explanation: Health access is needed to sync walking data automatically
- Mount this hook from `src/App.tsx`.

5. Keep the manual sync button, but make it resilient

- In `src/components/HealthSyncTracker.tsx` and `src/hooks/useHealthSync.ts`:
  - keep the sync button for explicit sync runs
  - if permissions were already granted, sync immediately
  - if permissions are missing, request them there too as a fallback
  - show friendly messages for:
    - unsupported device
    - permission denied
    - Health Connect / Apple Health unavailable
    - successful sync

6. Align the native platform configuration

- iOS:
  - verify HealthKit entitlements remain enabled
  - verify `NSHealthShareUsageDescription` is present and clear
- Android:
  - verify the app is configured for Health Connect / health permissions required by the plugin version in use
  - confirm the app can guide the user to Health Connect settings if needed
- Keep the existing plugin dependency and native package registration intact.

7. Make the web experience explicit

- On web, replace any path that could surface plugin/module errors with a clear in-app explanation:
  - “Health Sync works in the LegacyFit mobile app on iPhone and Android.”
  - “On web, you can still log miles manually.”
- add a CTA for users who are on mobile web:
  - “Open in the mobile app” 
- Do not attempt to “bypass” the web app into native capabilities from a browser tab. That is not possible unless the user opens the actual native app.

8. Clarify the native-vs-web answer

- Yes, you need a dual system.
- No, a normal web app cannot directly access Apple Health or Android Health Connect through this plugin.
- The only working path for this plugin is:
  ```text
  React app
    -> running inside Capacitor native app
    -> native plugin available
    -> requestAuthorization works
    -> Health data can be read
  ```
- A PWA/home-screen shortcut is still a web app, not a true native shell.

9. Validate end-to-end

- Test matrix:
  - web browser: no plugin import, no module URL error, clear fallback message
  - iPhone native app: permission prompt appears, denial handled gently, success reads data
  - Android native app: permission flow works, Health Connect availability handled, sync succeeds
  - signed-out native user: no permission request until authenticated
  - signed-in returning native user: app-load check behaves quietly if already granted/denied

10. Expected final result

- Web app no longer throws the module-resolution error.
- Logged-in native users are prompted for Health access at app load.
- The app requests read access for both steps and distance.
- Denials are handled gracefully.
- Health Sync works on real iOS and Android native builds, while web remains a safe fallback.

Technical notes

- Files likely involved:
  - `src/hooks/useHealthSync.ts`
  - `src/components/HealthSyncTracker.tsx`
  - `src/hooks/useIAPSync.ts`
  - `src/App.tsx`
  - `src/types/capgo-health.d.ts`
  - `capacitor.config.ts`
  - `ios/App/App/Info.plist`
  - `android/app/src/main/AndroidManifest.xml`
- Important implementation detail:
  - the native plugin import must never be reachable from browser execution
  - the permission request should use the plugin’s native API with both `steps` and `distance`
  - any app-load prompt should be gated behind both `Capacitor.isNativePlatform()` and authenticated user presence 
  - Do not modify `src/hooks/useIAPSync.ts` — use it as a read-only reference only.