# SITE CURRENT

- Status: candidate — approved Google Form subscription CTA
- Candidate branch: `subscription-google-form`
- Production baseline: `5007cfc5e5b3e756400390a36127ed9105d28533`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED; only the approved subscription delta (local e-mail form → Google Form CTA) is allowed.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs` and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR is created by a narrowly scoped GitHub Actions workflow; owner approval remains mandatory for the current PR HEAD.
- Subscription: one public Google Form CTA; no local input, backend, provider config, or client-side submission logic.