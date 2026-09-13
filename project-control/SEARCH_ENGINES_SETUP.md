# Search engines setup

## Google Search Console

1. Open <https://search.google.com/search-console>.
2. Add a **URL-prefix** property: `https://irenkipo.github.io/`.
3. Choose **HTML file** when Google offers it. Download the exact `google….html` file without renaming or editing it.
4. Give that file to the site maintainer. It must be added as `src/site/<exact-google-filename>.html`; the existing build copies matching Google verification files to `dist/<exact-google-filename>.html` and therefore to the public site root.
5. After deployment, open `https://irenkipo.github.io/<exact-google-filename>.html` in a private browser window, then click **Verify** in Search Console. Do not remove the file after verification.
6. In **Sitemaps**, submit `https://irenkipo.github.io/sitemap.xml`.
7. In **URL Inspection**, inspect:
   - `https://irenkipo.github.io/`
   - `https://irenkipo.github.io/read/`

Do not add a fabricated verification token, Google Analytics, or another tracker. Official references: [ownership verification](https://support.google.com/webmasters/answer/9008080), [sitemap submission](https://support.google.com/webmasters/answer/7451001), [URL Inspection](https://support.google.com/webmasters/answer/9012289).

## Bing Webmaster Tools

1. Open <https://www.bing.com/webmasters/>.
2. Prefer **Import from Google Search Console** after the Google property is verified; select `https://irenkipo.github.io/` and import it.
3. If import is unavailable, add the site manually and use Bing's offered verification method. For the XML-file method, keep the provided filename/content unchanged and add it as `src/site/BingSiteAuth.xml`; the build copies it to the public site root.
4. Submit or confirm `https://irenkipo.github.io/sitemap.xml`.

Official reference: [Add and verify a site](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b).

The 11 chapters do not need manual submission one by one when the sitemap is accepted. Record only real external states in `project-control/SEO_SEARCH_CURRENT.md`.