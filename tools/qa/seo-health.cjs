"use strict";

const BASE_URL = new URL(process.env.SEO_BASE_URL || "https://irenkipo.github.io/");
const CANONICAL_ORIGIN = "https://irenkipo.github.io";
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf4CueonKqtg43EaRjTHyjK3V_PbcGvwwzNju_QM2_mjdCspg/viewform";
const LITRES_URL = "https://www.litres.ru/74382683/";
const SOCIAL_URLS = [
  "https://www.instagram.com/irenkipo/",
  "https://www.facebook.com/1236694432869766",
  "https://www.threads.com/@irenkipo"
];
const CHAPTER_PATHS = Array.from({ length: 11 }, (_, index) => `/read/chapter-${String(index + 1).padStart(2, "0")}/`);
const EXPECTED_PATHS = ["/", "/read/", ...CHAPTER_PATHS, "/privacy.html", "/terms.html"];
const EXPECTED_CANONICALS = EXPECTED_PATHS.map(pathname => `${CANONICAL_ORIGIN}${pathname}`);
const failures = [];
const timings = [];

const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(match => match[0]);
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match ? match[2].replaceAll("&amp;", "&") : "";
};
const title = html => (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").trim();
const meta = (html, name) => tags(html, "meta").filter(tag => attribute(tag, "name").toLowerCase() === name.toLowerCase()).map(tag => attribute(tag, "content"));
const canonicals = html => tags(html, "link").filter(tag => attribute(tag, "rel").toLowerCase().split(/\s+/).includes("canonical")).map(tag => attribute(tag, "href"));
const anchors = html => tags(html, "a").map(tag => ({ tag, href: attribute(tag, "href") })).filter(item => item.href);

async function request(url, includeBody = false) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const started = Date.now();
    try {
      const response = await fetch(url, {
        method: includeBody ? "GET" : "HEAD",
        redirect: "follow",
        headers: { "user-agent": "irenkipo-seo-health/1.0" },
        signal: AbortSignal.timeout(20000)
      });
      const elapsedMs = Date.now() - started;
      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`HTTP ${response.status}`);
        if (attempt < 3) {
          await response.body?.cancel();
          await sleep(attempt * 1000);
          continue;
        }
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = includeBody ? await response.text() : "";
      if (!includeBody) await response.body?.cancel();
      timings.push({ url, elapsedMs });
      return { response, body, elapsedMs };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(attempt * 1000);
    }
  }
  failures.push(`${url}: ${lastError?.message || "request failed"}`);
  return null;
}

function collectTypes(value, output = new Set()) {
  if (Array.isArray(value)) value.forEach(item => collectTypes(item, output));
  else if (value && typeof value === "object") {
    if (typeof value["@type"] === "string") output.add(value["@type"]);
    Object.values(value).forEach(item => collectTypes(item, output));
  }
  return output;
}

function exactExternalLink(html, expectedUrl, options = {}) {
  const found = anchors(html).find(item => item.href === expectedUrl);
  if (!found) return false;
  if (options.newTab && attribute(found.tag, "target") !== "_blank") return false;
  if (options.safeRel) {
    const rel = attribute(found.tag, "rel").toLowerCase().split(/\s+/);
    if (!rel.includes("noopener") || !rel.includes("noreferrer")) return false;
  }
  return true;
}

