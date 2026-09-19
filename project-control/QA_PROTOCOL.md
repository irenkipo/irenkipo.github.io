# QA protocol

1. Run `python tools/build/build-site.py`.
2. Run `npm ci --prefix tools/qa` when dependencies are not installed.
3. Validate only site/reader HTML pages; official `google*.html` ownership files are opaque verification payloads and must not be rewritten by an HTML formatter.
4. Install the matching Chromium build with `npm exec --prefix tools/qa playwright install chromium`.
5. Run `node tools/qa/qa-site.cjs`.
6. Run `node tools/qa/seo-health.cjs` against public production.
7. Run `node tools/qa/security-scan.cjs`.
8. Confirm `dist/` contains no source, tooling, previews, Markdown, fragments, credentials, or environment files.
9. Compare the complete candidate homepage and current production at 1440, 820, and 390 pixels. No visible delta is allowed; the author-mark raster is checksum-verified and masked only to avoid protocol-dependent browser decoding noise.
10. Do not merge or deploy when any check fails.
11. Verify analytics consent states: with no stored choice the consent strip is visible and no Google tag is present; denial stores `denied` and loads no tag; acceptance stores `granted` and adds exactly one `G-5F54GZZN18` Google tag. Visual-lock screenshots must use a stored denied choice so the approved underlying site geometry remains comparable.
