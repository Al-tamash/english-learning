# Bol — Daily English System

**Design document · 2026-10-24 · Working title: "Bol"**

---

## Aapke liye summary (Hinglish)

Aapke liye ek **personal English practice system** banega jo browser me chalega — laptop aur phone dono pe. Roz 30 minute ka session hoga:

1. Kal ki sentences bolna (2 min)
2. Aaj ka ek sentence pattern (6 min)
3. 5 naye words/phrases jo aapke kaam aur life ke hain (5 min)
4. Audio sunke saath-saath bolna aur record karna (6 min)
5. Real scenario — client call, colleague se baat, shop pe milna — bolke record karna (9 min)
6. Quick revision + streak (2 min)

Har hafte ek theme hai (apna intro, client kickoff, project update, payment follow-up, etc.) aur har hafte ek real-life mission. **12 hafte, 84 din.** Din calendar se nahi, aapke complete kiye hue dinon se badhenge — ek din chhoot gaya to content skip nahi hoga, wahi din aage aayega. 30 minute na ho to 15 minute ka short session bhi hai. Grammar book ke order pe nahi — bolne ke patterns pe. Grammar usi pattern ke andar chhoti dose me aayegi. Words spaced repetition se wapas aate rahenge, isliye alag se "yaad" nahi karne padenge.

Progress phone aur laptop dono pe same rahega. Aapki voice recording sirf aapke device pe rahegi, upload nahi hogi.

Aapko ek baar karna hoga: Cloudflare account (aapke paas hai), free Supabase account, aur sync ke liye email login. Uske baad roz sirf app kholna aur "Start" dabana.

---

## 1. Context and intent

The user is a 26-year-old Hindi-first web developer at Edone Solutions, in the final semester of a BCA degree. He builds websites and meets clients by phone, WhatsApp, video call, and occasionally in person. He can read some English but cannot produce sentences live. Pronunciation is unclear to him, and he freezes when a client or colleague speaks English.

He owns three books — *Intermediate English Grammar* (Raymond Murphy, 2nd Indian edition), *High School English Grammar & Composition* (Wren & Martin), and *Word Power Made Easy* — and has finished none. He has studied tenses and modals before but cannot use them in speech. He believes the missing pieces are "complete grammar" and "more words."

The system is built on the opposite diagnosis: he has studied enough rules; he has not built the habit of **producing** sentences. Grammar and vocabulary are taught only as material for speaking, in the order speaking needs them.

**Intent:** a self-follow daily system that turns 30 minutes into speaking practice, builds automatic sentence patterns, and gives honest weekly evidence of progress — usable on the phone he always carries and the laptop he works on.

---

## 2. Goals, non-goals, anti-goals

### Goals

- By the end of 12 weeks, handle routine client interactions (intro, kickoff, status update, clarification, delay, payment follow-up, scheduling) with understandable English and limited freezing.
- Hold everyday small talk with friends and colleagues: weekend, food, travel, work, plans, opinions.
- Build ~500 active words/phrases and ~40 reusable sentence patterns.
- Improve intelligibility (not accent removal): v/w, th, s/sh, word stress, -ed endings, sentence rhythm.
- Daily 30-minute session, one tap to start, works offline, progress synced across laptop and phone.
- Produce visible evidence: weekly recordings of the same benchmark prompts, compared over 12 weeks.

### Non-goals

- A complete grammar reference or a substitute for Murphy/Wren & Martin.
- Exam preparation (IELTS, TOEFL, competitive exams).
- Accent elimination or "native-like" pronunciation.
- A general vocabulary trainer or dictionary.
- Social features, leaderboards, multi-user support.
- An AI conversation tutor in v1.
- Payments or monetisation.
- Push notifications in v1.

### Anti-goals

- **Another unfinished book.** If a session feels like reading grammar rules, the design has failed.
- **Passive consumption.** Every session must include spoken output. Watching/listening alone does not count.
- **Friction.** Login prompts, sync conflicts, or a 5-screen setup before practice will kill the habit.
- **Shame.** No red Xs, no "failed" days, no harsh pronunciation scores. Self-assessment is primary.
- **Scope creep into a full LMS.** One learner, one path, 84 days.

---

## 3. Constraints

