# Week 2 Daily Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author Week 2's 7 daily sessions and make the app load, navigate, and show practice across multiple weeks.

**Architecture:** Week 2 content is written as seven `w02dNN.json` files in the existing day schema (same depth as Week 1). The loader switches from static Week 1 imports to `import.meta.glob`, validates every file at module load, and exposes week-aware helpers. Today, Progress and Library consume those helpers; the session engine and stages stay untouched.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Zod, Vitest, Playwright, Tailwind.

**Spec:** `docs/superpowers/specs/2026-10-28-weeks-2-12-daily-practice-design.md`

## Global Constraints

- Content copy: all `*_hi` fields and notes in Hinglish; targets, dialogues and model answers in English.
- Day schema unchanged: learning day = exactly 5 words, 6 dialogue lines, 4 scenario turns, 3 quiz items, 4–6 pattern examples; review day = no words/pattern/dialogue/scenario, 3 quiz items, mission required.
- Week 2 source of truth: `content-src/weeks/week-02.json` patterns, mission, phrases, pronunciation notes. Do not reorder or invent patterns.
- Word ids unique across the whole course, prefixed `w02_` for Week 2 (Week 1 uses `w_`).
- Do not edit Week 1 JSON, `content-src/weeks/*.json`, or generated `lessons/` and `reference/` HTML.
- Totals count authored days (`14` after this plan), not the 84-day promise.
- `npm run build`, `npx vitest run`, `npm run validate:content` must pass at the end of every task that changes code.

## Review Focus

- All authored days done but more weeks are coming: Today must show a week-complete fallback, never crash on `nextDay!`. Covered by Task 5 test.
- A malformed authored JSON must fail loudly at module load, not disappear from the app. Covered by validation in Task 4.
- Duplicate word ids across weeks would corrupt SRS keys. Covered by Task 3's 30-unique-word assertion and `validateAll`.
- Existing Week 1 progress and backup import must survive the loader change. Covered by Task 8 backup round-trip.
- Week boundary in session navigation/warm-up: `w01d07` must be followed by `w02d01`, not `null`. Covered by Task 4 and Task 5 tests.

---

### Task 1: Week 2 Days 1–3 content

**Files:**
- Create: `content-src/week-02/w02d01.json`
- Create: `content-src/week-02/w02d02.json`
- Create: `content-src/week-02/w02d03.json`
- Test: `src/content/week02.test.ts`

**Interfaces:**
- Consumes: `parseDay(input: unknown): DayContent` from `src/content/validate.ts`.
- Produces: three `DayContent` JSON files that later tasks and the loader read by id `w02d01`, `w02d02`, `w02d03`.

**Day map (exact values):**

| File | id | day | title | theme | pattern id / frame | 5 words | scenario id / setting | sound focus |
|---|---|---|---|---|---|---|---|---|
| `w02d01.json` | w02d01 | 1 | What do you usually do? | Your morning routine | `p_w02_routine` / `I usually ___ at ___.` | routine, commute, alarm, breakfast, schedule | `s_w02_monday_chat` / office kitchen, colleague Riya | -s endings |
| `w02d02.json` | w02d02 | 2 | I don't watch cricket very often. | Habits you don't have | `p_w02_negative_habit` / `I don't ___ very often.` | gym, cricket, movie, hobby, walk | `s_w02_lunch_colleague` / office canteen, lunch break | sentence rhythm |
| `w02d03.json` | w02d03 | 3 | How was your weekend? | Weekend small talk | `p_w02_weekend_past` / `How was your weekend?` | weekend, family, traffic, tired, relax | `s_w02_weekend_plans` / Monday desk chat about the weekend | was / were |

