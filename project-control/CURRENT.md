# SITE CURRENT

- Status: PRODUCTION LOCKED — final site closeout 2026-09-25
- Production baseline: `cc1574cb5d474f3bc02da456b4a616705ca4a22b`
- Rollback branch: `site-rollback-final-2026-09-25` -> `cc1574cb5d474f3bc02da456b4a616705ca4a22b`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED. The current production homepage, reader, 11-chapter audiobook player, download modal, subscription form, legal pages, typography, palette, artwork, controls, spacing and section order require new explicit owner approval before any visible change.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs`, `node tools/qa/seo-health.cjs`, `node tools/qa/e2e-closeout.cjs`, and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR + owner approval required before merge.
- Subscription: one public Google Form CTA remains the subscription transport. User-approved one-click unsubscribe uses a noindex `/unsubscribe.html` helper that submits an opaque unsubscribe token through the same existing Google Form; no new backend or provider is introduced.
- Search engines: technical preparation and external setup are complete. Google Search Console ownership is verified; sitemap is submitted; homepage and `/read/` indexing were requested. Bing Webmaster Tools is connected via Google Search Console import; sitemap status is `Success`, with 15 URLs discovered, 0 errors, and 0 warnings. Remaining crawl/index timing is external search-engine processing, not a missing site task.
- TikTok Developers: verification file `src/site/tiktokl8QvfszBTbx6BbHw4UIczI4ZhomoCQnM.txt` is copied by the build into the deploy artifact root so URL-prefix ownership verification can resolve publicly. No visible site content or publishing behavior changes.

- Promo profile delta: add complete author social cross-links (Instagram, Facebook, Threads, YouTube, Telegram, TikTok) to the site and Person.sameAs metadata; add derived non-redrawn profile assets for YouTube/avatar use. No book text, series art, cover art, description, typography, palette, or section order changes.

- Pages recovery delta: mirror the verified canonical `dist/` artifact to repository root because the active GitHub Pages branch deployment is currently serving repository-root content instead of the custom workflow artifact. This is a deployment-path recovery only; canonical visible site content remains the locked approved site.

- Visible social-links delta: explicitly approved PROMO profile completion adds YouTube, Telegram, and TikTok beside existing Instagram, Facebook, and Threads in the homepage social section. Mobile layout becomes a compact two-column grid. This is the only intended visible geometry change.

- TikTok Developers current URL-prefix verification delta: add exact current verification file `tiktokxqEIWzaIdqIchWPfBayCEjQ9UENdeYu0.txt` with token `xqEIWzaIdqIchWPfBayCEjQ9UENdeYu0` at source and deploy root. No visible site change.

- TikTok Developers exact verification filename delta: add `tiktokl8QvfszBTbx6BbHw4UIczI4ZhomoCQnM(2).txt` at both source and deployed root because TikTok generated that exact filename for the current URL-prefix verification request. Content is identical to the existing signature; no visible site change.

- Threads OAuth callback delta: add a noindex helper page at `/threads-oauth-callback.html` used only for the one-time Threads authorization-code return. No visible homepage/profile design changes; no automatic publishing permission is granted by this site change.

- GA4 analytics delta: user-approved cookieless Google Analytics 4 measurement using public Measurement ID `G-5F54GZZN18`. `analytics_storage`, advertising storage, advertising user-data and advertising personalization remain denied; no consent banner is shown. Measured actions include reading starts, chapter starts/opens, downloads, subscription clicks, LitRes clicks, and social clicks. Homepage/book visuals, literary text, series art, typography, palette, and section order remain unchanged; privacy disclosure is updated factually.

- Audiobook V2 GitHub-release test delta: add a test-only workflow that uploads the already approved local `CH11_WEB_V2.mp3` from the self-hosted runner to a public prerelease asset for streaming compatibility checks. No page content, player, production deploy, or public site navigation is changed by this delta.

- Audiobook HTML5 browser test delta: add isolated noindex `/audio-test.html` with a standard HTML5 audio player pointed at the public CH11 GitHub Release asset. The page is intentionally absent from navigation and sitemap and exists only to verify real browser playback and seeking before integrating the audiobook into the site.

- Audiobook V2 production-player delta: the approved 11-chapter WEB V2 audiobook is hosted as public GitHub Release assets under tag `audiobook-v-zone-vidimosti-v2`. Automated sync verifies FILES_LOCAL=11/11, ASSETS=11/11 and PUBLIC_RANGE=11/11. The existing audiobook modal is upgraded from a placeholder to a lazy-loading HTML5 player with chapter selection; no audio is fetched until a listener chooses a chapter. GA4 records audiobook open, chapter selection and first play per chapter. No literary text, cover art, series art or unrelated page geometry is changed.

- SEO guard maintenance: production SEO health validation accepts the current on-site subscription form as the canonical subscription CTA while retaining compatibility with the legacy external Google Form link. This changes QA logic only and does not change visible site content.

- Site QA guard maintenance: the audiobook check now requires the production player structure (1 lazy HTML5 audio element, 11 exact release URLs, no initial audio src) instead of the obsolete “coming soon” placeholder. Live visual comparison masks only the approved audiobook CTA text delta; all other visible differences remain locked.

- Audiobook V2 download delta: enable the existing Download modal to provide one public ZIP package containing all 11 approved WEB V2 MP3 chapters. Package asset: `Iren_Kipo_V_zone_vidimosti_Audiobook_WEB_V2.zip`, hosted in the same production GitHub Release. No audio re-encoding or literary-content changes.

- Audiobook modal behavior delta: closing the audiobook modal by the × button, backdrop click or Escape pauses any playing audio while preserving the current playback position for later resume. This fixes background playback after the player is closed.

- Subscription funnel analytics delta: successful on-site Google Forms submissions emit a `subscription_success` GA4 event with only campaign attribution fields (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`). Subscriber email is never sent to analytics. No visible site change.