- **Time:** 30 minutes/day target. A 15-minute short session exists for busy days. The core path is capped at ~30 minutes; optional extras (extra review, replay) are never required.
- **Devices:** Windows laptop and an Android phone (Chrome). Mobile-first UI; laptop layout is a wider version of the same flow. iOS is out of scope for v1.
- **Connectivity:** daily internet is available, but practice must survive patchy connectivity. Content and session logic offline; sync when online.
- **Language:** explanations in simple Roman Hinglish; all practice material in English. The learner reads English slowly, so instructions must be short and scannable.
- **Tone:** for a 26-year-old working professional. No childish mascots, no "good job!" overload. Respectful, direct, practical.
- **Cost:** free tiers only. No paid TTS, speech, or hosting APIs.
- **Privacy:** voice recordings stay on the device; no recording upload. The speech keyword check may send microphone audio to the browser's speech service; it runs only after a one-time consent screen and can be turned off in Settings.
- **Environment:** built in `C:\english-learning`, a currently empty folder. Not yet a git repository.
- **Single user:** no roles, invitations, or admin panel.

---

## 4. Approaches considered

### A. Hosted PWA with cloud sync — **chosen**

React/Vite PWA deployed to Cloudflare Pages, content bundled at build time, Supabase (Postgres + magic-link auth) for progress and SRS sync. Installable on the phone home screen; works offline after first load.

- **Pros:** one link on both devices; progress follows the learner; real cross-device habit; free tiers sufficient; the learner is a web developer and can handle a one-time setup.
- **Cons:** one-time account setup (Supabase, Cloudflare; email login optional); internet needed for first load and sync; Supabase free-tier project pauses after inactivity (acceptable for daily use).

### B. Local-only app with manual export/import — rejected

Same PWA, no backend. Data in IndexedDB, progress moved between devices via an export code or file.

- **Pros:** zero accounts, fully private, no hosting.
- **Cons:** the learner alternates devices daily. Manual sync is the exact friction that breaks a 30-minute habit. A lost phone or cleared browser data loses progress.

### C. Static daily-plan pack (PDF/HTML + audio) — rejected

A folder of daily pages and audio, no app state.

- **Pros:** simplest to produce; printable.
- **Cons:** no tracking, no SRS, no recording workflow, no feedback loop. It becomes another book — the failure mode this project exists to avoid.

---

## 5. The learning design

### 5.1 Principles

1. **Speaking first.** The majority of each session is the learner talking, not reading.
2. **Patterns, not chapters.** One reusable sentence frame per day, practised in positive, negative, and question form, then filled with the learner's own world.
3. **High-frequency, personally relevant language.** Words and scenarios come from client work, office chat, and daily life — not from a generic word list.
4. **Spaced repetition, low daily load.** 5 new items/day with reviews capped at 10 due items.
5. **Listen → shadow → record → compare.** Pronunciation work is embedded in dialogue practice, not a separate phonetics course.
6. **Real scenarios, not dialogues to memorise.** The app gives the other person's line; the learner must respond in their own words.
7. **Evidence over vibes.** The same benchmark recording is repeated weekly; progress is heard, not guessed.
8. **Forgiving streak.** Consistency is shown as a weekly percentage with grace days; missing one day does not reset everything.

### 5.2 Twelve-week arc

| Week | Theme | Core patterns | Grammar woven in |
|---|---|---|---|
| 1 | Introduce yourself and your work | I am… / I work at… / I build… | Present simple: be, have, do |
| 2 | Daily routine and small talk | I usually… / Do you…? / What about you? | Present simple, frequency adverbs |
| 3 | Asking and clarifying | Can you repeat…? / What do you mean by…? / Could you explain…? | Question forms, polite requests |
| 4 | Client kickoff call | We need… / I'd like to… / Could you share…? / Let's… | would/could, let's |
| 5 | Project updates and status | I've finished… / I'm working on… / It will take… | Present perfect vs past simple (light) |
| 6 | Explaining technical work simply | It's like… / This allows… / The problem is… | Connectors, simple relative clauses |
| 7 | Calls and messages | Can you hear me? / Let me share… / I'll call you back… | Imperatives, future forms |
| 8 | In-person meetings | Nice to meet you… / Let me show you… / Would you like…? | Offers, would like |
| 9 | Problems, delays, apologies | I'm sorry… / There was an issue… / It's delayed because… | Past simple, because/so |
| 10 | Money, quotes, follow-ups | The cost is… / Could you confirm…? / When can we expect…? | Numbers, polite questions |
| 11 | Opinions and suggestions | I think… / Why don't we…? / I agree… | Comparatives, opinion frames |
| 12 | Fluency and real calls | Mixed review; mock calls; storytelling | Conditionals (basic), mixed review |

