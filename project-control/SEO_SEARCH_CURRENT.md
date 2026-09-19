# SEO SEARCH CURRENT

## Current production state

- Production URL: <https://irenkipo.github.io/>
- Production SHA: `50e7f33dd4ad07b8fefbb1e2ad05f97173f2dc5a`
- Sitemap URL: <https://irenkipo.github.io/sitemap.xml>
- Robots URL: <https://irenkipo.github.io/robots.txt>
- Primary search goal: bring a Russian-speaking reader to the author's site to read «В зоне видимости» free of charge.
- Secondary channel: LitRes.
- Visible SEO copy changes: prohibited for this delta.

GOOGLE SEARCH CONSOLE: VERIFIED

GOOGLE SITEMAP: SUBMITTED

GOOGLE MAIN PAGE: INDEXING REQUESTED

GOOGLE /read/: INDEXING REQUESTED

BING: CONNECTED VIA GOOGLE SEARCH CONSOLE IMPORT

BING SITEMAP: SUCCESS

BING URLS DISCOVERED: 15

BING SITEMAP ERRORS: 0

BING SITEMAP WARNINGS: 0

Google and Bing external setup is complete. Search engines may continue processing crawl and indexing data after submission; no manual submission of the 11 chapter URLs is required while the sitemap remains healthy.

## Production audit

### ALREADY DONE

- Homepage title is exactly `Ирэн Кипо — серия романов «Всё хорошо»`.
- Homepage description is exactly `Ирэн Кипо — автор серии романов «Всё хорошо». Книга 1 «В зоне видимости»: читать бесплатно на сайте автора.`
- Homepage has one H1, one canonical URL, complete Open Graph and Twitter card metadata, and a favicon.
- Valid JSON-LD covers `WebSite`, `Person`, `Book`, and the nested `CreativeWorkSeries`; it contains no invented ISBN, reviews, ratings, awards, publisher, price, or dates.
- `/read/` and chapters 01–11 have unique titles, descriptions, canonical URLs, one H1, and reading navigation. Literary text is unchanged.
- Indexed sitemap pages have no `noindex`; the deliberate `/404.html` noindex is not included in the sitemap.
- The build generates the public sitemap and robots file in `dist`; the sitemap has 15 canonical HTTPS URLs: homepage, `/read/`, 11 chapters, privacy, and terms.
- `robots.txt` allows public crawling and declares the canonical sitemap; it does not block `/`, `/read/`, or required assets.
- Internal browser QA covers missing anchors, internal 4xx, images, console errors, keyboard behavior, and layouts at 1440, 820, and 390 px.
- The site remains static and uses no web-font downloads or third-party client-side libraries. GA4 measurement (`G-5F54GZZN18`) runs in denied-storage cookieless mode with advertising features/signals disabled and no consent banner.
- Google Search Console ownership is verified via the deployed HTML verification file.
- Google has accepted the sitemap submission; the homepage and `/read/` have been live-tested and submitted for indexing.
- Bing Webmaster Tools is connected through Google Search Console import; the sitemap status is `Success`, with 15 URLs discovered, 0 errors, and 0 warnings.

### MISSING

None for technical search-engine setup.

Search engines may still need time to crawl and index the submitted URLs. That is an external processing state, not a missing site configuration.

### NEEDS IMPROVEMENT

Resolved:

- classified the legacy root `sitemap.xml` and `robots.txt` as inactive; GitHub Pages deploys only the deterministic versions generated inside `dist`;
- build validates exactly the real chapter directories 01–11 and rejects chapter drift;
- build copies the official Google HTML verification file from `src/site/` to the root of `dist`;
- Google Search Console and Bing Webmaster Tools are both connected to the production property and sitemap.

### DO NOT CHANGE

- approved banner, covers, 3D mockups, palette, typography, dimensions, or section order;
- book description, chapter text, reader structure, or chapter count;
- audio placeholder, Google Form URL, LitRes URL, or social URLs;
- visible text for keyword placement; keywords below are a mapping tool, not copy to paste into the page;
- privacy/terms as search landing pages.

## Compact semantic core

