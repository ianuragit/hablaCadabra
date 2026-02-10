# Habla Cadabra

A mobile-first Spanish verb conjugation flashcard trainer for English speakers.

## Features

- Session setup with user name and **Include vosotros** toggle
- 10-round session: each round serves 50 unique verbs (sorted by frequency)
- Present tense conjugation practice with 540+ real Spanish verbs
- Flashcard with flip animation and self-grading (Right/Wrong)
- Keyboard shortcuts: `Space`/`Enter` to reveal, `R` for right, `W` for wrong
- Round analytics: score, accuracy, elapsed time, per-pronoun breakdown
- Focus list showing your top 10 weakest verb/pronoun combinations
- Shareable branded progress card with **Download as PNG**
- Conjugation cheat sheet with present tense endings and stem/irregular hints
- No backend, no persistence — pure client-side state

## Tech stack

- Next.js 14 (App Router) with `output: 'standalone'`
- TypeScript
- Tailwind CSS
- `html-to-image` for PNG export
- Client-side state only (no DB, no server storage)

## Local development

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Production build

```bash
npm run build
npm start
```

## Deploy to Railway

### Option A: Node buildpack (simplest)

1. Push this repository to GitHub.
2. In Railway, click **New Project** → **Deploy from GitHub repo**.
3. Select this repo. Railway auto-detects Node.js and runs:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm start`
4. Set environment variable: `PORT=3000`
5. Deploy. Railway assigns a public domain automatically.

### Option B: Docker

1. Push this repository to GitHub.
2. In Railway, click **New Project** → **Deploy from GitHub repo**.
3. Railway will detect the `Dockerfile` and build from it.
4. Set environment variable: `PORT=3000`
5. Deploy.

## Regenerating verb data

The verb dataset is pre-built in `lib/verbs.ts`. To regenerate:

```bash
node scripts/generate-verbs.mjs
```

This reads verb definitions from the generation script and outputs typed conjugation data.

## Notes

- Session resets on browser refresh by design.
- No localStorage or server-side storage is used.
- 540+ verbs with hardcoded present tense conjugations (including irregulars, stem-changers, -zco, -go, -guir, -ger/-gir patterns).
