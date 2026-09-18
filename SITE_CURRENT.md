# SITE CURRENT

Status: PARTIAL / PHYSICAL CURRENT REFRESHED
Updated: 2026-09-17

## Physical production
- Repository: `irenkipo/irenkipo.github.io`
- Production branch: `main`
- Current observed production branch commit: `50d753e149fdb6ae358014a9905e852a856f4722`
- The site is published.
- Repository-native control source now exists at `project-control/CURRENT.md` on `main`; use it together with production `main` as the authoritative SITE control layer.
- Current repository-native control status is candidate/finalization state, so SITE remains PARTIAL rather than being promoted to VERIFIED by inference.
- Latest production commit deploys the TikTok Developers verification file through the generated site artifact; no visible site-content change is asserted here.

## Synchronization note
- Previous observed production commit in this file was `b48d5f0c6b782c605304b2ed90d6d0809dc57e06`.
- GitHub comparison to current production shows 19 commits ahead and a material repository reorganization, including the `project-control/` control layer and generated `dist/` deployment workflow.
- No missing intermediate state was reconstructed from chat memory.

## Remaining/open state
- Follow `project-control/CURRENT.md` for the exact current candidate/open SITE state.
- Preserve locked visual/content state unless explicitly approved.
- Audiobook remains a separate integration task when finished audio is ready.

## Cross-chat synchronization rule
- Chat history is never the source of truth for SITE.
- SITE decisions must load GitHub production `main` and `project-control/CURRENT.md` first.
- This compatibility pointer must not override a newer repository-native CURRENT.
- After an approved production change, record the exact production commit/current state physically before treating synchronization as complete.

## Minimal maintenance model
- Local request = local patch only.
- Verify requested change and unrelated regressions before publishing.
- Do not create duplicate CURRENT/DELTA/HANDOFF/CHANGELOG files.