Each week has 7 days: 6 learning days + 1 review/mission day. 84 days total.

**Pacing is completion-based, not calendar-based.** Weeks are content weeks. Today always shows the next unfinished day; a missed day is not skipped. The 12-week arc is an estimate of elapsed effort, not a deadline. Streaks are calendar-based and separate from path progress. Benchmarks and missions become due when the learner completes that content week's Day 7, not on a fixed date. `profiles.current_week` is a cached display value derived from completed days.

### 5.3 The daily 30-minute session

| Stage | Time | What happens |
|---|---|---|
| 1. Warm-up | 2 min | 5 sentences from yesterday. Hindi/context prompt → learner says the English → reveal → self-mark "aaya / nahi aaya". |
| 2. Pattern | 6 min | One frame with positive, negative, question forms. Model audio, Hinglish note, 6 substitutions from the learner's world. Learner says each aloud. |
| 3. Words | 5 min | 5 new items (word or phrase): Hinglish meaning, one collocation, one work/life example. Due SRS reviews appear here (cap 10). Quick recall check. |
| 4. Listen & shadow | 6 min | 6-line dialogue with audio (two TTS voices). Line-by-line repeat, record, compare. One pronunciation focus (e.g., v vs w) with 2 minimal pairs. |
| 5. Real scenario | 9 min | A 4-turn situation (client asks what you do; colleague invites you to lunch; shop owner asks budget). The other person's lines are given; the learner responds and records. Keyword check if enabled. Model answer revealed only after the attempt. Self-review: Did I answer? Did I use today's pattern? Was I understandable? |
| 6. Wrap | 2 min | 3 quick recalls, today's speaking time, streak, tomorrow preview. On some days: a real-life mission. |

**Session budget.** The core path is 2 + 6 + 5 + 6 + 9 + 2 = 30 minutes with the counts above. Timers are guides, not auto-advance. Extra substitutions, extra dialogue lines, and extra scenario turns are optional and clearly marked. On a busy day the learner can choose **Short session (15 min)**: warm-up + pattern + scenario; words and shadowing roll into the next session's review. The app never blocks completion because the clock ran out.

Day 7 replaces stages 2–5 with a 15-minute mixed review and a 10-minute weekly benchmark recording, plus a 5-minute real-world mission.

### 5.4 Patterns

A pattern is a frame with three forms and a short Hinglish note. Example (Day 1):

- **Frame:** I work at ___ as a ___.
- **Positive:** I work at Edone Solutions as a web developer.
- **Negative:** I don't work at a big company.
- **Question:** Where do you work?
- **Note:** Company ke pehle **at**, role ke pehle **as**.
- **Substitutions:** a client's office / a small team / a startup / Mumbai / remotely / my uncle's shop.

Patterns repeat across weeks in new situations. The learner is not expected to recall a rule name — only to produce the frame.

### 5.5 Vocabulary and SRS

- 5 new items per learning day (Days 1–6); 30 per week; ~360 core items over 12 weeks, plus ~140 fixed phrases (e.g., "Could you repeat that?", "I'll get back to you") for ~500 total.
- Each item: term, Hinglish meaning, one collocation, one example tied to work or daily life, tags (work / small talk / calls / money).
- SRS: simplified SM-2. Ratings Again / Hard / Good / Easy. Intervals 1, 3, 7, 14, 30, 60 days. Daily due cap 10; overdue items roll forward without penalty.
- New words appear in that day's pattern and scenario wherever possible, so they are produced, not just recognised.
- Word list is curated, not scraped: no rare or exam-only words in the first 12 weeks.

### 5.6 Listening, shadowing, pronunciation