(async () => {
  const sitemapUrl = new URL("sitemap.xml", BASE_URL).href;
  const robotsUrl = new URL("robots.txt", BASE_URL).href;
  const sitemapResult = await request(sitemapUrl, true);
  const robotsResult = await request(robotsUrl, true);
  if (!sitemapResult || !robotsResult) throw new Error("Core discovery files are unavailable");

  const sitemap = sitemapResult.body;
  if (!/^<\?xml[\s\S]*<urlset\b[\s\S]*<\/urlset>\s*$/i.test(sitemap.trim())) failures.push("sitemap.xml: invalid XML envelope");
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1].trim());
  if (new Set(sitemapUrls).size !== sitemapUrls.length) failures.push("sitemap.xml: duplicate URLs");
  if (sitemapUrls.length !== EXPECTED_CANONICALS.length || EXPECTED_CANONICALS.some(url => !sitemapUrls.includes(url))) failures.push("sitemap.xml: URL set differs from the 15 expected canonical URLs");
  const sitemapChapters = sitemapUrls.filter(url => /\/read\/chapter-\d{2}\/$/.test(url));
  if (sitemapChapters.length !== 11 || sitemapUrls.some(url => /chapter-12/i.test(url))) failures.push("sitemap.xml: expected exactly chapters 01–11 and no chapter-12");
  if (sitemapUrls.some(url => !url.startsWith("https://irenkipo.github.io/"))) failures.push("sitemap.xml: non-canonical or non-HTTPS URL");

  const robots = robotsResult.body;
  if (!/^Allow:\s*\/$/mi.test(robots)) failures.push("robots.txt: Allow / missing");
  if (!robots.includes("Sitemap: https://irenkipo.github.io/sitemap.xml")) failures.push("robots.txt: canonical Sitemap line missing");
  if (/^Disallow:\s*\/(?:\s*$|read(?:\/|$)|assets(?:\/|$))/mi.test(robots)) failures.push("robots.txt: public pages or required assets are blocked");

  const pages = new Map();
  for (const pathname of EXPECTED_PATHS) {
    const requestUrl = new URL(pathname.replace(/^\//, ""), BASE_URL).href;
    const result = await request(requestUrl, true);
    if (!result) continue;
    const html = result.body;
    pages.set(pathname, html);
    const expectedCanonical = `${CANONICAL_ORIGIN}${pathname}`;
    const pageTitle = title(html);
    const descriptions = meta(html, "description");
    const pageCanonicals = canonicals(html);
    const robotsMeta = meta(html, "robots").join(",").toLowerCase();
    if (!pageTitle) failures.push(`${pathname}: title missing`);
    if (descriptions.length !== 1 || !descriptions[0].trim()) failures.push(`${pathname}: one non-empty description required`);
    if (pageCanonicals.length !== 1 || pageCanonicals[0] !== expectedCanonical) failures.push(`${pathname}: canonical must equal ${expectedCanonical}`);
    if (robotsMeta.split(/[\s,]+/).includes("noindex")) failures.push(`${pathname}: unexpected noindex`);
    if ((html.match(/<h1\b/gi) || []).length !== 1) failures.push(`${pathname}: exactly one H1 required`);
  }

  const pageTitles = [...pages.values()].map(title);
  const pageDescriptions = [...pages.values()].map(html => meta(html, "description")[0] || "");
  const pageCanonicals = [...pages.values()].flatMap(canonicals);
  if (new Set(pageTitles).size !== pageTitles.length) failures.push("Indexed pages: duplicate titles");
  if (new Set(pageDescriptions).size !== pageDescriptions.length) failures.push("Indexed pages: duplicate descriptions");
  if (new Set(pageCanonicals).size !== pageCanonicals.length) failures.push("Indexed pages: duplicate canonicals");

  const homepage = pages.get("/") || "";
  if (title(homepage) !== "Ирэн Кипо — серия романов «Всё хорошо»") failures.push("Homepage: preferred title changed");
  if (meta(homepage, "description")[0] !== "Ирэн Кипо — автор серии романов «Всё хорошо». Книга 1 «В зоне видимости»: читать бесплатно на сайте автора.") failures.push("Homepage: preferred description changed");
  const jsonLdBlocks = [...homepage.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!jsonLdBlocks.length) failures.push("Homepage: JSON-LD missing");
  const structuredTypes = new Set();
  for (const block of jsonLdBlocks) {
    try { collectTypes(JSON.parse(block[1]), structuredTypes); }
    catch { failures.push("Homepage: invalid JSON-LD"); }
  }
  for (const requiredType of ["WebSite", "Person", "Book", "CreativeWorkSeries"]) if (!structuredTypes.has(requiredType)) failures.push(`Homepage JSON-LD: ${requiredType} missing`);

  const hasCurrentSubscriptionForm = /<form\b[^>]*data-subscription-form\b/i.test(homepage) && /<button\b[^>]*data-subscription-submit\b/i.test(homepage);
  if (!hasCurrentSubscriptionForm && !exactExternalLink(homepage, GOOGLE_FORM_URL, { newTab: true, safeRel: true })) failures.push("Homepage: subscription CTA invalid");
  if (!exactExternalLink(homepage, LITRES_URL, { newTab: true, safeRel: true })) failures.push("Homepage: LitRes href/target/rel invalid");
  for (const socialUrl of SOCIAL_URLS) if (!exactExternalLink(homepage, socialUrl, { newTab: true, safeRel: true })) failures.push(`Homepage: social link invalid (${new URL(socialUrl).hostname})`);

  const internalLinks = new Set();
  for (const [pathname, html] of pages) {
    const sourceUrl = new URL(pathname.replace(/^\//, ""), BASE_URL);
    for (const { href } of anchors(html)) {
      if (href.startsWith("#") || /^(?:mailto|tel):/i.test(href)) continue;
      const resolved = new URL(href, sourceUrl);
      resolved.hash = "";
      if (resolved.origin === BASE_URL.origin) internalLinks.add(resolved.href);
    }
  }
  const sitemapRequestUrls = new Set(EXPECTED_PATHS.map(pathname => new URL(pathname.replace(/^\//, ""), BASE_URL).href));
  for (const url of internalLinks) if (!sitemapRequestUrls.has(url)) await request(url, false);

  const faviconTag = tags(homepage, "link").find(tag => attribute(tag, "rel").toLowerCase().split(/\s+/).includes("icon"));
  if (!faviconTag) failures.push("Homepage: favicon missing");
  else await request(new URL(attribute(faviconTag, "href"), BASE_URL).href, false);

  const homepageTiming = timings.find(item => item.url === BASE_URL.href);
  const report = {
    pass: failures.length === 0,
    production: BASE_URL.href,
    checkedIndexedPages: pages.size,
    sitemapUrls: sitemapUrls.length,
    chapters: sitemapChapters.length,
    internalLinksChecked: internalLinks.size,
    structuredTypes: [...structuredTypes].sort(),
    homepageResponseMs: homepageTiming?.elapsedMs ?? null,
    externalLinks: "structure-only (Google Form, LitRes, Instagram, Facebook, Threads)",
    failures
  };
  console.log(JSON.stringify(report, null, 2));
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(JSON.stringify({ pass: false, failures: [...failures, error.message] }, null, 2));
  process.exit(1);
});