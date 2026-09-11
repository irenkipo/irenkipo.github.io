# SITE CURRENT

Status: RECOVERY / NOT PRODUCTION
Updated: 2026-09-10

## Physical baseline
- Repository: `irenkipo/irenkipo.github.io`
- Recovery branch: `work-system/site-current-v1`
- Baseline source: `site-final-work`
- Baseline commit: `49bb32e4ad7c87e5ef1987888e9e1d13f66d2f64`
- Production branch: `main`
- Production commit at recovery start: `174ea2cb0b77bb4857f83af116c372763766e144`
- Nothing in this recovery branch is published automatically.

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

## Open / unresolved
- Verify the recovery baseline against the last user-approved homepage visuals.
- Restore only missing/incorrect approved assets; do not redesign the page.
- Then complete remaining site work (text placement, form/functionality, responsive/mobile verification) from the verified baseline.
- Production deployment remains blocked until explicit user approval.

## Mandatory change rule
Every requested change uses this sequence:
1. LOAD this CURRENT.
2. PATCH only the explicitly requested scope.
3. VERIFY diff against the baseline.
4. If anything outside scope changed, reject the result and do not publish it.
5. After user approval, update this CURRENT to the new exact commit.

## Safety rules
- Never rebuild the whole site for a local correction.
- Never treat chat memory as the site source of truth.
- Never use `irenkipo-publisher` as the website repository.
- Never deploy or merge to `main` merely because a generated result looks plausible.