- Dialogues are 6–8 lines, 60–90 seconds, written for the week's theme.
- Audio: browser speech synthesis with two distinct voices (one en-IN if available, otherwise en-US/en-GB), adjustable rate (default 0.85).
- Shadowing: listen once, then repeat each line while recording, then play both back.
- One focus per day: v/w, th, s/sh, -ed endings, word stress, sentence rhythm, or a commonly confusing pair for Hindi speakers.
- Target is intelligibility, not accent. The app never scores "accent".

### 5.7 Scenarios

Each learning day has one 4-turn core scenario (up to 2 optional extra turns). The other speaker's lines are shown and played; the learner's turns are prompted with a Hinglish hint, then recorded. Expected keywords enable a soft check ("3 of 4 key words caught") where speech recognition exists. The model answer is shown after the attempt. Self-rating is a 3-question checklist, not a score.

Scenario sources: client kickoff, standup, bug explanation, delay apology, payment follow-up, scheduling, WhatsApp voice note, shop visit, meeting a friend, introducing a colleague, explaining a quote, saying no politely.

### 5.8 Weekly review, missions, and benchmarks

- **Day 7 review:** mixed quiz from the week (patterns, words, question forms); 10-minute benchmark recording.
- **Benchmark set (same every week):** introduce yourself (30s), describe your work (30s), talk about last weekend (30s), handle "Can you do it by Friday?" (30s). Stored locally with transcript and self-rating; compared week over week.
- **Benchmark retention:** all 12 weekly benchmarks are exempt from routine recording cleanup (~25 minutes of audio). They stay on the device in v1; moving them to a new phone is not automatic, and the JSON backup includes metadata and transcripts, not audio blobs. Daily practice recordings are pruned after 30 days by default.
- **Real-world mission:** one per week, e.g., send a 60-second English voice note to a friend, order in English at a shop, ask a colleague one question in English, record a fake client update and send it to yourself. Missions are logged with a simple "done / not done".

### 5.9 Measurement

| Measure | Target |
|---|---|
| Days completed | ≥ 80% over any 4-week window |
| Speaking time | ≥ 15 min/day recorded or self-reported |
| Vocabulary recall | ≥ 80% on due cards by Week 8 |
| Patterns | 40 patterns produced in a scenario at least once |
| Weekly benchmark | Self-rating improves from 1–2 to 4–5 by Week 12 |
| Hindi switching | Downward trend in benchmark transcripts (where recognition is available) |
| Real calls | By Week 12, complete one real client call using at least 5 target phrases |

### 5.10 Teaching workspace and weekly lessons

The folder also serves as a teaching workspace (see `MISSION.md` and `docs/curriculum-plan.md`):

- `lessons/NNNN-*.html` — 12 short, self-contained weekly lessons. Each teaches that week's patterns with interactive drills and links to the app's Week page.
- `reference/*.html` — printable pattern bank, phrase bank, and pronunciation notes.
- `learning-records/*.md` — evidence of what the learner can actually do; drives the next lesson.
- `RESOURCES.md` — trusted sources used for explanations.
- `NOTES.md` — learner preferences and watch-outs.

The app is the daily practice gym; the weekly lesson is the concept plus first practice; the reference sheet is quick review. Content IDs are shared between lessons and app days.

---

## 6. Product design

### 6.1 Screens

1. **Today** — greeting, streak and weekly consistency, today's session card (theme, pattern, minutes), one primary button: **Start 30 min**. If a session is paused, **Resume**. If done, **Review** and tomorrow preview.
2. **Session** — full-screen, one stage at a time, progress dots, timer, audio play buttons, large record button, reveal/self-mark controls. Exit confirms and saves a partial session.
3. **Progress** — calendar heatmap, speaking minutes, words strong/learning, patterns completed, benchmark recordings by week with playback, mission log.
4. **Library** — all 12 weeks and 84 days, replay any lesson; phrasebook filtered by tag; search.
5. **Settings** — TTS voice and rate, daily reminder (.ics download), sync status and "Sync now", export backup (JSON), delete all data, sign out.
6. **Onboarding** — 3 short screens: how it works, 2-minute baseline recording (optional, skippable), install to home screen, sign in.

### 6.2 Session state machine

`idle → warmup → pattern → words → shadow → scenario → wrap → done`

