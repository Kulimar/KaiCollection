# CLAUDE.md — Kai's Creations

A highly visual, data-driven gallery for Kai's Lego builds, paper crafts, and art.

## Run it
- `npm start` — local gallery at http://localhost:3000 (also serves the manager)
- No build step; plain static HTML/CSS/JS, zero dependencies.

## Repository
- GitHub: `Kulimar/KaiCollection`
- Remote visibility is PUBLIC. **Visibility decision (2026-07-10): Kaz explicitly approved publishing the curated, EXIF-stripped gallery — including face photos — to `main` and to GitHub Pages (`gh-pages` branch).**
- The local content manager (`manager.html`, `manager-server.js`, `js/manager.js`, `js/exif-reader.js`, `server.js`) stays out of `gh-pages`; it lives on `main` but is never part of the published site.
- Raw source media stays outside this repo in sibling `../KaiWebsite/`; only web derivatives in `images/kai/` are published.

## Architecture map
See `docs/system-architecture.md`. The target architecture is a static gallery plus a local-only content manager backed by an editable manifest; details require plan approval before implementation.

## Golden rules
1. **Photos of a child are private-by-default.** Never publish, push, upload to a third party, or expose metadata without explicit approval.
2. **Data-driven or it doesn't ship.** Gallery items live in a manifest with documented defaults; captions, dates, categories, order, and image paths are not hardcoded in UI code.
3. **Content management must be reversible.** Preserve originals; generated derivatives go to separate paths; reorder/edit operations can be previewed before saving.
4. **Strip sensitive metadata from publishable derivatives.** Preserve only intentional display fields in the manifest; do not publish GPS/device/private EXIF.
5. **Third-party code requires static security review before install or execution.** Prefer manually vendored text-only skills over installers/MCP services.
6. **Additive and gated.** The public gallery cannot expose local editor controls or write capabilities.
7. **Fail closed.** Missing/invalid manifests produce a safe error; publishing refuses unapproved visibility or unstamped output.
8. **No secrets in git.** Names/locations only in `docs/SECRETS.md`; values live in ignored files and are denied to agents.

## Session conventions
- **Start:** read this file → `tasks/lessons.md` → `tasks/todo.md` → top of `docs/dev-handoff.md`; run `git status`.
- **During:** plan before work of 3+ steps; stop and re-plan on surprises. Delegate bulk implementation/security review, then verify files at this exact repo path.
- **End:** update dev-handoff, todo, and lessons; show Kaz changes before any push.
- After any correction: add Symptom / Root cause / Fix-rule to `tasks/lessons.md` so it is not repeated.

## Verify before claiming done
- Validate manifest schema and every referenced file.
- Test keyboard, touch, narrow phone, wide desktop, filters/search/sort, and reduced-motion mode.
- Confirm published artifacts contain no secrets, GPS EXIF, local editor, or unapproved photos.
- Enumerate files at this exact path after delegated writes; never trust a subagent's self-report alone.
