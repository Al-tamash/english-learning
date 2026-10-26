# Week 1 lesson teaching audit — grammar and missing practice

**Design document · 2026-10-26 · Status: proposed**

## Aapke liye summary (Hinglish)

Week 1 ke weekly lesson me abhi 6 patterns, 6 fill-ins, 4 speaking prompts aur pronunciation hain. Grammar explain nahi hoti, common mistakes correct nahi hote, listening/sentence-building/dialogue/self-check missing hai, aur Lesson 1 ka Day 1–7 se relation clear nahi hai.

Is design me lesson ko **pattern-first** rakha jayega. Har pattern ke andar 2–4 line ka grammar note, ek common mistake, aur uske baad grammar drills, sentence building, model dialogue, listen-and-repeat, 60-second self-check aur Week 1 roadmap add hoga. Lesson ~25–30 minute ka rahega — lamba grammar chapter nahi.

## 1. Intent

Make `lessons/0001-week-1-introduce-yourself.html` a complete teaching lesson for the learner, not only a pattern sheet. The lesson must:

- explain the grammar that the six Week 1 patterns already use;
- correct the learner's most likely Hinglish-to-English slips;
- add active practice (listening, sentence building, dialogue, translation, self-check);
- make clear that this is the **one weekly lesson**, while Day 1–7 are separate app practice sessions;
- stay production-first, phone-first, and under ~30 minutes for the core path.

This is consistent with the main design document: "Grammar usi pattern ke andar chhoti dose me aayegi" and the note that the learner's bottleneck is sentence production, not grammar knowledge.

## 2. Current state

`lessons/0001-week-1-introduce-yourself.html` currently has:

- hero and six pattern cards, each with `+ / − / ?` forms and two examples;
- a TTS “Suno” button per pattern;
- six fill-in quiz items (mostly prepositions);
- four open speaking prompts;
- v/w, th, and “experience” pronunciation notes;
- teacher follow-up questions and a printable-reference link.

`reference/0001-week-1-patterns.html` currently has six patterns, 10 phrases, 30 words and pronunciation notes.

## 3. Audit findings

| Area | Current | Missing |
|---|---|---|
| Grammar | Four short pattern notes | Present simple `I work` vs `she works`; `do/does`; negatives; `be` vs action verb; prepositions; `a/an`; countable/uncountable; `good at + noun/-ing`; question word order |
| Practice | Six fill-ins, mostly prepositions | Grammar-focused items, sentence building, listen-and-repeat, Hinglish → English translation |
| Conversation | Four open prompts | Model client-introduction dialogue, follow-up questions, formal vs casual version |
| Common mistakes | None | `I am having 3 years experience`, `good in`, `work in Edone Solutions`, `since 3 years`, `She work`, `What you do?`, missing `a/an` |
| Roadmap | None | Lesson 1 vs Day 1–7 vs Day 7 review/benchmark |
| Self-check | None | 60-second intro checklist/rubric |
| Vocabulary | 30 words only in the reference | 5–8 active words used inside the lesson |
| Pronunciation | v/w, th, “experience” stress | Numbers/years (`three` vs `thirty`) and sentence stress |

The biggest conceptual gap is the roadmap: the learner reasonably expected seven lesson pages because Week 1 has seven 30-minute days. The lesson must explain that Day 1–6 are app sessions and Day 7 is review.

## 4. Goals

- Add a **Week 1 roadmap** near the top: this weekly lesson, six daily app sessions, Day 7 review + benchmark.
- Add a 2–4 line **grammar note** inside each of the six pattern cards.
- Add a compact **Grammar corner** summary and a **Common mistakes** section.
- Add **grammar drills**, **sentence building**, and **Hinglish → English translation** practice.
- Add a **model client-introduction dialogue** with listen buttons.
- Add a **listen-and-repeat** drill using browser TTS.
- Add a **60-second self-check** rubric.
- Activate 5–8 reference words inside the lesson.
- Add numbers/years and sentence-stress notes.
- Update the printable reference with compact grammar rules and common mistakes.
- Rename the page label to **“Week 1 · Weekly Lesson”** so it is not confused with Day 1.
- Keep the core lesson at ~25–30 minutes; mark anything longer as optional.

## 5. Non-goals

- A complete grammar syllabus or a substitute for Murphy/Wren & Martin.
- Teaching every tense. Only grammar used by the six Week 1 patterns.
- Changing the app's six daily sessions or adding new Week 1 lesson pages.
- AI speaking feedback, scoring, or pronunciation grading.
- Backend, accounts, sync, or new dependencies.
- A visual redesign of the app or the reference sheet.

## 6. Anti-goals