- Each stage saves progress on completion; leaving mid-stage saves a draft.
- Audio and recording controls are available on every speaking stage.
- "Skip for today" is allowed on any stage but logged; the app never blocks completion.
- Target duration is shown; the app does not hard-stop at 30 minutes.

### 6.3 Interaction rules

- One primary action per screen.
- Text is always visible for every audio line (no audio-only content).
- Recordings are one tap; playback is one tap; delete is one tap with confirm.
- No modal chains. No account prompts during a session.
- Hinglish UI labels with English practice content; instructions are one sentence where possible.

### 6.4 Visual direction

- Calm, professional, mobile-first. Warm neutral background, one accent colour, generous spacing, large tap targets (≥ 48px).
- Dark and light themes; system preference by default.
- Typography optimised for mixed Hinglish/English: a clean sans-serif with good Latin and Devanagari-adjacent fallback; no decorative fonts.
- Motion limited to stage transitions and recording state; respects reduced-motion.

---

## 7. Technical design

### 7.1 Stack

- **Frontend:** React 18 + TypeScript + Vite.
- **Styling:** Tailwind CSS with a small set of design tokens.
- **State:** Zustand with persist middleware (localStorage for small state, IndexedDB for recordings and sync queue).
- **PWA:** `vite-plugin-pwa` (manifest, service worker, precache app shell + content).
- **Backend:** Supabase (Postgres, Auth magic link, Row Level Security).
- **Audio:** Web Speech API `speechSynthesis` for model audio; `MediaRecorder` for recordings.
- **Speech check:** Web Speech API `SpeechRecognition` where available (Chrome/Edge desktop, Android Chrome); graceful fallback elsewhere.
- **Testing:** Vitest for units, Playwright for session and sync flows.
- **Deployment:** Cloudflare Pages static site; environment variables for Supabase URL and anon key.

No paid APIs. No server code of our own in v1.

### 7.2 Project structure

```
C:\english-learning\
  docs/                     design, setup, content guide
  public/                   icons, manifest assets
  src/
    app/                    routing, layout, theme
    screens/                Today, Session, Progress, Library, Settings, Onboarding
    session/                stage components, state machine, timers
    content/                day JSON, loader, types, validation helpers
    audio/                  tts.ts, recorder.ts, speech-check.ts
    srs/                    algorithm, scheduling, due queue
    sync/                   supabase client, outbox, merge
    store/                  zustand stores and selectors
    components/             shared UI
  content-src/              authored week/day JSON before build validation
  scripts/                  validate-content.ts, generate-manifest.ts
  supabase/migrations/      SQL schema and RLS
```

Content is authored as JSON, validated at build time, and bundled into the app. No CMS in v1.

### 7.3 Content schema (per day)

```jsonc
{
  "id": "w01d01",
  "week": 1,
  "day": 1,
  "type": "learning",
  "theme": "Introduce yourself and your work",
  "title": "What do you do?",
  "goal_hi": "Apna kaam aur company simple English me batana.",
  "pattern": {
    "id": "p_work_at",
    "frame": "I work at ___ as a ___.",
    "forms": {
      "positive": "I work at Edone Solutions as a web developer.",
      "negative": "I don't work at a big company.",
      "question": "Where do you work?"
    },
    "note_hi": "Company ke pehle 'at', role ke pehle 'as'.",
    "examples": [
      { "en": "I work at a startup as a designer.", "hi": "Main ek startup me designer hoon." }
    ]
  },
  "words": [
    {
      "id": "w_developer",
      "term": "developer",
      "hi": "software banane wala",
      "collocation": "web developer",
      "example_en": "I am a web developer.",
      "example_hi": "Main web developer hoon.",
      "tags": ["work"]
    }
  ],
  "dialogue": {
    "title": "New colleague",
    "context_hi": "Office me naye colleague se pehli baar baat.",
    "lines": [
      { "speaker": "A", "en": "Hi, I'm Rahul. What do you do?", "hi": "Hi, main Rahul. Aap kya karte ho?" },
      { "speaker": "B", "en": "I'm a web developer. I work at Edone Solutions.", "hi": "Main web developer hoon. Main Edone Solutions me kaam karta hoon." }
    ],
    "sound_focus": {
      "tip_hi": "'v' bolte waqt upper teeth lower lip ko chhue.",
      "pairs": ["vest / west", "vine / wine"]
    }
  },
  "scenario": {
    "id": "s_client_what_do_you_do",
    "title_hi": "Client poochta hai aap kya karte ho",
    "setting_hi": "Video call pe naya client.",
    "turns": [
      {
        "prompt_en": "So, what do you do at Edone?",
        "hint_hi": "Batao ki aap websites banate ho.",
        "keywords": ["web", "developer", "websites", "build"]
      }
    ]
  },
  "quiz": [
    { "type": "fill", "prompt": "I work ___ Edone Solutions.", "answer": "at" }
  ],
  "mission": null
}
```

