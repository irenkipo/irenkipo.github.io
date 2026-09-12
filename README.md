# irenkipo.github.io

Production website for Irene Kipo and the novel series «Всё хорошо».

## Structure

- `src/` — canonical website source;
- `tools/build/` — deterministic source-to-`dist` builder;
- `tools/qa/` — browser, SEO, security, and artifact checks;
- `project-control/` — current production state, visual lock, dependencies, and QA protocol;
- `dist/` — generated deployment artifact (not committed).

## Local build

```text
python tools/build/build-site.py
node tools/qa/qa-site.cjs
node tools/qa/security-scan.cjs
```

GitHub Pages must deploy only the generated `dist/` artifact after required PR checks and owner approval.