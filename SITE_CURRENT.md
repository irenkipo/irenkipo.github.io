# SITE CURRENT

Status: ACTIVE / NEAR-COMPLETE / DO NOT REDESIGN
Updated: 2026-09-10

## Exact current baseline
- Repository: `irenkipo/irenkipo.github.io`
- Production/current branch: `main`
- Current baseline commit: `174ea2cb0b77bb4857f83af116c372763766e144`
- Commit message: `Use direct v2 image files`
- Tracking branch: `work-system/site-current-v2`

## Superseded working pointer
- `site-final-work` at `49bb32e4ad7c87e5ef1987888e9e1d13f66d2f64` is NOT the current site baseline.
- `work-system/site-current-v1` was created from that stale pointer and must not be used for further site work.

## Current interpretation
The site is already near completion. Continue from `main`, not from older recovery branches.

Already present in current site:
- working homepage structure
- approved visual palette/style
- hero image wiring
- Book 1 3D presentation
- four-series-cover presentation
- Book 2 section
- reading/download/listen actions and modals
- author section and social links
- responsive/mobile CSS
- subscription form UI

## Mandatory work rule
1. LOAD `main@174ea2cb...` as baseline.
2. Identify only remaining defects/open tasks.
3. PATCH only the requested defect.
4. VERIFY diff against baseline.
5. Reject any unrelated regression.
6. Never rebuild/redesign the whole site for a local correction.
7. Do not move `main` or publish additional changes without explicit user approval.

## Locked decisions
- Do not rename books or series.
- Do not replace the approved palette or overall visual language.
- Do not change the established 3D book presentation without explicit instruction.
- Do not reintroduce removed extra inscriptions or decorative lock elements.
- Do not substitute old placeholder assets for current v2 assets.