- Word ids: `w02_routine`, `w02_commute`, `w02_alarm`, `w02_breakfast`, `w02_schedule`, `w02_gym`, `w02_cricket`, `w02_movie`, `w02_hobby`, `w02_walk`, `w02_weekend`, `w02_family`, `w02_traffic`, `w02_tired`, `w02_relax`.
- Pattern copy: take `forms.positive`, `forms.negative` and `forms.question` verbatim from the matching pattern in `content-src/weeks/week-02.json`; `note_hi` from that pattern's `note`; use its `say` plus its two `examples` as the first three examples, then add one or two more learner-world examples to reach 4–6.
- Dialogue titles: "Monday morning chat", "Lunch with a colleague", "Monday weekend catch-up". Each exactly 6 A/B lines with `en` + `hi`.
- Quiz answers: d01 `start`, `starts`, translate → `I usually start work at ten.`; d02 `watch`, `Do`, translate → `I don't go to the gym very often.`; d03 `was`, `went`, translate → `My weekend was good.`
- `mission` is `null` for all three.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { parseDay } from './validate';
import d01 from '../../content-src/week-02/w02d01.json';
import d02 from '../../content-src/week-02/w02d02.json';
import d03 from '../../content-src/week-02/w02d03.json';

const days = [d01, d02, d03].map((day) => parseDay(day));

