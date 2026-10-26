import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const contentDir = join('content-src', 'weeks');
const lessonsDir = 'lessons';
const referenceDir = 'reference';

const pad = (number) => String(number).padStart(4, '0');

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function lessonFile(week) {
  return `${pad(week.number)}-week-${week.number}-${week.slug}.html`;
}

function referenceFile(week) {
  return `${pad(week.number)}-week-${week.number}-patterns.html`;
}

function sayButton(text, extraClass = '') {
  return `<button class="say${extraClass ? ` ${extraClass}` : ''}" type="button" data-say="${esc(
    text,
  )}">Suno</button>`;
}

function quizCard(id, label, item) {
  return `
            <div class="quiz-card" data-quiz>
              <label class="quiz-label" for="${esc(id)}">${label}</label>
              <div class="quiz-row">
                <input
                  id="${esc(id)}"
                  type="text"
                  data-answer="${esc(item.answers.join('|'))}"
                  data-explain="${esc(item.explain)}"
                  data-model="${esc(item.model)}"
                  autocomplete="off"
                />
                <button class="btn" type="button" data-check>Check</button>
              </div>
              <p class="feedback" data-feedback aria-live="polite"></p>
            </div>`;
}

function renderPatterns(week) {
  const cards = week.patterns
    .map((pattern, index) => {
      const examples = pattern.examples
        .map(
          ([english, hinglish]) =>
            `<li>${english}<small>${hinglish}</small></li>`,
        )
        .join('\n                ');

      return `
            <article class="pattern-card">
              <div class="pattern-top">
                <div>
                  <p class="pattern-frame">${index + 1}. ${pattern.frame}</p>
                  <p class="pattern-note">${pattern.note}</p>
                </div>
                ${sayButton(pattern.say)}
              </div>
              <dl class="forms">
                <div class="form-row"><dt>+</dt><dd>${pattern.positive}</dd></div>
                <div class="form-row"><dt>−</dt><dd>${pattern.negative}</dd></div>
                <div class="form-row"><dt>?</dt><dd>${pattern.question}</dd></div>
              </dl>
              <ul class="examples">
                ${examples}
              </ul>
              <p class="grammar-note"><strong>Grammar:</strong> ${pattern.grammar}</p>
              <p class="mistake-note"><strong>Common mistake:</strong> ${pattern.mistake}</p>
            </article>`;
    })
    .join('\n');

  return `<div class="pattern-grid">${cards}
          </div>`;
}

function renderPractice(week) {
  const { practice } = week;

  const patternCards = practice.pattern
    .map((item, index) => quizCard(`q${index + 1}`, item.prompt, item))
    .join('');

  const grammarCards = practice.grammar
    .map((item, index) => quizCard(`g${index + 1}`, item.prompt, item))
    .join('');

  const buildCards = practice.build
    .map((item, index) => quizCard(`b${index + 1}`, `Build: ${item.jumbled}`, item))
    .join('');

  const translateCards = practice.translate
    .map((item, index) => quizCard(`t${index + 1}`, item.hinglish, item))
    .join('');

  return `
        <section class="section" aria-labelledby="quiz-title">
          <h2 class="section-heading" id="quiz-title">Practice 1: pattern fill-ins</h2>
          <p class="section-subtitle">
            Blank me ek word likho. Capital letters aur extra spaces ki chinta mat karo. Check
            dabao, feedback dekho, phir agla.
          </p>
          <div class="quiz-grid">${patternCards}
          </div>
        </section>

        <section class="section" aria-labelledby="grammar-practice-title">
          <h2 class="section-heading" id="grammar-practice-title">Practice 2: grammar fill-ins</h2>
          <p class="section-subtitle">
            Ek word ya short form likho. Contractions aur full forms dono accepted hain.
          </p>
          <div class="quiz-grid">${grammarCards}
          </div>
        </section>

        <section class="section" aria-labelledby="build-title">
          <h2 class="section-heading" id="build-title">Practice 3: build the sentence</h2>
          <p class="section-subtitle">
            Jumbled words ko sahi order me full sentence banao. Capital letters aur final
            punctuation ki chinta mat karo.
          </p>
          <div class="quiz-grid">${buildCards}
          </div>
        </section>

        <section class="section" aria-labelledby="translate-title">
          <h2 class="section-heading" id="translate-title">Practice 4: Hinglish → English</h2>
          <p class="section-subtitle">
            Hinglish prompt ka English version likho. Ek se zyada sahi answers accepted hain; wrong
            attempt par model answer dikhega.
          </p>
          <div class="quiz-grid">${translateCards}
          </div>
        </section>`;
}

