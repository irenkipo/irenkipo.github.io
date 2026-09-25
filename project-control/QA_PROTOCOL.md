# QA protocol

1. Run `python tools/build/build-site.py`.
2. Run `npm ci --prefix tools/qa` when dependencies are not installed.
3. Validate only site/reader HTML pages; official `google*.html` ownership files are opaque verification payloads and must not be rewritten by an HTML formatter.
4. Install the matching Chromium build with `npm exec --prefix tools/qa playwright install chromium`.
5. Run `node tools/qa/qa-site.cjs`.
6. Run `node tools/qa/seo-health.cjs` against public production.
7. Run `node tools/qa/e2e-closeout.cjs` to verify reading save/restore and homepage continuation, audiobook chapter/time restore without autoplay plus pause/save on close, EPUB/PDF/audio-ZIP links, canonical LitRes link, intercepted subscription transport/status/event, and one-click unsubscribe token transport/status.
8. Run `node tools/qa/security-scan.cjs`.
9. Confirm `dist/` contains no source, tooling, previews, Markdown, fragments, credentials, or environment files.
10. Compare the complete candidate homepage and current production at 1440, 820, and 390 pixels. No visible delta is allowed; the author-mark raster is checksum-verified and masked only to avoid protocol-dependent browser decoding noise.
11. Do not merge or deploy when any check fails.
12. Verify analytics runtime: every public page loads the local analytics runtime; exactly one Google tag for `G-5F54GZZN18` is added; runtime defaults `analytics_storage`, `ad_storage`, `ad_user_data`, and `ad_personalization` to `denied`; no consent banner or analytics cookie UI is present.