Rules:

- Day IDs and item IDs are stable; SRS keys depend on them.
- A global word bank prevents duplicates; a word may reappear for review but only one canonical entry.
- Every scenario turn has at least two keywords.
- Every learning day (Days 1–6) has 5 words, one pattern, one dialogue of 6–8 lines, one scenario of 4–6 turns, and 3 quiz items. Day 7 is a review day (`type: "review"`) with a quiz, benchmark, and mission only; it introduces no new SRS cards.
- Validation fails the build on missing fields, duplicate IDs, or word-count mismatch.
- Content is reviewed for Hinglish tone and for Indian-English-specific pronunciation notes before shipping.

### 7.4 Audio and speech

- **TTS:** pick a male `en-IN` voice when available; otherwise a male `en-US` or `en-GB` voice. Use a second, distinct voice for the other dialogue speaker. Rate default 0.85, user-adjustable 0.6–1.2. The learner can change the voice in Settings. If no voice is available, show text and a warning; the session remains usable.
- **Recording:** `MediaRecorder` with `audio/webm` where supported, fallback `audio/mp4`. Stored as blobs in IndexedDB with day/stage metadata. Playback via object URL. A "clear recordings" action frees space.
- **Speech check (consent-based, on by default for Android Chrome):** run only for scenario turns. Normalise transcript, fuzzy-match against expected keywords, show "key words caught: 3/4". Never block progress. A one-time consent screen explains that the browser may process microphone audio in the cloud; the learner can decline or turn it off later in Settings. If declined or unavailable, hide the check and rely on self-review. The "Hindi switching" metric only exists when the check is enabled.
- **Privacy:** recordings never leave the device. The speech check uses the browser's speech service, which may process microphone audio in the cloud depending on browser and platform; it runs only after consent, and uses on-device processing when the browser exposes it. Only transcripts (optional), ratings, and timing sync.

### 7.5 Data model and sync

Supabase tables (all with RLS `user_id = auth.uid()`):

| Table | Purpose | Key |
|---|---|---|
| `profiles` | display name, start date, current week | `user_id` |
| `settings` | TTS voice, rate, reminder preference | `user_id` |
| `day_progress` | status, stage reached, completion time, speaking seconds, self-rating | `(user_id, day_id)` |
| `srs_cards` | ease, interval, due date, reps, lapses, last rating | `(user_id, item_id)` |
| `benchmarks` | week number, prompt id, duration, transcript, self-rating | `(user_id, week, prompt_id)` |
| `missions` | week number, mission id, done, note | `(user_id, week, mission_id)` |

- Every row carries `updated_at` and `device_id`.
- Local-first: writes go to Zustand/IndexedDB immediately; an outbox queues them for Supabase.
- Before sign-in, the same tables exist locally under an anonymous profile ID; the first successful sign-in merges that local data into the account.
- Pull on app open and on "Sync now": fetch rows updated since `last_pulled_at`; last-write-wins per row by `updated_at`.
- Conflicts are unlikely (single user, rarely simultaneous devices); per-row merge avoids clobbering unrelated progress.
- Sign-in (when the learner chooses it) requires internet. Sessions work offline before and after, and sync later.
- Export backup downloads a JSON of all local state; import restores it.

### 7.6 Auth and onboarding

