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
  "assets/approved/book-1-3d.png": "5cd56581150c093ddcbe75f4edec3432dd0a36553f1b7ebb0476161d9f959d97",
  "assets/approved/book-1-cover.png": "9ff1cbceda275ba7d9c65695fa8db67dc2a3fcb6e2fe48b662f4f7e777d677eb",
  "assets/approved/book-2-3d.png": "e09a5b1c7e9d63a59b70d959269f29dd5677d3902e3fa9d327ab5f05b893e4c0",
  "assets/approved/book-2-cover.png": "1b33aee2001ac8ac61e7246186c5fb12558dc297e21873ecdac5f9bf3b7dc6cb",
  "assets/approved/book-3-cover.png": "40aac76d068d536a5acfff7c531f9ddaaf49e6a5ddd0dc1d59fde1e6899fcb77",
  "assets/approved/book-4-cover.png": "114ccf8aa931cb279db7b41c6ac6d8f517c181930a18a09c91d823e1f18988db",
  "assets/approved/series-banner.png": "2dbc630edc8b666b5b2f358b9edc1fba157f10547c611bea31e33e202c6bce7b",
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
  const phantomAudioControls = await audioModal.locator("audio,[data-play],[data-progress]").count();
  await page.keyboard.press("Escape");

  await page.locator("[data-subscription-form]").evaluate(form => form.requestSubmit());
  const emptyEmail = (await page.locator("[data-subscription-status]").textContent()).trim();
  await page.locator("#subscription-email").fill("wrong-email");
  await page.locator("[data-subscription-form]").evaluate(form => form.requestSubmit());
  const invalidEmail = (await page.locator("[data-subscription-status]").textContent()).trim();
  await page.locator("#subscription-email").fill("qa@example.com");
  await page.locator("[data-subscription-form]").evaluate(form => { form.requestSubmit(); form.requestSubmit(); });
  const subscriptionStatus = (await page.locator("[data-subscription-status]").textContent()).trim();

  const checkedPages = [];
  for (const route of ["/read/", ...chapters, "/privacy.html", "/terms.html"]) {
    const response = await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: "networkidle" });
    const currentMeta = await pageMeta(page);
    checkedPages.push({ route, status: response.status(), overflow: await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), meta: currentMeta });
  }
  await context.close();
  return { name, viewport, main, meta, h1Ok, jsonLdTypes: jsonLd["@graph"].map(item => item["@type"]), modalOpen, closeFocused, focusTrapped, focusReturned, audioOpen, audioLabel, audioStatus, phantomAudioControls, emptyEmail, invalidEmail, subscriptionStatus, checkedPages, consoleErrors, pageErrors, badResponses };
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
  const geometry = async page => page.evaluate(() => [...document.querySelectorAll("header,main>section,footer,img")].map(node => { const rect = node.getBoundingClientRect(); return { tag: node.tagName, id: node.id, src: node.getAttribute("src") || "", x: rect.x, y: rect.y, width: rect.width, height: rect.height }; }));
  const productionGeometry = await geometry(production);
  const candidateGeometry = await geometry(candidate);
  const geometryLocked = productionGeometry.length === candidateGeometry.length && productionGeometry.every((item, index) => { const other = candidateGeometry[index]; return item.tag === other.tag && item.id === other.id && item.src === other.src && ["x", "y", "width", "height"].every(key => Math.abs(item[key] - other[key]) < 0.1); });
  await candidate.locator('[data-open="audio"]').evaluate(button => { button.textContent = "Слушать бесплатно"; });
  await Promise.all([production, candidate].map(page => page.evaluate(() => document.querySelectorAll('img[src*="ik-logo.jpg"]').forEach(image => { image.style.visibility = "hidden"; }))));
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
(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));
  const browser = await chromium.launch(browserOptions());
  try {
    const viewports = { desktop: { width: 1440, height: 1000 }, tablet: { width: 820, height: 1180 }, mobile: { width: 390, height: 844 } };
    const results = [];
    for (const [name, viewport] of Object.entries(viewports)) results.push(await runViewport(browser, name, viewport));

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
    const visual = process.env.SKIP_LIVE_VISUAL_COMPARE === "1" ? [] : [];
    if (process.env.SKIP_LIVE_VISUAL_COMPARE !== "1") for (const [name, viewport] of Object.entries(viewports)) visual.push(await visualCompare(browser, viewport, name));

    const config = JSON.parse(fs.readFileSync(path.join(root, "assets/config/subscription.json"), "utf8"));
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
      if (!result.audioOpen || result.audioLabel !== "Аудиокнига скоро" || result.audioStatus !== "Многоголосая аудиокнига готовится" || result.phantomAudioControls !== 0) failures.push(`${result.name}: audio placeholder`);
      if (result.emptyEmail !== "Введите e-mail." || result.invalidEmail !== "Введите корректный e-mail." || result.subscriptionStatus !== config.notConfiguredMessage) failures.push(`${result.name}: subscription states`);
      if (result.checkedPages.some(item => item.status !== 200 || item.overflow !== 0 || item.meta.brokenImages.length || item.meta.missingAnchors.length || item.meta.og.length || item.meta.twitter.length || !item.meta.canonical || !item.meta.description)) failures.push(`${result.name}: reader/legal pages`);
      if (result.consoleErrors.length || result.pageErrors.length || result.badResponses.length) failures.push(`${result.name}: browser errors`);
    }
    if (Object.values(downloadChecks).some(item => item.status !== 200 || item.bytes < 1000)) failures.push("downloads");
    if (sitemapUrls.length !== expectedUrls.length || expectedUrls.some(url => !sitemapUrls.includes(url))) failures.push("sitemap");
    if (!robots.includes("Allow: /") || !robots.includes("Sitemap: https://irenkipo.github.io/sitemap.xml")) failures.push("robots");
    if (forbiddenDist.length) failures.push("dist cleanliness");
    if (hashFailures.length) failures.push("locked asset checksums");
    if (visual.some(item => !item.geometryLocked || item.differentPixels !== 0)) failures.push("visual lock");
    if (config.enabled !== false || config.formAction || config.formId) failures.push("subscription must stay safely disabled until Brevo embed is provided");

    const report = { pass: failures.length === 0, failures, results, downloadChecks, sitemapUrlCount: sitemapUrls.length, forbiddenDist, hashFailures, visual };
    fs.writeFileSync(path.join(reportDir, "site-qa.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ pass: report.pass, failures, viewports: results.map(item => ({ name: item.name, overflow: item.main.overflow, brokenImages: item.meta.brokenImages.length, consoleErrors: item.consoleErrors.length, pageErrors: item.pageErrors.length, checkedPages: item.checkedPages.length })), downloadChecks, sitemapUrlCount: sitemapUrls.length, forbiddenDist, hashFailures, visual }, null, 2));
    if (failures.length) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})().then(() => process.exit(process.exitCode || 0)).catch(error => { console.error(error); process.exit(1); });