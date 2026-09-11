# SITE CURRENT

Status: RECOVERY / NOT PRODUCTION
Updated: 2026-09-11

## Physical baseline
- Repository: `irenkipo/irenkipo.github.io`
- Recovery branch: `work-system/site-current-v1`
- Baseline source: `site-final-work`
- Baseline commit: `49bb32e4ad7c87e5ef1987888e9e1d13f66d2f64`
- Production branch: `main`
- Production commit at recovery start: `174ea2cb0b77bb4857f83af116c372763766e144`
- Repository audit verified that `site-final-work` is exactly one commit ahead of this production commit and was saved as `WORK: preserve completed final-site implementation`.
- The production parent already contains the direct v2 image assets; the recovery baseline adds the completed site implementation, reader/download build and QA tooling on top.
- Nothing in this recovery branch is published automatically.

## Cross-chat synchronization rule
- Chat history is never the source of truth for SITE.
- The shared state between any SITE-related chats is GitHub + this `SITE_CURRENT.md`.
- Every approved change made in any SITE chat must be committed to the repository and reflected in `SITE_CURRENT.md` before that task is considered complete.
- If repository files changed but `SITE_CURRENT.md` was not updated, the change is INCOMPLETE and must not be treated as the active approved state.
- Any new SITE chat must LOAD `SITE_CURRENT.md` before making decisions or edits.

## Automated guards
- `main` contains `.github/workflows/site-current-guard.yml`.
- `main` contains `.github/workflows/production-gate.yml`.
- `SITE CURRENT guard` requires `SITE_CURRENT.md` to change together with site-content changes.
- `Production approval gate` requires a fresh APPROVED review from GitHub account `irenkipo` for the current PR HEAD commit; a newer commit makes the previous approval stale.
- Repository-level branch protection for `main` is NOT YET VERIFIED/ENFORCED because the connected GitHub integration has no administration permission for branch-protection settings.
- Until branch protection is enabled manually in GitHub settings, direct pushes to `main` remain a residual risk even though the workflows run.

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

## Audit findings — 2026-09-11
1. `site-final-work/index.html` does NOT render the approved hero artwork. The hero is an empty `.asset-frame` placeholder.
2. The page does NOT render final book-cover artwork in the series grid or Book 1 section. It uses `.cover-slot` placeholder blocks.
3. The HTML comments expect `hero-canonical.jpg` and `book1/2/3/4-canonical.jpg`, but those canonical filenames are absent from `assets/images`.
4. Real image assets do exist in the branch (`book1-cover.jpg`, `series-cover.jpg`, author mark and other source material), so the recovery task is asset restoration/mapping, not a new redesign.
5. The signup form is present but intentionally disabled and not connected; this remains an OPEN functional task.
6. The baseline contains structural QA tooling for desktop/tablet/mobile, broken images, anchors, modal behavior and all 11 reader pages.
7. Production remains blocked until visual recovery is verified and the user explicitly approves it.

## Next exact step
- Enable branch protection/rules for `main`: require a pull request before merging and require the two status checks above.
- Then build one recovery patch that changes ONLY asset wiring/presentation needed to restore the approved visual language.
- Do not rewrite text, rename books, redesign layout, change palette, or touch production directly.
- Before showing the patch as a candidate, verify the diff contains no unrelated changes and run structural QA.

## Mandatory change rule
Every requested change uses this sequence:
1. LOAD this CURRENT.
2. PATCH only the explicitly requested scope.
3. VERIFY diff against the baseline.
4. Run structural QA when affected.
5. If anything outside scope changed, reject the result and do not publish it.
6. After user approval, commit the approved result and update this CURRENT to the new exact commit.

## Safety rules
- Never rebuild the whole site for a local correction.
- Never treat chat memory as the site source of truth.
- Never use `irenkipo-publisher` as the website repository.
- Never deploy or merge to `main` merely because a generated result looks plausible.
- Never mix older recovery/design branches back into ACTIVE work unless a specific missing approved asset must be recovered from them.
