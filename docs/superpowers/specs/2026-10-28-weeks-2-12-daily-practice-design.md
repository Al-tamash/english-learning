# Weeks 2–12 Daily Practice — Design

**Date:** 2026-10-28
**Status:** Awaiting approval

## Intent

The app's daily practice (Today, Session, Library, Progress) currently only knows
Week 1. Weeks 2–12 have weekly lesson pages and printable reference sheets, but no
daily sessions. This design extends the daily practice to all 12 weeks with the same
depth as Week 1, starting with a fully authored Week 2 as the template, then repeating
the recipe for Weeks 3–12.

Why: `docs/curriculum-plan.md` promises "12 weekly lessons + 84 daily practice
sessions". Only 7 of 84 exist in the app. The learner cannot keep practising after
Week 1 even though the teaching material for Weeks 2–12 is already written.

## Current state (verified)

- `src/content/index.ts` statically imports `content-src/week-01/w01d01.json` …
  `w01d07.json` only. `getAllDays()` returns those 7 days.
- `content-src/weeks/week-02.json` … `week-12.json` each hold: 6 patterns (frame,
  forms, examples, grammar, mistake), grammar rules, mistakes, practice sets
  (`pattern` 6, `grammar` 4, `build` 3, `translate` 3), `repeat`, one dialogue,
  4 speak prompts, 10 vocab items, self-check, 4 pronunciation notes, 5 follow-ups,
  mission, source, 10 phrases.
- `content-src/week-01/` holds 7 daily files in the strict day schema; `week-01.json`
  is only metadata (`handAuthored: true`).
- Day schema (`src/content/schema.ts`) requires per learning day: exactly 5 words,
  6-line dialogue, 4-turn scenario, exactly 3 quiz items, pattern with 4–6 examples.
  Review days must have no words/pattern/dialogue/scenario, 3 quiz items, and a mission.
- Screens assume one week: TodayScreen hardcodes "Week 1"/"Week 2 jald aa raha hai",
  ProgressScreen labels every section "Week 1", LibraryScreen has a hardcoded
  `weeklyLessons` array and a practice list from `getAllDays()`.

## Goals

1. Week 2 has 7 authored daily files, indistinguishable in quality from Week 1.
2. The app loads all authored weeks and advances across week boundaries.
3. Today / Library / Progress show week-aware progress instead of Week 1 labels.
4. Weeks 3–12 can be authored one week at a time with no further code changes.
5. Existing Week 1 progress, SRS cards, streak and backups keep working.

## Non-goals

- No edits to Week 1 content files.
- No changes to session stage order, SRS algorithm, audio, or storage.
- No edits to generated weekly lesson/reference HTML.
- No backend, accounts, or sync.
- No new UI design system; reuse existing Tailwind patterns.

## Anti-goals (would make this a failure even if it works)

- 77 days of filler: repeated dialogues, 2–3 thin words per day, or scenarios that
  are not tied to the week's patterns.
- Breaking Week 1 progress or the backup import for existing users.
- A screen that still says "Week 1" when the learner is in Week 2.
- Authoring all 11 weeks before the learner has validated Week 2's feel.

## Constraints

- Content language stays Hinglish for all `*_hi` fields and notes; English for
  targets, model answers and dialogues.
- Word ids must be unique across the whole course (`w02_…`, not reused `w_…`).
- Each learning day must pass `zod` schema unchanged; no schema loosening.
- Weekly JSON is the source of truth for that week's 6 patterns, mission, phrases and
  pronunciation notes. Do not invent a different syllabus.

## Approaches considered

**A. Full parity, week by week — chosen.**
Author 7 daily files per week at Week 1 depth (5 words/day, unique 6-line dialogue,
4-turn scenario, 3 quiz items), then repeat. Highest quality, matches the product's
promise, and Week 2 acts as a review gate before 10 more weeks are written.

**B. Script-generated skeleton + hand polish — rejected.**
Would produce 77 files quickly, but dialogues repeat, word lists thin out, and the
"same as Week 1" feel is lost. Content quality is the product; speed is not the
constraint here.

