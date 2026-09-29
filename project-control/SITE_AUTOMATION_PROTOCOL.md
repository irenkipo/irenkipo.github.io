# SITE AUTOMATION PROTOCOL

Status: REQUIRED  
Scope: all maintenance, content-file replacement, build, QA, and deployment work for `irenkipo.github.io`.

## 1. Single approved route

For site work, use the existing automation path first:

`ChatGPT → GitHub → existing self-hosted Windows runner/workflow → local D:\ source/worktree when required → site branch → QA → PR → main → GitHub Pages`

Existing automation has priority over any new script, workflow, manual upload, terminal sequence, Codex flow, or alternate transport.

## 2. NO WORKAROUNDS

If an approved workflow already exists, use it.

A failure in the approved workflow is **not** permission to bypass it.

Before proposing or creating any alternate route, first:

1. identify the existing workflow intended for the task;
2. run or inspect that workflow;
3. read the exact failing step/log;
4. repair the existing workflow if repair is possible;
5. re-run the approved route.

Do **not** create a replacement workflow, temporary upload workflow, alternate PowerShell chain, manual file-copy procedure, Codex route, or other workaround unless:
- the approved route is proven unavailable or structurally incapable of the requested task; **and**
- the user explicitly approves the alternate route.

## 3. No routine manual terminal work for the user

For tasks covered by existing automation, do not ask the user to paste PowerShell, Git, `gh`, Node, or Python command chains.

A manual command may be requested only when:
- no existing automated action can perform the required step;
- the exact missing capability has been verified;
- the command is the minimum necessary intervention.

After that intervention, return immediately to the approved automated route.

## 4. Inspect before inventing

Before changing site automation:
- inspect `.github/workflows/`;
- inspect relevant `tools/` and `project-control/` files;
- check recent PRs/runs for an already completed or in-progress implementation;
- verify whether the requested result is already present in `main` or production.

Never rebuild, re-upload, or recreate a route merely because the current chat does not yet know its state.

## 5. Preserve unrelated local work

Never reset, clean, restore, stash, overwrite, or repurpose a local working tree with unrelated uncommitted changes.

When local Windows files are required, use the existing dedicated worktree/runner route or a clean task-specific worktree.

## 6. Book 1 download updates

For Book 1 PDF/EPUB changes, the approved automation is the existing site Book 1 download sync route, currently represented by the established `site-book1-download-sync.yml` workflow and its associated script.

A Book 1 download update must keep these synchronized in one controlled change:
- `src/assets/books/book1.pdf`
- `src/assets/books/book1.epub`
- root mirrors under `assets/books/`
- `project-control/ASSETS_MANIFEST.md`
- locked expected download hashes in site QA when applicable
- `project-control/CURRENT.md`

Reader HTML, design, audio, analytics, and LitRes are out of scope unless separately approved.

The source DOCX is read-only for site publication work.

## 7. Required verification

Before merge:
- confirm only approved files changed;
- confirm reader HTML/design are unchanged unless explicitly approved;
- run required site QA;
- require `SITE CURRENT guard`;
- require production approval gate where configured.

After merge:
- verify GitHub Pages deployment completed successfully;
- verify the relevant production assets correspond to the approved change.

## 8. ChatGPT operating rule

For every site-related request in this project:

**Existing automation first. Diagnose and repair it rather than bypassing it. No workaround without explicit user approval after a verified failure of the approved route.**

This rule overrides convenience, speed, or a newly invented implementation path.
