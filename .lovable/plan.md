
Add a native platform guard before the dynamic import of `@capgo/capacitor-health` in `src/hooks/useHealthSync.ts`.

**Change** (inside the `try` block of `sync`, just before the dynamic import on ~line 56):

```ts
if (!Capacitor.isNativePlatform()) {
  throw new Error("Health sync is only available on iOS or Android devices.");
}
const { Health } = await import("@capgo/capacitor-health");
```

`Capacitor` is already imported at the top of the file, so no new imports are needed. Nothing else in the file changes.
