# Dev Handoff — Kai's Creations

Living log. Newest session on top: what changed, what's live, what's next, what will bite the next person.

---

## 2026-07-10 (later 4) — Volume control, slideshow timer, first publish

**What changed**
- Volume control: floating button (bottom-right) toggles mute; hovering/focusing it expands a volume slider (`index.html`, `js/audio.js`, `css/gallery.css`). Fade-in now targets the slider volume.
- Lightbox slideshow: a red line under the info row drains over 10s (was 30s, shortened same day at Kaz's request), then auto-advances to the next image, looping through the visible set. Manual nav or reopen restarts it; closing stops it (`js/gallery.js`).
- **Publish decision:** Kaz explicitly approved pushing everything to `main` and publishing the gallery via GitHub Pages. Recorded in CLAUDE.md; removed the `git push`/`gh api` deny rules from `.claude/settings.json` accordingly.
- Rewrote README for the renamed site (Master Builder — KaiCollections) with the live Pages link.
- Created orphan `gh-pages` branch containing ONLY the public gallery: `index.html`, `css/gallery.css`, `js/gallery.js`, `js/audio.js`, `content/creations.json`, `images/kai/`, `audio/`, `.nojekyll`. No manager, no server, no docs/tasks/.claude.

**Current state**
- `main` pushed to GitHub (public repo) including the 42 EXIF-stripped derivatives. `gh-pages` published at https://kulimar.github.io/KaiCollection/.
- Manager remains local-only: run `npm start` and open /manager.html.

**Gotchas**
- The slideshow timer uses requestAnimationFrame, so it pauses while the tab is hidden — intentional.
- When regenerating `gh-pages`, never copy manager files or docs into it; rebuild from the explicit include list above.

---

## 2026-07-10 (later 3) — Rename, background music, lightbox cleanup

**What changed**
- Renamed the site: title is now "Master Builder", subtitle "KaiCollections" (`index.html` `<title>`, header h1, subtitle).
- Added background music (`js/audio.js`, new): plays `audio/eMastered_WooSong.mp3` on load, loops, fades in over 2s to 30% volume. Browsers block audible autoplay, so it tries immediately and otherwise starts on the first click/keypress/touch.
- Lightbox cleanup: close/prev/next buttons moved from inside the scrolling panel onto the overlay (they were being clipped by `overflow: auto` and causing the horizontal scrollbar). Panel now `overflow: hidden`, image up to 80vh/1200px wide, title/meta/tags compacted into one small row under the image.

**Current state**
- Server from the prior session is still running on port 3000 (a fresh `node server.js` hits EADDRINUSE); it serves from disk so all changes are live at http://localhost:3000.
- Nothing pushed; repo still PUBLIC, no visibility decision.

**Gotchas**
- Audio start is gesture-gated in Chrome — silence until the visitor's first interaction is expected behavior, not a bug.

---

## 2026-07-10 (later 2) — Imported 42 real curated creations

**What changed**
- Processed all 76 source images in sibling `../KaiWebsite/` read-only: extracted EXIF dates, deduped by hash (1 exact dup skipped: `IMG_4693 (1).jpg`), flagged 1 unreadable `IMG_3161.HEIC` (needs conversion), detected 3 files with GPS EXIF.
- Categorized all 74 valid photos by hand via native vision (subagent auxiliary vision backend was down — 429 insufficient_quota — so the main session did it directly using labeled contact sheets).
- Kaz approved including face/portrait photos (personal site about him).
- Curated 74 → 42 (kept best 1-2 shots per build story; dropped redundant near-duplicate angles).
- Imported: re-encoded each to web (≤1600px) + thumb (≤700px) into `images/kai/`, **stripping all EXIF including GPS** (verified: getexif() empty on output). Wrote `content/creations.json` with 42 items (40 lego, 1 paper, 1 art), real EXIF dates where present (2 items) else dateSource "unknown".
- Verified live: gallery serves 42 items, filters count correctly, real images + thumbs return HTTP 200, visually confirmed the Kid's Studio look renders with real photos.

**Current state**
- Gallery at http://localhost:3000 now shows Kai's 42 real creations. Originals in `../KaiWebsite/` untouched. Published derivatives are EXIF-stripped.
- Remote GitHub repo still PUBLIC; **nothing pushed**. No publish/visibility decision made yet.

**Next**
- Kaz: review the real gallery; adjust any titles/categories/dates or drop/add items via the manager.
- Optionally convert `IMG_3161.HEIC` and re-run import for that one.
- Decide repo visibility (public/private) before any push/publish.

**Gotchas**
- Subagent vision path is billing-blocked (OpenAI 429); use main-session native vision for image tasks until that's resolved.
- Only 4 of 76 source photos had EXIF dates — most gallery items show "Date unknown" by design (never fabricated).

---

## 2026-07-10 (later) — First build: gallery + local content manager (placeholders only)

**What changed**
- Built the "Kid's Studio" public gallery (`index.html`, `css/gallery.css`, `js/gallery.js`): masonry grid, category filter chips (Lego/Paper Craft/Art), search, sort (My order/Newest/Oldest/Title), lightbox, responsive, `prefers-reduced-motion` respected. Data-driven from `content/creations.json`.
- Built a local-only content manager (`manager.html`, `js/manager.js`, `manager-server.js`, `js/exif-reader.js`): drag-and-drop upload, drag-to-reorder, per-item caption/category/tags editing, pure-JS EXIF date parsing with manual fallback when absent. Not linked from the public gallery.
- Populated `content/creations.json` with 8 placeholder items (SVG illustrations, not real photos) covering all three categories and a deliberate mix of exif/manual/unknown date sources to exercise the "never invent" rule.
- Zero new dependencies added; `package.json` still has an empty dependency list. No installs, no network calls, no git operations performed during the build.
- Verified locally: `node --check` clean on all new JS; `node server.js` serves the gallery and `content/creations.json` correctly on port 3000; visually confirmed the Kid's Studio look (bright cream background, red/orange/blue category chips, rounded playful cards, big friendly display type).

**Current state**
- Gallery is fully demonstrable locally with placeholder art. No real photos of Kai have been added or touched.
- Remote GitHub repo remains PUBLIC; nothing has been pushed. `.claude/settings.json` still denies `git push`/`gh`/`npm install`/`npx` at this stage.

**Next**
- Kaz reviews the live local build (`npm start` → http://localhost:3000).
- Once approved: swap placeholder items for a Kaz-approved curated sample of real photos via the manager (drag-drop + manual review), decide repo visibility, then push.

**Gotchas**
- The build subagent didn't append its own dev-handoff/todo entries as instructed; this entry and the todo update were added in the main session after independently verifying the file listing and booting the server.

---

## 2026-07-10 — Framework scaffold + security sweep started

**What changed**
- Cloned the existing `Kulimar/KaiCollection` repo into this exact folder; preserved sibling `../KaiWebsite/` as an untouched source-media drop.
- Added the new-project framework baseline: CLAUDE.md, shared Claude settings, .gitignore, README, architecture, secrets doc, todo, and lessons.
- Started static security reviews of the linked design skills/sources. Nothing third-party has been installed or run.

**Current state**
- Existing placeholder code/photos remain unchanged in the working tree except README scaffolding.
- Remote GitHub repo is PUBLIC. No push, publication, deployment, photo import, or Google Photos access is approved.

**Next**
- Return security findings + design/technical/content-manager plan to Kaz.
- Agree on Google Photos access method and approve only a small curated sample.
- Wait for Kaz's go-ahead before implementation.

**Gotchas**
- The bot cannot access the linked Discord design channel (403 Missing Access); Kaz must grant View Channel + Read Message History or provide exports/links.
- Delegated writes must be enumerated at this exact path before acceptance.
