# SITE CURRENT

- Status: candidate — cookieless GA4 analytics and measurable promotion funnel
- Candidate branch: `ga4-consent-2026-09-19`
- Production baseline: `50e7f33dd4ad07b8fefbb1e2ad05f97173f2dc5a`
- Rollback tag: `SITE-PRE-SEO-SECURITY-V1`
- Public URL: <https://irenkipo.github.io/>
- Visual state: LOCKED except for the explicitly approved Audiobook V2 delta: the existing audiobook button/placeholder may become the production 11-chapter player. All unrelated homepage geometry, art, typography, palette and content remain locked.
- Build: `python tools/build/build-site.py`
- QA: `node tools/qa/qa-site.cjs`, `node tools/qa/seo-health.cjs`, and `node tools/qa/security-scan.cjs`
- Deployment source: generated `dist/` artifact only.
- Release: PR + owner approval required before merge.
- Subscription: one public Google Form CTA; no local input, backend, provider config, or client-side submission logic.
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
