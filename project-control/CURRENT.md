# SITE CURRENT

- Status: candidate — SEO/security/dist migration
- Candidate branch: `site-technical-hardening`
- Production baseline: `b48d5f0c6b782c605304b2ed90d6d0809dc57e06`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED; only the approved visible delta `Слушать бесплатно` → `Аудиокнига скоро` is allowed.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs` and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR is created by a narrowly scoped GitHub Actions workflow; owner approval remains mandatory for the current PR HEAD.
- Subscription: safe frontend is prepared; Brevo public form embed is not configured and must not report success.