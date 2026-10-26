# Week 1 Lesson Teaching Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Week 1 standalone lesson and printable reference with grammar micro-notes, common mistakes, active practice, dialogue, self-check, and a clear weekly roadmap, without turning the lesson into a grammar chapter.

**Architecture:** Content stays in the existing standalone HTML pages. `assets/quiz.js` gains variant-answer, explanation, and model-answer support; `assets/course.css` gains styles for the new sections. Playwright covers both `file://` and built-site behavior.

**Tech Stack:** Static HTML/CSS/JS, Playwright 1.48, existing Vite build and static-copy pipeline.

**Spec:** `docs/superpowers/specs/2026-10-26-week-1-lesson-teaching-audit-design.md`

## Global Constraints

- Core lesson is **25–30 minutes**; optional practice may be longer.
- One weekly lesson only. Day 1–6 are app sessions; Day 7 is review + benchmark.
- Explanations are Roman Hinglish; practice content is English. No Devanagari.
- The lesson must work from `file://` and from the deployed site.
- No new dependencies, backend, auth, audio files, AI scoring, or new Week 1 lesson pages.
- No changes to the app's daily sessions or `content-src/week-01/`.
- Keep the existing `data-quiz` / `data-check` / `data-feedback` API and the `Sahi` / `Phir se` feedback prefixes.
- Keep the printable reference at **two A4 pages**.
- Phone-first: accessible labels, `aria-live` feedback, `type="button"` on every button.
- TTS remains optional; when unavailable, buttons are disabled and text still teaches.
- Commit after Tasks 1–4. Task 5 is verification/deploy and only commits if it fixes a failure.

## Review Focus

1. **Answer variants and normalization:** a learner types `does not` for `doesn't`, extra spaces, different capitalization, curly apostrophes, or a final period; it must be accepted, never falsely marked wrong. Test in Task 1.
2. **Wrong sentence-building/translation answer:** the learner sees a Hinglish explanation and the model answer, not only `Phir se`; there is no dead end. Test in Task 1.
3. **No TTS voice or `speechSynthesis` unavailable:** every `Suno` button is disabled with a clear title, while all text and practice remain usable. Test in Task 3.
4. **Printable reference overflow:** header/print buttons are hidden and the reference fits two A4 pages; grammar and mistakes stay readable. Test in Task 4; manual A4 check in Task 5.
5. **360px phone width:** roadmap, tables, dialogue, and checklist do not create page-level horizontal scrolling; tables scroll inside their own wrapper. Tests in Tasks 2 and 4.

## Scope Boundary

This plan implements the approved design only. It does **not** add new Weeks 2–12 lessons, change app session content, add AI feedback, or redesign the app shell.

## File Structure

```
lessons/0001-week-1-introduce-yourself.html   lesson: roadmap, grammar, practice, dialogue, self-check
reference/0001-week-1-patterns.html           printable reference: grammar rules + mistakes
assets/quiz.js                                variant answers, explanations, model answers
assets/course.css                             new section styles + print rules
tests/e2e/lesson.spec.ts                      new behavior and content coverage
```

No new production files are needed. The existing build copy step already copies `lessons/`, `reference/`, and `assets/`.

---

### Task 1: Practice engine + grammar/sentence/translation drills

**Files:**
- Modify: `assets/quiz.js`
- Modify: `lessons/0001-week-1-introduce-yourself.html` (existing quiz section and new practice sections)
- Test: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: the existing `[data-quiz]`, `input[data-answer]`, `[data-check]`, and `[data-feedback]` contract.
- Produces: `data-answer` may contain `|`-separated accepted answers; `data-explain` is shown after every check; `data-model` is shown after a wrong check. Feedback still starts with `Sahi` or `Phir se`.
- Produces: internal `normalizeAnswer(value: string): string`; no export needed.

- [ ] **Step 1: Write the failing practice test**

Append this test to `tests/e2e/lesson.spec.ts`:

```ts
test('checks grammar practice with explanations, variants, and model answers', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  const grammar = page.locator('.quiz-card').filter({ hasText: 'She ___ at a bank.' });
  await grammar.getByRole('textbox').fill('work');
  await grammar.getByRole('button', { name: 'Check' }).click();
  await expect(grammar.getByText('Phir se')).toBeVisible();
  await expect(grammar.getByText('He/she/it ke saath verb me -s lagta hai.')).toBeVisible();
  await expect(grammar.getByText('Model: She works at a bank.')).toBeVisible();

  await grammar.getByRole('textbox').fill(' works ');
  await grammar.getByRole('button', { name: 'Check' }).click();
  await expect(grammar.getByText('Sahi')).toBeVisible();

  const negative = page.locator('.quiz-card').filter({ hasText: 'He ___ work at a big company.' });
  await negative.getByRole('textbox').fill('does not');
  await negative.getByRole('button', { name: 'Check' }).click();
  await expect(negative.getByText('Sahi')).toBeVisible();

  const build = page
    .locator('.quiz-card')
    .filter({ hasText: 'Build: at / I / Edone Solutions / work / as / a / web developer' });
  await build.getByRole('textbox').fill('I WORK AT EDONE SOLUTIONS AS A WEB DEVELOPER');
  await build.getByRole('button', { name: 'Check' }).click();
  await expect(build.getByText('Sahi')).toBeVisible();

  const translation = page
    .locator('.quiz-card')
    .filter({ hasText: 'Mere paas teen saal ka experience hai.' });
  await translation.getByRole('textbox').fill('i have 3 years of experience.');
  await translation.getByRole('button', { name: 'Check' }).click();
  await expect(translation.getByText('Sahi')).toBeVisible();

  const translationWrong = page
    .locator('.quiz-card')
    .filter({ hasText: 'Mujhe frontend design achha aata hai.' });
  await translationWrong.getByRole('textbox').fill('I am good in frontend design.');
  await translationWrong.getByRole('button', { name: 'Check' }).click();
  await expect(translationWrong.getByText('Phir se')).toBeVisible();
  await expect(translationWrong.getByText('good at + skill.')).toBeVisible();
  await expect(
    translationWrong.getByText("Model: I'm good at frontend design."),
  ).toBeVisible();

  const location = page
    .locator('.quiz-card')
    .filter({ hasText: 'Main Nagpur se hoon, lekin Pune me rehta hoon.' });
  await location.getByRole('textbox').fill('I’m from Nagpur but I live in Pune');
  await location.getByRole('button', { name: 'Check' }).click();
  await expect(location.getByText('Sahi')).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "checks grammar practice"
```