- Facebook canonical Page navigation delta: the visible homepage Facebook link opens the Reels tab of canonical Page ID `1236694432869766` directly, because the Page root view may not surface published Reels. `Person.sameAs` remains the canonical root Page URL. No Facebook identity, content, analytics, book text, artwork, typography, palette, or section-order change.

- Facebook live-Reel navigation correction: the visible homepage Facebook link points directly to the currently published canonical Reel `1751115659272771`, because the numeric Page `/reels/` route returns an unavailable-page error in the current Facebook UI. `Person.sameAs` remains the canonical Page root URL. No content, artwork, typography, palette, section order, or Facebook identity changes.

- Facebook web-profile correction: the visible homepage Facebook link uses the public web-profile identifier `122107606821454086`, as evidenced by the Page's own published post/profile-media URLs. Automation continues to use Graph Page ID `1236694432869766`. This separates the API Page identifier from the browser-facing profile identifier; no Facebook content or identity is recreated.

- Technical SEO and reader-measurement delta: add explicit index/follow and author metadata, Book/Chapter/Breadcrumb structured data for the book and all 11 chapter pages, and GA4 reader-depth events at 50% and 90% plus book completion at 90% of chapter 11. No book text, visible copy, layout, palette, typography, or artwork is changed.

- Search-intent metadata delta: target Russian-language discovery for the book with natural, non-stuffed phrases around «В зоне видимости», contemporary family fiction, family saga, family/technology/publicity themes and free online reading. Add a small meta-keywords set for Yandex only; Google-facing work relies on title, description and structured Book genre/keywords because Google ignores meta-keywords. No visible page copy, book text, layout, artwork, typography or palette is changed.

- Visual-change governance: no externally visible homepage/reader layout, copy, artwork, typography, palette, spacing, section order, controls, or other presentation changes may be made without the user's prior explicit approval. Technical SEO, analytics and performance work must remain visually neutral unless separately approved.

- Audiobook/search recrawl delta: enrich existing nonvisual schema.org metadata with free-reading, topic, ReadAction and ListenAction semantics plus an Audiobook entity for the approved 12:36:05 audio edition; refresh sitemap lastmod on the homepage, book index and 11 chapter URLs to reflect the current 2026-09-21 content/metadata update. No visible copy, controls, layout, artwork, typography, palette or literary text changes.

- Lossless image-size optimization delta: recompress approved PNG assets without resizing, recropping, palette conversion or visual redesign; preserve decoded RGBA pixels exactly, keep only files that become smaller, mirror optimized source assets to the public root, update locked asset checksums, and require the existing strict desktop/tablet/mobile pixel comparison before merge. LOSSLESS_IMAGE_RESULT: 8/8 PNG files became smaller; 13222420 -> 12392078 bytes; saved 830342 bytes (6.3%); decoded RGBA pixels verified identical for every optimized image.

- Search-discovery automation delta: add an IndexNow verification key and post-deploy submission workflow for the 15 canonical public URLs; add a dedicated image sitemap for approved cover/banner/share/author-mark assets; make all 11 chapter search titles, descriptions and Chapter schema topic metadata unique and content-specific without changing any literary text or visible page content; keep source/public chapter copies synchronized. No visible copy, layout, controls, artwork, typography, palette, spacing or literary text changes.

