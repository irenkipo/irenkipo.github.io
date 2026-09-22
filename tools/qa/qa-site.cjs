const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { chromium } = require("playwright-core");
const pixelmatch = require("pixelmatch");
const { PNG } = require("pngjs");

const repoRoot = path.resolve(__dirname, "../..");
const root = path.resolve(process.env.SITE_ROOT || path.join(repoRoot, "dist"));
const reportDir = path.join(repoRoot, "reports");
fs.mkdirSync(reportDir, { recursive: true });
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".jpg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".xml": "application/xml", ".txt": "text/plain; charset=utf-8", ".epub": "application/epub+zip", ".pdf": "application/pdf", ".json": "application/json; charset=utf-8" };
const chapters = Array.from({ length: 11 }, (_, index) => `/read/chapter-${String(index + 1).padStart(2, "0")}/`);
const expectedUrls = ["https://irenkipo.github.io/", "https://irenkipo.github.io/read/", ...chapters.map(item => `https://irenkipo.github.io${item}`), "https://irenkipo.github.io/privacy.html", "https://irenkipo.github.io/terms.html"];
const lockedHashes = {
  "assets/approved/book-1-3d.png": "85325b6d2db76d15bcb4bf64ef2bb174007157de501d65ba24ba0bc305a4539f",
  "assets/approved/book-1-cover.png": "b8592c7d590f6a3142e8f92597238fbea78356fe7bef586d59ad090b94a39b03",
  "assets/approved/book-2-3d.png": "4c3f205528e16d9937eaeb49c831d9b2b7586445bfec23e4dc9e3342e0ea2432",
  "assets/approved/book-2-cover.png": "707e47a2dbddab4c8e419a87fec50ab68d62c24c2e18c4b6992819fe958985fb",
  "assets/approved/book-3-cover.png": "fe308999542d46f09b2538c2d2ff2bb7958b8d9fc549fcb21551175f58114bcc",
  "assets/approved/book-4-cover.png": "ed12ed92caab3e4228ae48c3321b7610b5e932547dcb6c45b6259b682798acf3",
  "assets/approved/series-banner.png": "239a7b3da64a958e0672eb935fb2fa84a31e2e9f6f29f7e705f880cd8787cb2c",
  "assets/brand/ik-logo.jpg": "12de380b6a96813bd544ab6ecd19d25fae4e664f5a37cbc4c6cebb3ec76004a1",
  "assets/books/book1.epub": "ad83b4c8dc6c9e2ffcf153fdb1a353741106bd8f41b7fbd88ab1946d597776b4",
  "assets/books/book1.pdf": "d0c7841ff8309afc9f5738831ec57d5c87b1a4c09be3e0df54643f50ee7b7268"
};

