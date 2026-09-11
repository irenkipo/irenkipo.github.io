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

## Verified visual reference
- Library reference: `landing page.jpg` is recorded in the promotion asset registry as `APPROVED / reference` and `NO` changes without approval.
- Use it as a visual-language reference, not as a source for accidental placeholder copy.

## Audit findings — 2026-09-10
1. `site-final-work/index.html` does NOT render the approved hero artwork. The hero is an empty `.asset-frame` placeholder.
2. The page does NOT render final book-cover artwork in the series grid or Book 1 section. It uses `.cover-slot` placeholder blocks.
3. The HTML comments expect `hero-canonical.jpg` and `book1/2/3/4-canonical.jpg`, but those canonical filenames are absent from `assets/images`.
4. Real image assets do exist in the branch (`book1-cover.jpg`, `series-cover.jpg`, author mark and other source material), so the recovery task is asset restoration/mapping, not a new redesign.
5. The signup form is present but intentionally disabled and not connected; this remains an OPEN functional task.
6. Production is still blocked. No merge/deploy is allowed until visual recovery is verified and the user explicitly approves it.

## Next exact step
- Build one recovery patch that changes ONLY asset wiring/presentation needed to restore the approved visual language.
- Do not rewrite text, rename books, redesign layout, change palette, or touch production.
- Before showing the patch as a candidate, verify the diff contains no unrelated changes.

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
