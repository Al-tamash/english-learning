# Bol

Bol is a local-first daily English speaking PWA. It gives a 30-minute session, or a 15-minute short session on busy days, with Hinglish explanations and English practice.

Week 1 has 7 days: 6 learning days plus 1 review and benchmark day.

## Requirements

- Node.js 20+
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

## Checks

```bash
npm test -- --run
npm run validate:content
npm run build
```

The first time you run end-to-end tests, install the Playwright browser:

```bash
npx playwright install chromium
```

Then build and run the E2E suite:

```bash
npm run build
npm run test:e2e
```

The E2E tests use the production preview at `http://localhost:4173`.

## Production build

```bash
npm run build
```

The deployable output is in `dist/`. It contains the SPA redirect file, web manifest, service worker, generated PWA icons, and the standalone lesson pages.

The Week 1 lesson and printable reference are copied into `dist/` during the build, so they deploy at:

- `/lessons/0001-week-1-introduce-yourself.html`
- `/reference/0001-week-1-patterns.html`

They are also linked from the Library screen.

## Deploy

Cloudflare Pages is the target host. See [docs/setup.md](docs/setup.md) for the exact Wrangler commands, dashboard settings, and Android install steps.

## Current scope

Plan 1 is local-first:

- No backend and no login.
- Progress and SRS data are stored in this browser.
- Practice recordings stay on this device in IndexedDB.
- The optional voice keyword check is consent-gated.
- Cross-device sync and Weeks 2–12 are planned for later plans.

## Project map

- `src/content/` — Week 1 content validation and lookup.
- `src/session/` — session stages and warm-up logic.
- `src/srs/` — spaced-repetition scheduling.
- `src/store/` — persisted app store, progress, streak, and settings.
- `src/audio/` — TTS, recording storage, and consent-based keyword check.
- `src/screens/` — Today, session stages, Progress, Library, and Settings.
- `content-src/week-01/` — authored Week 1 JSON.
- `tests/e2e/` — Playwright flows.
- `docs/setup.md` — deployment and phone install guide.