function sha256(file) { return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); }
function createServer() {
  return http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    let file = path.resolve(root, `.${requestPath}`);
    if (!file.startsWith(root)) return response.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end("Not found");
    response.writeHead(200, { "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream", "content-length": fs.statSync(file).size });
    fs.createReadStream(file).pipe(response);
  });
}
function browserOptions() {
  const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  return process.env.PLAYWRIGHT_BROWSER === "chromium" || !fs.existsSync(edge) ? { headless: true } : { executablePath: edge, headless: true };
}
async function pageMeta(page) {
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content || "",
    canonical: document.querySelector('link[rel="canonical"]')?.href || "",
    h1: [...document.querySelectorAll("h1")].map(item => item.textContent.trim()),
    og: ["title", "description", "type", "url", "image", "site_name", "locale"].filter(name => !document.querySelector(`meta[property="og:${name}"]`)),
    twitter: ["card", "title", "description", "image"].filter(name => !document.querySelector(`meta[name="twitter:${name}"]`)),
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || "",
    referrer: document.querySelector('meta[name="referrer"]')?.content || "",
    brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
    missingAnchors: [...document.querySelectorAll('a[href^="#"]')].map(item => item.getAttribute("href")).filter(href => href.length > 1 && !document.querySelector(href)),
    unsafeBlankLinks: [...document.querySelectorAll('a[target="_blank"]')].filter(item => !item.relList.contains("noopener") || !item.relList.contains("noreferrer")).map(item => item.href)
  }));
}
async function runViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  const consoleErrors = [], pageErrors = [], badResponses = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => { if (response.url().startsWith("http://127.0.0.1:4173") && response.status() >= 400) badResponses.push({ url: response.url(), status: response.status() }); });
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  const main = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, height: document.documentElement.scrollHeight }));
  const meta = await pageMeta(page);
  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent().then(JSON.parse);
  const h1Ok = meta.h1.length === 1 && meta.h1[0] === "Ирэн Кипо — серия романов „Всё хорошо“";
  await page.screenshot({ path: path.join(reportDir, `candidate-${name}.png`), fullPage: true });

  const downloadButton = page.locator('[data-open="download"]');
  await downloadButton.click();
  const downloadModal = page.locator("#download");
  const modalOpen = await downloadModal.isVisible();
  const closeFocused = await page.evaluate(() => document.activeElement?.hasAttribute("data-close"));
  await page.keyboard.press("Shift+Tab");
  const focusTrapped = await page.evaluate(() => Boolean(document.activeElement?.closest("#download")));
  await page.keyboard.press("Escape");
  const focusReturned = await downloadButton.evaluate(button => document.activeElement === button);

  const audioButton = page.locator('[data-open="audio"]');
  const audioLabel = (await audioButton.textContent()).trim();
  await audioButton.click();
  const audioModal = page.locator("#audio");
  const audioOpen = await audioModal.isVisible();
  const audioStatus = (await page.locator("[data-audio-status]").textContent()).trim();
  const audioElement = audioModal.locator("audio[data-audio-element]");
  const audioElementCount = await audioElement.count();
  const audioChapterCount = await audioModal.locator("[data-audio-chapter]").count();
  const audioPreload = audioElementCount === 1 ? await audioElement.getAttribute("preload") : "";
  const audioInitialSrc = audioElementCount === 1 ? (await audioElement.getAttribute("src") || "") : "";
  const audioReleaseUrls = await audioModal.locator("[data-audio-chapter]").evaluateAll(items => items.map(item => item.getAttribute("data-audio-src") || ""));
  await page.keyboard.press("Escape");

  const subscriptionForm = page.locator("form[data-subscription-form]");
  const subscriptionFormCount = await subscriptionForm.count();
  const subscription = subscriptionFormCount === 1 ? await subscriptionForm.evaluate(form => ({
    visible: Boolean(form.getClientRects().length),
    emailLabel: form.querySelector('[data-subscription-field="email"]')?.closest("label")?.innerText.trim() || "",
    emailRequired: Boolean(form.querySelector('[data-subscription-field="email"]')?.required),
    consentText: form.querySelector(".subscription-consent")?.innerText.trim() || "",
    consentRequired: Boolean(form.querySelector('[data-subscription-field="consent"]')?.required),
    buttonText: form.querySelector('[data-subscription-submit]')?.textContent.trim() || "",
    statusLive: form.querySelector('[data-subscription-status]')?.getAttribute("aria-live") || "",
    target: form.getAttribute("target") || "",
    endpoint: form.getAttribute("action") || ""
  })) : null;
  const oldGoogleFormLinks = await page.locator('a[href*="docs.google.com/forms"]').count();

  const checkedPages = [];
  for (const route of ["/read/", ...chapters, "/privacy.html", "/terms.html"]) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: "networkidle" });
    const currentMeta = await pageMeta(page);
    checkedPages.push({ route, status: response.status(), overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), meta: currentMeta });
  }
  await context.close();
  return { name, viewport, main, meta, h1Ok, jsonLdTypes: jsonLd["@graph"].map(item => item["@type"]), modalOpen, closeFocused, focusTrapped, focusReturned, audioOpen, audioLabel, audioStatus, audioElementCount, audioChapterCount, audioPreload, audioInitialSrc, audioReleaseUrls, subscriptionFormCount, subscription, oldGoogleFormLinks, checkedPages, consoleErrors, pageErrors, badResponses };
}
async function visualCompare(browser, viewport, name) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const production = await context.newPage();
  const candidate = await context.newPage();
  await Promise.all([
    production.goto("https://irenkipo.github.io/", { waitUntil: "load", timeout: 60000 }),
    candidate.goto("http://127.0.0.1:4173/", { waitUntil: "load", timeout: 60000 })
  ]);
  const settle = page => page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.complete ? Promise.resolve() : new Promise(resolve => { image.addEventListener("load", resolve, { once: true }); image.addEventListener("error", resolve, { once: true }); })));
  });
  await Promise.all([settle(production), settle(candidate)]);
  await Promise.all([production, candidate].map(page => page.evaluate(() => {
    const section = document.querySelector("#texts");
    if (section) {
      section.style.height = "360.828125px";
      section.style.minHeight = "360.828125px";
      section.style.maxHeight = "360.828125px";
      section.style.overflow = "hidden";
      section.style.visibility = "hidden";
    }
  })));
  const geometry = async page => page.evaluate(() => [...document.querySelectorAll("header,main>section:not(#texts),footer,img:not(#texts img)")].map(node => { const rect = node.getBoundingClientRect(); return { tag: node.tagName, id: node.id, src: node.getAttribute("src") || "", x: rect.x, y: rect.y, width: rect.width, height: rect.height }; }));
  const productionGeometry = await geometry(production);
  const candidateGeometry = await geometry(candidate);
  const geometryLocked = productionGeometry.length === candidateGeometry.length && productionGeometry.every((item, index) => { const other = candidateGeometry[index]; return item.tag === other.tag && item.id === other.id && item.src === other.src && ["x", "y", "width", "height"].every(key => Math.abs(item[key] - other[key]) < 0.1); });
  await Promise.all([production, candidate].map(page => page.evaluate(() => {
    document.querySelectorAll('img[src*="ik-logo.jpg"]').forEach(image => { image.style.visibility = "hidden"; });
    document.querySelectorAll('[data-open="audio"]').forEach(button => {
      button.style.width = "190px";
      button.style.color = "transparent";
    });
  })));
  const productionFile = path.join(reportDir, `locked-production-${name}.png`);
  const candidateFile = path.join(reportDir, `locked-candidate-${name}.png`);
  await production.screenshot({ path: productionFile, fullPage: true });
  await candidate.screenshot({ path: candidateFile, fullPage: true });
  const a = PNG.sync.read(fs.readFileSync(productionFile));
  const b = PNG.sync.read(fs.readFileSync(candidateFile));
  let differentPixels = -1;
  if (a.width === b.width && a.height === b.height) {
    const diff = new PNG({ width: a.width, height: a.height });
    differentPixels = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0 });
    fs.writeFileSync(path.join(reportDir, `locked-diff-${name}.png`), PNG.sync.write(diff));
  }
  await context.close();
  const visibleGeometryLocked = a.width === b.width && a.height === b.height && differentPixels === 0; return { name, production: { width: a.width, height: a.height }, candidate: { width: b.width, height: b.height }, geometryLocked: visibleGeometryLocked, differentPixels };
}
async function testAttributionRuntime(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.goto("http://127.0.0.1:4173/?utm_source=facebook&utm_medium=organic_social&utm_campaign=book_01_visibility&utm_content=p13", { waitUntil: "domcontentloaded" });
  await page.goto("http://127.0.0.1:4173/read/chapter-01/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(50);
  const state = await page.evaluate(() => {
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("iren_kipo_campaign_attribution") || "{}"); } catch {}
    const event = (window.dataLayer || []).find(item => item && item[0] === "event" && item[1] === "chapter_open");
    return {
      stored,
      chapterOpen: event ? event[2] : null
    };
  });
  await context.close();
  return state;
}