describe('Week 2 days 1–3', () => {
  it('has the expected ids, days and pattern frames', () => {
    expect(days.map((d) => d.id)).toEqual(['w02d01', 'w02d02', 'w02d03']);
    expect(days.map((d) => d.day)).toEqual([1, 2, 3]);
    expect(days.map((d) => d.week)).toEqual([2, 2, 2]);
    expect(days.map((d) => d.pattern?.frame)).toEqual([
      'I usually ___ at ___.',
      "I don't ___ very often.",
      'How was your weekend?',
    ]);
  });

  it('has Week 1 depth on every day', () => {
    for (const day of days) {
      expect(day.words).toHaveLength(5);
      expect(day.dialogue?.lines).toHaveLength(6);
      expect(day.scenario?.turns).toHaveLength(4);
      expect(day.quiz).toHaveLength(3);
      expect(day.pattern?.examples.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('starts each day with the planned words and scenario', () => {
    expect(days[0].words.map((w) => w.term)).toEqual([
      'routine', 'commute', 'alarm', 'breakfast', 'schedule',
    ]);
    expect(days.map((d) => d.scenario?.id)).toEqual([
      's_w02_monday_chat', 's_w02_lunch_colleague', 's_w02_weekend_plans',
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/week02.test.ts`
Expected: FAIL — module `../../content-src/week-02/w02d01.json` not found.

- [ ] **Step 3: Author the three JSON files**

Follow `content-src/week-01/w01d01.json` for shape and `content-src/weeks/week-02.json` for grammar notes and quiz material. Use the day map above for ids, titles, words, patterns and scenarios. Write fresh dialogue lines and hints; do not copy the Week 1 dialogue.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/week02.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add content-src/week-02 src/content/week02.test.ts
git commit -m "feat: author Week 2 practice days 1-3"
```

---

### Task 2: Week 2 Days 4–6 content

**Files:**
- Create: `content-src/week-02/w02d04.json`
- Create: `content-src/week-02/w02d05.json`
- Create: `content-src/week-02/w02d06.json`
- Modify: `src/content/week02.test.ts`

**Interfaces:**
- Consumes: the three files from Task 1 and `parseDay`.
- Produces: complete learning-day set `w02d04`–`w02d06`, using the same schema.

**Day map (exact values):**

| File | id | day | title | theme | pattern id / frame | 5 words | scenario id / setting | sound focus |
|---|---|---|---|---|---|---|---|---|
| `w02d04.json` | w02d04 | 4 | I went to ___ / I stayed ___. | Last weekend stories | `p_w02_past_actions` / `I went to ___ / I stayed ___.` | cousin, theatre, plan, food, sleep | `s_w02_friend_catchup` / phone catch-up with a friend | went |
| `w02d05.json` | w02d05 | 5 | Do you like ___? | Likes and preferences | `p_w02_likes` / `Do you like ___?` | colleague, chat, break, lunch, office | `s_w02_precall` / video call starting, 2 minutes early | like + verb-ing rhythm |
| `w02d06.json` | w02d06 | 6 | What about you? | Keep the conversation going | `p_w02_followup` / `What about you?` | early, late, busy, book, cook | `s_w02_asking_them` / work event, meeting someone new | question intonation |

- Word ids: `w02_cousin`, `w02_theatre`, `w02_plan`, `w02_food`, `w02_sleep`, `w02_colleague`, `w02_chat`, `w02_break`, `w02_lunch`, `w02_office`, `w02_early`, `w02_late`, `w02_busy`, `w02_book`, `w02_cook`.
- Pattern copy follows the same rule as Task 1: forms and note verbatim from the matching `week-02.json` pattern, examples built from `say` + the two listed examples + 1–2 new.
- Dialogue titles: "Friend catch-up", "Before the call starts", "At the work event". Each exactly 6 A/B lines with `en` + `hi`.
- Quiz answers: d04 `went`, `at`, translate → `I went to the market on Sunday.`; d05 `working`, `Does`, translate → `Do you like working from home?`; d06 `about`, `you`, translate → `What about you?`
- `mission` is `null` for all three.

- [ ] **Step 1: Extend the failing test**

Append to `src/content/week02.test.ts`:

```ts
import d04 from '../../content-src/week-02/w02d04.json';
import d05 from '../../content-src/week-02/w02d05.json';
import d06 from '../../content-src/week-02/w02d06.json';

const allLearningDays = [d01, d02, d03, d04, d05, d06].map((day) => parseDay(day));

it('has six learning days with 30 unique words', () => {
  expect(allLearningDays.map((d) => d.id)).toEqual([
    'w02d01', 'w02d02', 'w02d03', 'w02d04', 'w02d05', 'w02d06',
  ]);
  const terms = allLearningDays.flatMap((d) => d.words.map((w) => w.term));
  const ids = allLearningDays.flatMap((d) => d.words.map((w) => w.id));
  expect(terms).toHaveLength(30);
  expect(new Set(terms).size).toBe(30);
  expect(new Set(ids).size).toBe(30);
});

it('keeps the last three patterns in weekly order', () => {
  expect(allLearningDays.map((d) => d.pattern?.frame)).toEqual([
    'I usually ___ at ___.',
    "I don't ___ very often.",
    'How was your weekend?',
    'I went to ___ / I stayed ___.',
    'Do you like ___?',
    'What about you?',
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/week02.test.ts`
Expected: FAIL — `w02d04.json` not found.

- [ ] **Step 3: Author the three JSON files**

Use `content-src/weeks/week-02.json` for the `went/stayed`, `like + verb-ing` and follow-up grammar notes. Keep scenarios from `docs/curriculum-plan.md` Week 2 list.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/week02.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add content-src/week-02 src/content/week02.test.ts
git commit -m "feat: author Week 2 practice days 4-6"
```

---

### Task 3: Week 2 Day 7 review

**Files:**
- Create: `content-src/week-02/w02d07.json`
- Modify: `src/content/week02.test.ts`

**Interfaces:**
- Consumes: the six learning days from Tasks 1–2.
- Produces: one review day `w02d07` with no new words, 3 recall quiz items, and the Week 2 mission.

**Exact content:**

- `id: "w02d07"`, `week: 2`, `day: 7`, `type: "review"`, `theme: "Week 2 review"`, `title: "Review + benchmark"`.
- `goal_hi: "Week 2 ke patterns aur words yaad karke Monday small talk confidently karna."`
- `pattern: null`, `words: []`, `dialogue: null`, `scenario: null`.
- Quiz answers: `usually` (word order), `was` (`How ___ your weekend?`), `working` (`Do you like ___ from home?`).
- `mission`: `id: "m_week2_small_talk"`, `title_hi: "Ek colleague se ek real small-talk question English me poochho — “How was your weekend?” ya “Do you like ___?” — aur uska answer suno."`, `steps_hi` with 4 steps (question chuno, English me poochho, answer suno, ek follow-up poochho).

- [ ] **Step 1: Extend the failing test**

Append to `src/content/week02.test.ts`:

```ts
import d07 from '../../content-src/week-02/w02d07.json';

it('closes the week with a review day', () => {
  const review = parseDay(d07);
  expect(review.id).toBe('w02d07');
  expect(review.type).toBe('review');
  expect(review.pattern).toBeNull();
  expect(review.words).toHaveLength(0);
  expect(review.dialogue).toBeNull();
  expect(review.scenario).toBeNull();
  expect(review.quiz).toHaveLength(3);
  expect(review.mission?.id).toBe('m_week2_small_talk');
  expect(review.mission?.steps_hi).toHaveLength(4);
});

it('has seven Week 2 days and 30 unique words overall', () => {
  const week = [d01, d02, d03, d04, d05, d06, d07].map((day) => parseDay(day));
  expect(week).toHaveLength(7);
  expect(week.filter((d) => d.type === 'learning')).toHaveLength(6);
  const ids = week.flatMap((d) => d.words.map((w) => w.id));
  expect(new Set(ids).size).toBe(30);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/week02.test.ts`
Expected: FAIL — `w02d07.json` not found.

- [ ] **Step 3: Author the review day JSON**

Copy the shape of `content-src/week-01/w01d07.json`; change ids, goal, quiz prompts and mission.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/week02.test.ts`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add content-src/week-02/w02d07.json src/content/week02.test.ts
git commit -m "feat: add Week 2 review and mission"
```

---

### Task 4: Week-aware content loader

**Files:**
- Modify: `src/content/index.ts`
- Modify: `src/content/index.test.ts`

**Interfaces:**
- Consumes: `validateAll(days: unknown[]): { days: DayContent[]; errors: string[] }` and every `content-src/week-*/w*.json` file.
- Produces:
  - `ALL_DAYS: DayContent[]` — sorted by `week`, then `day`.
  - `WEEK_1_DAYS: DayContent[]` — filtered week 1, kept for back-compat.
  - `getAllDays(): DayContent[]`
  - `getDay(dayId: string): DayContent`
  - `getNextDay(dayId: string): DayContent | null` — crosses weeks, `null` after the last authored day.
  - `getDaysForWeek(week: number): DayContent[]`
  - `getAuthoredWeeks(): number[]`
  - `getWeekMeta(): WeekMeta[]` where `WeekMeta = { week: number; slug: string; title: string; lessonHref: string; referenceHref: string }`, derived from `content-src/weeks/week-*.json`, sorted by week.
  - Hrefs: `` `/lessons/${String(week).padStart(4, '0')}-week-${week}-${slug}.html` `` and `` `/reference/${String(week).padStart(4, '0')}-week-${week}-patterns.html` ``.

- [ ] **Step 1: Write the failing test**

Replace the body of `src/content/index.test.ts` with:

```ts
import {
  ALL_DAYS, BENCHMARK_PROMPTS, WEEK_1_DAYS, getAuthoredWeeks, getDay,
  getDaysForWeek, getNextDay, getWeekMeta,
} from './index';

it('loads both authored weeks in order', () => {
  expect(ALL_DAYS).toHaveLength(14);
  expect(WEEK_1_DAYS).toHaveLength(7);
  expect(ALL_DAYS[7].id).toBe('w02d01');
  expect(getDaysForWeek(2).map((d) => d.id)).toEqual([
    'w02d01', 'w02d02', 'w02d03', 'w02d04', 'w02d05', 'w02d06', 'w02d07',
  ]);
  expect(getAuthoredWeeks()).toEqual([1, 2]);
});

it('keeps every learning day at Week 1 depth', () => {
  for (const day of ALL_DAYS.filter((d) => d.type === 'learning')) {
    expect(day.words).toHaveLength(5);
    expect(day.dialogue?.lines).toHaveLength(6);
    expect(day.scenario?.turns).toHaveLength(4);
    expect(day.quiz).toHaveLength(3);
  }
});

it('keeps every Day 7 review-only', () => {
  for (const day of ALL_DAYS.filter((d) => d.day === 7)) {
    expect(day.type).toBe('review');
    expect(day.words).toHaveLength(0);
    expect(day.pattern).toBeNull();
    expect(day.mission).not.toBeNull();
  }
});

it('moves across the week boundary and stops at the last authored day', () => {
  expect(getNextDay('w01d01')?.id).toBe('w01d02');
  expect(getNextDay('w01d07')?.id).toBe('w02d01');
  expect(getNextDay('w02d07')).toBeNull();
});

it('derives lesson and reference links for every week', () => {
  const meta = getWeekMeta();
  expect(meta).toHaveLength(12);
  expect(meta[0]).toMatchObject({
    week: 1,
    lessonHref: '/lessons/0001-week-1-introduce-yourself.html',
    referenceHref: '/reference/0001-week-1-patterns.html',
  });
  expect(meta[1]).toMatchObject({
    week: 2,
    lessonHref: '/lessons/0002-week-2-daily-routine-and-small-talk.html',
    referenceHref: '/reference/0002-week-2-patterns.html',
  });
});

it('defines four benchmark prompts', () => {
  expect(BENCHMARK_PROMPTS).toHaveLength(4);
});

it('throws for an unknown day', () => {
  expect(() => getDay('w99d01')).toThrow('Unknown day: w99d01');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/content/index.test.ts`
Expected: FAIL — `getDaysForWeek`, `getAuthoredWeeks`, `getWeekMeta` are not exported; `ALL_DAYS` has length 7.

- [ ] **Step 3: Implement the loader**

In `src/content/index.ts`, replace the seven static imports with:

```ts
const dayModules = import.meta.glob('../../content-src/week-*/w*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const weekModules = import.meta.glob('../../content-src/weeks/week-*.json', {
  eager: true,
  import: 'default',
}) as Record<string, { number: number; slug: string; title: string }>;
```

Pass `Object.values(dayModules)` to `validateAll` once; if `errors.length > 0`, throw `new Error(\`Invalid content:\n${errors.join('\n')}\`)`. Sort the parsed days by week then day. Implement the helpers above on `ALL_DAYS`. Keep the existing `getDay` error message exactly (`Unknown day: ${dayId}`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/content/index.test.ts src/content/week02.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/index.ts src/content/index.test.ts
git commit -m "feat: load and validate all authored weeks"
```

---

### Task 5: Today screen across weeks

**Files:**
- Modify: `src/screens/TodayScreen.tsx`
- Modify: `src/screens/today.test.tsx`

**Interfaces:**
- Consumes: `getAllDays`, `getDay`, `getDaysForWeek`, `getAuthoredWeeks`, `getWeekMeta` from Task 4.
- Produces: Today shows the first unfinished authored day, a week-scoped progress bar, and a fallback when the authored content is exhausted.

- [ ] **Step 1: Write the failing tests**

Append to `src/screens/today.test.tsx`:

```ts
function completeDays(ids: string[]) {
  const state = createInitialState();
  for (const dayId of ids) {
    state.days[dayId] = {
      dayId, status: 'done', stagesCompleted: ['warmup', 'wrap'],
      speakingSeconds: 600, selfRating: 4, missionDone: false,
      completedAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
  }
  return state;
}

it('moves into Week 2 after Week 1 is complete', () => {
  useAppStore.setState(completeDays([
    'w01d01', 'w01d02', 'w01d03', 'w01d04', 'w01d05', 'w01d06', 'w01d07',
  ]));
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

  expect(screen.getByText('Day 1 · Week 2')).toBeInTheDocument();
  expect(screen.getByText('What do you usually do?')).toBeInTheDocument();
  expect(screen.getByText('0 / 7 din')).toBeInTheDocument();
});

it('shows the next-week fallback when authored content is exhausted', () => {
  useAppStore.setState(completeDays([
    'w01d01', 'w01d02', 'w01d03', 'w01d04', 'w01d05', 'w01d06', 'w01d07',
    'w02d01', 'w02d02', 'w02d03', 'w02d04', 'w02d05', 'w02d06', 'w02d07',
  ]));
  render(<MemoryRouter initialEntries={['/']}><App /></MemoryRouter>);

  expect(screen.getByText('Week 2 complete')).toBeInTheDocument();
  expect(screen.getByText('Week 3 jald aa raha hai.')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/today.test.tsx`
Expected: FAIL — still shows "Week 1 complete" / cannot find Week 2 text.

- [ ] **Step 3: Implement the screen**

Replace the hardcoded completion block and progress bar:

- `const authoredWeeks = getAuthoredWeeks();`
- `const lastWeek = authoredWeeks[authoredWeeks.length - 1];`
- `const allAuthored = authoredWeeks.length === getWeekMeta().length;`
- Fallback title: `allAuthored ? 'Course complete' : \`Week ${lastWeek} complete\``; subtitle: `allAuthored ? 'Saare 84 din complete.' : \`Week ${lastWeek + 1} jald aa raha hai.\``
- Week progress: `const weekDays = getDaysForWeek(day.week); const doneInWeek = weekDays.filter((d) => days[d.id]?.status === 'done').length;` render `{doneInWeek} / {weekDays.length} din`.
- Replace the "Week 1" label above the completion card with `Week {lastWeek}`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/today.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/TodayScreen.tsx src/screens/today.test.tsx
git commit -m "feat: advance Today across weeks"
```

---

### Task 6: Progress screen per week

**Files:**
- Modify: `src/screens/ProgressScreen.tsx`
- Modify: `src/screens/secondaryScreens.test.tsx`

**Interfaces:**
- Consumes: `getAllDays`, `getAuthoredWeeks`, `getWeekMeta`, `getDaysForWeek`.
- Produces: course totals over authored days and one section per authored week.

- [ ] **Step 1: Update and extend the failing tests**

In `src/screens/secondaryScreens.test.tsx`, change the expected total to `Days complete: 1/14`, and append:

```ts
it('shows a section for each authored week', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/progress']}><App /></MemoryRouter>);
  expect(screen.getByText('Week 1 · Introduce yourself and your work')).toBeInTheDocument();
  expect(screen.getByText('Week 2 · Daily routine and small talk')).toBeInTheDocument();
  expect(screen.getByText('Day 1 · What do you usually do?')).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/screens/secondaryScreens.test.tsx`
Expected: FAIL — `1/7` and no Week 2 section.

- [ ] **Step 3: Implement the screen**

Header label becomes `Course progress`. Totals stay `{complete}/{allDays.length}` (now authored days). Replace the single day list with:

```tsx
{getWeekMeta()
  .filter((meta) => getDaysForWeek(meta.week).length > 0)
  .map((meta) => (
    <section key={meta.week} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold">
        Week {meta.week} · {meta.title}
      </h3>
      <div className="mt-3 space-y-2">{/* existing day rows for getDaysForWeek(meta.week) */}</div>
    </section>
  ))}
```

Keep the existing row markup, status pills and status labels.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/secondaryScreens.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/ProgressScreen.tsx src/screens/secondaryScreens.test.tsx
git commit -m "feat: group Progress by week"
```

---

### Task 7: Library with practice by week

**Files:**
- Modify: `src/screens/LibraryScreen.tsx`
- Modify: `src/screens/secondaryScreens.test.tsx`

**Interfaces:**
- Consumes: `getWeekMeta`, `getAuthoredWeeks`, `getDaysForWeek`.
- Produces: week cards with lesson/reference links derived from weekly JSON, and a practice list grouped by authored week.

- [ ] **Step 1: Write the failing test**

Append to `src/screens/secondaryScreens.test.tsx`:

```ts
it('offers Week 2 practice in the library', () => {
  useAppStore.setState(createInitialState());
  render(<MemoryRouter initialEntries={['/library']}><App /></MemoryRouter>);
  expect(
    screen.getByRole('button', { name: 'Practice Day 1 · Week 2' }),
  ).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/secondaryScreens.test.tsx`
Expected: FAIL — no such button.

- [ ] **Step 3: Implement the screen**

- Delete the hardcoded `weeklyLessons` array; use `const weeks = getWeekMeta()`.
- Keep the Week 1 featured card, but take week 1 from `weeks[0]` (`Open lesson` / `Printable patterns` anchors must keep those names).
- Keep the "Browse all weeks" anchor at `/lessons/index.html` and the Weeks 2–12 list, mapped from `weeks.filter((w) => w.week >= 2)` with link names `Week {week} lesson` and `Week {week} reference`.
- Replace the flat practice list with one block per authored week:

```tsx
{getAuthoredWeeks().map((week) => (
  <div key={week} className="mt-4">
    <p className="text-sm font-semibold">Week {week} practice</p>
    {getDaysForWeek(week).map((day) => (/* existing row */))}
  </div>
))}
```

- Give each practice button `aria-label={\`Practice Day ${day.day} · Week ${day.week}\`}` while keeping the visible text `Practice`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/screens/secondaryScreens.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/screens/LibraryScreen.tsx src/screens/secondaryScreens.test.tsx
git commit -m "feat: group Library practice by week"
```

---

### Task 8: Backup coverage, e2e totals, docs, full verification

**Files:**
- Modify: `src/store/backup.test.ts`
- Modify: `tests/e2e/day1.spec.ts`
- Modify: `docs/curriculum-plan.md`
- Test: full suite

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: proof that Week 2 progress survives export/import and the shipped UI reports 14 authored days.

- [ ] **Step 1: Extend the backup test**

In `sampleData()`, add:

```ts
data.days.w02d01 = {
  dayId: 'w02d01',
  status: 'done',
  stagesCompleted: ['warmup', 'pattern', 'words', 'shadow', 'scenario', 'wrap'],
  speakingSeconds: 1200,
  selfRating: 5,
  missionDone: false,
  completedAt: now.toISOString(),
  updatedAt: now.toISOString(),
};
```

In the round-trip test, assert `parsed.days.w02d01.status` is `done`.

- [ ] **Step 2: Run the backup test**

Run: `npx vitest run src/store/backup.test.ts`
Expected: PASS. This is a regression pin for Task 4 — if it fails with `unknown day`, the loader is not picking up Week 2.

- [ ] **Step 3: Update the e2e total**

In `tests/e2e/day1.spec.ts`, change `Days complete: 1/7` to `Days complete: 1/14`.

- [ ] **Step 4: Update the curriculum status table**

In `docs/curriculum-plan.md`, change the daily JSON row from "Week 1 authored; Weeks 2–12 not authored" to "Weeks 1–2 authored; Weeks 3–12 not authored".

- [ ] **Step 5: Run full verification**

Run:
```bash
npm run validate:content
npx vitest run
npm run build
npx playwright test tests/e2e/day1.spec.ts
```

Expected: `Validated 14 day(s)`; all Vitest suites pass; build succeeds; Playwright day-1 spec passes with `1/14`.

- [ ] **Step 6: Commit**

```bash
git add src/store/backup.test.ts tests/e2e/day1.spec.ts docs/curriculum-plan.md
git commit -m "test: cover Week 2 backup and totals"
```

---

## Follow-on work (not part of this plan)

Weeks 3–12 reuse Tasks 1–3's recipe with each `content-src/weeks/week-NN.json`: six learning days in pattern order, 30 unique words, Day 7 review with the shared benchmark prompts. Each batch updates `ALL_DAYS` expectations (14 → 21 → … → 84), the e2e total, and the curriculum status row. No code changes are expected after Task 4 unless a schema gap appears.