Expected: FAIL — the grammar practice labels and new quiz cards do not exist yet.

- [ ] **Step 3: Extend `assets/quiz.js`**

Add this helper above `initQuiz`:

```js
function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '');
}
```

Replace the single-answer comparison in `check()` with:

```js
const accepted = (input.dataset.answer || '')
  .split('|')
  .map(normalizeAnswer)
  .filter(Boolean);
const correct = accepted.includes(normalizeAnswer(input.value));

input.setAttribute('aria-invalid', String(!correct));

if (feedback) {
  const parts = [correct ? 'Sahi' : 'Phir se'];
  const explanation = (input.dataset.explain || '').trim();
  const model = (input.dataset.model || '').trim();

  if (explanation) {
    parts.push(explanation);
  }
  if (!correct && model) {
    parts.push(`Model: ${model}`);
  }

  feedback.textContent = parts.join(' ');
  feedback.classList.toggle('correct', correct);
  feedback.classList.toggle('wrong', !correct);
}
```

Keep the existing Enter-key behavior and `root.dataset.quizReady = 'true'`.

- [ ] **Step 4: Update the existing six quiz items**

In `lessons/0001-week-1-introduce-yourself.html`, change the heading from `Quiz — 6 blanks` to `Practice 1: pattern fill-ins`, and update the subtitle to:

> Blank me ek word likho. Capital letters aur extra spaces ki chinta mat karo. Check dabao, feedback dekho, phir agla.

Add `data-explain` and `data-model` to each existing item:

| ID | Label | `data-answer` | `data-explain` | `data-model` |
|---|---|---|---|---|
| q1 | `I work ___ Edone Solutions.` | `at` | `Company ke pehle at.` | `I work at Edone Solutions.` |
| q2 | `I'm ___ Nagpur.` | `from` | `Origin ke liye from.` | `I'm from Nagpur.` |
| q3 | `I live ___ Pune.` | `in` | `City ke pehle in.` | `I live in Pune.` |
| q4 | `I have three years of ___.` | `experience` | `Experience = kaam ka tajurba; “years of experience”.` | `I have three years of experience.` |
| q5 | `I build responsive websites ___ small businesses.` | `for` | `for = kiske liye.` | `I build responsive websites for small businesses.` |
| q6 | `I'm good ___ frontend development.` | `at` | `good at fixed phrase.` | `I'm good at frontend development.` |

- [ ] **Step 5: Add the six grammar fill-ins**

Insert a new section after the existing practice grid, before the existing speaking section:

```html
<section class="section" aria-labelledby="grammar-practice-title">
  <h2 class="section-heading" id="grammar-practice-title">Practice 2: grammar fill-ins</h2>
  <p class="section-subtitle">
    Ek word ya short form likho. “Doesn't” aur “does not” dono accepted hain.
  </p>
  <div class="quiz-grid"><!-- six cards below --></div>
</section>
```

Use this exact content for the six `.quiz-card` blocks:

| ID | Label | `data-answer` | `data-explain` | `data-model` |
|---|---|---|---|---|
| g1 | `She ___ at a bank.` | `works` | `He/she/it ke saath verb me -s lagta hai.` | `She works at a bank.` |
| g2 | `___ you work here?` | `Do` | `Present simple question me do/does.` | `Do you work here?` |
| g3 | `He ___ work at a big company.` | `doesn't / does not` | `He/she/it ke saath doesn't.` | `He doesn't work at a big company.` |
| g4 | `I'm ___ engineer.` | `an` | `Vowel sound ke pehle an.` | `I'm an engineer.` |
| g5 | `I'm good ___ design.` | `at` | `good at fixed phrase.` | `I'm good at design.` |
| g6 | `How many years of experience ___ you have?` | `do` | `Question me do/does auxiliary.` | `How many years of experience do you have?` |

In the HTML, join the answers shown with `/` using `|` in `data-answer`. Every card needs a unique `id`, a matching `for`, `autocomplete="off"`, `type="button"`, and `<p class="feedback" data-feedback aria-live="polite"></p>`.

- [ ] **Step 6: Add sentence building and translation**

Insert two more sections after Practice 2:

```html
<section class="section" aria-labelledby="build-title">
  <h2 class="section-heading" id="build-title">Practice 3: build the sentence</h2>
  <p class="section-subtitle">
    Jumbled words ko sahi order me full sentence banao. Capital letters aur final punctuation ki
    chinta mat karo.
  </p>
  <div class="quiz-grid"><!-- four cards below --></div>
</section>

<section class="section" aria-labelledby="translate-title">
  <h2 class="section-heading" id="translate-title">Practice 4: Hinglish → English</h2>
  <p class="section-subtitle">
    Hinglish prompt ka English version likho. Ek se zyada sahi answers accepted hain; wrong attempt
    par model answer dikhega.
  </p>
  <div class="quiz-grid"><!-- four cards below --></div>
</section>
```

