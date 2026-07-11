# Lessons Log — Kai's Creations

Root-cause notes so we do not relearn the same thing. Newest on top; review at session start; append after every correction.

## 2026-07-10 — Pages source must be checked before pushing private code to main
**Symptom:** GitHub Pages was already enabled and serving from `main`, so pushing the manager to `main` would have briefly published it.
**Root cause:** Assumed Pages was unconfigured because no publish decision existed; the legacy repo had Pages on `main` all along.
**Fix / rule:** Before any push to a public repo, check `gh api repos/<owner>/<repo>/pages` and point the source at the curated `gh-pages` branch first (done this session; source now `gh-pages`).

## 2026-07-10 — Multi-line git commit messages fail via PowerShell here-strings
**Symptom:** `git commit -m @'...'@` split the message at embedded quotes and errored with a bogus pathspec.
**Root cause:** The here-string was not parsed as a literal through the tool layer, so inner quotes broke argument splitting.
**Fix / rule:** Write the message to a scratch file and use `git commit -F <file>`.

## 2026-07-10 — Treat child-photo repositories as private even when the remote is public
**Symptom:** The existing GitHub repository reports PUBLIC visibility while containing family gallery images.
**Root cause:** Legacy repository visibility may not match the privacy assumptions of a new child-photo project.
**Fix / rule:** Block pushes, photo imports, and deployments until Kaz explicitly chooses visibility. Strip GPS/private EXIF from any approved publishable derivative and keep originals outside public output.

## 2026-07-10 — Verify delegated output at the exact repository path
**Symptom:** A prior project had delegated files written into a similarly named sibling directory.
**Root cause:** Subagent completion reports are not proof of destination correctness.
**Fix / rule:** After every delegated write, enumerate the exact `Kai/KaiCollection` destination and inspect git status before accepting the result.
