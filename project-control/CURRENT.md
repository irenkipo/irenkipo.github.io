# SITE CURRENT

- Status: candidate — complete author social profile cross-links and derived profile assets
- Candidate branch: `promo-profile-crosslinks-2026-09-18`
- Production baseline: `50e7f33dd4ad07b8fefbb1e2ad05f97173f2dc5a`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED; no visible page changes are allowed in this state-only delta.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs`, `node tools/qa/seo-health.cjs`, and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR + owner approval required before merge.
- Subscription: one public Google Form CTA; no local input, backend, provider config, or client-side submission logic.
- Search engines: technical preparation and external setup are complete. Google Search Console ownership is verified; sitemap is submitted; homepage and `/read/` indexing were requested. Bing Webmaster Tools is connected via Google Search Console import; sitemap status is `Success`, with 15 URLs discovered, 0 errors, and 0 warnings. Remaining crawl/index timing is external search-engine processing, not a missing site task.
- TikTok Developers: verification file `src/site/tiktokl8QvfszBTbx6BbHw4UIczI4ZhomoCQnM.txt` is copied by the build into the deploy artifact root so URL-prefix ownership verification can resolve publicly. No visible site content or publishing behavior changes.

- Promo profile delta: add complete author social cross-links (Instagram, Facebook, Threads, YouTube, Telegram, TikTok) to the site and Person.sameAs metadata; add derived non-redrawn profile assets for YouTube/avatar use. No book text, series art, cover art, description, typography, palette, or section order changes.
