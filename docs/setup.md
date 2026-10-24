# Bol — Cloudflare Pages setup

This guide deploys the Plan 1 build to Cloudflare Pages. Plan 1 is a static PWA: there is no backend, no auth, and no server database.

## 1. Install and build

```bash
npm install
npm run build
```

The build output is `dist/`. Before uploading, confirm these files exist:

- `dist/index.html`
- `dist/_redirects`
- `dist/manifest.webmanifest`
- `dist/sw.js`

`_redirects` contains `/* /index.html 200` so React Router routes work after a direct visit or reload.

## 2. Cloudflare account and Wrangler

Run this yourself in a terminal. It opens the browser and asks you to log in to Cloudflare:

```bash
npx wrangler login
```

Check the logged-in account:

```bash
npx wrangler whoami
```

## 3. Create the Pages project (first time only)

```bash
npx wrangler pages project create bol
```

If `bol` already exists, skip this command. If the account has more than one project, use a different project name and replace `bol` in the deploy command.

## 4. Deploy the built files

```bash
npx wrangler pages deploy dist --project-name=bol
```

Wrangler prints the deployment URL. Open it on the laptop and confirm the Today screen loads.

For later updates, run `npm run build` and then the same deploy command.

## 5. Cloudflare Pages dashboard alternative

If you connect a Git repository instead of using direct upload:

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: your release branch

Direct upload with Wrangler is enough for Plan 1.

## 6. Install on Android Chrome

1. Open the deployed HTTPS URL in Chrome on the phone.
2. Wait for the Today screen to load once while online. This lets the service worker cache the app shell and Week 1 content.
3. Tap the Chrome menu (three dots).
4. Tap **Add to Home screen** / **Install app**.
5. Open Bol from the home screen. It launches in standalone mode.
6. Turn on airplane mode and open Bol again to check the offline shell. The last local progress should remain available.

## 7. Privacy and current limits

- Plan 1 has no backend. Progress is stored in the browser, not in a Cloudflare database.
- Practice recordings never leave the device. They are kept in IndexedDB on that device.
- The optional voice keyword check only runs after the learner grants consent. Declining keeps the check off; speaking practice still works.
- Progress does not sync between laptop and phone yet. Supabase auth and sync are planned for a later plan.
- Weeks 2–12 and the full dashboard are out of scope for Plan 1.
