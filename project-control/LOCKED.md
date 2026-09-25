# LOCKED production state

The verified production baseline is commit `cc1574cb5d474f3bc02da456b4a616705ca4a22b`.

Rollback reference: branch `site-rollback-final-2026-09-25`, pointing exactly to `cc1574cb5d474f3bc02da456b4a616705ca4a22b`.

Locked without new explicit owner approval:

- complete visible homepage composition, section order, copy, controls, spacing, typography, palette and responsive geometry;
- series banner, all four book covers, Book 1 and Book 2 3D projections, author mark and approved social-share artwork;
- Book 1 description and all literary text in the reader;
- production 11-chapter audiobook player, chapter list, current close/pause behavior and audiobook ZIP download;
- EPUB and PDF downloads;
- current subscription form and one-click unsubscribe user flow;
- current Privacy and Terms visible text;
- current social and LitRes destinations.

Approved technical production state that must not be silently rolled back:

- deterministic `dist/` build and GitHub Pages deployment;
- cookieless denied-storage GA4 measurement;
- embedded anonymous native site counter using reserved technical Google Forms events only on production origin;
- owner-test suppression for both GA4 and native counter;
- campaign attribution without subscriber identity;
- local-only reading progress and audiobook progress via browser localStorage;
- per-chapter reading/audio analytics and download/LitRes/subscription/404 measurement;
- Google Search Console, Bing, sitemap, robots, structured data and IndexNow setup;
- production 11-chapter audiobook assets hosted in the approved GitHub Release.

Mandatory release gates:

- `python tools/build/build-site.py`;
- `node tools/qa/qa-site.cjs`;
- `node tools/qa/seo-health.cjs`;
- `node tools/qa/e2e-closeout.cjs`;
- `node tools/qa/security-scan.cjs`;
- production-affecting changes require an updated `project-control/CURRENT.md`;
- no merge/deploy when a required gate fails.

Checksums in `ASSETS_MANIFEST.md` remain authoritative for locked runtime assets.

Any future visible change requires separate explicit approval before implementation. Technical work must preserve this verified production state unless the owner explicitly approves a replacement.