- **Local-first, sign-in optional.** The app creates an anonymous local profile on first launch and is fully usable without an account. Sign-in is prompted once (skippable) with "Sync karo" messaging, not as a gate.
- Supabase magic link: enter email once per device, click the link, session persists. First sign-in requires internet; daily practice does not.
- On sign-in, local progress and SRS rows merge into the account using `updated_at` last-write-wins per row; the local anonymous ID is retired.
- If the session expires or Supabase is unreachable, the app keeps working locally and shows "Sync pending"; no practice is blocked. Re-authentication flushes the outbox.
- If the learner later prefers no email, a sync-code flow can replace magic links without changing the data model (future option, not v1).
- Onboarding: how it works → optional baseline recording → install prompt → optional sign-in. The first session can start without an account or baseline.

### 7.7 Offline and PWA

- Precache app shell, fonts, icons, and all content JSON. Audio is generated at runtime, so it works offline.
- Installable on Android Chrome (Add to Home Screen); desktop Chrome/Edge use the same PWA. v1 targets Android only.
- Update flow: new service worker waits; a non-blocking "Update ready" banner refreshes on tap.
- IndexedDB is the source of truth on device; Supabase is the sync layer.

### 7.8 Deployment and setup

- **Cloudflare Pages:** connect the repo (or use direct upload), build command `npm run build`, output directory `dist`, env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Add a `_redirects` rule (`/* /index.html 200`) for client-side routing. The free tier covers this project.
- Supabase: one project, run the SQL migration, enable email magic-link auth, set the deployed URL as the redirect allow-list entry.
- A `docs/setup.md` walks through Cloudflare Pages, Supabase, keys, migration, deploy, and phone install, with exact clicks and copy-paste values. The learner already has a Cloudflare account and has deployed a site, so this is a 15–20 minute one-time task.
- Local development: `npm install`, `npm run dev`, `npm run validate:content`, `npm run test`.

### 7.9 Testing

- **Unit:** SRS intervals and due caps, content schema validation, transcript matching, merge rules.
- **Integration:** completing a session writes day progress and SRS updates; offline queue flushes on reconnect; auth session persists.
- **E2E (Playwright):** complete Day 1 at mobile viewport with microphone permission mocked; reload and resume; complete a review day; sync between two browser contexts.
- **Content QA:** validation script plus human read-through of every week for tone, Hinglish accuracy, and scenario realism.
- **Manual:** install on the learner's phone, complete a real session, verify sync to laptop.

---

## 8. Content production plan

Content is the largest part of the work. The builder authors it; the learner reviews Week 1–2 in detail and then each batch, especially Hinglish tone and scenario realism. There is no separate reviewer. The learner is available for the Week 1 gate, the two-device sync test, and the phone install. Content is produced in batches, not all at once:

| Batch | Scope | Gate |
|---|---|---|
| 0 | Day 1 + schema + validation | App can run a full session with one day |
| 1 | Weeks 1–2 (14 days) | Learner completes Week 1; tone and difficulty adjusted |
| 2 | Weeks 3–4 | Client-call scenarios reviewed |
| 3 | Weeks 5–6 | Technical explanation scenarios reviewed |
| 4 | Weeks 7–8 | Call and in-person scenarios reviewed |
| 5 | Weeks 9–10 | Problem/payment scenarios reviewed |
| 6 | Weeks 11–12 | Benchmark prompts finalised |

Each batch: author JSON → validate → read aloud for naturalness → check word reuse and SRS IDs → spot-check TTS pronunciation of names/terms.

Authoring guidelines:

- Sentences ≤ 12 words in early weeks; ≤ 18 by Week 12.
- One new concept per day. No day introduces two patterns.
- Examples use the learner's real context: Edone Solutions, websites, clients, BCA college, Mumbai/office commute, shop visits, WhatsApp.
- Hinglish notes are explanatory, not transliterated English.
- No culturally obscure references; no idioms before Week 9; no phrasal-verb dumps.
- Dialogues sound like real Indian office conversations, not textbook English.

---

## 9. Build phases

| Phase | Deliverable | Exit criteria |
|---|---|---|
| 1. Foundation | Vite/React/TS/Tailwind scaffold, design tokens, PWA shell, content schema + validator, Day 1 content, session engine with TTS/recording, local persistence | Complete Day 1 offline on desktop and mobile viewport; reload resumes |
| 2. Core content | Weeks 1–2 authored and validated; Today, Progress (basic), Library, Settings | 14 days playable; learner completes Week 1 |
| 3. Sync | Supabase schema, magic-link auth, outbox, merge, export/import | Same progress on two devices after offline edits |
| 4. Full content | Weeks 3–12 in batches; benchmark recordings; missions; phrasebook | 84 days validated; all stages complete |
| 5. Polish and ship | Progress dashboard, onboarding, accessibility pass, deploy, setup guide, pilot week | Learner installs on phone, completes 7 consecutive days, no blocker bugs |

