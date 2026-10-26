# Teaching Notes

## Preferences

- Hinglish (Roman) explanations; English practice. He writes Roman Hindi, not Devanagari.
- 30 minutes/day; 15-minute short session on busy days. Phone always; laptop sometimes.
- Android Chrome; Cloudflare Pages; male en-IN TTS preferred.
- Wants automatic voice feedback; speech check on after a one-time consent.
- Tone: 26-year-old working professional. No childish gamification or overpraise.
- Practical, work-first: client calls before generic textbook topics.

## Watch-outs

- Do not turn lessons into grammar chapters. He has unfinished grammar books; the bottleneck is sentence production, not rule knowledge.
- One pattern at a time. Short sentences in early weeks.
- Pronunciation target is intelligibility, not accent.
- He freezes in live calls; simulate real pressure gradually.
- Missing a day is normal; never make him feel behind.

## Workspace

- App design: `docs/superpowers/specs/2026-10-24-english-learning-system-design.md`
- Curriculum plan: `docs/curriculum-plan.md`
- App: React PWA in `src/`; build output in `dist/`.
- Weekly lessons: `lessons/` — Weeks 1–12 authored; start at `lessons/index.html`.
- Reference sheets: `reference/` — 12 printable pattern sheets.
- Daily app sessions: Week 1 only. Weeks 2–12 lessons are ready, but their app sessions still need authoring.
- Regenerate weekly lessons from `content-src/weeks/` with `npm run generate:lessons`. Week 1 is hand-authored and must not be regenerated.
