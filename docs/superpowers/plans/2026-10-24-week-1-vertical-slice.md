# Bol — Week 1 Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first PWA that runs the full 30-minute (and 15-minute short) Week 1 English practice session on Android Chrome and desktop, with TTS, recording, SRS, progress, and offline support.

**Architecture:** Vite + React + TypeScript single-page app. Week 1 content is authored as JSON in `content-src/`, validated with Zod at build time, and bundled. Zustand persists progress and SRS in localStorage; recordings live in IndexedDB. No backend, auth, or sync in this plan.

**Tech Stack:** React 18, TypeScript 5 (strict), Vite 5, Tailwind CSS 3.4, Zustand 4, Zod 3, idb-keyval 6, vite-plugin-pwa 0.20, Vitest 2 + Testing Library, Playwright 1.48.

**Spec:** `docs/superpowers/specs/2026-10-24-english-learning-system-design.md`

## Global Constraints

- One learner, local-only. **No Supabase, auth, or sync** in this plan.
- Full session target 30 min; short session 15 min. Timers are guides and never block completion.
- Week 1 has 7 days: 6 learning days + 1 review day.
- Every learning day: 5 words, 1 pattern, 6 dialogue lines, 4 scenario turns, 3 quiz items.
- Day 7 is review-only: no new words, no pattern/dialogue/scenario; quiz + 4 benchmark prompts + mission.
- UI copy is Roman Hinglish; practice content is English. No Devanagari.
- Recordings stay in IndexedDB. Never upload. Practice recordings older than 30 days are pruned; benchmarks are kept.
- Target Android Chrome and desktop Chrome/Edge. No iOS.
- SRS: ladder 1, 3, 7, 14, 30, 60 days. New Good = 1, Easy = 3, Hard = 1; later Good advances one step, Easy skips one, Hard holds; Again = 10 minutes; due cap 10; max interval 60 days.
- Male en-IN TTS preferred, then male en-US/en-GB. Text is always visible.
- Speech keyword check runs only after consent and never blocks completion.
- Strict TypeScript; exported interfaces use no `any`.
- Node 20 LTS+ and npm 10+.
- Commit after each task.

## Review Focus

1. Microphone permission denied or no microphone: the session must still complete, with recording skipped and a clear message.
2. No TTS voice or `speechSynthesis` missing: text still drives every stage; no dead end.
3. Completing a session near midnight or after a timezone change: streak counts at most once per local calendar day.
4. Double-tapping Next/Finish, or reloading mid-stage: no stage skipped, no progress double-counted.
5. Corrupt/old localStorage or a missing day ID: the app shows a recovery screen with a reset action, not a white screen.

## Scope Boundary

This plan implements Phase 1–2 of the spec for **Week 1 only**, plus the first teaching lesson. It does **not** implement Supabase/auth/sync, Weeks 2–12, the full 12-week dashboard, push reminders, or the AI tutor. Those are separate plans.

## File Structure

```
content-src/week-01/          Week 1 day JSON (w01d01.json … w01d07.json)
scripts/validate-content.ts   CLI wrapper around the content validator
src/app/Layout.tsx            shell, header, bottom nav
src/screens/                  Today, Session, Progress, Library, Settings, Onboarding
src/session/                  stage list, transitions, warm-up selection
src/audio/                    TTS, recorder, recording store, speech keyword check
src/srs/                      SRS algorithm
src/store/                    Zustand store and streak logic
src/content/                  types, Zod schema, validator, loader, benchmarks
src/components/               shared UI (buttons, cards, stage header)
src/test/setup.ts             jest-dom, browser API mocks
lessons/                      Week 1 teaching lesson (standalone HTML)
reference/                    printable Week 1 pattern sheet
assets/                       shared lesson CSS and quiz JS
tests/e2e/                    Playwright specs
```

---

### Task 1: Scaffold, app shell, and recovery boundary

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/app/Layout.tsx`, `src/app/ErrorBoundary.tsx`
- Create: `src/test/setup.ts`, `src/App.test.tsx`

**Interfaces:**
- Produces: `App(): JSX.Element`; `Layout` renders `<h1>Bol</h1>`, links `Aaj`, `Progress`, `Library`, `Settings`, and `<Outlet />`.
- Produces: `ErrorBoundary` renders `<h1>Kuch galat ho gaya</h1><button>Reset karo</button>` when a child throws.

- [ ] **Step 1: Initialise the repo and write the failing shell test**

```bash
git init
npm init -y
```

```tsx
// src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { ErrorBoundary } from './app/ErrorBoundary';

it('renders the app shell and navigation', () => {
  render(<MemoryRouter><App /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: 'Bol' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Aaj' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
});

it('shows a recovery screen when a child throws', () => {
  const Boom = () => { throw new Error('boom'); };
  render(<ErrorBoundary><Boom /></ErrorBoundary>);
  expect(screen.getByText('Kuch galat ho gaya')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reset karo' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- --run src/App.test.tsx`
Expected: FAIL — `App` does not exist.

- [ ] **Step 3: Install dependencies and scaffold the shell**

```bash
npm install react@18 react-dom@18 react-router-dom@6 zustand@4 zod@3 idb-keyval@6
npm install -D vite@5 @vitejs/plugin-react typescript@5 @types/react @types/react-dom @types/node
npm install -D tailwindcss@3 postcss autoprefixer
npm install -D vitest@2 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
npm install -D vite-plugin-pwa@0.20 @playwright/test@1.48 tsx
```

`vite.config.ts` uses `defineConfig` from `vitest/config`, the React plugin, and `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true, css: true }`. `tsconfig.json` sets `strict: true`, `resolveJsonModule: true`, `jsx: react-jsx`, `types: ["vitest/globals"]`; `tsconfig.node.json` includes `vite.config.ts` and `scripts/**/*.ts` with `types: ["node"]`. Tailwind content paths cover `index.html` and `src/**/*.{ts,tsx}`. `package.json` scripts: `"dev": "vite"`, `"build": "tsc -b && vite build"`, `"test": "vitest"`, `"preview": "vite preview"`.

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(),
  })),
});
```

`src/App.tsx` defines `<Routes>` with `Layout` and placeholder routes: `/` → `<h2>Aaj</h2>`, `/session` → `<h2>Session</h2>`, `/progress`, `/library`, `/settings`. `src/main.tsx` wraps `<App />` in `<BrowserRouter>` and imports `index.css`.

`src/index.css` defines the shared tokens `--bg: #faf7f2`, `--surface: #ffffff`, `--ink: #1f2933`, `--muted: #6b7280`, `--accent: #0f766e`, `--accent-ink: #ffffff`, `--line: #e5e7eb`; Tailwind maps them to `background`, `surface`, `ink`, `muted`, `accent`, and `line` utilities. The shell is mobile-first with a bottom nav, and switches to a left rail at `md`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/App.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verify the production build**

Run: `npm run build`
Expected: `dist/` created with no TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore: scaffold Bol app shell"
```

---

### Task 2: Content types, schema, validator, and Day 1

**Files:**
- Create: `src/content/types.ts`, `src/content/schema.ts`, `src/content/validate.ts`
- Create: `content-src/week-01/w01d01.json`
- Create: `scripts/validate-content.ts`
- Test: `src/content/validate.test.ts`

**Interfaces:**
- Produces: `Stage = 'warmup' | 'pattern' | 'words' | 'shadow' | 'scenario' | 'wrap'`; `DayContent`, `WordItem`, `PatternContent`, `DialogueContent`, `ScenarioContent`, `QuizItem`, `Mission` from `src/content/types.ts`.
- Produces: `parseDay(input: unknown): DayContent`; `validateAll(days: unknown[]): { days: DayContent[]; errors: string[] }`.
- Produces: `npm run validate:content` prints `Validated N day(s)` and exits non-zero on failure.

- [ ] **Step 1: Write the failing validation tests**

```ts
// src/content/validate.test.ts
import { readFileSync } from 'node:fs';
import { parseDay, validateAll } from './validate';

const day1 = JSON.parse(readFileSync('content-src/week-01/w01d01.json', 'utf8'));

