# Master Builder — KaiCollections

A visual, searchable gallery of Kai's Lego builds, paper crafts, and art. Data-driven from `content/creations.json`, zero dependencies, plain static HTML/CSS/JS.

## Live site
https://kulimar.github.io/KaiCollection/ (GitHub Pages, `gh-pages` branch — gallery only)

## Features
- Masonry gallery with category filters (Lego / Paper Craft / Art), search, and sort
- Lightbox with keyboard/touch navigation and a 30-second auto-advance slideshow timer
- Looping background music with fade-in, mute toggle, and volume slider
- Responsive, respects `prefers-reduced-motion`

## Run locally
```bash
npm start
```
Then open http://localhost:3000.

## Content manager (local only)
`manager.html` + `manager-server.js` provide drag-and-drop import, reorder, and caption/date editing. These are **never published** — they exist only on `main` and run only on localhost.

## Working docs
- `CLAUDE.md` — project constitution and privacy rules
- `docs/system-architecture.md` — architecture
- `docs/dev-handoff.md` — current state and next steps
- `tasks/todo.md` — working plan
- `tasks/lessons.md` — root-cause rules

## Privacy
Published images are curated web derivatives with all EXIF (including GPS) stripped. Original photos live outside this repository and are never committed.