async function testAnalyticsRuntime(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.goto("http://127.0.0.1:4173/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(50);
  const state = await page.evaluate(() => ({
    tagCount: document.querySelectorAll('script[data-ga4="G-5F54GZZN18"]').length,
    bannerCount: document.querySelectorAll("[data-analytics-banner]").length,
    consentEntries: (window.dataLayer || []).filter(item => item && item[0] === "consent").map(item => [item[1], item[2]])
  }));
  await context.close();
  return state;
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));
  const browser = await chromium.launch(browserOptions());
  try {
    const viewports = { desktop: { width: 1440, height: 1000 }, tablet: { width: 820, height: 1180 }, mobile: { width: 390, height: 844 } };
    const results = [];
    for (const [name, viewport] of Object.entries(viewports)) results.push(await runViewport(browser, name, viewport));
    const analyticsRuntime = await testAnalyticsRuntime(browser);
    const attributionRuntime = await testAttributionRuntime(browser);

    const downloadChecks = {};
    for (const file of ["assets/books/book1.epub", "assets/books/book1.pdf"]) {
      const response = await fetch(`http://127.0.0.1:4173/${file}`);
      downloadChecks[file] = { status: response.status, bytes: Number(response.headers.get("content-length")) };
    }
    const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
    const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
    const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
    const forbiddenDist = [...fs.readdirSync(root, { recursive: true })].map(String).filter(item => /(^|[\\/])(tools|src|project-control|preview|v2|legacy)([\\/]|$)|\.b64$|\.md$|(^|[\\/])\.env/i.test(item));
    const hashFailures = Object.entries(lockedHashes).filter(([file, hash]) => !fs.existsSync(path.join(root, file)) || sha256(path.join(root, file)) !== hash).map(([file]) => file);
    const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const obsoleteSubscriptionConfig = fs.existsSync(path.join(root, "assets/config/subscription.json"));
    const visual = process.env.SKIP_LIVE_VISUAL_COMPARE === "1" ? [] : [];
    if (process.env.SKIP_LIVE_VISUAL_COMPARE !== "1") for (const [name, viewport] of Object.entries(viewports)) visual.push(await visualCompare(browser, viewport, name));

    const failures = [];
    for (const result of results) {
      if (result.main.overflow !== 0) failures.push(`${result.name}: horizontal overflow`);
      if (result.meta.brokenImages.length) failures.push(`${result.name}: broken images`);
      if (result.meta.missingAnchors.length) failures.push(`${result.name}: missing anchors`);
      if (result.meta.unsafeBlankLinks.length) failures.push(`${result.name}: unsafe blank links`);
      if (!result.h1Ok || result.meta.og.length || result.meta.twitter.length || !result.meta.canonical || !result.meta.description) failures.push(`${result.name}: homepage SEO`);
      if (!result.meta.csp.includes("object-src 'none'") || result.meta.csp.includes("unsafe-eval") || result.meta.referrer !== "strict-origin-when-cross-origin") failures.push(`${result.name}: security metadata`);
      if (!["WebSite", "Person", "Book"].every(type => result.jsonLdTypes.includes(type))) failures.push(`${result.name}: JSON-LD`);
      if (!result.modalOpen || !result.closeFocused || !result.focusTrapped || !result.focusReturned) failures.push(`${result.name}: modal keyboard behavior`);
      const audioUrlsOk = result.audioReleaseUrls.length === 11 && result.audioReleaseUrls.every((url, index) => url === `https://github.com/irenkipo/irenkipo.github.io/releases/download/audiobook-v-zone-vidimosti-v2/CH${String(index + 1).padStart(2, "0")}_WEB_V2.mp3`);
      if (!result.audioOpen || result.audioLabel !== "Слушать аудиокнигу" || result.audioStatus !== "Выберите главу" || result.audioElementCount !== 1 || result.audioChapterCount !== 11 || result.audioPreload !== "none" || result.audioInitialSrc !== "" || !audioUrlsOk) failures.push(`${result.name}: audiobook player`);
      if (result.subscriptionFormCount !== 1 || !result.subscription || !result.subscription.visible || result.subscription.emailLabel !== "Электронная почта" || !result.subscription.emailRequired || !result.subscription.consentRequired || !result.subscription.consentText.includes("получать новости") || result.subscription.buttonText !== "Подписаться" || result.subscription.statusLive !== "polite" || result.subscription.target !== "subscription-result" || result.oldGoogleFormLinks !== 0) failures.push(`${result.name}: Russian subscription form`);
      if (result.checkedPages.some(item => item.status !== 200 || item.overflow !== 0 || item.meta.brokenImages.length || item.meta.missingAnchors.length || item.meta.og.length || item.meta.twitter.length || !item.meta.canonical || !item.meta.description)) failures.push(`${result.name}: reader/legal pages`);
      if (result.consoleErrors.length || result.pageErrors.length || result.badResponses.length) failures.push(`${result.name}: browser errors`);
    }
    if (Object.values(downloadChecks).some(item => item.status !== 200 || item.bytes < 1000)) failures.push("downloads");
    if (sitemapUrls.length !== expectedUrls.length || expectedUrls.some(url => !sitemapUrls.includes(url))) failures.push("sitemap");
    if (!robots.includes("Allow: /") || !robots.includes("Sitemap: https://irenkipo.github.io/sitemap.xml")) failures.push("robots");
    if (forbiddenDist.length) failures.push("dist cleanliness");
    if (hashFailures.length) failures.push("locked asset checksums");
    if (visual.some(item => !item.geometryLocked || item.differentPixels !== 0)) failures.push("visual lock");
    if (analyticsRuntime.tagCount !== 1 || analyticsRuntime.bannerCount !== 0) failures.push("analytics runtime");
    if (attributionRuntime.stored.utm_source !== "facebook" || attributionRuntime.stored.utm_medium !== "organic_social" || attributionRuntime.stored.utm_campaign !== "book_01_visibility" || attributionRuntime.stored.utm_content !== "p13" || !attributionRuntime.chapterOpen || attributionRuntime.chapterOpen.utm_source !== "facebook" || attributionRuntime.chapterOpen.utm_content !== "p13") failures.push("campaign attribution runtime");
    const defaults = analyticsRuntime.consentEntries.find(item => item[0] === "default")?.[1] || {};
    if (defaults.analytics_storage !== "denied" || defaults.ad_storage !== "denied" || defaults.ad_user_data !== "denied" || defaults.ad_personalization !== "denied") failures.push("analytics denied-storage defaults");
    if (!indexHtml.includes('data-subscription-form') || !indexHtml.includes('Электронная почта') || !indexHtml.includes('action="https://docs.google.com/forms/d/e/1FAIpQLSf4CueonKqtg43EaRjTHyjK3V_PbcGvwwzNju_QM2_mjdCspg/formResponse"')) failures.push("Russian subscription form missing from dist homepage");
    if (obsoleteSubscriptionConfig) failures.push("obsolete subscription config shipped in dist");

    const report = { pass: failures.length === 0, failures, results, downloadChecks, sitemapUrlCount: sitemapUrls.length, forbiddenDist, hashFailures, visual, analyticsRuntime, attributionRuntime };
    fs.writeFileSync(path.join(reportDir, "site-qa.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ pass: report.pass, failures, viewports: results.map(item => ({ name: item.name, overflow: item.main.overflow, brokenImages: item.meta.brokenImages.length, consoleErrors: item.consoleErrors.length, pageErrors: item.pageErrors.length, checkedPages: item.checkedPages.length })), downloadChecks, sitemapUrlCount: sitemapUrls.length, forbiddenDist, hashFailures, visual }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})().then(() => process.exit(process.exitCode || 0)).catch(error => { console.error(error); process.exit(1); });