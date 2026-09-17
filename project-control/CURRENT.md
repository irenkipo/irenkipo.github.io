# SITE CURRENT

- Status: candidate — finalize verified Google/Bing search-engine state
- Candidate branch: `site-search-seo`
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
- TikTok Developers: verification-only root file `tiktokl8QvfszBTbx6BbHw4UIczI4ZhomoCQnM.txt` is the current state-only delta for URL-prefix ownership verification; no visible site content or publishing behavior changes.
