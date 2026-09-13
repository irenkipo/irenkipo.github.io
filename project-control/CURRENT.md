# SITE CURRENT

- Status: candidate — search-engine technical completion
- Candidate branch: `site-search-seo`
- Production baseline: `c686f642b4a61e0096c9ebd8ba8dd224a7c8b366`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED; no visible page changes are allowed in this SEO delta.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs`, `node tools/qa/seo-health.cjs`, and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR is created by a narrowly scoped GitHub Actions workflow; owner approval remains mandatory for the current PR HEAD.
- Subscription: one public Google Form CTA; no local input, backend, provider config, or client-side submission logic.
- Search engines: technical preparation complete; external Google/Bing verification and sitemap submission remain PENDING in `SEO_SEARCH_CURRENT.md`.