Sentence-building cards:

| ID | Label | Accepted answers (join with `|`) | `data-explain` | `data-model` |
|---|---|---|---|---|
| b1 | `Build: at / I / Edone Solutions / work / as / a / web developer` | `I work at Edone Solutions as a web developer.` / `I work as a web developer at Edone Solutions.` | `Subject + verb + at + company + as + role.` | `I work at Edone Solutions as a web developer.` |
| b2 | `Build: from / I'm / Nagpur / but / I / live / in / Pune` | `I'm from Nagpur, but I live in Pune.` / `I am from Nagpur, but I live in Pune.` / `I'm from Nagpur but I live in Pune.` / `I am from Nagpur but I live in Pune.` / `I live in Pune, but I'm from Nagpur.` / `I live in Pune but I'm from Nagpur.` / `I live in Pune but I am from Nagpur.` | `Origin from; current city in.` | `I'm from Nagpur, but I live in Pune.` |
| b3 | `Build: experience / three / I / of / have / years` | `I have three years of experience.` / `I have 3 years of experience.` / `I have three years' experience.` / `I have 3 years' experience.` | `have + number + years of + experience.` | `I have three years of experience.` |
| b4 | `Build: good / I'm / at / design / frontend` | `I'm good at frontend design.` / `I am good at frontend design.` | `good at + noun.` | `I'm good at frontend design.` |

Translation cards:

| ID | Prompt | Accepted answers (join with `|`) | `data-explain` | `data-model` |
|---|---|---|---|---|
| t1 | `Main Edone Solutions me web developer hoon.` | `I work at Edone Solutions as a web developer.` / `I am a web developer at Edone Solutions.` / `I'm a web developer at Edone Solutions.` | `Company at; role as; singular job a.` | `I work at Edone Solutions as a web developer.` |
| t2 | `Main Nagpur se hoon, lekin Pune me rehta hoon.` | `I'm from Nagpur, but I live in Pune.` / `I am from Nagpur, but I live in Pune.` / `I'm from Nagpur but I live in Pune.` / `I am from Nagpur but I live in Pune.` / `I live in Pune, but I'm from Nagpur.` / `I live in Pune but I'm from Nagpur.` / `I live in Pune but I am from Nagpur.` | `from = origin; in = current city.` | `I'm from Nagpur, but I live in Pune.` |
| t3 | `Mere paas teen saal ka experience hai.` | `I have three years of experience.` / `I have 3 years of experience.` / `I have three years' experience.` / `I have 3 years' experience.` | `have + years of experience.` | `I have three years of experience.` |
| t4 | `Mujhe frontend design achha aata hai.` | `I'm good at frontend design.` / `I am good at frontend design.` | `good at + skill.` | `I'm good at frontend design.` |