function renderDialogue(dialogue) {
  const lines = dialogue.lines
    .map(
      (line) => `
            <div class="dialogue-line">
              <span class="speaker">${line.speaker}</span>
              <p${line.target ? ' class="dialogue-target"' : ''}>${line.text}</p>
              ${sayButton(line.say || line.text)}
            </div>`,
    )
    .join('\n');

  return `<div class="dialogue">${lines}
          </div>
          <p class="section-subtitle">${dialogue.closing}</p>`;
}

function renderLesson(week, previous, next) {
  const grammarRows = week.grammarRules
    .map(([rule, example]) => `                <tr><td>${rule}</td><td>${example}</td></tr>`)
    .join('\n');

  const mistakes = week.mistakes
    .map(
      ([wrong, right, note]) => `
            <article class="note-card mistake-card">
              <p class="wrong">✗ ${wrong}</p>
              <p class="right">✓ ${right}</p>
              <p>${note}</p>
            </article>`,
    )
    .join('\n');

  const repeatLines = week.repeat
    .map(
      (line) => `
            <div class="repeat-line">
              <p>${line}</p>
              ${sayButton(line)}
            </div>`,
    )
    .join('\n');

  const speakCards = week.speakPrompts
    .map(
      (prompt) => `
            <article class="speak-card">
              <h3>${prompt.title}</h3>
              <p>${prompt.prompt}</p>
              <p class="starter">${prompt.starter}</p>
            </article>`,
    )
    .join('\n');

  const vocabCards = week.vocab
    .slice(0, 6)
    .map(
      (item) => `
            <article class="vocab-card">
              <h3>${item.word}</h3>
              <p><strong>${item.collocation}</strong></p>
              <p class="vocab-example">${item.example}</p>
            </article>`,
    )
    .join('\n');

  const checks = week.selfCheck
    .map(
      (item, index) => `
            <li>
              <input type="checkbox" id="check-${index + 1}" />
              <label for="check-${index + 1}">${item}</label>
            </li>`,
    )
    .join('');

  const pronunciation = week.pronunciation
    .map(
      (item) => `
            <article class="note-card">
              <h3>${item.title}</h3>
              <p>${item.body}</p>
            </article>`,
    )
    .join('\n');

  const followUps = week.followUps.map((item) => `<li>${item}</li>`).join('\n              ');

  const nav = [
    previous
      ? `<a class="btn" href="${lessonFile(previous)}">← Week ${previous.number}</a>`
      : '',
    `<a class="btn" href="index.html">All weeks</a>`,
    next ? `<a class="btn" href="${lessonFile(next)}">Week ${next.number} →</a>` : '',
  ]
    .filter(Boolean)
    .join('\n            ');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f766e" />
    <meta name="description" content="${esc(week.description)}" />
    <title>Week ${week.number} · ${week.title} | Bol</title>
    <link rel="stylesheet" href="../assets/course.css" />
    <script src="../assets/quiz.js" defer></script>
    <script src="../assets/say.js" defer></script>
  </head>
  <body>
    <div class="page">
      <header class="site-header no-print">
        <a class="brand" href="index.html"><span class="brand-mark">B</span> Bol</a>
        <div class="header-actions">
          <a class="btn" href="../reference/${referenceFile(week)}">Week ${week.number} patterns</a>
        </div>
      </header>

      <main>
        <section class="hero">
          <p class="eyebrow">Week ${week.number} · Weekly Lesson</p>
          <h1>${week.title}</h1>
          <p class="lead">${week.lead}</p>
          <div class="lesson-meta">
            <span class="pill">25–30 min</span>
            <span class="pill">6 patterns</span>
            <span class="pill">grammar + practice</span>
            <span class="pill">Week ${week.number} mission</span>
          </div>
        </section>

        <section class="section" aria-labelledby="roadmap-title">
          <h2 class="section-heading" id="roadmap-title">Week ${week.number} roadmap</h2>
          <p class="section-subtitle">
            Lesson ${week.number} = is hafte ka weekly lesson; Day 1–6 = daily practice. Ye page poore
            hafte ka map hai.
          </p>
          <div class="roadmap-grid">
            <article class="roadmap-card">
              <p class="roadmap-step">Lesson ${week.number} · Weekly lesson</p>
              <h3>Ye page — 25–30 min</h3>
              <p>
                6 patterns, grammar notes, practice, dialogue aur 60-second self-check. Core
                25–30 min; practice optional extra.
              </p>
            </article>
            <article class="roadmap-card">
              <p class="roadmap-step">Day 1–6 · Daily practice</p>
              <h3>Roz 15–30 min</h3>
              <p>
                Har din do patterns bolo, paanch words use karo, aur ek 30–45 second recording
                karo. Lesson ko roz dobara mat padho.
              </p>
            </article>
            <article class="roadmap-card">
              <p class="roadmap-step">Day 7 · Review + benchmark</p>
              <h3>Recall + 60-second recording</h3>
              <p>Purane patterns bina dekhe bolo, quiz karo, aur apna benchmark record karo.</p>
            </article>
          </div>
        </section>

        <section class="section" aria-labelledby="patterns-title">
          <h2 class="section-heading" id="patterns-title">The 6 patterns</h2>
          <p class="section-subtitle">
            Pehle poora pattern bolo. Phir apni details me badal ke bolo. Suno button se model
            pronunciation sun sakte ho.
          </p>
          ${renderPatterns(week)}
        </section>

        <section class="section" aria-labelledby="grammar-title">
          <h2 class="section-heading" id="grammar-title">Grammar corner</h2>
          <p class="section-subtitle">
            Ye rules Week ${week.number} ke saare patterns cover karte hain. Ratta nahi — bolte time apply karo.
          </p>
          <div class="table-wrap">
            <table class="grammar-table rules-table">
              <thead>
                <tr><th scope="col">Rule</th><th scope="col">Example</th></tr>
              </thead>
              <tbody>
${grammarRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" aria-labelledby="mistakes-title">
          <h2 class="section-heading" id="mistakes-title">Common mistakes</h2>
          <p class="section-subtitle">
            Ye 6 galtiyan Week ${week.number} me sabse zyada hoti hain. Pehle wrong bolo, phir right — loud.
          </p>
          <div class="mistake-grid">${mistakes}
          </div>
        </section>
${renderPractice(week)}

        <section class="section" aria-labelledby="listen-title">
          <h2 class="section-heading" id="listen-title">Listen and repeat</h2>
          <p class="section-subtitle">
            Suno → 2 second pause → bolo. Do rounds: pehle text dekho, phir screen se nazar hatao.
          </p>
          <div class="repeat-list">${repeatLines}
          </div>
        </section>

        <section class="section" aria-labelledby="dialogue-title">
          <h2 class="section-heading" id="dialogue-title">Model dialogue</h2>
          <p class="section-subtitle">
            ${week.dialogue.context} Target lines ko apni details se replace karke bolo.
          </p>
          ${renderDialogue(week.dialogue)}
        </section>

        <section class="section" aria-labelledby="speak-title">
          <h2 class="section-heading" id="speak-title">4 speak prompts</h2>
          <p class="section-subtitle">Phone me 30–45 seconds record karo. Perfect nahi, clear hona chahiye.</p>
          <div class="speak-grid">${speakCards}
          </div>
        </section>

        <section class="section" aria-labelledby="vocab-title">
          <h2 class="section-heading" id="vocab-title">Vocabulary in action</h2>
          <p class="section-subtitle">
            Sirf word yaad nahi — collocation ke saath bolo. Apne 60-second answer me do words use
            karo.
          </p>
          <div class="vocab-grid">${vocabCards}
          </div>
        </section>

        <section class="section" aria-labelledby="selfcheck-title">
          <h2 class="section-heading" id="selfcheck-title">60-second self-check</h2>
          <p class="section-subtitle">
            Phone me 60 seconds record karo. Neeche checklist se score karo; 5/6 = ready.
          </p>
          <ul class="checklist">${checks}
          </ul>
          <p class="section-subtitle">
            3/6 = ek pattern dobara bolo, phir record karo. Recording suno, ek cheez sudharo,
            dobara record karo.
          </p>
        </section>

        <section class="section" aria-labelledby="pronunciation-title">
          <h2 class="section-heading" id="pronunciation-title">Pronunciation quick check</h2>
          <div class="pronunciation-grid">${pronunciation}
          </div>
        </section>

        <section class="section">
          <div class="callout">
            <h3>Week ${week.number} mission</h3>
            <p>${week.mission}</p>
            <p>
              Mission ko Day 7 se pehle karo. Ek asli insaan ke saath, ya phone par record
              karke. Perfect English nahi — clear English target hai.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="callout">
            <h3>Teacher ko follow-up poochho</h3>
            <p>Lesson ke baad ye questions ready rakho:</p>
            <ul>
              ${followUps}
            </ul>
          </div>
        </section>

        <section class="section">
          <div class="callout">
            <h3>Primary source</h3>
            <p>
              Is hafte ka best free source:
              <a href="${week.source.url}" target="_blank" rel="noreferrer">${week.source.label}</a>.
              ${week.source.note}
            </p>
            <p>
              Pronunciation aur meaning ke liye
              <a href="https://dictionary.cambridge.org/" target="_blank" rel="noreferrer">Cambridge Dictionary</a>
              use karo.
            </p>
          </div>
        </section>

        <section class="section">
          <div class="callout">
            <h3>Printable reference</h3>
            <p>
              Saare 6 patterns, grammar rules, mistakes, phrases aur pronunciation notes ek sheet me
              hain. Print karke desk ke paas rakho.
            </p>
            <p>
              <a class="btn btn-primary" href="../reference/${referenceFile(week)}">Printable reference</a>
            </p>
          </div>
        </section>

        <nav class="section no-print" aria-label="Lesson navigation">
          <div class="header-actions">
            ${nav}
          </div>
        </nav>
      </main>

      <footer class="footer">
        <p>
          Practice sources:
          <a href="https://dictionary.cambridge.org/" target="_blank" rel="noreferrer">Cambridge Dictionary</a>
          aur
          <a href="https://www.bbc.co.uk/learningenglish/" target="_blank" rel="noreferrer">BBC Learning English</a>.
        </p>
        <p>Bol · Week ${week.number} · Weekly Lesson · Hinglish explanations, English practice.</p>
      </footer>
    </div>
  </body>
</html>
`;
}

function renderReference(week) {
  const grammarRows = week.grammarRules
    .map(([rule, example]) => `                <tr><td>${rule}</td><td>${example}</td></tr>`)
    .join('\n');

  const patterns = week.patterns
    .map(
      (pattern, index) => `
            <article class="ref-pattern">
              <h3>${index + 1}. ${pattern.frame}</h3>
              <p><strong>+</strong> ${pattern.positive}</p>
              <p><strong>−</strong> ${pattern.negative}</p>
              <p><strong>?</strong> ${pattern.question}</p>
            </article>`,
    )
    .join('\n');

  const mistakes = week.mistakes
    .map(
      ([wrong, right, note]) => `                <tr>
                  <td class="wrong">${wrong}</td>
                  <td class="right">${right}</td>
                  <td>${note}</td>
                </tr>`,
    )
    .join('\n');

  const phrases = week.phrases
    .map(([phrase, meaning]) => `<li><strong>${phrase}</strong> — ${meaning}</li>`)
    .join('\n              ');

  const words = week.vocab
    .map(
      (item) => `                <li>
                  <strong>${item.word}</strong> — ${item.meaning}
                  <span>${item.collocation} · ${item.example}</span>
                </li>`,
    )
    .join('\n');

  const pronunciation = week.pronunciation
    .map((item) => `<li><strong>${item.title}:</strong> ${item.body}</li>`)
    .join('\n              ');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f766e" />
    <meta
      name="description"
      content="Printable Week ${week.number} English reference: ${week.patterns.length} patterns, grammar rules, common mistakes, phrases, words, and pronunciation notes."
    />
    <title>Week ${week.number} patterns | Bol reference</title>
    <link rel="stylesheet" href="../assets/course.css" />
  </head>
  <body>
    <div class="page">
      <header class="site-header no-print">
        <a class="brand" href="index.html"><span class="brand-mark">B</span> Bol</a>
        <div class="header-actions">
          <a class="btn" href="../lessons/${lessonFile(week)}">Back to lesson</a>
          <button class="print-btn" type="button" onclick="window.print()">Print</button>
        </div>
      </header>

      <main>
        <section class="reference-hero">
          <p class="eyebrow">Bol · Week ${week.number} reference</p>
          <h1>${week.title}</h1>
          <p class="lead">
            ${week.patterns.length} patterns · ${week.grammarRules.length} grammar rules · ${week.mistakes.length} mistakes ·
            ${week.phrases.length} phrases · ${week.vocab.length} words. Client call se pehle 2 minute
            is sheet par eye scan karo, phir loud bolo.
          </p>
        </section>

        <section class="section" aria-labelledby="grammar-title">
          <h2 class="section-heading" id="grammar-title">Grammar quick rules</h2>
          <div class="table-wrap">
            <table class="grammar-table rules-table">
              <thead>
                <tr><th scope="col">Rule</th><th scope="col">Example</th></tr>
              </thead>
              <tbody>
${grammarRows}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section" aria-labelledby="patterns-title">
          <h2 class="section-heading" id="patterns-title">${week.patterns.length} patterns</h2>
          <div class="ref-grid">${patterns}
          </div>
        </section>

        <section class="section" aria-labelledby="mistakes-title">
          <h2 class="section-heading" id="mistakes-title">Common mistakes</h2>
          <div class="table-wrap">
            <table class="grammar-table mistake-table">
              <thead>
                <tr><th scope="col">Wrong</th><th scope="col">Right</th><th scope="col">Why</th></tr>
              </thead>
              <tbody>
${mistakes}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section page-break" aria-labelledby="phrases-title">
          <h2 class="section-heading" id="phrases-title">Phrase bank</h2>
          <ul class="phrase-list">
              ${phrases}
          </ul>
        </section>

        <section class="section" aria-labelledby="words-title">
          <h2 class="section-heading" id="words-title">Words in action</h2>
          <div class="word-columns">
            <ul class="word-list">
${words}
            </ul>
          </div>
        </section>

        <section class="section" aria-labelledby="pronunciation-title">
          <h2 class="section-heading" id="pronunciation-title">Pronunciation notes</h2>
          <ul class="phrase-list">
              ${pronunciation}
          </ul>
        </section>

        <section class="section">
          <div class="callout">
            <h3>Week ${week.number} mission</h3>
            <p>${week.mission}</p>
            <p class="tagline">
              Sources: ${week.source.label} · Cambridge Dictionary · BBC Learning English.
            </p>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>Bol · Week ${week.number} · Printable reference · Hinglish explanations, English practice.</p>
      </footer>
    </div>
  </body>
</html>
`;
}

function renderLessonIndex(weeks) {
  const cards = weeks
    .map(
      (week) => `
            <article class="roadmap-card">
              <p class="roadmap-step">Week ${week.number}</p>
              <h3><a href="${lessonFile(week)}">${week.title}</a></h3>
              <p>${week.lead}</p>
              <p><a href="../reference/${referenceFile(week)}">Printable reference</a></p>
            </article>`,
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f766e" />
    <meta name="description" content="Bol weekly English lessons, Week 1 to Week 12." />
    <title>Weekly lessons | Bol</title>
    <link rel="stylesheet" href="../assets/course.css" />
  </head>
  <body>
    <div class="page">
      <header class="site-header no-print">
        <a class="brand" href="../index.html"><span class="brand-mark">B</span> Bol</a>
        <div class="header-actions">
          <a class="btn" href="../index.html">Open app</a>
        </div>
      </header>

      <main>
        <section class="hero">
          <p class="eyebrow">Bol · Weekly lessons</p>
          <h1>From introducing yourself to closing a call</h1>
          <p class="lead">
            Barah weekly lessons. Har hafte ek core situation, 6 patterns, drills, dialogue aur ek
            asli mission. Ek hafte me ek lesson — saare ek saath mat karo.
          </p>
          <div class="lesson-meta">
            <span class="pill">12 weeks</span>
            <span class="pill">72 patterns</span>
            <span class="pill">printable sheets</span>
          </div>
        </section>

        <section class="section" aria-labelledby="weeks-title">
          <h2 class="section-heading" id="weeks-title">All weeks</h2>
          <p class="section-subtitle">
            Week 1 se shuru karo. Jab Week 1 ka benchmark aur mission ho jaye, tab Week 2 kholo.
          </p>
          <div class="roadmap-grid">${cards}
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>Bol · Weekly lessons · Hinglish explanations, English practice.</p>
      </footer>
    </div>
  </body>
</html>
`;
}

function renderReferenceIndex(weeks) {
  const items = weeks
    .map(
      (week) =>
        `<li><a href="${referenceFile(week)}">Week ${week.number} — ${week.title}</a></li>`,
    )
    .join('\n              ');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0f766e" />
    <title>Reference sheets | Bol</title>
    <link rel="stylesheet" href="../assets/course.css" />
  </head>
  <body>
    <div class="page">
      <header class="site-header no-print">
        <a class="brand" href="../index.html"><span class="brand-mark">B</span> Bol</a>
        <div class="header-actions">
          <a class="btn" href="../lessons/index.html">All lessons</a>
        </div>
      </header>
      <main>
        <section class="reference-hero">
          <p class="eyebrow">Bol · Reference sheets</p>
          <h1>Print, keep, and scan before a call</h1>
          <p class="lead">Har week ki pattern sheet. Ek page, loud practice, no scrolling on a call.</p>
        </section>
        <section class="section">
          <h2 class="section-heading">All reference sheets</h2>
          <ul class="phrase-list">
              ${items}
          </ul>
        </section>
      </main>
      <footer class="footer">
        <p>Bol · Reference sheets · Hinglish explanations, English practice.</p>
      </footer>
    </div>
  </body>
</html>
`;
}

const files = (await readdir(contentDir)).filter((file) => /^week-\d+\.json$/.test(file));
const weeks = [];

for (const file of files) {
  const week = JSON.parse(await readFile(join(contentDir, file), 'utf8'));
  weeks.push(week);
}

weeks.sort((a, b) => a.number - b.number);

if (!weeks.length) {
  console.error('No week content found in content-src/weeks.');
  process.exit(1);
}

if (weeks[0].number !== 1) {
  console.error('Week 1 content is missing from content-src/weeks.');
  process.exit(1);
}

await mkdir(lessonsDir, { recursive: true });
await mkdir(referenceDir, { recursive: true });

for (const [index, week] of weeks.entries()) {
  if (week.handAuthored) {
    continue;
  }

  const previous = weeks[index - 1] || null;
  const next = weeks[index + 1] || null;

  await writeFile(
    join(lessonsDir, lessonFile(week)),
    renderLesson(week, previous, next),
    'utf8',
  );
  await writeFile(
    join(referenceDir, referenceFile(week)),
    renderReference(week),
    'utf8',
  );
}

await writeFile(join(lessonsDir, 'index.html'), renderLessonIndex(weeks), 'utf8');
await writeFile(join(referenceDir, 'index.html'), renderReferenceIndex(weeks), 'utf8');

console.log(`Generated ${weeks.length} weekly lessons and ${weeks.length} reference sheets.`);