| Cluster | Queries | Search intent | Priority | Target page | Already covered | Natural additional signal | Visible-text change forbidden |
|---|---|---|---|---|---|---|---|
| A1 — author brand | Ирэн Кипо; Ирен Кипо; Ирэн Кипо книги | Find the official author site and books | HIGH | `/` | Title, H1, Person JSON-LD, author section | Search Console property and consistent canonical discovery | YES |
| A2 — series brand | Ирэн Кипо Всё хорошо; Всё хорошо Ирэн Кипо; Все хорошо Ирэн Кипо | Find the official series page | HIGH | `/` | Title, H1, banner context, WebSite and series structured data | Sitemap submission and external profile links to the canonical homepage | YES |
| A3 — Book 1 brand | В зоне видимости Ирэн Кипо; В зоне видимости книга; В зоне видимости роман | Find Book 1 and its official reading route | HIGH | `/` → `/read/` | Homepage description and Book JSON-LD; Book 1 block and internal CTA | Search Console inspection of homepage and `/read/` | YES |
| B1 — direct reading | читать В зоне видимости; В зоне видимости читать бесплатно; книга В зоне видимости читать онлайн | Read this specific book online | HIGH | `/read/` | Unique title/description/H1; homepage `Читать бесплатно` link | Accepted sitemap and healthy chapter navigation | YES |
| B2 — free book reading | читать книгу бесплатно; современный роман читать бесплатно; русский роман читать бесплатно | Discover a free modern Russian novel | MEDIUM | `/read/` | Read-page description and complete free chapter access | Canonical indexing of `/read/`; no extra generic copy | YES |
| B3 — family saga reading | семейный роман читать бесплатно; семейная сага читать онлайн; современная семейная сага | Find a contemporary family saga to read | MEDIUM | `/` → `/read/` | Series context, Book 1 description, free-reading CTA | Structured series/book relationship and sitemap | YES |
| C1 — family themes | современный семейный роман; роман о семье; роман о семейных отношениях; семейная сага о современности | Discover fiction about a modern family | MEDIUM | `/` | Approved Book 1 description and series presentation | Existing semantic HTML and Book/Series JSON-LD only | YES |
| C2 — public life themes | роман о блогерах; роман о социальных сетях; роман о публичной жизни | Discover a novel about a family living publicly online | MEDIUM | `/` | Approved description explicitly covers a family blog, content, and public observation | No extra signal required without approved visible copy | YES |
| C3 — family and technology | роман о семье и технологиях | Discover fiction connecting family life and technology | MEDIUM | `/` | Approved description explicitly mentions new technology and family time | Book structured data and internal read link | YES |

## Keyword → page map

| QUERY CLUSTER | TARGET PAGE | TITLE | DESCRIPTION | H1 | STRUCTURED DATA | INTERNAL LINKS | STATUS |
|---|---|---|---|---|---|---|---|
| Author, series, Book 1, family saga, read free | `/` | Preferred exact title retained | Preferred exact description retained | `Ирэн Кипо — серия романов „Всё хорошо“` | WebSite + Person + Book + CreativeWorkSeries | Direct `/read/` CTA; series, author, LitRes, and social blocks retained | READY; primary landing page |
| Read «В зоне видимости» free | `/read/` | `Читать «В зоне видимости» — Ирэн Кипо` | Unique book/series/free-reading description | `В зоне видимости` | Book relationship originates on homepage | Linked from homepage; links to all 11 chapters and back home | READY; primary reading-intent page |
| Indexed continuation, not doorway pages | `/read/chapter-01/` … `/read/chapter-11/` | Unique chapter number + book + author | Unique chapter number + book/series context | One chapter H1 per page | No fabricated per-chapter schema | Previous/next/contents navigation; chapter 01–11 only | READY; no keyword expansion |
| Utility/legal only | `/privacy.html` | Unique legal title | Unique factual description | `Конфиденциальность` | None required | Homepage footer and back link | INDEXABLE UTILITY; not promoted |
| Utility/legal only | `/terms.html` | Unique legal title | Unique factual description | `Условия использования` | None required | Homepage footer and back link | INDEXABLE UTILITY; not promoted |

## Operating rule

Technical search preparation and external search-engine setup are complete. This file should now only record real Google Search Console/Bing crawl, sitemap, or indexing states reported by those services; new audience-development planning belongs in the existing PROMO workflow.