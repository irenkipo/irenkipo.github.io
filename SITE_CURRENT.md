# SITE CURRENT

Status: ACTIVE / NEAR-COMPLETE / DO NOT REDESIGN
Updated: 2026-09-10

## Exact current repository state
- Repository: `irenkipo/irenkipo.github.io`
- Production branch: `main`
- Main HEAD: `174ea2cb0b77bb4857f83af116c372763766e144` (`Use direct v2 image files`)
- Tracking branch: `work-system/site-current-v2`

## IMPORTANT: two site implementations currently coexist
1. Root production page: `/index.html` — older implementation. It still reconstructs hero from `hero-p0..p6.txt` and series covers from `series-exact.b64`.
2. Newer implementation: `/v2/index.html` — direct image files (`assets/hero.jpg`, `book1.jpg` ... `book4.jpg`, `author.jpg`) and is the more recent near-complete site implementation.

Therefore:
- Do NOT use `site-final-work` as CURRENT.
- Do NOT treat root `/index.html` and `/v2/index.html` as equivalent.
- Canonical candidate for completion is `/v2/index.html` at `main@174ea2cb...`, pending user approval before replacing/promoting the root page.

## Verified complete/present in v2
- responsive homepage structure
- direct hero asset
- direct Book 1–4 cover assets
- Book 1 3D presentation
- Book 2 section
- author mark and author block
- Instagram/Facebook/Threads links
- LitRes link
- read button to `/read/`
- listen/download modals
- mobile CSS

## Verified remaining functional gaps in v2
1. Subscription form is visual only. Submit is intercepted and displays: `Форма подготовлена. Подключение списка рассылки — отдельный технический шаг.` No mailing service/backend is connected.
2. Audio is not connected. Listen modal explicitly says the audio file is not yet connected.
3. Download files are not connected. EPUB/PDF/MP3 are shown as `подключается` and are not download links.
4. Root `/index.html` is still the older implementation; v2 has not yet been promoted to the root production homepage.

## Locked decisions
- Do not rename books or series.
- Do not replace the approved palette or overall visual language.
- Do not change the established 3D book presentation without explicit instruction.
- Do not reintroduce removed extra inscriptions or decorative lock elements.
- Do not substitute old placeholder assets for current v2 assets.
- Do not redesign the page while closing functional gaps.

## Mandatory work rule
1. LOAD this CURRENT.
2. Work only from `/v2/index.html` as the canonical candidate unless the user explicitly chooses another baseline.
3. PATCH only one verified gap at a time.
4. VERIFY diff against baseline and reject unrelated changes.
5. Never modify/promote root production `/index.html` without explicit user approval.
6. After approval of a patch, record exact commit here.

## Next exact step
Close the remaining functional gaps in this order without redesign:
A. choose/connect subscription destination;
B. connect EPUB/PDF files that actually exist and pass link checks;
C. connect audio only when a real approved audio asset exists;
D. run final visual/mobile/link regression check;
E. only then ask for approval to promote v2 to root production.