**C. Lighter 3-day week — rejected.**
Less authoring, but breaks the daily habit loop the app is built around and would make
Weeks 2–12 feel like a downgrade from Week 1.

## Content model per week

Each week produces 7 files: `w<WW>d01.json` … `w<WW>d07.json` under
`content-src/week-<WW>/`.

| Day | Type | Content |
|---|---|---|
| 1–6 | learning | One weekly pattern each, in the order they appear in `weeks/week-<WW>.json` |
| 7 | review | No new words; 3 recall quiz items; weekly mission; the 4 shared benchmark prompts |

**Words.** 30 unique words per week: the 10 from the weekly `vocab` list plus 20
theme-relevant additions, 5 per learning day. Every word keeps `term`, `hi`,
`collocation`, `example_en`, `example_hi`, `tags`.

**Dialogues.** One unique 6-line A/B dialogue per learning day, set in that day's
scenario location. The weekly JSON dialogue is used as tone reference and as the
source for the day that matches its context; it is not copy-pasted six times.

**Scenarios.** One unique 4-turn scenario per learning day, taken from the week's
scenario list in `docs/curriculum-plan.md` (Week 2: Monday morning chat, lunch with a
colleague, weekend plans, pre-call small talk, friend catch-up, asking about them).
Each turn has `prompt_en`, `hint_hi`, ≥2 `keywords`, `model_en` that uses the day's
pattern.

**Quiz.** 3 items per day: one pattern fill, one grammar/build item, one translate
item. Start from the weekly practice sets; when a set runs short (there are only 3
translate items for 6 days), the author writes a fresh item in the same style rather
than repeating one. Day 7 revisits the week's three hardest items (not new material).

**Pronunciation.** Rotate the week's four pronunciation notes across the six learning
days through each day's `dialogue.sound_focus` (tip + minimal pairs). If the week has
fewer notes than days (every week does), the last two days reinforce the closest
existing note (e.g. sentence rhythm, question intonation from the week's grammar
section). Day-level `sound_focus` may extend the weekly notes; the weekly JSON and
generated HTML are not edited or regenerated.

**Mission.** Learning days may carry a small mission; Day 7 carries the week mission
from the weekly JSON with 3–4 Hinglish steps.

## Week 2 day map

Patterns in order from `week-02.json`:

| Day | Pattern | Scenario | 5 words | Pronunciation |
|---|---|---|---|---|
| 1 | I usually ___ at ___. | Monday morning chat | routine, commute, alarm, breakfast, schedule | -s endings |
| 2 | I don't ___ very often. | Lunch with a colleague | gym, cricket, movie, hobby, walk | sentence rhythm |
| 3 | How was your weekend? | Weekend plans talk | weekend, family, traffic, tired, relax | was / were |
| 4 | I went to ___ / I stayed ___. | Friend catch-up | cousin, theatre, plan, food, sleep | went |
| 5 | Do you like ___? | Pre-call small talk | colleague, chat, break, lunch, office | like + verb-ing rhythm |
| 6 | What about you? | Asking about them | early, late, busy, book, cook | question intonation |
| 7 | Review + benchmark | Weekly mission | — | review |

Day 7 quiz revisits: usually word order, `How was your weekend?`, `like + verb-ing`.
Day 7 mission: ask a colleague one real small-talk question in English (from
`week-02.json`), with steps in Hinglish.

## Technical design

### Content loader

Replace the 7 static imports in `src/content/index.ts` with Vite's
`import.meta.glob('../../content-src/week-*/w*.json', { eager: true, import: 'default' })`.
Parse every file through `validateAll` once at module load and throw a single
aggregated error if any file is invalid, so a bad authored file fails the build/test
instead of silently disappearing.

Exports:

- `ALL_DAYS: DayContent[]` — sorted by week then day.
- `WEEK_1_DAYS` — kept as a filtered export for existing tests/back-compat.
- `getAllDays()` — all days.
- `getDay(id)` — unchanged contract.
- `getNextDay(id)` — next day across week boundaries; `null` after `w12d07`.
- `getDaysForWeek(week)` — that week's 7 days.
- `getWeekMeta()` — week number, slug, title, lesson href and reference href, derived
  from `content-src/weeks/week-*.json` via import.meta.glob, replacing LibraryScreen's
  hardcoded array.

