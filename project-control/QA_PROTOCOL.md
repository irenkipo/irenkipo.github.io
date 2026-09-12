# QA protocol

1. Run `python tools/build/build-site.py`.
2. Run `npm ci --prefix tools/qa` when dependencies are not installed.
3. Install the matching Chromium build with `npm exec --prefix tools/qa playwright install chromium`.
4. Run `node tools/qa/qa-site.cjs`.
5. Run `node tools/qa/security-scan.cjs`.
6. Confirm `dist/` contains no source, tooling, previews, Markdown, fragments, credentials, or environment files.
7. Compare candidate and current production at 1440, 820, and 390 pixels; normalize only the explicitly approved audio-button text delta for locked pixel comparison.
8. Do not merge or deploy when any check fails.