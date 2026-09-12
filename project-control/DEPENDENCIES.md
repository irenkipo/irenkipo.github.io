# Runtime and build dependencies

## Runtime shipped in `dist`

- `src/site/` → homepage and 404;
- `src/legal/` → privacy and terms at unchanged public URLs;
- `src/read/` → contents plus 11 chapter URLs;
- `src/assets/` → approved visuals, CSS, JavaScript, EPUB, PDF, and author mark;
- `src/config/subscription.json` → `dist/assets/config/subscription.json`.

## Build and QA only

- `tools/build/build-site.py` creates `dist/` from the explicit source allowlist;
- `tools/qa/` validates HTML, SEO, accessibility behavior, links, assets, checksums, and viewport layout;
- `.github/workflows/` builds, validates, and deploys the generated artifact.
- Optional book conversion tools write only to ignored `tools/.build/` staging and never overwrite canonical `src/`.

## Removed from the active tree

The following were not referenced by the locked runtime or build and remain recoverable from Git history and rollback tag:

- `v2/`;
- `latest.html`;
- root `styles.css`;
- Base64 and text fragments under legacy `assets/`;
- old preview screenshots;
- duplicated `downloads/` artifacts;
- superseded root JavaScript/CSS and temporary images;
- the one-off browser-speech removal script.

No approved visual source used by production was deleted; each was moved to `src/assets/` unchanged.