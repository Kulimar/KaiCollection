# System Architecture — Kai's Creations

Living map. Update this when the shape changes.

## Current placeholder
```
images-list.json (filename array) ──→ script.js ──→ static gallery DOM
images/ + audio/                  ──→ browser assets
server.js                         ──→ local Express static server
functions/likes.js + JSON file    ──→ experimental Netlify likes endpoint
```
This is under security/architecture review and has not been approved as the replacement foundation.

## Proposed target (pending Kaz's plan approval)
```
Private source/import folder (outside public output)
        ↓ local-only content manager
EXIF read → privacy scrub → editable fields → reorder/preview
        ↓ explicit save/export
content/creations.json + optimized publishable derivatives
        ↓ schema validation
public gallery: masonry/grid + filters + search + sort + lightbox
        ↓ explicit, visibility-gated deployment
approved hosting target
```

## Boundaries / invariants
- Public gallery is read-only and contains no upload/admin API or editor controls.
- Content manager runs locally; browser drag-and-drop cannot silently write files, so saves use explicit download/export or a local authenticated helper selected in the approved plan.
- Originals stay outside publication; derivatives strip GPS/private EXIF.
- Manifest is canonical for caption, display date, category, tags, order, dimensions, alt text, and derivative path.
- Missing EXIF never invents a date/caption; fields remain visibly incomplete for manual editing.
- No photo or manifest reaches a remote service without explicit approval.

## Proposed manifest entity
Final schema is part of the plan, not yet implemented. Minimum fields: stable id, source/derivative path, title/caption, date + date source, category, tags, order, dimensions, alt text, featured flag, visibility/status.

## Deployment
Undecided. The GitHub repository is currently public; all publishing/pushing is blocked pending Kaz's explicit visibility decision.