`src/session/engine.ts`, `appStore.ts`, `backup.ts` and `warmup.ts` keep using
`getDay`/`getAllDays`; no signature changes.

### Screens

- **TodayScreen:** pick the first unfinished day across all authored weeks. Progress
  bar shows that day's week (`done in week / 7`). When every authored day is done:
  during rollout show "Week n complete · Week n+1 jald aa raha hai"; once all 12 weeks
  are authored show "Course complete". Remove the hardcoded Week 1 copy.
- **ProgressScreen:** header "Course progress"; totals count **authored** days
  (`x/14` after Step 1, `x/84` when all 12 weeks land); day list grouped into
  per-week sections (Week n · title, then 7 rows) for authored weeks only.
  Week 1 data unchanged.
- **LibraryScreen:** practice list grouped by week with the lesson/reference links in
  each week header, driven by `getWeekMeta()` instead of the hardcoded array.
- **SessionScreen / stages:** no changes.
- **Week 12 scenario:** the curriculum plan's 10-turn mock call is compressed to the
  schema's 4 turns for the daily scenario. The full 10-turn call stays in the weekly
  lesson/reference and the benchmark day context; the daily session still tests the
  same phrases.

### Tests and validation

- Update `src/content/index.test.ts`: 84 days, 12 weeks × 7, ids/order, Day 7 review
  in every week, unique word ids across the course, `getNextDay('w01d07') === 'w02d01'`,
  `getNextDay('w12d07') === null`.
- Add a content test that every week's six learning days each have 5 words, a 6-line
  dialogue, a 4-turn scenario and 3 quiz items.
- Extend `npm run validate:content` to assert 84 days once all weeks land.
- Update e2e/render assertions that assume a 7-day denominator (`Days complete: 1/7`)
  to the authored-day count (`1/14` after Step 1).
- Run `npm test`, `npm run build`, `npm run validate:content`.

### Rollout

1. **Week 2 + infrastructure** — loader, screens, tests, 7 Week 2 files. Stop for a
   hands-on review by the learner.
2. **Weeks 3–5**, **6–8**, **9–12** — content only, same recipe, validator after each
   batch.
3. Final full-course test pass and curriculum status table update.

## Verification

- Week 2 Day 1 session runs end-to-end: warmup → pattern → words → shadow → scenario
  → wrap, with TTS and recording behaving as in Week 1.
- Completing `w01d07` makes Today offer `w02d01` (not "Week 1 complete").
- Library shows Weeks 1–2 practice rows; lesson/reference links still resolve.
- Progress shows 7/84 → 14/84 and both week sections.
- Backup export/import round-trips week 2 progress and SRS cards.
- `npm test`, `npm run build`, `npm run validate:content` pass.

## Decisions made (builder may challenge)

- 30 words/week (10 given + 20 added) — keeps exactly 5/day as the schema requires.
- Day order follows the weekly JSON pattern order; no new syllabus order invented.
- Benchmark prompts stay the same 4 across weeks, as the curriculum plan specifies.
- Week 2 is the review gate; Weeks 3–12 are not started until Week 2 is accepted.
- Rollout totals count authored days, not the 84-day promise, so the learner never
  sees 70 phantom empty days.
- Authors may add day-level pronunciation notes and quiz items beyond the weekly JSON;
  the weekly JSON and generated lesson/reference HTML stay untouched.
- Week 12's 10-turn mock call is split/compressed into 4-turn daily scenarios.

## What is left to the builder

- Author Week 2's 7 JSON files to the recipe above, including all Hinglish copy.
- Implement the loader/screen/test changes exactly as scoped.
- After Week 2 acceptance, repeat the recipe for Weeks 3–12 using each weekly JSON's
  patterns, vocab, practice sets, mission and pronunciation notes.
