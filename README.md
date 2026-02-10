# Habla Cadabra

A mobile-first Spanish verb conjugation flashcard trainer for English speakers.

## Features

- Session setup with user name, tense mode, and **Include vosotros** toggle.
- 10-round session model; each round serves 50 weighted random verb cards.
- Tenses supported: Present Indicative, Preterite, Imperfect.
- Mixed mode hides the tense until reveal.
- Reveal flow + self-grading (Right/Wrong) with keyboard shortcuts:
  - `Space` / `Enter`: reveal
  - `R`: mark right
  - `W`: mark wrong
- Round analytics:
  - score, accuracy, elapsed time
  - by-tense and by-pronoun breakdowns
  - top 10 focus list of weakest verb/pronoun/tense items
- Shareable branded progress card with **Download as PNG** via `html-to-image`.
- Conjugation cheat sheet with tense tabs and stem/irregular hints.
- Built-in dataset with **600 verbs** including explicit conjugation maps for:
  - present
  - preterite
  - imperfect

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Client-side state only (no backend, no persistence)

## Local development

```bash
npm install
npm run dev
```

Visit: `http://localhost:3000`

## Production

```bash
npm run build
npm start
```

## Deploy to Railway (Node buildpack approach)

1. Push this repository to GitHub/GitLab.
2. In Railway, click **New Project** → **Deploy from GitHub repo**.
3. Select this repo.
4. Railway auto-detects Node and uses:
   - install: `npm install`
   - build: `npm run build`
   - start: `npm start`
5. Add environment variable:
   - `NODE_ENV=production`
6. Deploy.

Railway will assign a public domain automatically.

## Notes

- Session resets on browser refresh by design.
- No localStorage or server-side storage is used.
