## Plan: Apple App Site Association File

### What will be done
1. Create `public/.well-known/apple-app-site-association` with the exact JSON provided by the user.
2. Check if a `_headers` file (or equivalent server config for MIME types) exists in the project. If none exists, no additional changes are needed — Vite's static file serving will handle the file correctly from the `public/` directory.

### Technical note
The `public/` folder in Vite projects is copied as-is to the build output. The `.well-known/apple-app-site-association` file will be served at `/.well-known/apple-app-site-association` automatically. Most deployment platforms (Netlify, Vercel, etc.) infer `application/json` for files in `.well-known/`, but a `_headers` config can be added if needed once the deployment target is known.

### Files to create
- `public/.well-known/apple-app-site-association`