Phases 2 and 4 can overlap with 3. Phase 1 must not grow: it ends at one playable day.

---

## 10. Acceptance criteria

- A full 30-minute session and a 15-minute short session run end-to-end on a phone and a laptop, with model audio, recording, playback, reveal, and self-marking.
- Day progress and SRS survive reload, browser restart, and offline use.
- Progress made on the phone appears on the laptop (and vice versa) within one sync.
- All 84 days pass schema validation; each has the required elements; no duplicate item IDs.
- The learner can complete Week 1 without reading a grammar explanation longer than 2 sentences.
- Benchmarks from Week 1 and Week 4 can be played side by side on the same device, and all 12 survive routine recording cleanup.
- Recordings never leave the device (except microphone audio used by the consent-based browser speech check); export/delete works.
- Lighthouse PWA installability passes; app shell loads offline.
- Setup from zero (accounts to installed phone app) takes ≤ 30 minutes with the guide.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|---|---|
| App becomes another unfinished book | 30-min cap, speaking majority, no long reading, no grammar chapters |
| TTS voice quality varies by device | Voice picker, rate control, text always visible, allow replacing audio later |
| Speech recognition struggles with Indian accent | Keyword match only, never a hard score, skippable, self-review primary |
| Content volume delays launch | Day 1 first, then two-week batches; schema + validator; reuse patterns |
| Setup friction (Supabase/Cloudflare) | Step-by-step guide, exact values, one-time only; learner already uses Cloudflare |
| Habit breaks after a few days | One-tap start, offline, forgiving streak, weekly mission, visible progress |
| Phone storage fills with recordings | Auto-prune practice recordings older than 30 days (configurable), keep 12 benchmarks, storage indicator |
| Supabase free tier pauses | Daily use keeps it active; export backup available; document unpause step |
| Scope creep (AI tutor, social, payments) | Explicit non-goals; revisit only after 12-week pilot |

---

## 12. Decisions made by the builder (check these)

1. 12 content weeks × 7 days = 84 days; 30 minutes/day with a 15-minute short session; Day 7 is review + mission. Progress advances by completed days, not calendar dates.
2. Hinglish (Roman) explanations; English practice content. No Devanagari in v1.
3. Mobile-first PWA; Cloudflare Pages for hosting; Supabase for auth and sync; Android Chrome and desktop Chrome/Edge.
4. Local-first, optional magic-link sign-in; recordings stay local; only progress/SRS/optional transcripts sync.
5. Browser TTS + Web Speech API; male en-IN voice preferred; speech keyword check on by default after a one-time consent screen; no paid speech services.
6. 5 new vocabulary items/day on learning days (~500 total including phrases); SRS due cap 10.
7. One pattern per day, ~40 distinct patterns across 12 weeks.
8. No push notifications in v1; optional `.ics` daily reminder.
9. Content bundled at build time; JSON + build-time validation; no CMS.
10. Single user; no social, payments, or AI tutor in v1.
11. Benchmarks are exempt from 30-day recording cleanup; all 12 stay local, and the JSON backup excludes audio blobs.

## 13. Open questions for the learner

1. **Deadline:** any fixed date (college viva, client go-live, interview) to prioritise certain weeks?

Resolved setup choices: Android phone (Chrome) and Windows laptop; Cloudflare Pages hosting; speech keyword check on after a one-time consent screen (can be turned off); male en-IN voice preferred, with a male en-US/en-GB fallback.

## 14. Out of scope / future

- AI conversation partner with corrections (after the 12-week pilot).
- Human-recorded audio packs to replace TTS.
- Additional 12-week tracks (interview English, advanced client negotiation).
- Push reminders via web push and a scheduled Supabase function.
- Devanagari UI toggle and Hindi-medium grammar reference.
- Multi-learner support, sharing, and analytics.
