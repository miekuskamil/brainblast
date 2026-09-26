# Brain Blast

Maths and literacy practice for Scottish **P7 / S1** learners (Curriculum for Excellence, Second → early Third
level). Offline-first React PWA; also ships as a single self-contained `brainblast.html` that runs by
double-click with no server and no network.

## What's inside

| | |
|---|---|
| Subjects | Maths (31 topics), Spelling (7), Writing & Grammar (17), Vocabulary (7) |
| Content | ~70 procedural maths styles × 3 difficulty tiers · 252 maths bank items · 298 spelling words · 501 grammar items · 172 vocab items · 6 reading passages |
| Learning engine | Leitner spaced repetition (1/3/7/21/60 days), per-topic mastery, mastery-driven difficulty tiers with parent override |
| Modes | Practice rounds, Daily challenge (all four subjects), Exam mode (10–30 questions, review-before-submit), Times Tables Turbo, Run & Learn platformer |
| Motivation | Coins, streaks with a grace day, garden, shop & collection — tuned so learning pays more than grinding |
| Parents | Grown-up gate on Settings, 4 profiles, readable progress view, backup/restore with validation |
| Accessibility | Read-aloud on every text block, dictated spelling words, dyslexia font stack, reduced motion, 44 px targets |

## Run it

```bash
npm install --legacy-peer-deps
npm run dev        # http://localhost:5173
npm test           # Vitest — ~1,080 tests
npm run build      # PWA into dist/
npm run bundle     # build + inline into ./brainblast.html (single file, offline)
```

## Project layout

```
src/
  App.jsx               screen state machine, rewards, persistence wiring
  app/                  pure App helpers (rewards, progress labels, resume, forms, PWA)
  components/           screens: Hub, Quiz, Exam, Game, TimesTable, screens.jsx, common UI
  curriculum/           question model, answer checking, subjects, generators, SVG visuals, item banks
  engine/               SRS review, mastery, difficulty, session builder, storage, exam, speech, sounds
  styles/app.css        design tokens + components (light/dark)
scripts/build-single.mjs  inlines the Vite build into brainblast.html
tests/                  core · engine · maths · literacy · visual · app · ui
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for how the pieces fit together.

## Principles

- **Offline, private, free.** No accounts, no network requests, no analytics. Everything lives in `localStorage`.
- **Fair marking.** Typed answers tolerate how children actually type (curly apostrophes, `9:20` vs `09:20`,
  `78p` vs `£0.78`) but reject wrong units and near-misses.
- **Never a dead end.** After two misses the answer is revealed with an explanation, then the round moves on.
- **Content is data.** Adding a topic means registering it in `curriculum/index.js`; nothing else changes.
