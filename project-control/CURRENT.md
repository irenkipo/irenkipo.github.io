# SITE CURRENT

- Status: candidate — Google Search Console ownership verification file
- Candidate branch: `google-search-verification`
- Production baseline: `ec51b995a20acc0a41f541828ec1563453289d2a`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED; no visible page changes are allowed in this verification delta.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs`, `node tools/qa/seo-health.cjs`, and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR + owner approval required before merge.
- Subscription: one public Google Form CTA; no local input, backend, provider config, or client-side submission logic.
- Search engines: technical preparation is complete; this candidate adds the exact Google Search Console HTML verification file. Google/Bing connection and sitemap submission remain PENDING until external verification succeeds.