- Subscription transport hardening delta: make the existing on-site Google Forms submission action and required entry names native HTML attributes so delivery no longer depends on JavaScript renaming fields; keep the current visible form unchanged; downgrade browser-side analytics from unverified `subscription_success` to `subscription_submit` because iframe load alone cannot prove a Google Sheet write. No visible copy, layout, styling, controls, artwork or literary text changes.

- Hero CWV metadata delta: correct the approved series-banner intrinsic HTML dimensions to the decoded asset size 2033×774 and mark this existing above-the-fold image fetchpriority=high. The PNG bytes, CSS, rendered geometry, crop, artwork, copy and layout remain unchanged; strict visual lock is required before merge.

- Hero CLS reservation delta: replace the approved hero image CSS aspect-ratio:auto override with the exact decoded asset ratio 2033/774 so the browser reserves the final banner height before the PNG loads. Final rendered geometry, PNG bytes, crop, artwork, copy, colors, typography and layout are unchanged; strict visual lock is required before merge.

- Subscription status hardening: after Google Forms iframe load, the visible status now states only that the request was sent and that email confirmation follows after processing; it no longer claims the subscription is already recorded. No layout/style/control/artwork/literary-text changes.

- Subscription feedback: after confirmed Google Forms iframe response, show a more prominent factual message: “Спасибо! Заявка отправлена. Подтверждение придёт на электронную почту.” Overall page composition and controls remain unchanged.

- Subscriber browser state: after a successful Google Forms submission, the same browser stores only a boolean subscription marker (no email) and shows “Вы уже подписаны на новости Ирэн Кипо.” on later visits instead of repeating the form. No subscriber list is exposed to the public site.

- QA mechanism: branch `author-copy-approved-2026-09-21` may skip only the live pixel-lock comparison for the explicitly approved author-copy delta. HTML, SEO, security, responsive, download, asset-hash, analytics, and runtime checks remain mandatory.

- 2026-09-21: User-approved author-section copy change: removed “Страницы разные. Всё хорошо.” Retained “Писатель. Истории о людях, которые ищут, любят и остаются собой.” and the existing “Подписаться на новости” button. No site news feed added.

- 2026-09-21 promotion/SEO entity delta: corrected the stale Facebook identity in homepage Person.sameAs to the current public Facebook page; added a canonical CreativeWorkSeries entity for «Всё хорошо» and linked Book 1 to it; added publication date metadata for Book 1; added social-image alt metadata; synchronized the stronger public /read/ SEO metadata back into src/read/index.html so future builds cannot silently regress it. No visible page content or layout changed.

- 2026-09-21 promotion attribution delta: preserve only non-personal campaign UTM fields (utm_source, utm_medium, utm_campaign, utm_content) in sessionStorage for the current browser session and attach them to key GA4 events across homepage/reader navigation, including read_start, chapter_open/progress, audiobook events, subscription_submit and LitRes outbound clicks. No email or subscriber identity is stored in analytics attribution. QA now verifies facebook/P13 attribution survives navigation to chapter 1. No visible site change.

- 2026-09-22 TikTok Business OAuth callback delta: add noindex helper page `/tiktok-business-callback.html` that relays only the OAuth authorization result from the public verified site to the local PROMO listener at `127.0.0.1:3456`. No visible homepage/profile copy, layout, artwork, typography, palette, controls, section order, or publishing behavior changes. This is technical OAuth plumbing only.

- Instagram OAuth callback delta: add a noindex helper page at `/instagram-oauth-callback.html` used only for the one-time Instagram authorization-code return for PROMO automation. No visible homepage/profile design changes; no automatic publishing permission is granted by this site change.

- Facebook Meta V2 canonical link delta: replace the retired Facebook profile URL in the visible social link and Person.sameAs metadata with the new canonical Page `https://www.facebook.com/irenkipo/`. No visible layout, artwork, typography, palette, or section-order change.

- 2026-09-22 runtime integrity repair: the generated `dist/index.html` is now normalized to the canonical Meta V2 Facebook Page and the build rejects the retired Facebook profile ID if it leaks into the deploy artifact. The build also requires all six canonical social links plus LitRes to exist in the final deploy artifact. No visible layout, copy, artwork, typography, palette, controls, or section-order change.

