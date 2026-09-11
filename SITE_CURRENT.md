# SITE CURRENT

Status: PUBLISHED / ACTIVE MAINTENANCE
Updated: 2026-09-11

## Physical production
- Repository: `irenkipo/irenkipo.github.io`
- Production branch: `main`
- Current observed production branch commit: `b48d5f0c6b782c605304b2ed90d6d0809dc57e06`
- The site is published.

## Remaining open work
1. Subscription form — connect and verify end-to-end signup flow.
2. Audiobook — create/integrate the approved audiobook workflow and then connect the finished audio to the site.

Everything else in the site build is treated as published/locked unless the user explicitly requests a change.

## Cross-chat synchronization rule
- Chat history is never the source of truth for SITE.
- The shared state between any SITE-related chats is GitHub + this `SITE_CURRENT.md`.
- Every approved SITE change must be committed and reflected here before the task is considered complete.
- Any new SITE chat must LOAD `SITE_CURRENT.md` first.

## Minimal maintenance model
- Keep the exact published production commit as rollback point.
- Future edits use a working branch/candidate.
- Local request = local patch only.
- Verify requested change and unrelated regressions before publishing.
- After approval, publish and record the new production commit here.

## Locked user decisions
These must not be changed unless the user explicitly unlocks that exact item.
- Series/book names: do not rename.
- Approved palette: do not replace with a new palette.
- Book presentation: 3D projection; do not flatten or change the established angle without instruction.
- No extra lock icon at the bottom of the page.
- No extra unapproved bottom inscriptions.
- Family visual canon: exactly five translucent back-only family silhouettes: left adult man + boy; right adult woman + teenage girl + little girl; central woman back-only.
- Frame means a window/frame, not an architectural arch.
- Do not introduce visible faces into the approved family visual concept.

## Mandatory change rule
1. LOAD this CURRENT.
2. PATCH only the explicitly requested scope.
3. VERIFY diff against the published baseline.
4. Run structural QA when affected.
5. If anything outside scope changed, reject the result and do not publish it.
6. After user approval, commit the result and update this CURRENT to the new exact production commit.

## Safety rules
- Never rebuild the whole site for a local correction.
- Never treat chat memory as the site source of truth.
- Never use `irenkipo-publisher` as the website repository.
- Never deploy merely because a generated result looks plausible.