- [ ] **Step 7: Run the test to verify it passes**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "checks grammar practice"
```

Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```powershell
git add assets/quiz.js lessons/0001-week-1-introduce-yourself.html tests/e2e/lesson.spec.ts
git commit -m "feat: add grammar practice to Week 1 lesson"
```

---

### Task 2: Roadmap, grammar notes, grammar corner, common mistakes

**Files:**
- Modify: `lessons/0001-week-1-introduce-yourself.html`
- Modify: `assets/course.css`
- Test: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: existing lesson structure and CSS variables (`--surface`, `--line`, `--accent`, `--danger`, etc.).
- Produces: section IDs `roadmap-title`, `grammar-title`, `mistakes-title`; classes `.roadmap-grid`, `.roadmap-card`, `.roadmap-step`, `.grammar-note`, `.mistake-note`, `.table-wrap`, `.grammar-table`, `.rules-table`, `.mistake-grid`, `.mistake-card`.

- [ ] **Step 1: Write the failing teaching-content test**

Append:

```ts
test('teaches the Week 1 roadmap, grammar notes, and common mistakes', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  await expect(page.getByText('Week 1 · Weekly Lesson', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Week 1 roadmap' })).toBeVisible();
  await expect(
    page.getByText('Lesson 1 = Week 1 ka weekly lesson; Day 1 = app ka pehla practice session.'),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Grammar corner' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Common mistakes' })).toBeVisible();
  await expect(page.locator('.pattern-card .grammar-note')).toHaveCount(6);
  await expect(page.locator('.pattern-card .mistake-note')).toHaveCount(6);
  await expect(page.locator('.mistake-card')).toHaveCount(8);
  await expect(
    page.locator('.mistake-card').getByText('I am having 3 years experience.'),
  ).toBeVisible();
  await expect(
    page.locator('.mistake-card').getByText('I have 3 years of experience.'),
  ).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(lesson);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "teaches the Week 1 roadmap"
```

Expected: FAIL — the roadmap, grammar notes, and mistakes sections do not exist.

- [ ] **Step 3: Rename the lesson and add the roadmap**

In the hero:

- Change `<p class="eyebrow">Week 1 · Lesson 1</p>` to `<p class="eyebrow">Week 1 · Weekly Lesson</p>`.
- Change the first pill from `20–25 min` to `25–30 min`.
- Replace the pill text `6 fill-ins` with `grammar + practice`.
- Replace `4 speak prompts` with `Day 1–7 roadmap`.

Insert this section immediately after the hero and before the patterns:

```html
<section class="section" aria-labelledby="roadmap-title">
  <h2 class="section-heading" id="roadmap-title">Week 1 roadmap</h2>
  <p class="section-subtitle">
    Lesson 1 = Week 1 ka weekly lesson; Day 1 = app ka pehla practice session. Ye page poore week
    ka map hai.
  </p>
  <div class="roadmap-grid">
    <article class="roadmap-card">
      <p class="roadmap-step">Lesson 1 · Weekly lesson</p>
      <h3>Ye page — 25–30 min</h3>
      <p>6 patterns, grammar notes, practice, dialogue aur 60-second self-check. Core 25–30 min; Practice 3–4 optional.</p>
    </article>
    <article class="roadmap-card">
      <p class="roadmap-step">Day 1–6 · App sessions</p>
      <h3>Roz 30 min (ya 15 min short)</h3>
      <p>Har din ek pattern + 5 words + dialogue + recording. Lesson ko roz dobara mat padho.</p>
    </article>
    <article class="roadmap-card">
      <p class="roadmap-step">Day 7 · Review + benchmark</p>
      <h3>Recall + 60-second recording</h3>
      <p>Purane patterns bina dekhe bolo, quiz karo, aur apna benchmark record karo.</p>
    </article>
  </div>
</section>
```

Change the footer line to `Bol · Week 1 · Weekly Lesson · Hinglish explanations, English practice.`

- [ ] **Step 4: Add a grammar note and a common mistake to each pattern card**

Place these two elements after the closing `</ul>` of each pattern's `.examples`, inside the `.pattern-card`:

```html
<p class="grammar-note"><strong>Grammar:</strong> …</p>
<p class="mistake-note"><strong>Common mistake:</strong> …</p>
```

Use this exact copy:

| Card | Grammar note (after `Grammar:`) | Common mistake (after `Common mistake:`) |
|---|---|---|
| 1 | Present simple permanent job ke liye. Company ke pehle at, role ke pehle as, aur singular job ke pehle a/an. He/she/it ke saath work → works. | “I work in Edone Solutions” → “I work at Edone Solutions.” Company ke pehle at. |
| 2 | be from = origin; live in = current city. City ke pehle in. Where are you from? (be) / Where do you live? (do). | “I am from Nagpur only” → “I'm from Nagpur.” Yahan only ki zaroorat nahi. |
| 3 | have experience ke liye; he/she/it ke saath has. Experience uncountable: much experience, many years. Question me do, are nahi. | “I am having 3 years experience” → “I have 3 years of experience.” Experience state hai, action nahi. |
| 4 | Present simple job duties ke liye. I/we/they build; he/she/it builds. for = client/beneficiary. Our team builds — team singular. | “Our team build websites” → “Our team builds websites.” Team singular hai. |
| 5 | good at + noun/-ing. I'm learning = abhi seekh raha hoon. Negative me yet: I'm not good at backend yet. | “I'm good in frontend” → “I'm good at frontend.” Fixed phrase good at. |
| 6 | Present simple questions: do/does + subject + base verb. What do you do? = profession. work at company / for client / with people / in field. | “What you do?” → “What do you do?” Question me do chahiye. |

- [ ] **Step 5: Add Grammar corner and Common mistakes**

Insert after the patterns section and before Practice 1:

```html
<section class="section" aria-labelledby="grammar-title">
  <h2 class="section-heading" id="grammar-title">Grammar corner</h2>
  <p class="section-subtitle">
    Ye 6 rules Week 1 ke saare patterns cover karte hain. Ratta nahi — bolte time apply karo.
  </p>
  <div class="table-wrap">
    <table class="grammar-table rules-table">
      <thead>
        <tr><th scope="col">Rule</th><th scope="col">Example</th></tr>
      </thead>
      <tbody>
        <tr><td>I/you/we/they + base verb; he/she/it + verb-s</td><td>I work · She works</td></tr>
        <tr><td>Questions: do/does + subject + base verb</td><td>Do you work here? · Does she work here?</td></tr>
        <tr><td>Negatives: don't/doesn't + base verb</td><td>I don't work · She doesn't work</td></tr>
        <tr><td>be: am/is/are + noun/adjective; questions invert</td><td>I'm a developer. · Are you a developer?</td></tr>
        <tr><td>Prepositions: at company · as role · from origin · in city/field · for client · with people · of experience</td><td>I work at Edone as a developer.</td></tr>
        <tr><td>a/an + singular job · good at + noun/-ing · experience uncountable, years countable</td><td>I'm a developer. I'm good at design. I have three years of experience.</td></tr>
      </tbody>
    </table>
  </div>
</section>

<section class="section" aria-labelledby="mistakes-title">
  <h2 class="section-heading" id="mistakes-title">Common mistakes</h2>
  <p class="section-subtitle">
    Ye 8 galtiyan Week 1 me sabse zyada hoti hain. Pehle wrong bolo, phir right — loud.
  </p>
  <div class="mistake-grid">
    <!-- eight .note-card.mistake-card articles -->
  </div>
</section>
```

Each mistake card uses this structure:

```html
<article class="note-card mistake-card">
  <p class="wrong">✗ I am having 3 years experience.</p>
  <p class="right">✓ I have 3 years of experience.</p>
  <p>Experience state hai, action nahi; of chahiye.</p>
</article>
```

The eight wrong/right pairs and reasons:

| Wrong | Right | Reason |
|---|---|---|
| `I am having 3 years experience.` | `I have 3 years of experience.` | `Experience state hai, action nahi; of chahiye.` |
| `I am good in frontend.` | `I'm good at frontend.` | `good at fixed phrase.` |
| `I work in Edone Solutions.` | `I work at Edone Solutions.` | `Company ke pehle at.` |
| `I am from Nagpur only.` | `I'm from Nagpur.` | `English me only ki zaroorat nahi.` |
| `I am working here since 3 years.` | `I have worked here for 3 years.` | `for + duration; present perfect later.` |
| `She work at a bank.` | `She works at a bank.` | `He/she/it + -s.` |
| `What you do?` | `What do you do?` | `Question me do.` |
| `I am web developer.` | `I am a web developer.` | `Singular job ke pehle a/an.` |

- [ ] **Step 6: Add the styles**

Add to `assets/course.css` near the existing pattern/quiz styles:

```css
.roadmap-grid,
.mistake-grid {
  display: grid;
  gap: 0.9rem;
}

.roadmap-card {
  border: 1px solid var(--line);
  border-radius: 1.2rem;
  background: var(--surface);
  padding: 1rem;
  box-shadow: 0 8px 24px rgba(15, 118, 110, 0.04);
}

.roadmap-step {
  margin: 0;
  color: var(--accent-dark);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.roadmap-card h3 {
  margin: 0.25rem 0 0.35rem;
  font-size: 1rem;
}

.roadmap-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.88rem;
}

.grammar-note,
.mistake-note {
  margin: 0;
  border-left: 3px solid var(--accent);
  border-radius: 0.3rem;
  padding: 0.5rem 0.65rem;
  background: var(--accent-soft);
  color: var(--ink);
  font-size: 0.82rem;
}

.mistake-note {
  border-left-color: var(--danger);
  background: #fff1f0;
}

.grammar-note strong {
  color: var(--accent-dark);
}

.mistake-note strong {
  color: var(--danger);
}

.table-wrap {
  overflow-x: auto;
}

.grammar-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface);
  font-size: 0.86rem;
}

.grammar-table th,
.grammar-table td {
  border-bottom: 1px solid var(--line);
  padding: 0.55rem 0.6rem;
  text-align: left;
  vertical-align: top;
}

.grammar-table th {
  color: var(--muted);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.mistake-card {
  border-color: #f1b5ae;
  background: #fff8f7;
}

.mistake-card .wrong {
  color: var(--danger);
  font-weight: 700;
}

.mistake-card .right {
  color: var(--success);
  font-weight: 700;
}

.mistake-card p {
  margin: 0.15rem 0;
  font-size: 0.86rem;
}
```

Inside the existing `@media (min-width: 700px)` block, add:

```css
.roadmap-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.mistake-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "teaches the Week 1 roadmap"
```

Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```powershell
git add assets/course.css lessons/0001-week-1-introduce-yourself.html tests/e2e/lesson.spec.ts
git commit -m "feat: teach Week 1 grammar in lesson"
```

---

### Task 3: Listening, dialogue, vocabulary, self-check, pronunciation

**Files:**
- Modify: `lessons/0001-week-1-introduce-yourself.html`
- Modify: `assets/course.css`
- Test: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: existing `[data-say]` TTS script and `.say` button styling.
- Produces: section IDs `listen-title`, `dialogue-title`, `vocab-title`, `selfcheck-title`; classes `.repeat-list`, `.repeat-line`, `.dialogue`, `.dialogue-line`, `.speaker`, `.dialogue-target`, `.vocab-grid`, `.vocab-card`, `.checklist`.
- Produces: the TTS guard also handles `window.speechSynthesis === undefined`, not only a missing property.

- [ ] **Step 1: Write the failing speaking-content tests**

Append:

```ts
test('adds listen-and-repeat, dialogue, vocabulary, and self-check', async ({ page }) => {
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  await expect(page.getByRole('heading', { name: 'Listen and repeat' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Model dialogue' })).toBeVisible();
  await expect(page.getByText("Hi, I'm Riya from Acme. What do you do?")).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vocabulary in action' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '60-second self-check' })).toBeVisible();
  await expect(page.locator('.checklist input[type="checkbox"]')).toHaveCount(6);
  await expect(page.getByText('three years / thirty years')).toBeVisible();
  await expect(page.getByText('Content words par stress')).toBeVisible();

  await page.getByLabel('Naam, city, role, company bola.').check();
  await expect(page.getByLabel('Naam, city, role, company bola.')).toBeChecked();
  expect(await page.locator('[data-say]').count()).toBeGreaterThanOrEqual(16);
});

test('disables Suno buttons if speech synthesis is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: undefined });
  });
  const lesson = pathToFileURL(path.resolve('lessons/0001-week-1-introduce-yourself.html')).href;
  await page.goto(lesson);

  await expect(page.locator('.say').first()).toBeDisabled();
  await expect(page.locator('.say').first()).toHaveAttribute(
    'title',
    'Is browser me voice available nahi hai.',
  );
});
```

- [ ] **Step 2: Run them to verify they fail**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "listen-and-repeat|speech synthesis"
```

Expected: FAIL — the new sections do not exist and the TTS guard only checks property presence.

- [ ] **Step 3: Add Listen and repeat + Model dialogue**

Insert before the existing `4 speak prompts` section:

```html
<section class="section" aria-labelledby="listen-title">
  <h2 class="section-heading" id="listen-title">Listen and repeat</h2>
  <p class="section-subtitle">
    Suno → 2 second pause → bolo. Do rounds: pehle text dekho, phir screen se nazar hatao.
  </p>
  <div class="repeat-list">
    <!-- four .repeat-line rows -->
  </div>
</section>

<section class="section" aria-labelledby="dialogue-title">
  <h2 class="section-heading" id="dialogue-title">Model dialogue</h2>
  <p class="section-subtitle">
    Client intro. Riya = client, You = learner. Target lines ko apne intro se replace karke bolo.
  </p>
  <div class="dialogue"><!-- six .dialogue-line rows --></div>
  <p class="section-subtitle">
    Last line ke baad ek question poochho: “Do you work with a tech team?”
  </p>
</section>
```

Each repeat row:

```html
<div class="repeat-line">
  <p>I work at Edone Solutions as a web developer.</p>
  <button class="say" type="button" data-say="I work at Edone Solutions as a web developer.">Suno</button>
</div>
```

Use these four lines:

1. `I work at Edone Solutions as a web developer.`
2. `I'm from Nagpur, but I live in Pune.`
3. `I have three years of experience.`
4. `I'm good at frontend design, and I'm learning backend.`

Each dialogue row:

```html
<div class="dialogue-line">
  <span class="speaker">Riya</span>
  <p>Hi, I'm Riya from Acme. What do you do?</p>
  <button class="say" type="button" data-say="Hi, I'm Riya from Acme. What do you do?">Suno</button>
</div>
```

Use these six lines; add `dialogue-target` to the three `You` rows:

| Speaker | Line | Target |
|---|---|---|
| Riya | `Hi, I'm Riya from Acme. What do you do?` | no |
| You | `Hi, Riya. I'm [your name]. I work at Edone Solutions as a web developer.` | yes |
| Riya | `Where are you from?` | no |
| You | `I'm from Nagpur, but I live in Pune.` | yes |
| Riya | `How many years of experience do you have?` | no |
| You | `I have three years of experience in web development.` | yes |

For the target `You` line, use `data-say="Hi, Riya. I'm Mohd. I work at Edone Solutions as a web developer."` so the TTS does not read the placeholder.

- [ ] **Step 4: Add Vocabulary in action + 60-second self-check**

Insert immediately after the existing `4 speak prompts` section and before pronunciation:

```html
<section class="section" aria-labelledby="vocab-title">
  <h2 class="section-heading" id="vocab-title">Vocabulary in action</h2>
  <p class="section-subtitle">
    Sirf word yaad nahi — collocation ke saath bolo. Apne 60-second intro me do words use karo.
  </p>
  <div class="vocab-grid">
    <!-- six .vocab-card articles -->
  </div>
</section>

<section class="section" aria-labelledby="selfcheck-title">
  <h2 class="section-heading" id="selfcheck-title">60-second self-check</h2>
  <p class="section-subtitle">
    Phone me 60 seconds record karo. Neeche checklist se score karo; 5/6 = ready.
  </p>
  <ul class="checklist"><!-- six label/checkbox rows --></ul>
  <p class="section-subtitle">
    3/6 = ek pattern dobara bolo, phir record karo. Recording suno, ek cheez sudharo, dobara record karo.
  </p>
</section>
```

Vocabulary cards:

| Word | Collocation | Example |
|---|---|---|
| developer | web developer | `I'm a web developer at Edone Solutions.` |
| client | a new client | `I build websites for clients.` |
| experience | years of experience | `I have three years of experience.` |
| frontend | frontend development | `I'm good at frontend development.` |
| backend | backend development | `I'm learning backend development.` |
| in-house | an in-house team | `I work in-house as a frontend developer.` |

Self-check labels, in order:

1. `Naam, city, role, company bola.`
2. `“I work at ___ as a ___” use kiya.`
3. `“I'm from ___ / I live in ___” use kiya.`
4. `Years of experience bataya.`
5. `Ek ya do questions wapas poochhe.`
6. `60 seconds me bolaya, Hindi minimum thi.`

Each row:

```html
<li>
  <input type="checkbox" id="check-name" />
  <label for="check-name">Naam, city, role, company bola.</label>
</li>
```

- [ ] **Step 5: Add pronunciation notes and teacher questions**

Inside the existing pronunciation grid, add:

```html
<article class="note-card">
  <h3>Numbers: three vs thirty</h3>
  <p>
    <strong>three</strong> = 3 (short), <strong>thirty</strong> = 30 (thir-ty). Practice:
    three years / thirty years.
  </p>
</article>
<article class="note-card">
  <h3>Sentence stress</h3>
  <p>
    Content words par stress: <strong>I WORK</strong> at <strong>EDONE</strong> as a
    <strong>WEB DEVELOPER</strong>. at/as/a ko jaldi bolo.
  </p>
</article>
```

Add these two items to the teacher follow-up list:

- `Mera “good at” aur “work at” use sahi tha?`
- `60-second intro me kaunsi grammar mistake repeat ho rahi thi?`

- [ ] **Step 6: Make the TTS guard handle an undefined API**

Change the inline script condition from:

```js
if (!('speechSynthesis' in window)) {
```

to:

```js
if (!('speechSynthesis' in window) || !window.speechSynthesis) {
```

Keep the existing disabled-button title and early return.

- [ ] **Step 7: Add the styles**

Add to `assets/course.css` near the speaking styles:

```css
.repeat-list {
  display: grid;
  gap: 0.5rem;
}

.repeat-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--line);
  border-radius: 0.9rem;
  background: var(--surface);
  padding: 0.65rem 0.8rem;
}

.repeat-line p {
  margin: 0;
  font-size: 0.9rem;
}

.dialogue {
  display: grid;
  gap: 0.5rem;
}

.dialogue-line {
  display: grid;
  grid-template-columns: 4.3rem 1fr auto;
  gap: 0.6rem;
  align-items: start;
  border-bottom: 1px solid var(--line);
  padding: 0.55rem 0;
}

.dialogue-line:last-child {
  border-bottom: 0;
}

.speaker {
  color: var(--accent-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  padding-top: 0.15rem;
  text-transform: uppercase;
}

.dialogue-line p {
  margin: 0;
  font-size: 0.9rem;
}

.dialogue-target {
  border-radius: 0.5rem;
  background: var(--accent-soft);
  padding: 0.4rem 0.55rem;
}

.vocab-grid {
  display: grid;
  gap: 0.7rem;
}

.vocab-card {
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: var(--surface);
  padding: 0.85rem;
}

.vocab-card h3 {
  margin: 0 0 0.2rem;
  color: var(--accent-dark);
  font-size: 1rem;
}

.vocab-card p {
  margin: 0.15rem 0;
  color: var(--muted);
  font-size: 0.86rem;
}

.vocab-card .vocab-example {
  color: var(--ink);
}

.checklist {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.checklist li {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  border: 1px solid var(--line);
  border-radius: 0.7rem;
  background: var(--surface);
  padding: 0.55rem 0.7rem;
  font-size: 0.9rem;
}

.checklist input {
  margin-top: 0.25rem;
  accent-color: var(--accent);
}
```

Add inside `@media (min-width: 700px)`:

```css
.vocab-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

Add a phone override:

```css
@media (max-width: 520px) {
  .dialogue-line {
    grid-template-columns: 1fr auto;
  }

  .speaker {
    grid-column: 1 / -1;
  }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "listen-and-repeat|speech synthesis"
```

Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```powershell
git add assets/course.css lessons/0001-week-1-introduce-yourself.html tests/e2e/lesson.spec.ts
git commit -m "feat: add Week 1 dialogue and self-check"
```

---

### Task 4: Printable reference grammar and mistakes

**Files:**
- Modify: `reference/0001-week-1-patterns.html`
- Modify: `assets/course.css`
- Test: `tests/e2e/lesson.spec.ts`

**Interfaces:**
- Consumes: `.table-wrap`, `.grammar-table`, `.rules-table` from Task 2; existing `.page-break` print class.
- Produces: reference section IDs `grammar-title`, `mistakes-title`; `.mistake-table` with `.wrong` / `.right` cells; two-page print layout.

- [ ] **Step 1: Write the failing reference test**

Append:

```ts
test('reference includes grammar rules, mistakes, and print styles', async ({ page }) => {
  const reference = pathToFileURL(path.resolve('reference/0001-week-1-patterns.html')).href;
  await page.goto(reference);

  await expect(page.getByRole('heading', { name: 'Grammar quick rules' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Common mistakes' })).toBeVisible();
  await expect(page.locator('.rules-table tbody tr')).toHaveCount(6);
  await expect(page.locator('.mistake-table tbody tr')).toHaveCount(8);
  await expect(
    page.locator('.mistake-table').getByText('I am having 3 years experience.'),
  ).toBeVisible();
  await expect(
    page.locator('.mistake-table').getByText('I have 3 years of experience.'),
  ).toBeVisible();

  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(reference);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.print-btn')).toBeHidden();
  await expect(page.locator('.page-break')).toHaveCSS('break-before', 'page');
});
```

- [ ] **Step 2: Run it to verify it fails**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "reference includes grammar rules"
```

Expected: FAIL — the reference has no grammar/mistakes sections.

- [ ] **Step 3: Add Grammar quick rules**

Insert after the reference hero and before the 6 patterns:

```html
<section class="section" aria-labelledby="grammar-title">
  <h2 class="section-heading" id="grammar-title">Grammar quick rules</h2>
  <div class="table-wrap">
    <table class="grammar-table rules-table">
      <thead>
        <tr><th scope="col">Rule</th><th scope="col">Example</th></tr>
      </thead>
      <tbody>
        <!-- six rows below -->
      </tbody>
    </table>
  </div>
</section>
```

Use these six rows exactly:

| Rule | Example |
|---|---|
| I/you/we/they + base verb; he/she/it + verb-s | I work · She works |
| Questions: do/does + subject + base verb | Do you work here? · Does she work here? |
| Negatives: don't/doesn't + base verb | I don't work · She doesn't work |
| be: am/is/are + noun/adjective; questions invert | I'm a developer. · Are you a developer? |
| Prepositions: at company · as role · from origin · in city/field · for client · with people · of experience | I work at Edone as a developer. |
| a/an + singular job · good at + noun/-ing · experience uncountable, years countable | I'm a developer. I'm good at design. I have three years of experience. |

- [ ] **Step 4: Add Common mistakes and fix the print page break**

Insert after the 6 patterns and before pronunciation:

```html
<section class="section page-break" aria-labelledby="mistakes-title">
  <h2 class="section-heading" id="mistakes-title">Common mistakes</h2>
  <div class="table-wrap">
    <table class="grammar-table mistake-table">
      <thead>
        <tr><th scope="col">Wrong</th><th scope="col">Right</th><th scope="col">Why</th></tr>
      </thead>
      <tbody>
        <!-- eight rows below -->
      </tbody>
    </table>
  </div>
</section>
```

Use these eight rows exactly:

| Wrong | Right | Why |
|---|---|---|
| `I am having 3 years experience.` | `I have 3 years of experience.` | `Experience state hai, action nahi; of chahiye.` |
| `I am good in frontend.` | `I'm good at frontend.` | `good at fixed phrase.` |
| `I work in Edone Solutions.` | `I work at Edone Solutions.` | `Company ke pehle at.` |
| `I am from Nagpur only.` | `I'm from Nagpur.` | `English me only ki zaroorat nahi.` |
| `I am working here since 3 years.` | `I have worked here for 3 years.` | `for + duration; present perfect later.` |
| `She work at a bank.` | `She works at a bank.` | `He/she/it + -s.` |
| `What you do?` | `What do you do?` | `Question me do.` |
| `I am web developer.` | `I am a web developer.` | `Singular job ke pehle a/an.` |

Render the first column as `<td class="wrong">`, the second as `<td class="right">`, and the third
as `<td>reason</td>`, so the reference styles color the corrections.

Remove `page-break` from the 30-words section. The common mistakes section now starts page 2; pronunciation and words follow on that page.

- [ ] **Step 5: Update the reference hero and footer**

Change the lead to:

> 6 patterns · 6 grammar rules · 8 mistakes · 30 words · 10 phrases. Client call se pehle 2 minute is sheet par eye scan karo, phir loud bolo.

Change the footer to:

> Bol · Week 1 · Printable reference · 6 patterns · 6 grammar rules · 8 mistakes · 30 words · 10 phrases.

- [ ] **Step 6: Add reference/print styles**

Add to `assets/course.css`:

```css
.mistake-table .wrong {
  color: var(--danger);
  font-weight: 700;
}

.mistake-table .right {
  color: var(--success);
  font-weight: 700;
}
```

Inside `@media print`, add:

```css
.table-wrap {
  overflow: visible;
}

.grammar-table {
  font-size: 7.8pt;
}

.grammar-table th,
.grammar-table td {
  padding: 2pt 3pt;
}

.grammar-table tr {
  break-inside: avoid;
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run:

```powershell
npm run build
npx playwright test tests/e2e/lesson.spec.ts -g "reference includes grammar rules"
```

Expected: PASS (1 test).

- [ ] **Step 8: Commit**

```powershell
git add assets/course.css reference/0001-week-1-patterns.html tests/e2e/lesson.spec.ts
git commit -m "feat: add grammar rules to Week 1 reference"
```

---

### Task 5: Full verification and deployment

**Files:**
- No production edits expected. If verification finds a failure, fix the owning file and rerun the relevant task.

**Interfaces:**
- Consumes: all previous tasks.
- Produces: a verified build, full test result, and live deployment.

- [ ] **Step 1: Run the unit tests**

Run:

```powershell
npm test -- --run
```

Expected: PASS — all existing unit tests pass (46 tests at the start of this plan).

- [ ] **Step 2: Run content validation and build**

Run:

```powershell
npm run validate:content
npm run build
```

Expected: `validate:content` reports 7 valid days; `npm run build` completes with no TypeScript errors and prepares `dist/`.

- [ ] **Step 3: Run the full browser suite**

Run:

```powershell
npm run test:e2e
```

Expected: PASS — 10 tests (4 existing + 6 new), including the built-site and service-worker lesson tests. Final review added a no-voice TTS regression test.

- [ ] **Step 4: Check the standalone pages manually**

Open these directly with `file://`:

- `C:\english-learning\lessons\0001-week-1-introduce-yourself.html`
- `C:\english-learning\reference\0001-week-1-patterns.html`

Check at 360px width:

- no page-level horizontal scroll;
- roadmap, grammar table, dialogue and checklist are readable;
- tables scroll inside their wrapper on the lesson and reference;
- all `Suno` buttons either speak or are disabled with the fallback title;
- the 60-second checklist checkboxes toggle.

- [ ] **Step 5: Check the A4 print layout**

Open the reference in Chrome → Print, paper A4 portrait. Expected: **2 pages**.

Page 1: hero, grammar quick rules, 6 patterns.
Page 2: common mistakes, pronunciation, 10 phrases, 30 words.

If it is 3 pages, compress in this order and recheck:

1. `@media print` `.grammar-table` to `7.4pt`, padding `1.5pt 2pt`.
2. `.section` margin to `6pt`.
3. `.ref-pattern p` and `.word-list li` to `7.6pt`.
4. `.word-list li` margin-bottom to `2pt`.

Do not add a third page.

- [ ] **Step 6: Confirm the worktree is clean**

Run:

```powershell
git status --short
```

Expected: no output. If your harness ticks the checkboxes in this plan file, only
`docs/superpowers/plans/2026-10-26-week-1-lesson-teaching-audit.md` may be modified; commit it as
`docs: track plan progress` before pushing. No production file may be left uncommitted.

- [ ] **Step 7: Push and deploy**

Run:

```powershell
git push origin main
```

Expected: GitHub accepts the push; Cloudflare Pages starts the deployment.

- [ ] **Step 8: Verify the live lesson and reference**

After the Cloudflare deployment finishes, run:

```powershell
$lesson = Invoke-WebRequest -Uri "https://english-learning-7o4.pages.dev/lessons/0001-week-1-introduce-yourself" -UseBasicParsing
$lesson.StatusCode
$lesson.Content -match "Week 1 roadmap"
$lesson.Content -match "Grammar corner"

$reference = Invoke-WebRequest -Uri "https://english-learning-7o4.pages.dev/reference/0001-week-1-patterns" -UseBasicParsing
$reference.StatusCode
$reference.Content -match "Grammar quick rules"
$reference.Content -match "Common mistakes"

(Invoke-WebRequest -Uri "https://english-learning-7o4.pages.dev/assets/course.css" -UseBasicParsing).StatusCode
(Invoke-WebRequest -Uri "https://english-learning-7o4.pages.dev/assets/quiz.js" -UseBasicParsing).StatusCode
```

Expected:

```text
200
True
True
200
True
True
200
200
```

If the content is stale, wait for the Cloudflare deployment, then hard-refresh; the service worker can serve the old app shell briefly.

## Final Review Corrections

- b1 rejects the missing-article sentence `I work at Edone Solutions as web developer.`
- b2/t2 also accept `I live in Pune but I'm from Nagpur.`
- b3/t3 also accept `I have three years' experience.` and `I have 3 years' experience.`
- All `Suno` buttons disable when `getVoices()` has no English voice; `voiceschanged` re-checks availability.