- Turning the lesson into a 45–60 minute grammar chapter.
- Adding rules without speaking practice.
- Adding exercises without answers/explanations.
- Making the lesson depend on internet access; TTS must remain optional.
- Duplicating the reference sheet word-for-word.

## 7. Constraints

- Standalone HTML that works from `file://` and from the deployed site.
- Hinglish explanations; English examples.
- Phone-first layout; accessible labels, `aria-live` feedback, `type="button"`.
- Reuse `assets/course.css` and `assets/quiz.js`; no external libraries.
- Preserve existing TTS behaviour and graceful degradation when `speechSynthesis` is unavailable.
- Keep the printable reference at two A4 pages; compress rather than adding a third page.
- Keep existing URLs and the build copy step (lesson/reference already deploy correctly).

## 8. Approaches considered

### A. Pattern-first + grammar micro-notes (chosen)

Add small grammar notes and mistakes inside each pattern card, then dedicated practice. Keeps the lesson production-focused and ~30 minutes.

**Trade-off:** less exhaustive than a grammar chapter; some rules are introduced only as needed.

### B. Full grammar chapter

A separate grammar section with rules, tables, and 15–20 exercises.

**Trade-off:** more complete, but 45–60 minutes, grammar-book feel, and it works against the learner's actual bottleneck.

### C. Separate grammar reference page

Keep the lesson unchanged and add `reference/0001-week-1-grammar.html`.

**Trade-off:** smallest lesson, but grammar is separated from practice and may never be opened.

**Decision:** A. It matches the main design document's “grammar in small doses inside the pattern” principle.

## 9. Proposed lesson structure

1. **Hero** — keep title; change meta to `25–30 min`, add pills `grammar`, `6 patterns`, `practice`.
2. **Week 1 roadmap** — three cards:
   - `Lesson 1 · Weekly lesson` — this page, 25–30 min, all six patterns.
   - `Day 1–6 · App sessions` — 30 min (or 15 min short), one pattern per day.
   - `Day 7 · Review + benchmark` — recall + 60-second recording.
   Include one explicit line: “Lesson 1 = Week 1 ka weekly lesson; Day 1 = app ka pehla practice session.”
3. **The 6 patterns** — each card gets:
   - existing frame, forms, examples, Suno button;
   - a `Grammar` micro-note (2–4 lines, Hinglish);
   - a `Common mistake` line (`wrong → right` + one-line reason).
4. **Grammar corner** — compact table of the six rules:
   - `I/you/we/they work` vs `he/she/it works`;
   - `do/does + subject + base verb`;
   - `don't/doesn't + base verb`;
   - `am/is/are` for identity/state; questions invert;
   - prepositions: `at` company, `as` role, `from` origin, `in` city/field, `for` client, `with` people, `of` experience;
   - `a/an` + singular job; `good at` + noun/-ing; `I'm learning` + noun/-ing.
5. **Common mistakes** — 8 wrong/right cards with short Hinglish explanations.
6. **Practice 1: pattern fill-ins** — keep the existing six items; add `data-explain` feedback.
7. **Practice 2: grammar fill-ins** — six new items:
   - `She ___ at a bank.` → `works`
   - `___ you work here?` → `Do`
   - `He ___ work at a big company.` → `doesn't`
   - `I'm ___ engineer.` → `an`
   - `I'm good ___ design.` → `at`
   - `How many years of experience ___ you have?` → `do`
8. **Practice 3: sentence building** — four jumbled-word prompts typed as full sentences; accept variants; show the model answer.
9. **Practice 4: Hinglish → English** — four translation prompts typed in English; accept variants; show the model answer.
10. **Listen and repeat** — four sentences with Suno buttons and a “Suno → 2 second pause → bolo” instruction.
11. **Model dialogue** — six-line client introduction with per-line Suno buttons; two target lines marked for repetition.
12. **Vocabulary in action** — six words from the reference (`developer`, `client`, `experience`, `frontend`, `backend`, `in-house`) with collocations and a “use two in your intro” prompt.
13. **60-second self-check** — six checkboxes: name/city/role/company, `I work at… as…`, `I'm from… / I live in…`, years of experience, one or two questions back, 60 seconds with minimal Hindi.
14. **Pronunciation** — keep v/w, th, experience; add numbers (`three` vs `thirty`) and sentence stress.
15. **Teacher follow-up** — keep and add two grammar-specific questions.
16. **Printable reference** — keep link; update reference sheet.
17. **Footer** — rename to “Week 1 · Weekly Lesson”.

## 10. Grammar notes (copy direction)

The builder should write these in short Hinglish, not grammar jargon. Direction per pattern:

1. **I work at ___ as a ___.** Present simple for a permanent job. `at` + company, `as` + role, `a/an` before a singular job. Third person: `She works`. Question: `Where do you work?`
2. **I'm from ___ / I live in ___.** `be from` = origin; `live in` = current city. `in` + city. `Where are you from?` uses `be`; `Where do you live?` uses `do`.
3. **I have ___ years of experience.** `have` for experience; `has` with he/she/it. `years of experience`; experience is uncountable here (`much experience`, `many years`). Question uses `do`, not `are`.
4. **I build ___ for ___.** Present simple for job duties. `for` = client/beneficiary. `I/we/they build`; `he/she/it builds`; `Our team builds`. Question: `What do you build?`
5. **I'm good at ___ / I'm learning ___.** `good at` + noun or `-ing`. `I'm learning` = present continuous for something happening now. `yet` in negatives.
6. **Do you work ___? / What do you do?** `do/does` for present-simple questions; main verb stays base. `What do you do?` asks about profession. `work at/for/with/in` distinctions. Short answers: `Yes, I do. / No, I don't.`

## 11. Common mistakes to include

| Wrong | Right | Why |
|---|---|---|
| I am having 3 years experience. | I have 3 years of experience. | Experience is a state, not an action; `of` is needed. |
| I am good in frontend. | I'm good at frontend. | `good at` is the fixed phrase. |
| I work in Edone Solutions. | I work at Edone Solutions. | `at` + company. |
| I am from Nagpur only. | I'm from Nagpur. | `only` is not needed in English here. |
| I am working here since 3 years. | I have worked here for 3 years. | Use `for` + duration; later pattern for present perfect. |
| She work at a bank. | She works at a bank. | He/she/it takes `-s`. |
| What you do? | What do you do? | Question needs `do`. |
| I am web developer. | I am a web developer. | Singular job needs `a/an`. |

## 12. Practice mechanics

- Extend `assets/quiz.js` to support:
  - `data-answer` with `|`-separated accepted variants;
  - normalized comparison: trim, lowercase, collapse spaces, ignore final punctuation;
  - `data-explain` Hinglish explanation shown after checking;
  - `data-model` model answer shown after a wrong attempt.
- Keep the existing `data-quiz`, `data-check`, `data-feedback`, `Sahi`, `Phir se` API so existing tests continue to pass.
- Sentence-building and translation use the same input/check pattern; no drag-and-drop (phone-friendly and accessible).
- TTS uses the existing `[data-say]` mechanism. Do not add audio files.
- The dialogue is read-only except for two marked lines the learner repeats; no speech scoring.
- Self-check uses native checkboxes; no persistence required.

## 13. Reference sheet changes

- Add a compact **Grammar quick rules** table (six rules from §9.4).
- Add a compact **Common mistakes** list (six to eight rows from §11).
- Keep existing six patterns, 10 phrases, 30 words, pronunciation notes.
- Target two A4 pages. If content overflows, compress the word list to three columns and reduce section spacing before adding a third page.
- Keep `@media print` rules; navigation and buttons remain hidden.

## 14. Testing and verification

- `tests/e2e/lesson.spec.ts`:
  - existing pattern answer check still passes;
  - new grammar answer check (`works`) passes and wrong answer shows `Phir se` + explanation;
  - sentence-building/translation input accepts variants;
  - roadmap, common mistakes, grammar corner and self-check are visible;
  - reference page contains grammar rules and common mistakes;
  - build-served and service-worker-served lesson tests still pass.
- `npm test -- --run` (unit), `npm run test:e2e`, `npm run validate:content`, `npm run build`.
- Manual checks: phone width; `file://` open; production preview; print preview at A4.
- Deploy through the existing GitHub → Cloudflare Pages flow; verify the live lesson and reference URLs.

## 15. Risks and mitigations

- **Lesson becomes too long:** mark advanced/extra practice as optional; keep the core path ~30 minutes.
- **Grammar overload:** each note is 2–4 lines; no tense tables beyond what the six patterns need.
- **Print overflow:** compact tables/columns; verify A4 print before merging.
- **Answer matching frustration:** accept common variants and show the model answer; never leave the learner guessing.
- **Duplication with the app:** the lesson teaches and previews; the app remains the daily practice gym.

## 16. Out of scope / next plans

- More Week 1 lesson pages. The current model is one weekly lesson plus seven app sessions.
- Weeks 2–12 lesson authoring.
- Grammar in the daily app sessions (can be a later enhancement).
- AI feedback or pronunciation scoring.

## 17. Approval

This design is proposed for approval. After approval, the implementation plan will be written in `docs/superpowers/plans/`, then the lesson, reference, quiz helper and tests will be updated and deployed through GitHub.