it('parses Day 1 with the required counts', () => {
  const day = parseDay(day1);
  expect(day.pattern?.id).toBe('p_work_at');
  expect(day.words).toHaveLength(5);
  expect(day.dialogue?.lines).toHaveLength(6);
  expect(day.scenario?.turns).toHaveLength(4);
  expect(day.quiz).toHaveLength(3);
});

it('rejects a missing pattern frame', () => {
  expect(() => parseDay({ ...day1, pattern: { ...day1.pattern, frame: undefined } })).toThrow();
});

it('reports duplicate day IDs', () => {
  const result = validateAll([day1, { ...day1 }]);
  expect(result.errors.join(' ')).toContain('duplicate day id');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/content/validate.test.ts`
Expected: FAIL — module and Day 1 JSON do not exist.

- [ ] **Step 3: Implement types, schema, validator, and Day 1 content**

Define the types exactly as in the spec §7.3, with these additions: `DayType = 'learning' | 'review'`, `QuizItem.options?: string[]`, and `DialogueLine.speaker: 'A' | 'B'`.

Zod schema rules:
- `id`, `week`, `day`, `type`, `theme`, `title`, `goal_hi` required.
- `pattern` nullable; when present, `examples` has 4–6 items.
- `words` has exactly 5 items on learning days, 0 on review days.
- `dialogue` nullable; when present, exactly 6 lines.
- `scenario` nullable; when present, exactly 4 turns; every turn has ≥2 keywords and a `model_en`.
- `quiz` has exactly 3 items.
- `mission` nullable.

`validateAll` also rejects duplicate day IDs and duplicate word IDs across all days.

Author `content-src/week-01/w01d01.json` using the Day 1 row in `docs/curriculum-plan.md` and the shape in the spec §7.3: `title: "What do you do?"`, pattern `p_work_at` (“I work at ___ as a ___.”) with 5 examples, words `developer, client, website, project, meeting`, a 6-line “new colleague” dialogue, a 4-turn “client asks what you do” scenario, and 3 fill-in quiz items: `I work ___ Edone Solutions.` → `at`; `I work at Edone Solutions ___ a web developer.` → `as`; `I am a web ___.` → `developer`. The sound focus is v/w with `vest / west` and `vine / wine`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/content/validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Add and run the validation CLI**

```json
// package.json
"scripts": {
  "validate:content": "tsx scripts/validate-content.ts"
}
```

`scripts/validate-content.ts` reads every `content-src/week-*/**.json`, calls `validateAll`, prints `Validated N day(s)` or the errors, and sets `process.exitCode = 1` on failure.

Run: `npm run validate:content`
Expected: `Validated 1 day(s)`.

- [ ] **Step 6: Commit**

```bash
git add src/content content-src scripts package.json
git commit -m "feat: add Week 1 content schema and Day 1"
```

---

### Task 3: Week 1 days 2–7, loader, and benchmarks

**Files:**
- Create: `content-src/week-01/w01d02.json` … `w01d07.json`
- Create: `src/content/index.ts`, `src/content/benchmarks.ts`
- Test: `src/content/index.test.ts`

**Interfaces:**
- Produces: `getDay(dayId: string): DayContent` (throws on unknown ID).
- Produces: `getAllDays(): DayContent[]`, `getNextDay(dayId: string): DayContent | null`.
- Produces: `WEEK_1_DAYS: DayContent[]`.
- Produces: `BENCHMARK_PROMPTS: ReadonlyArray<{ id: string; en: string; hi: string }>` with exactly 4 items: intro, work, weekend, deadline.

- [ ] **Step 1: Write the failing loader tests**

```ts
// src/content/index.test.ts
import { BENCHMARK_PROMPTS, WEEK_1_DAYS, getDay, getNextDay } from './index';

it('loads all 7 Week 1 days', () => {
  expect(WEEK_1_DAYS).toHaveLength(7);
  expect(getDay('w01d07').type).toBe('review');
});

it('gives every learning day the required counts', () => {
  for (const day of WEEK_1_DAYS.filter((d) => d.type === 'learning')) {
    expect(day.words).toHaveLength(5);
    expect(day.dialogue?.lines).toHaveLength(6);
    expect(day.scenario?.turns).toHaveLength(4);
    expect(day.quiz).toHaveLength(3);
  }
});

it('keeps Day 7 review-only', () => {
  const day = getDay('w01d07');
  expect(day.words).toHaveLength(0);
  expect(day.pattern).toBeNull();
  expect(day.dialogue).toBeNull();
  expect(day.scenario).toBeNull();
  expect(day.mission).not.toBeNull();
});

it('moves to the next day and stops at the end', () => {
  expect(getNextDay('w01d01')?.id).toBe('w01d02');
  expect(getNextDay('w01d07')).toBeNull();
});

it('defines four benchmark prompts', () => {
  expect(BENCHMARK_PROMPTS).toHaveLength(4);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/content/index.test.ts`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Author days 2–7 and implement the loader**

Use the Week 1 day-by-day table in `docs/curriculum-plan.md` for patterns, words, scenarios, and pronunciation:

- Day 2: `I'm from ___ / I live in ___.`
- Day 3: `I have ___ years of experience.`
- Day 4: `I build ___ for ___.`
- Day 5: `I'm good at ___ / I'm learning ___.`
- Day 6: `Do you work ___? / What do you do?`
- Day 7: review quiz, 4 benchmark prompts, mission “Send a 60-second English voice note to a friend introducing yourself and your work.”

Day 7 has `type: "review"`, no pattern/dialogue/scenario, empty `words`, 3 fill-in quiz items, and a mission. Day 1 also uses 3 fill-in quiz items so the wrap test can type answers; later learning days may mix fill and choice. Each learning day uses the five words listed in the curriculum table for that day.

`src/content/index.ts` statically imports all 7 JSON files, validates each with `parseDay`, sorts by `week` then `day`, and exports the functions above. `src/content/benchmarks.ts` exports the 4 prompts with Hinglish hints.

- [ ] **Step 4: Run the tests and validator**

Run: `npm test -- --run src/content/index.test.ts`
Expected: PASS.

Run: `npm run validate:content`
Expected: `Validated 7 day(s)`.

- [ ] **Step 5: Commit**

```bash
git add content-src src/content
git commit -m "feat: add Week 1 content and benchmark prompts"
```

---

### Task 4: SRS algorithm

**Files:**
- Create: `src/srs/srs.ts`
- Test: `src/srs/srs.test.ts`

**Interfaces:**
- Produces: `SrsRating = 'again' | 'hard' | 'good' | 'easy'`.
- Produces: `SrsCard { itemId: string; ease: number; intervalDays: number; dueAt: string; reps: number; lapses: number; lastRating: SrsRating | null; updatedAt: string }`.
- Produces: `createCard(itemId: string, now: Date): SrsCard`.
- Produces: `schedule(card: SrsCard, rating: SrsRating, now: Date): SrsCard`.
- Produces: `dueCards(cards: Record<string, SrsCard>, now: Date, limit?: number): SrsCard[]` (default limit 10, sorted by `dueAt` ascending).

- [ ] **Step 1: Write the failing SRS tests**

```ts
// src/srs/srs.test.ts
import { createCard, dueCards, schedule } from './srs';

const now = new Date('2026-10-24T08:00:00.000Z');

it('schedules a new Good card for tomorrow', () => {
  const next = schedule(createCard('w_developer', now), 'good', now);
  expect(next.intervalDays).toBe(1);
  expect(next.dueAt).toBe('2026-10-25T08:00:00.000Z');
});

it('schedules Again in ten minutes and counts a lapse', () => {
  const next = schedule(createCard('w_developer', now), 'again', now);
  expect(next.dueAt).toBe('2026-10-24T08:10:00.000Z');
  expect(next.lapses).toBe(1);
});

it('schedules a new Easy card in three days', () => {
  expect(schedule(createCard('x', now), 'easy', now).intervalDays).toBe(3);
});

it('advances Good one ladder step and Easy two', () => {
  const card = { ...createCard('x', now), intervalDays: 4, ease: 2.5 };
  expect(schedule(card, 'good', now).intervalDays).toBe(7);
  expect(schedule(card, 'easy', now).intervalDays).toBe(14);
});

it('holds the interval on Hard and never drops ease below 1.3', () => {
  const card = { ...createCard('x', now), intervalDays: 7, ease: 1.3 };
  expect(schedule(card, 'hard', now).intervalDays).toBe(7);
  expect(schedule(card, 'again', now).ease).toBe(1.3);
});

it('caps intervals at 60 days and due cards at 10', () => {
  const card = { ...createCard('x', now), intervalDays: 60, ease: 2.5 };
  expect(schedule(card, 'good', now).intervalDays).toBe(60);

  const cards = Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => {
      const c = { ...createCard(`i${i}`, now), dueAt: new Date(now.getTime() - (12 - i) * 1000).toISOString() };
      return [c.itemId, c];
    }),
  );
  expect(dueCards(cards, now)).toHaveLength(10);
  expect(dueCards(cards, now)[0].itemId).toBe('i0');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/srs/srs.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/srs/srs.ts`**

Use `DAY_MS = 86_400_000` and `MINUTE_MS = 60_000`; compute `dueAt` from `now.getTime()`; set `updatedAt` and `lastRating`; increment `reps` on every rating.

Use `LADDER = [1, 3, 7, 14, 30, 60]`. `nextStep(interval)` returns the first ladder value greater than the current interval, or 60 if already at the top. Ratings: `again` → ease −0.2 (floor 1.3), interval 0, due +10 min, lapses +1. `hard` → ease −0.15 (floor 1.3), interval 1 for a new card else unchanged. `good` → interval 1 for a new card else `nextStep(interval)`. `easy` → ease +0.15, interval 3 for a new card else `nextStep(nextStep(interval))`. Clamp every interval to `min(60, interval)`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/srs/srs.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/srs
git commit -m "feat: add spaced repetition scheduler"
```

### Task 5: App store, local persistence, and streak

**Files:**
- Create: `src/store/appStore.ts`, `src/store/streak.ts`
- Test: `src/store/appStore.test.ts`

**Interfaces:**
- Produces: `DayProgress { dayId; status: 'not_started' | 'in_progress' | 'done'; stagesCompleted: Stage[]; speakingSeconds: number; selfRating: number | null; missionDone: boolean; completedAt: string | null; updatedAt: string }`.
- Produces: `Settings { ttsVoiceUri: string | null; ttsRate: number; speechCheckEnabled: boolean; speechConsent: 'unset' | 'granted' | 'denied' }`.
- Produces: `StreakState { current: number; best: number; lastCompletedDate: string | null }`.
- Produces: `AppData { localProfileId: string; days: Record<string, DayProgress>; srs: Record<string, SrsCard>; settings: Settings; streak: StreakState; activeSession: SessionState | null }` and `AppState extends AppData` with the actions below.
- Produces: `createInitialState(): AppData`; `useAppStore` with actions `startSession(dayId, mode: SessionMode, now?)`, `setStage(stage)`, `completeStage(stage, speakingSeconds?, now?)`, `finishSession(dayId, summary: { speakingSeconds: number; selfRating: number; missionDone?: boolean }, now?)`, `rateWord(itemId, rating, now?)`, `updateSettings(patch)`, `resetAll()`.
- Produces: `nextStreak(streak: StreakState, completedAt: Date): StreakState`; `localDateKey(date: Date): string` (`YYYY-MM-DD` in local time).
- Consumes: `SrsCard` from Task 4; `SessionState`, `SessionMode`, `createSession`, `advance` from Task 6. **Implement Task 6 before this task.**

- [ ] **Step 1: Write the failing store and streak tests**

```ts
// src/store/appStore.test.ts
import { beforeEach, expect, it, vi } from 'vitest';
import { createInitialState, useAppStore } from './appStore';
import { nextStreak, type StreakState } from './streak';

const now = new Date('2026-10-24T09:00:00');

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(createInitialState());
});

it('counts one streak day per local calendar day and resets after a gap', () => {
  let s: StreakState = { current: 0, best: 0, lastCompletedDate: null };
  s = nextStreak(s, now);
  s = nextStreak(s, new Date('2026-10-24T23:59:00'));
  expect(s.current).toBe(1);
  s = nextStreak(s, new Date('2026-10-25T00:01:00'));
  expect(s.current).toBe(2);
  s = nextStreak(s, new Date('2026-10-27T08:00:00'));
  expect(s.current).toBe(1);
  expect(s.best).toBe(2);
});

it('finishes a day once and clears the active session', () => {
  const store = useAppStore.getState();
  store.startSession('w01d01', 'full', now);
  store.finishSession('w01d01', { speakingSeconds: 900, selfRating: 4 }, now);
  store.finishSession('w01d01', { speakingSeconds: 900, selfRating: 4 }, now);
  const state = useAppStore.getState();
  expect(state.days.w01d01.status).toBe('done');
  expect(state.streak.current).toBe(1);
  expect(state.activeSession).toBeNull();
});

it('persists the active stage for reload', () => {
  useAppStore.getState().startSession('w01d01', 'full', now);
  useAppStore.getState().completeStage('warmup', 60, now);
  const raw = JSON.parse(localStorage.getItem('bol-app-v1') ?? '{}');
  expect(raw.state.activeSession.stage).toBe('pattern');
});

it('schedules a word when rated', () => {
  useAppStore.getState().rateWord('w_developer', 'good', now);
  expect(useAppStore.getState().srs.w_developer.intervalDays).toBe(1);
});

it('survives corrupt persisted storage', async () => {
  localStorage.setItem('bol-app-v1', '{bad json');
  vi.resetModules();
  const mod = await import('./appStore');
  expect(mod.useAppStore.getState().days).toEqual({});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/store/appStore.test.ts`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement the store**

`createInitialState()` returns a new `crypto.randomUUID()` as `localProfileId`, empty `days` and `srs`, settings `{ ttsVoiceUri: null, ttsRate: 0.85, speechCheckEnabled: true, speechConsent: 'unset' }`, streak `{ current: 0, best: 0, lastCompletedDate: null }`, and `activeSession: null`.

Wrap the store with `persist(..., { name: 'bol-app-v1', version: 1, storage: createJSONStorage(() => localStorage) })`. `startSession` stores `createSession(dayId, mode, now)` and marks the day `in_progress` unless it is already `done` (replays keep the done status). `completeStage` ignores the call when `stage !== activeSession.stage`; otherwise it calls `advance`, merges the stage into `stagesCompleted`, adds the stage's estimated speaking seconds (warmup 60, pattern 180, words 150, shadow 180, scenario 240, wrap 60; use an explicit `speakingSeconds` when supplied), and updates `updatedAt`. This makes double-taps and late calls harmless.

`finishSession` clears `activeSession` when it matches `dayId`. If the day is already `done`, it stops there so replays do not change progress or streak. Otherwise it sets the day to `done` with `completedAt`, merges `speakingSeconds`, stores `selfRating`, stores `missionDone` (default `false`), and calls `nextStreak`. Calling it twice for the same day leaves the streak and speaking time unchanged. `resetAll` merges `createInitialState()` (keeping actions) and clears localStorage.

`nextStreak` compares `localDateKey` values: same day → unchanged; yesterday → `current + 1`; anything else → `1`; `best` is the maximum.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/store/appStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store
git commit -m "feat: add local progress store and streak"
```

---

### Task 6: Session engine and warm-up selection

**Files:**
- Create: `src/session/engine.ts`, `src/session/warmup.ts`
- Test: `src/session/engine.test.ts`, `src/session/warmup.test.ts`

**Interfaces:**
- Produces: `SessionMode = 'full' | 'short'`.
- Produces: `SessionState { dayId; mode: SessionMode; stage: Stage; stagesCompleted: Stage[]; done: boolean; startedAt: string; speakingSeconds: number }`.
- Produces: `stageList(mode: SessionMode, dayType?: DayType): Stage[]`; `createSession(dayId: string, mode: SessionMode, now?: Date): SessionState`; `advance(state: SessionState): SessionState`; `skipStage(state: SessionState): SessionState`; `isFinished(state: SessionState): boolean`.
- Produces: `WarmupItem { prompt_hi: string; answer_en: string }`; `getWarmupItems(day: DayContent, previousDay: DayContent | null): WarmupItem[]`.
- Consumes: `getDay`, `DayType` from the content module (Tasks 2–3).

- [ ] **Step 1: Write the failing engine and warm-up tests**

```ts
// src/session/engine.test.ts
import { createSession, advance, stageList } from './engine';

const now = new Date('2026-10-24T09:00:00');

it('uses six stages for a full session and four for a short one', () => {
  expect(stageList('full')).toEqual(['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap']);
  expect(stageList('short')).toEqual(['warmup', 'pattern', 'scenario', 'wrap']);
});

it('advances in order and marks the session done after wrap', () => {
  const s = createSession('w01d01', 'full', now);
  expect(s.stage).toBe('warmup');
  const next = advance(s);
  expect(next.stage).toBe('pattern');
  expect(next.stagesCompleted).toEqual(['warmup']);
  expect(advance({ ...next, stage: 'wrap' }).done).toBe(true);
});

it('uses a review path with due words for Day 7', () => {
  expect(stageList('full', 'review')).toEqual(['warmup', 'words', 'wrap']);
  expect(stageList('short', 'review')).toEqual(['warmup', 'words', 'wrap']);
  expect(createSession('w01d07', 'full', now).stage).toBe('warmup');
});
```

```ts
// src/session/warmup.test.ts
import { getDay } from '../content';
import { getWarmupItems } from './warmup';

it('returns exactly five warm-up items', () => {
  expect(getWarmupItems(getDay('w01d01'), null)).toHaveLength(5);
  expect(getWarmupItems(getDay('w01d02'), getDay('w01d01'))).toHaveLength(5);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/session`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement the engine and warm-up**

`stageList` returns six stages for a full learning day, four for a short learning day, and `['warmup', 'words', 'wrap']` for a review day. `createSession` reads `getDay(dayId).type` and starts at the first stage; this keeps Day 7 from rendering empty pattern/dialogue/shadow/scenario stages while still reviewing due words.

`advance` adds the current stage to `stagesCompleted` (if not already there), then moves to the next allowed stage; after `wrap`, sets `done: true` and leaves `stage: 'wrap'`. `skipStage` moves forward without adding the skipped stage. Both are pure.

`getWarmupItems` takes previous-day quiz answers first (mapped to `{ prompt_hi: quiz.prompt, answer_en: quiz.answer }`), then previous-day pattern examples, then current-day pattern examples, then current-day word examples, de-duplicating by answer and stopping at 5. If fewer than 5 exist, return what exists.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/session`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/session
git commit -m "feat: add session state machine and warm-up"
```

---

### Task 7: Text-to-speech with male Indian voice preference

**Files:**
- Create: `src/audio/tts.ts`, `src/types/speech.d.ts`
- Test: `src/audio/tts.test.ts`

**Interfaces:**
- Produces: `pickVoice(voices: SpeechSynthesisVoice[], preferredLang?: string): SpeechSynthesisVoice | null`.
- Produces: `speak(text: string, opts?: { rate?: number; voiceUri?: string | null }): Promise<void>`; `stopSpeaking(): void`.
- Produces: `getEnglishVoices(): SpeechSynthesisVoice[]`.

- [ ] **Step 1: Write the failing TTS tests**

```ts
// src/audio/tts.test.ts
import { expect, it, vi } from 'vitest';
import { pickVoice, speak } from './tts';

const voice = (name: string, lang: string) =>
  ({ name, lang, default: false, localService: true, voiceURI: name }) as SpeechSynthesisVoice;

it('prefers an en-IN voice, then a male English voice', () => {
  const voices = [voice('Google US English', 'en-US'), voice('en-IN-language', 'en-IN')];
  expect(pickVoice(voices)?.lang).toBe('en-IN');

  const male = [voice('Google UK English Female', 'en-GB'), voice('Google UK English Male', 'en-GB')];
  expect(pickVoice(male)?.name).toContain('Male');
  expect(pickVoice([voice('Voix française', 'fr-FR')])).toBeNull();
});

it('resolves even when speech synthesis is missing', async () => {
  vi.stubGlobal('speechSynthesis', undefined);
  await expect(speak('Hello')).resolves.toBeUndefined();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/audio/tts.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement TTS and the speech types**

`pickVoice` scores English voices: `en-IN` +5, `en-US`/`en-GB` +2, name contains `male` +3, name contains known male names (`Daniel`, `Alex`, `Rishi`, `Male`) +2, name contains `female` −3. Highest score wins; no English voice → `null`.

`speak` resolves immediately if `window.speechSynthesis` or `SpeechSynthesisUtterance` is unavailable. Otherwise it cancels current speech, creates an utterance, sets `rate` (default 0.85) and the chosen voice, and resolves on `onend` or `onerror`. `stopSpeaking` calls `cancel()`.

`src/types/speech.d.ts` declares `SpeechRecognition` and `webkitSpeechRecognition` with `start()`, `stop()`, `abort()`, `lang`, `continuous`, `interimResults`, `onresult`, `onerror`, `onend`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/audio/tts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/audio/tts.ts src/audio/tts.test.ts src/types
git commit -m "feat: add TTS with male Indian voice preference"
```

---

### Task 8: Recording and local recording storage

**Files:**
- Create: `src/audio/recorder.ts`, `src/audio/recordingStore.ts`
- Test: `src/audio/recordingStore.test.ts`
- Modify: `package.json` (add `fake-indexeddb`)

**Interfaces:**
- Produces: `RecordingKind = 'practice' | 'benchmark'`.
- Produces: `RecordingMeta { id; dayId; stage: Stage; kind; createdAt; durationMs; mimeType }`; `StoredRecording extends RecordingMeta { blob: Blob }`.
- Produces: `selectMimeType(supported: string[]): string`.
- Produces: `startRecording(input: { dayId: string; stage: Stage; kind: RecordingKind }): Promise<{ stop(): Promise<StoredRecording>; cancel(): void }>`.
- Produces: `putRecording(rec: StoredRecording): Promise<void>`; `listRecordings(dayId?: string): Promise<StoredRecording[]>`; `deleteRecording(id: string): Promise<void>`; `clearOldPracticeRecordings(now: Date, days?: number): Promise<number>`; `clearAllRecordings(): Promise<void>`.

- [ ] **Step 1: Write the failing recording-store tests**

```ts
// src/audio/recordingStore.test.ts
import 'fake-indexeddb/auto';
import { expect, it } from 'vitest';
import { clearAllRecordings, clearOldPracticeRecordings, listRecordings, putRecording } from './recordingStore';
import type { StoredRecording } from './recorder';
import { selectMimeType } from './recorder';

const rec = (id: string, kind: 'practice' | 'benchmark', createdAt: string): StoredRecording => ({
  id, dayId: 'w01d01', stage: 'shadow', kind, createdAt, durationMs: 1000,
  mimeType: 'audio/webm', blob: new Blob(['x']),
});

it('selects the first supported mime type', () => {
  expect(selectMimeType(['audio/mp4', 'audio/webm;codecs=opus'])).toBe('audio/webm;codecs=opus');
  expect(selectMimeType(['audio/mp4'])).toBe('audio/mp4');
  expect(selectMimeType([])).toBe('');
});

it('stores recordings and prunes old practice clips but keeps benchmarks', async () => {
  await putRecording(rec('old-practice', 'practice', '2026-09-01T00:00:00.000Z'));
  await putRecording(rec('old-benchmark', 'benchmark', '2026-09-01T00:00:00.000Z'));
  await putRecording(rec('new-practice', 'practice', '2026-10-20T00:00:00.000Z'));

  expect(await clearOldPracticeRecordings(new Date('2026-10-24T00:00:00.000Z'), 30)).toBe(1);
  const kept = await listRecordings('w01d01');
  expect(kept.map((r) => r.id).sort()).toEqual(['new-practice', 'old-benchmark']);

  await clearAllRecordings();
  expect(await listRecordings()).toHaveLength(0);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/audio/recordingStore.test.ts`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement recorder and storage**

Run `npm install -D fake-indexeddb`. `selectMimeType` prefers `audio/webm;codecs=opus`, then `audio/webm`, `audio/mp4`, `audio/ogg`, returning the first entry present in `supported`, else `''`.

`startRecording` requests `getUserMedia({ audio: true })`, chooses the mime type from `MediaRecorder.isTypeSupported`, collects `dataavailable` chunks, and on `stop` builds a `Blob`, measures duration from a `Date.now()` start, and resolves `StoredRecording` with `crypto.randomUUID()`. `cancel` stops tracks and discards data. If `getUserMedia` or `MediaRecorder` is unavailable, reject with `new Error('Recording is not supported')`.

`recordingStore.ts` uses `idb-keyval` `set`, `get`, `keys`, `del` with keys `recording:<id>`. `listRecordings` filters by `dayId` when supplied. `clearOldPracticeRecordings` deletes only `kind === 'practice'` older than `days` (default 30). `clearAllRecordings` deletes every `recording:*` key.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/audio/recordingStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/audio/recorder.ts src/audio/recordingStore.ts src/audio/recordingStore.test.ts package.json package-lock.json
git commit -m "feat: add local recording storage"
```

---

### Task 9: Speech keyword check

**Files:**
- Create: `src/audio/speechCheck.ts`
- Test: `src/audio/speechCheck.test.ts`

**Interfaces:**
- Produces: `matchKeywords(transcript: string, keywords: string[]): string[]`.
- Produces: `isSpeechCheckSupported(): boolean`.
- Produces: `checkKeywords(keywords: string[], timeoutMs?: number): Promise<{ transcript: string; matched: string[]; total: number }>`.

- [ ] **Step 1: Write the failing keyword tests**

```ts
// src/audio/speechCheck.test.ts
import { expect, it } from 'vitest';
import { matchKeywords } from './speechCheck';

it('matches keywords despite case and punctuation', () => {
  expect(matchKeywords("I'm a WEB developer!", ['web', 'developer'])).toEqual(['web', 'developer']);
});

it('matches a plural form of a keyword', () => {
  expect(matchKeywords('I build websites', ['website'])).toEqual(['website']);
});

it('does not invent matches', () => {
  expect(matchKeywords('I work at Edone', ['worked', 'client'])).toEqual([]);
  expect(matchKeywords('', ['web'])).toEqual([]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/audio/speechCheck.test.ts`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement the keyword check**

`matchKeywords` lowercases the transcript, replaces non-alphanumeric characters with spaces, collapses whitespace, and returns keywords whose normalized form appears in the normalized transcript. Preserve the original keyword order; de-duplicate.

`isSpeechCheckSupported` checks for `SpeechRecognition` or `webkitSpeechRecognition` on `window`. `checkKeywords` sets `lang = 'en-IN'`, `continuous = false`, `interimResults = false`, resolves with the transcript and matches on the first result, resolves empty on error, and has an 8-second timeout (configurable via `timeoutMs`). It never throws.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/audio/speechCheck.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/audio/speechCheck.ts src/audio/speechCheck.test.ts
git commit -m "feat: add speech keyword matching"
```

### Task 10: Session shell, warm-up, and pattern stages

**Files:**
- Create: `src/screens/SessionScreen.tsx`
- Create: `src/components/StageHeader.tsx`, `src/screens/stages/WarmupStage.tsx`, `src/screens/stages/PatternStage.tsx`
- Modify: `src/App.tsx` (use the real `SessionScreen` at `/session`)
- Test: `src/screens/sessionShell.test.tsx`

**Interfaces:**
- Produces: `SessionScreen(): JSX.Element`; redirects to `/` when `activeSession` is null; renders `<StageHeader />` and the component for `activeSession.stage`.
- Produces: `WarmupStage({ day, previousDay })`; `PatternStage({ day })`; both call `useAppStore.getState().completeStage(stage)` when finished.
- `StageHeader` shows `Day {day.day} · {day.title}`, a dot per stage, and an `Exit` button that saves and returns to `/`.

- [ ] **Step 1: Write the failing shell test**

```tsx
// src/screens/sessionShell.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({
  speak: vi.fn().mockResolvedValue(undefined),
  stopSpeaking: vi.fn(),
}));

it('renders the pattern stage and advances only once', async () => {
  const now = new Date('2026-10-24T09:00:00');
  const session = { ...createSession('w01d01', 'full', now), stage: 'pattern' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);
  expect(screen.getByText('I work at ___ as a ___.')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Aage badho' }));
  useAppStore.getState().completeStage('pattern');
  expect(useAppStore.getState().activeSession?.stage).toBe('words');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/sessionShell.test.tsx`
Expected: FAIL — `SessionScreen` is still the placeholder.

- [ ] **Step 3: Implement the shell and the two stages**

`SessionScreen` finds the day with `getDay(session.dayId)` and the previous day from `getAllDays()`. `WarmupStage` shows one prompt at a time, a `Jawab dekho` button that reveals `answer_en`, and `Aaya` / `Nahi aaya` buttons; after the fifth item it calls `completeStage('warmup')`.

`PatternStage` shows the frame, the three forms, `note_hi`, and 5 example rows with a `Suno` button per row (`speak(example.en)`). `Aage badho` calls `completeStage('pattern')`. The button is disabled for one render after the click.

`StageHeader` shows the day number/title, a progress dot for each stage in `stageList(session.mode, day.type)`, and `Exit` (navigate `/`; the active session stays saved).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/sessionShell.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens src/App.tsx
git commit -m "feat: add session shell, warm-up, and pattern stages"
```

---

### Task 11: Words stage with SRS ratings

**Files:**
- Create: `src/screens/stages/WordsStage.tsx`
- Test: `src/screens/wordsStage.test.tsx`

**Interfaces:**
- Produces: `WordsStage({ day })`; shows due SRS cards first, then new words not yet in `srs`; each card has `Suno`, reveal, and four rating buttons: `Phir se`, `Mushkil`, `Theek`, `Aasan`.
- Calls `rateWord(itemId, rating)` and moves to the next card; after the last card calls `completeStage('words')`.
- If no cards remain, shows `Aaj naye words nahi` and calls `completeStage('words')`.

- [ ] **Step 1: Write the failing words test**

```tsx
// src/screens/wordsStage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { WordsStage } from './stages/WordsStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));

it('rates a word and schedules it', async () => {
  const now = new Date('2026-10-24T09:00:00');
  const session = { ...createSession('w01d01', 'full', now), stage: 'words' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<WordsStage day={getDay('w01d01')} />);
  expect(screen.getByText('developer')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Theek' }));

  const card = useAppStore.getState().srs.w_developer;
  expect(card.intervalDays).toBe(1);
  expect(screen.getByText('client')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/wordsStage.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `WordsStage`**

Build a `wordById` map from `getAllDays().flatMap((d) => d.words)`. Due cards are `dueCards(useAppStore.getState().srs, new Date())`; new cards are `day.words.filter((w) => !srs[w.id])`. Render due first, then new. Reveal state resets per card. Rating calls `rateWord` and advances. When the queue is empty, call `completeStage('words')` once (guard with a ref or `useEffect`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/wordsStage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/stages/WordsStage.tsx src/screens/wordsStage.test.tsx
git commit -m "feat: add words stage with SRS ratings"
```

---

### Task 12: Shadow stage with recording and playback

**Files:**
- Create: `src/screens/stages/ShadowStage.tsx`
- Test: `src/screens/shadowStage.test.tsx`

**Interfaces:**
- Produces: `ShadowStage({ day })`; shows the dialogue context, each line with `Suno`, a `Record karo` / `Stop` button, and `Apni recording suno` after stop.
- Saves each recording with `kind: 'practice'` and the current `stage: 'shadow'`.
- If recording fails, shows `Mic nahi mila. Bina recording ke practice karo.` and keeps the stage usable.
- `Aage badho` calls `completeStage('shadow')`.

- [ ] **Step 1: Write the failing shadow test**

```tsx
// src/screens/shadowStage.test.tsx
import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ShadowStage } from './stages/ShadowStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';
import { startRecording } from '../audio/recorder';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));
const { stop } = vi.hoisted(() => ({ stop: vi.fn() }));
stop.mockResolvedValue({
  id: 'r1', dayId: 'w01d01', stage: 'shadow', kind: 'practice',
  createdAt: new Date().toISOString(), durationMs: 800, mimeType: 'audio/webm', blob: new Blob(['x']),
});
vi.mock('../audio/recorder', () => ({
  startRecording: vi.fn().mockResolvedValue({ stop, cancel: vi.fn() }),
}));
Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:test') });
Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });

it('records, stops, and shows playback', async () => {
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'shadow' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ShadowStage day={getDay('w01d01')} />);
  const user = userEvent.setup();
  await user.click(screen.getAllByRole('button', { name: 'Record karo' })[0]);
  await user.click(screen.getByRole('button', { name: 'Stop' }));
  expect(await screen.findByText('Apni recording suno')).toBeInTheDocument();
  expect(stop).toHaveBeenCalled();
});

it('shows a mic error and still allows skipping', async () => {
  vi.mocked(startRecording).mockRejectedValueOnce(new Error('denied'));
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'shadow' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ShadowStage day={getDay('w01d01')} />);
  const user = userEvent.setup();
  await user.click(screen.getAllByRole('button', { name: 'Record karo' })[0]);
  expect(await screen.findByText('Mic nahi mila. Bina recording ke practice karo.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Aage badho' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/shadowStage.test.tsx`
Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `ShadowStage`**

Render `dialogue.lines`; the active line gets `Suno` and recording controls. On record, call `startRecording({ dayId: day.id, stage: 'shadow', kind: 'practice' })`; on stop, save the returned recording via `putRecording` and create an object URL for playback. Show `sound_focus.tip_hi` and the minimal pairs. `Aage badho` calls `completeStage('shadow')`. If `startRecording` rejects, set an error message and keep the skip path.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/shadowStage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/stages/ShadowStage.tsx src/screens/shadowStage.test.tsx
git commit -m "feat: add shadowing stage with local recording"
```

---

### Task 13: Scenario stage, consent, and keyword check

**Files:**
- Create: `src/screens/stages/ScenarioStage.tsx`, `src/components/ConsentDialog.tsx`
- Test: `src/screens/scenarioStage.test.tsx`

**Interfaces:**
- Produces: `ScenarioStage({ day })`; one turn at a time with `prompt_en`, `hint_hi`, `Record karo`, `Stop`, `Bina record kiye aage`, `Check karo` (only when consent granted, `speechCheckEnabled`, and supported), `Jawab dekho` (enabled after an attempt or skip), and the model answer.
- Produces: `ConsentDialog({ onGrant, onDeny })` with text `Voice check on karein?`, explanation that the browser may process mic audio, and buttons `Haan, on karo` / `Nahi, off rakho`.
- Consent updates `settings.speechConsent` to `granted` or `denied`.
- After the 4th turn, calls `completeStage('scenario')`.

- [ ] **Step 1: Write the failing scenario test**

```tsx
// src/screens/scenarioStage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { ScenarioStage } from './stages/ScenarioStage';
import { getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

vi.mock('../audio/tts', () => ({ speak: vi.fn().mockResolvedValue(undefined), stopSpeaking: vi.fn() }));
vi.mock('../audio/speechCheck', () => ({
  isSpeechCheckSupported: () => true,
  checkKeywords: vi.fn().mockResolvedValue({ transcript: 'I am a web developer', matched: ['web', 'developer'], total: 4 }),
}));

it('asks for consent, then hides the model answer until an attempt', async () => {
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'scenario' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<ScenarioStage day={getDay('w01d01')} />);
  expect(screen.getByText('Voice check on karein?')).toBeInTheDocument();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Nahi, off rakho' }));
  expect(useAppStore.getState().settings.speechConsent).toBe('denied');
  expect(screen.queryByRole('button', { name: 'Check karo' })).not.toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Bina record kiye aage' }));
  await user.click(screen.getByRole('button', { name: 'Jawab dekho' }));
  expect(screen.getByText(getDay('w01d01').scenario!.turns[0].model_en)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/scenarioStage.test.tsx`
Expected: FAIL — modules do not exist.

- [ ] **Step 3: Implement the scenario stage**

On mount, if `speechConsent === 'unset'` and `isSpeechCheckSupported()`, show `ConsentDialog`. A denied consent disables the keyword check for the rest of the app. On record, call `startRecording({ dayId, stage: 'scenario', kind: 'practice' })`; on stop, save and enable `Check karo` (when allowed). `Check karo` calls `checkKeywords(turn.keywords)` and shows `{matched.length}/{total} key words`. `Bina record kiye aage` marks the turn attempted. `Jawab dekho` reveals `model_en`; `Aage` moves to the next turn. After the last turn, `completeStage('scenario')`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/scenarioStage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/stages/ScenarioStage.tsx src/components/ConsentDialog.tsx src/screens/scenarioStage.test.tsx
git commit -m "feat: add scenario stage with consent-based keyword check"
```

---

### Task 14: Wrap stage, quiz, benchmark prompts, and completion

**Files:**
- Create: `src/screens/stages/WrapStage.tsx`
- Test: `src/screens/wrapStage.test.tsx`

**Interfaces:**
- Produces: `WrapStage({ day })`; renders the 3 quiz items one at a time (fill input or choice buttons), `Check` feedback (`Sahi` / `Phir se`), then a 1–5 self-rating, then `Session khatam`.
- On a review day, also shows the 4 `BENCHMARK_PROMPTS` with a `Record` button per prompt (`kind: 'benchmark'`), a `Benchmark baad me` skip, and `day.mission` with a `Mission complete` checkbox.
- `Session khatam` calls `finishSession(day.id, { speakingSeconds, selfRating, missionDone })` and navigates to `/progress`.

- [ ] **Step 1: Write the failing wrap test**

```tsx
// src/screens/wrapStage.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { BENCHMARK_PROMPTS, getDay } from '../content';
import { createInitialState, useAppStore } from '../store/appStore';
import { createSession } from '../session/engine';

it('completes a learning day after the quiz and rating', async () => {
  const day = getDay('w01d01');
  const session = { ...createSession('w01d01', 'full', new Date()), stage: 'wrap' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });

  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);
  const user = userEvent.setup();

  for (const quiz of day.quiz) {
    await user.type(screen.getByRole('textbox'), quiz.answer);
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await user.click(screen.getByRole('button', { name: 'Aage' }));
  }

  await user.click(screen.getByRole('button', { name: '4' }));
  await user.click(screen.getByRole('button', { name: 'Session khatam' }));

  expect(useAppStore.getState().days.w01d01.status).toBe('done');
  expect(useAppStore.getState().activeSession).toBeNull();
});

it('shows four benchmark prompts on the review day', async () => {
  const day = getDay('w01d07');
  const session = { ...createSession('w01d07', 'full', new Date()), stage: 'wrap' as const };
  useAppStore.setState({ ...createInitialState(), activeSession: session });
  render(<MemoryRouter initialEntries={['/session']}><App /></MemoryRouter>);

  const user = userEvent.setup();
  for (const quiz of day.quiz) {
    await user.type(screen.getByRole('textbox'), quiz.answer);
    await user.click(screen.getByRole('button', { name: 'Check' }));
    await user.click(screen.getByRole('button', { name: 'Aage' }));
  }

  for (const prompt of BENCHMARK_PROMPTS) {
    expect(screen.getByText(prompt.en)).toBeInTheDocument();
  }
  expect(screen.getByText(day.mission!.title_hi)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/wrapStage.test.tsx`
Expected: FAIL — `WrapStage` does not exist.

- [ ] **Step 3: Implement `WrapStage`**

Quiz state is local. For `fill`, compare lowercase trimmed input to `answer`; for `choice`, compare the selected option. Show `Sahi` or `Phir se`; `Aage` moves on even after a wrong answer (feedback only). Reset the input/selection when moving to the next quiz item. After the last quiz item, show the 1–5 rating and `Session khatam`.

For `day.type === 'review'`, render the benchmark list before the rating. Each `Record` uses `startRecording({ dayId, stage: 'wrap', kind: 'benchmark' })` and saves via `putRecording`; `Benchmark baad me` skips the list. Render `day.mission.title_hi` and `steps_hi` with a `Mission complete` checkbox; pass `missionDone` (default `false` on learning days) to `finishSession`. `Session khatam` uses the active session's `speakingSeconds`, calls `finishSession`, then `navigate('/progress')`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/wrapStage.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/stages/WrapStage.tsx src/screens/wrapStage.test.tsx
git commit -m "feat: add wrap stage, quiz, and benchmark prompts"
```

---

### Task 15: Today screen and routing

**Files:**
- Create: `src/screens/TodayScreen.tsx`
- Modify: `src/App.tsx` (real Today screen at `/`)
- Test: `src/screens/today.test.tsx`

**Interfaces:**
- Produces: `TodayScreen()`; picks the first day whose progress is not `done` from `getAllDays()`.
- Shows `Day {n} · Week 1`, the day title, pattern frame (if any), `Streak: {n} din`, and buttons `Start 30 min` / `Short 15 min`; shows `Resume` when `activeSession` exists.
- If all 7 days are done, shows `Week 1 complete` and `Week 2 jald aa raha hai`.
- Starting calls `startSession(day.id, 'full' | 'short')` and navigates to `/session`.

- [ ] **Step 1: Write the failing Today test**

```tsx
// src/screens/today.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';

it('shows Day 1 and starts a full session', async () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

  expect(screen.getByText('Day 1 · Week 1')).toBeInTheDocument();
  expect(screen.getByText('What do you do?')).toBeInTheDocument();
  expect(screen.getByText('Streak: 0 din')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Start 30 min' }));
  expect(useAppStore.getState().activeSession?.mode).toBe('full');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run src/screens/today.test.tsx`
Expected: FAIL — Today is still the placeholder.

- [ ] **Step 3: Implement `TodayScreen`**

Subscribe with `const days = useAppStore((s) => s.days)` and `const activeSession = useAppStore((s) => s.activeSession)`; compute `nextDay = getAllDays().find((d) => days[d.id]?.status !== 'done')`. If `activeSession`, show `Resume` and the day from the session. Use `navigate('/session')`. Show the pattern frame for learning days and `Aaj review + benchmark` for review days.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run src/screens/today.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/TodayScreen.tsx src/App.tsx src/screens/today.test.tsx
git commit -m "feat: add Today screen and session entry"
```

### Task 16: Progress, Library, and Settings screens

**Files:**
- Create: `src/screens/ProgressScreen.tsx`, `src/screens/LibraryScreen.tsx`, `src/screens/SettingsScreen.tsx`
- Modify: `src/App.tsx` (real screens at `/progress`, `/library`, `/settings`)
- Test: `src/screens/secondaryScreens.test.tsx`

**Interfaces:**
- `ProgressScreen` shows `Days complete: X/7`, `Speaking time: N min`, `Words strong: N` (cards with `intervalDays >= 7`), and a 7-row day list with status.
- `LibraryScreen` lists all 7 days with title, pattern/frame, and a `Practice` button that starts a full session.
- `SettingsScreen` shows a voice `<select>` from `getEnglishVoices()`, a rate range 0.6–1.2, a `Voice check` checkbox, and `Reset data` with a confirm dialog.

- [ ] **Step 1: Write the failing secondary-screen tests**

```tsx
// src/screens/secondaryScreens.test.tsx
import 'fake-indexeddb/auto';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../App';
import { createInitialState, useAppStore } from '../store/appStore';

it('shows completed days and strong words', () => {
  const state = createInitialState();
  state.days.w01d01 = {
    dayId: 'w01d01', status: 'done', stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
    speakingSeconds: 900, selfRating: 4, missionDone: false, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  };
  state.srs.w_developer = {
    itemId: 'w_developer', ease: 2.5, intervalDays: 10, dueAt: new Date().toISOString(),
    reps: 3, lapses: 0, lastRating: 'good', updatedAt: new Date().toISOString(),
  };
  useAppStore.setState(state);

  render(<MemoryRouter initialEntries={['/progress']}><App /></MemoryRouter>);
  expect(screen.getByText('Days complete: 1/7')).toBeInTheDocument();
  expect(screen.getByText('Speaking time: 15 min')).toBeInTheDocument();
  expect(screen.getByText('Words strong: 1')).toBeInTheDocument();
});

it('changes the TTS rate in Settings', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/settings']}><App /></MemoryRouter>);
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: '1' } });
  expect(useAppStore.getState().settings.ttsRate).toBe(1);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --run src/screens/secondaryScreens.test.tsx`
Expected: FAIL — placeholders are still rendered.

- [ ] **Step 3: Implement the three screens**

`ProgressScreen` derives stats from `useAppStore`. `LibraryScreen` uses `getAllDays()` and starts a full session on `Practice`. `SettingsScreen` lists English voices, persists `ttsVoiceUri` and `ttsRate`, toggles `speechCheckEnabled`, and resets after a confirm (calls `resetAll()` and `clearAllRecordings()`). On mount it calls `clearOldPracticeRecordings(new Date(), 30)` once.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --run src/screens/secondaryScreens.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ProgressScreen.tsx src/screens/LibraryScreen.tsx src/screens/SettingsScreen.tsx src/App.tsx src/screens/secondaryScreens.test.tsx
git commit -m "feat: add progress, library, and settings screens"
```

---

### Task 17: PWA, offline shell, and end-to-end short session

**Files:**
- Create: `public/logo.svg`, `pwa-assets.config.ts`, `playwright.config.ts`, `tests/e2e/day1.spec.ts`
- Modify: `vite.config.ts` (VitePWA), `src/main.tsx` (SW registration), `package.json` (scripts)
- Test: `tests/e2e/day1.spec.ts`

**Interfaces:**
- Produces: installable manifest with 192/512 icons, `theme_color: '#0f766e'`, `background_color: '#faf7f2'`, `display: 'standalone'`.
- Produces: `npm run test:e2e` runs Playwright against `npm run preview -- --port 4173`.
- Offline: after one online load, the app shell and Week 1 content load with the network disabled.

- [ ] **Step 1: Write the failing E2E test**

```ts
// tests/e2e/day1.spec.ts
import { expect, test } from '@playwright/test';

test('completes a short Day 1 session and survives reload + offline', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByText('Day 1 · Week 1')).toBeVisible();
  await page.getByRole('button', { name: 'Short 15 min', exact: true }).click();

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Jawab dekho', exact: true }).click();
    await page.getByRole('button', { name: 'Aaya', exact: true }).click();
  }
  await page.getByRole('button', { name: 'Aage badho', exact: true }).click();

  await page.getByRole('button', { name: 'Nahi, off rakho', exact: true }).click();
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: 'Bina record kiye aage', exact: true }).click();
    await page.getByRole('button', { name: 'Jawab dekho', exact: true }).click();
    await page.getByRole('button', { name: 'Aage', exact: true }).click();
  }

  for (const answer of ['at', 'as', 'developer']) {
    await page.getByRole('textbox').fill(answer);
    await page.getByRole('button', { name: 'Check', exact: true }).click();
    await page.getByRole('button', { name: 'Aage', exact: true }).click();
  }
  await page.getByRole('button', { name: '4', exact: true }).click();
  await page.getByRole('button', { name: 'Session khatam', exact: true }).click();
  await expect(page.getByText('Days complete: 1/7')).toBeVisible();

  await page.goto('/');
  await expect(page.getByText('Day 2 · Week 1')).toBeVisible();

  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText('Day 2 · Week 1')).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run build && npm run test:e2e -- tests/e2e/day1.spec.ts`
Expected: FAIL — no PWA config and/or the flow is incomplete.

- [ ] **Step 3: Add the PWA and test configuration**

Run `npm install -D @vite-pwa/assets-generator`, then generate icons from `public/logo.svg` with the `minimal-2023` preset. Configure `VitePWA` with `registerType: 'autoUpdate'`, `workbox: { clientsClaim: true, skipWaiting: true }`, the manifest above, and `workbox.globPatterns` covering `**/*.{js,css,html,svg,png,json}`. Add `playwright.config.ts` with `webServer: { command: 'npm run preview -- --port 4173', url: 'http://localhost:4173', reuseExistingServer: true }` and `use: { baseURL: 'http://localhost:4173' }`.

Add scripts: `"preview": "vite preview"`, `"test:e2e": "playwright test"`. Ensure `src/main.tsx` registers the service worker (the plugin’s auto injection is enough).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm run build && npm run test:e2e -- tests/e2e/day1.spec.ts`
Expected: PASS — session completes, reload shows Day 2, offline reload shows Day 2.

- [ ] **Step 5: Commit**

```bash
git add public pwa-assets.config.ts playwright.config.ts tests/e2e vite.config.ts src/main.tsx package.json
git commit -m "feat: add PWA shell and offline E2E coverage"
```

---

### Task 18: Cloudflare Pages deployment and setup guide

**Files:**
- Create: `public/_redirects`, `docs/setup.md`, `README.md`
- Test: `npm run build` output

**Interfaces:**
- Produces: `dist/_redirects` containing `/* /index.html 200`.
- Produces: `docs/setup.md` with exact Cloudflare Pages steps: build command `npm run build`, output `dist`, direct-upload command `npx wrangler pages deploy dist --project-name=bol`, and phone install steps.
- Produces: `README.md` with `npm install`, `npm run dev`, `npm test`, `npm run validate:content`, `npm run build`.

- [ ] **Step 1: Add the redirect and docs**

`public/_redirects`:

```
/* /index.html 200
```

`docs/setup.md` covers: `npm install`, `npm run build`, `npx wrangler login`, `npx wrangler pages project create bol` (first time only), `npx wrangler pages deploy dist --project-name=bol`, opening the URL on Android Chrome, and “Add to Home screen”. It also states that Plan 1 has no backend, recordings never leave the device, and the voice keyword check is consent-gated.

- [ ] **Step 2: Build and verify the deployable output**

Run: `npm run build`
Expected: `dist/index.html`, `dist/_redirects`, `dist/manifest.webmanifest`, `dist/sw.js` exist.

- [ ] **Step 3: Deploy with the human**

Pause and ask the learner to run `npx wrangler login` in a terminal, then `npx wrangler pages project create bol` if the project does not exist, then `npx wrangler pages deploy dist --project-name=bol`. Verify the returned URL loads the Today screen on the laptop and phone.

- [ ] **Step 4: Commit**

```bash
git add public/_redirects docs/setup.md README.md
git commit -m "docs: add Cloudflare Pages setup and project README"
```

---

### Task 19: Week 1 teaching lesson and printable reference

**Files:**
- Create: `assets/course.css`, `assets/quiz.js`
- Create: `lessons/0001-week-1-introduce-yourself.html`
- Create: `reference/0001-week-1-patterns.html`
- Test: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- `assets/quiz.js` defines `initQuiz(root)` and auto-runs it on `DOMContentLoaded` for every `[data-quiz]`: reads inputs with `data-answer`, compares trimmed lowercase, shows `Sahi` or `Phir se`.
- `lessons/0001-week-1-introduce-yourself.html` teaches the 6 Week 1 patterns, has 6 fill-in quiz items, 4 speak prompts, links to `../reference/0001-week-1-patterns.html`, and a reminder to ask the teacher follow-up questions.
- `reference/0001-week-1-patterns.html` is a print-friendly sheet (up to two A4 pages): 6 patterns, 30 words, 10 phrases, v/w + th notes.

- [ ] **Step 1: Write the failing lesson test**

```ts
// tests/e2e/lesson.spec.ts
import { expect, test } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

test('checks a lesson answer and links to the reference', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  await page.getByLabel('I work ___ Edone Solutions.').fill('at');
  await page.getByRole('button', { name: 'Check' }).first().click();
  await expect(page.getByText('Sahi').first()).toBeVisible();

  await page.getByLabel('I work ___ Edone Solutions.').fill('on');
  await page.getByRole('button', { name: 'Check' }).first().click();
  await expect(page.getByText('Phir se').first()).toBeVisible();

  await expect(page.getByRole('link', { name: 'Week 1 patterns' })).toHaveAttribute('href', '../reference/0001-week-1-patterns.html');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/lesson.spec.ts`
Expected: FAIL — lesson files do not exist.

- [ ] **Step 3: Write the shared assets, lesson, and reference**

Use the Week 1 patterns and words from `docs/curriculum-plan.md`. The lesson should be readable on a phone, with short sections, a `Suno` button per pattern using `speechSynthesis` when available, and citations to [Cambridge Dictionary](https://dictionary.cambridge.org/) and [BBC Learning English](https://www.bbc.co.uk/learningenglish/). The reference sheet uses `@media print` to hide navigation and fit on two A4 pages.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx playwright test tests/e2e/lesson.spec.ts`
Expected: PASS.

- [ ] **Step 5: Open the lesson for the learner**

Run: `start lessons/0001-week-1-introduce-yourself.html`
Expected: the lesson opens in the default browser.

- [ ] **Step 6: Commit**

```bash
git add assets lessons reference tests/e2e/lesson.spec.ts
git commit -m "feat: add Week 1 lesson and printable reference"
```

---

## Self-Review

**1. Spec coverage**

| Spec area | Covered by |
|---|---|
| Local-first PWA, no auth | Tasks 1, 5, 17 |
| Week 1 content, 6 learning + 1 review day | Tasks 2, 3 |
| 30-min and 15-min session structures | Task 6, 10–15 |
| Pattern, words, shadow, scenario, wrap stages | Tasks 10–14 |
| SRS 1/3/7/14/30/60, cap 10 | Task 4, 11 |
| TTS male en-IN preference | Task 7 |
| Recording stays local, 30-day practice prune, benchmarks kept | Task 8 |
| Consent-based keyword check | Tasks 9, 13 |
| Today, Progress, Library, Settings | Tasks 15, 16 |
| PWA install + offline | Task 17 |
| Cloudflare Pages deployment | Task 18 |
| Week 1 teaching lesson + reference | Task 19 |
| Sync, auth, Weeks 2–12, full dashboard | **Out of scope — next plans** |

**2. Step scan:** Each step names the file, the test, or the command and the expected result. No “handle edge cases” or “write tests” placeholders.

**3. Type consistency:** `DayContent`, `Stage`, `SrsCard`, `SessionState`, `AppData`, `AppState`, `StoredRecording`, and `Settings` are defined once and imported everywhere. `createInitialState()` returns `AppData`; `AppState` adds actions. `completeStage` is idempotent when the stage no longer matches the active stage.

**4. Review Focus mapping:** mic denial → Tasks 12, 13; no TTS → Task 7; midnight streak → Task 5; double-tap/reload → Tasks 5, 10; corrupt storage/missing day → Tasks 1, 5.

**5. Proportion:** This plan is longer than the Week 1 slice because it pins interfaces and test names across 19 sequential tasks. Code blocks are signatures, tests, and commands, not full implementations.

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-10-24-week-1-vertical-slice.md`. Please review the plan. Which execution approach would you prefer?**

**Ordering note:** implement Task 6 (session engine) before Task 5 (store), because the store consumes `createSession`/`advance`. Task numbers stay stable for references.

- **Subagent-driven** — a fresh subagent implements each task and a fresh reviewer checks it before the next one starts. Most thorough; costs a fresh context per task and per review.
- **Native** — I implement every task in this session, then one fresh reviewer checks the whole branch. Cheapest and fastest; no independent review until the end.

**For this plan I recommend Native**, because the 19 tasks are tightly coupled through a small set of interfaces and the plan pins them; a shipped mistake is local to one learner’s device, not a shared service. Does the plan capture what you want, and which approach should we use?



