# SECRETS — Kai's Creations

This file lists names and locations only—never values.

## Current inventory
No project secrets are required by the existing placeholder.

Potential future integrations (Google Photos OAuth, hosting/admin credentials) are **not approved or configured**. If adopted, credentials must live outside git in `.env` or `.secrets/`, be least-privilege, and be documented here by variable name/location only.

## Rules
- Never commit OAuth tokens, refresh tokens, cookies, exports, or private photo-library metadata.
- Never ask an agent to read or print credentials.
- Before any push: inspect `git status` and staged changes; scan for secret patterns and unintended media.
- Generate credentials per project; copy none from other projects.

## Leak response
1. Revoke/rotate immediately at the provider.
2. Remove the affected artifact from publication and git history (force-push only with explicit approval).
3. Record the root cause and preventing rule in `tasks/lessons.md`.