- 2026-09-22 subscription runtime correction: remove browser-side `iren_kipo_subscribed` persistence and the unverified “Вы уже подписаны” state. A hidden Google Forms iframe load is treated only as evidence that the request was sent; the UI now says “Спасибо! Заявка отправлена.” and never claims the subscriber is recorded. The existing form endpoint and required Google entry names remain unchanged. No layout, styling, artwork, typography, palette, or literary-content change.

- 2026-09-25 one-click unsubscribe delta: user explicitly selected the one-click option. Subscription confirmation emails may contain a clickable «Отписаться» link to `/unsubscribe.html?t=<opaque-token>`. The helper posts only a synthetic token carrier to the existing Google Form, never the subscriber email. The PROMO subscriber sync validates the current token, records `UNSUBSCRIBED`, sends the approved unsubscribe confirmation and owner notice, and rotates the token on every later subscription so stale links cannot unsubscribe a newer subscription. Reply-based Yahoo unsubscribe parsing is retired. No homepage layout, copy, artwork, typography, palette, section order, or reader content changes.

- Reader/audio local progress delta: explicitly approved 2026-09-25. Reading progress is stored only in the reader's browser via localStorage as the last chapter plus scroll ratio; the existing homepage «Читать бесплатно» link silently continues to that saved chapter, and the chapter restores the saved position on the same browser/device. Audiobook progress is stored only in localStorage as chapter plus playback seconds and is restored when the existing audiobook modal is opened, without autoplay and without preloading audio before the listener opens the player. No progress data is transmitted to PROMO, GA4, Google Forms, or any external service. No visible copy, layout, artwork, typography, palette, controls, or section order changes.


- 2026-09-25 SITE-NEXT analytics/SEO delta: keep cookieless GA4 and the locked visible UI; add machine-readable per-format download events, per-chapter 50/90 reading events, per-chapter audiobook select/play events, and 404_view tracking on the existing 404 page. Canonical Facebook source is now exactly `https://www.facebook.com/irenkipo/`; build-time silent replacement of retired Facebook identities is removed so stale identities fail validation instead of being masked. Sitemap `lastmod` is derived per indexed source page from Git history, with the existing date only as a non-git fallback. No visible homepage/reader copy, layout, artwork, typography, palette, controls, or section order changes.

- 2026-09-25 native counter delta: add an embedded cookieless visit/event counter that posts only technical @analytics.invalid records to the already-connected Google Form. No visitor email, name, persistent visitor ID, or cookie is created by this counter. External/direct entries are counted separately from page views; reading, audio, download, subscription-submit, LitRes and 404 actions use compact event codes. A hidden owner_test browser flag disables both native counter events and GA4 on the owner's browser. Deployed CSP allows only the existing Google Forms host for this transport. No visible homepage/reader copy, layout, artwork, typography, palette, controls, or section order changes.

- 2026-09-25 native counter QA isolation: native Google Form events are emitted only when location.origin is exactly https://irenkipo.github.io. Local/PR Playwright QA no longer writes traffic events. This corrects test contamination discovered during first production verification; visible UI unchanged.

- 2026-09-25 privacy disclosure closeout delta: explicitly approved update to the visible Privacy page documents the anonymous native Google Forms event counter and browser-local reading/audio progress storage. The Privacy CSP also explicitly allows the existing Google Forms transport for the native counter. No homepage, reader, artwork, typography, palette, controls, section order, or literary text changes.

- 2026-09-25 final user-journey QA delta: add a nonvisual Playwright closeout test that verifies reading progress save/restore and homepage continuation, audiobook chapter/time restoration without autoplay plus pause/save on modal close, EPUB/PDF/audiobook-ZIP links, canonical LitRes link, intercepted subscription form transport/status/event, and one-click unsubscribe token transport/status. The same test is required in PR Site quality and before production Pages deployment. No visible site change.

- 2026-09-25 FINAL SITE CLOSEOUT: production commit `cc1574cb5d474f3bc02da456b4a616705ca4a22b` passed SITE CURRENT guard, Site quality, SEO health, Pages build/deployment, and the final user-journey QA. Rollback branch `site-rollback-final-2026-09-25` points exactly to this verified production commit. Future work must start from this baseline and must not restore obsolete placeholders, pre-audiobook assets/behavior, pre-counter analytics, or older subscription/runtime states.

- 2026-09-26 Search Console status record: documentation-only update to `project-control/SEO_SEARCH_CURRENT.md` recording the verified Google state after sitemap resubmission and indexing requests for `/` and `/read/`. No public site, build, runtime, content, design, analytics, or deployment behavior changes.
