const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const repoRoot = path.resolve(__dirname, "../..");
const root = path.resolve(process.env.SITE_ROOT || path.join(repoRoot, "dist"));
const reportDir = path.join(repoRoot, "reports");
fs.mkdirSync(reportDir, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
  ".epub": "application/epub+zip",
  ".pdf": "application/pdf"
};

const GOOGLE_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSf4CueonKqtg43EaRjTHyjK3V_PbcGvwwzNju_QM2_mjdCspg/formResponse";
const AUDIO_ZIP = "https://github.com/irenkipo/irenkipo.github.io/releases/download/audiobook-v-zone-vidimosti-v2/Iren_Kipo_V_zone_vidimosti_Audiobook_WEB_V2.zip";
const LITRES = "https://www.litres.ru/74382683/";
const READING_KEY = "iren_kipo_reading_progress_v1";
const AUDIO_KEY = "iren_kipo_audio_progress_v1";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function createServer() {
  return http.createServer((request, response) => {
    const requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    let file = path.resolve(root, "." + requestPath);
    if (!file.startsWith(root)) return response.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return response.writeHead(404).end("Not found");
    const stat = fs.statSync(file);
    response.writeHead(200, {
      "content-type": mime[path.extname(file).toLowerCase()] || "application/octet-stream",
      "content-length": stat.size
    });
    fs.createReadStream(file).pipe(response);
  });
}

function browserOptions() {
  const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
  return process.env.PLAYWRIGHT_BROWSER === "chromium" || !fs.existsSync(edge)
    ? { headless: true }
    : { executablePath: edge, headless: true };
}

function silentWav(seconds = 65, sampleRate = 8000) {
  const dataLength = seconds * sampleRate;
  const buffer = Buffer.alloc(44 + dataLength, 128);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataLength, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28);
  buffer.writeUInt16LE(1, 32);
  buffer.writeUInt16LE(8, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataLength, 40);
  return buffer;
}

async function readingProgress(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));

  await page.goto("http://127.0.0.1:4174/read/chapter-01/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo(0, Math.round(max * 0.56));
  });
  await page.waitForTimeout(250);
  const actualRatio = await page.evaluate(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    dispatchEvent(new Event("pagehide"));
    return scrollY / max;
  });
  await page.waitForTimeout(100);

  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "null"), READING_KEY);
  assert(actualRatio > 0.2, "chapter did not scroll far enough for a meaningful progress test");
  assert(saved && saved.chapter === 1 && saved.path === "/read/chapter-01/", "reading progress was not saved for chapter 1");
  assert(Math.abs(saved.ratio - actualRatio) < 0.03, "saved reading progress does not match actual scroll position");

  await page.goto("http://127.0.0.1:4174/", { waitUntil: "domcontentloaded" });
  const continuePath = await page.locator('a.button.primary').first().evaluate(a => new URL(a.href).pathname);
  assert(continuePath === "/read/chapter-01/", "homepage read CTA did not continue to saved chapter");

  await page.goto("http://127.0.0.1:4174/read/chapter-01/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(150);
  const restoredRatio = await page.evaluate(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    return scrollY / max;
  });
  assert(Math.abs(restoredRatio - saved.ratio) < 0.12, "reading position was not restored");

  await page.evaluate(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    scrollTo(0, Math.round(max * 0.95));
  });
  await page.waitForTimeout(100);
  const milestone50 = await page.evaluate(() => (window.dataLayer || []).some(item => item && item[0] === "event" && item[1] === "chapter_progress" && item[2]?.percent_read === 50));
  const milestone90 = await page.evaluate(() => (window.dataLayer || []).some(item => item && item[0] === "event" && item[1] === "chapter_progress" && item[2]?.percent_read === 90));
  assert(milestone50 && milestone90, "reader analytics milestones 50/90 were not emitted");

  await context.close();
  return { savedRatio: saved.ratio, restoredRatio, continuePath, milestone50, milestone90 };
}

async function audioProgress(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const wav = silentWav();
  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.route("https://github.com/irenkipo/irenkipo.github.io/releases/download/audiobook-v-zone-vidimosti-v2/CH03_WEB_V2.mp3", route => route.fulfill({
    status: 200,
    contentType: "audio/wav",
    headers: { "Accept-Ranges": "bytes" },
    body: wav
  }));

  await page.goto("http://127.0.0.1:4174/", { waitUntil: "domcontentloaded" });
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ chapter: 3, time: 37, updated_at: new Date().toISOString() })), AUDIO_KEY);
  await page.reload({ waitUntil: "domcontentloaded" });

  await page.locator('[data-open="audio"]').click();
  const audio = page.locator("audio[data-audio-element]");
  await page.waitForFunction(() => {
    const el = document.querySelector("audio[data-audio-element]");
    return el && el.readyState >= 1 && el.currentTime >= 36;
  }, null, { timeout: 10000 });

  const restored = await audio.evaluate(el => ({ paused: el.paused, time: el.currentTime, src: el.src }));
  const status = (await page.locator("[data-audio-status]").textContent()).trim();
  const current = await page.locator('[data-audio-chapter="3"]').getAttribute("aria-current");
  assert(restored.paused, "audiobook auto-played while restoring progress");
  assert(restored.time >= 36 && restored.time <= 38.5, "audiobook time was not restored");
  assert(status === "Глава 3" && current === "true", "audiobook chapter was not restored");

  await audio.evaluate(async el => { el.muted = true; await el.play(); });
  await page.waitForTimeout(350);
  assert(!(await audio.evaluate(el => el.paused)), "mock audiobook did not start playback");

  await page.locator("#audio [data-close]").click();
  const afterClose = await audio.evaluate(el => ({ paused: el.paused, time: el.currentTime }));
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key) || "null"), AUDIO_KEY);
  assert(afterClose.paused, "audiobook kept playing after modal close");
  assert(stored && stored.chapter === 3 && stored.time >= 36, "audiobook progress was not saved on close");

  await context.close();
  return { status, restoredTime: restored.time, pausedAfterClose: afterClose.paused, storedTime: stored.time };
}

async function funnel(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  let subscriptionPost = "";
  let unsubscribePost = "";

  await page.route("https://www.googletagmanager.com/**", route => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.route("https://docs.google.com/forms/**", route => {
    const data = route.request().postData() || "";
    if (data.includes("unsubscribe%2B") || data.includes("unsubscribe+")) unsubscribePost = data;
    else subscriptionPost = data;
    return route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>ok</body></html>" });
  });

  await page.goto("http://127.0.0.1:4174/", { waitUntil: "domcontentloaded" });

  const links = await page.evaluate(({ audioZip, litres }) => {
    const downloadLinks = [...document.querySelectorAll("#download a")].map(a => ({ href: a.href, download: a.hasAttribute("download") }));
    const litresLink = [...document.querySelectorAll("a")].find(a => a.href === litres);
    return {
      downloadLinks,
      litres: litresLink ? { href: litresLink.href, target: litresLink.target, rel: litresLink.rel } : null,
      audioZipPresent: downloadLinks.some(item => item.href === audioZip && item.download)
    };
  }, { audioZip: AUDIO_ZIP, litres: LITRES });

  assert(links.downloadLinks.some(item => item.href.endsWith("/assets/books/book1.epub") && item.download), "EPUB download link missing");
  assert(links.downloadLinks.some(item => item.href.endsWith("/assets/books/book1.pdf") && item.download), "PDF download link missing");
  assert(links.audioZipPresent, "audiobook ZIP download link missing");
  assert(links.litres && links.litres.href === LITRES && links.litres.target === "_blank" && /noopener/.test(links.litres.rel) && /noreferrer/.test(links.litres.rel), "LitRes link is not canonical/safe");

  await page.locator('[data-subscription-field="email"]').fill("closeout@example.invalid");
  await page.locator('[data-subscription-field="consent"]').check();
  await page.locator("[data-subscription-submit]").click();
  await page.waitForFunction(() => document.querySelector("[data-subscription-status]")?.dataset.state === "sent", null, { timeout: 5000 });
  const subscriptionStatus = (await page.locator("[data-subscription-status]").textContent()).trim();
  assert(subscriptionPost.includes("entry.639030799=closeout%40example.invalid"), "subscription form did not post email field");
  assert(subscriptionPost.includes("entry.2056694574="), "subscription form did not post consent field");
  assert(subscriptionStatus === "Спасибо! Заявка отправлена.", "subscription confirmation status is incorrect");
  const subscriptionEvent = await page.evaluate(() => (window.dataLayer || []).some(item => item && item[0] === "event" && item[1] === "subscription_submit"));
  assert(subscriptionEvent, "subscription_submit analytics event was not emitted");

  const token = "0123456789abcdef0123456789abcdef";
  await page.goto("http://127.0.0.1:4174/unsubscribe.html?t=" + token, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1100);
  const unsubscribeState = await page.evaluate(() => ({ text: document.querySelector("#status")?.textContent.trim(), search: location.search }));
  assert(unsubscribeState.text === "Запрос на отписку принят.", "unsubscribe helper did not reach accepted state");
  assert(unsubscribeState.search === "", "unsubscribe token remained in browser address");
  assert(unsubscribePost.includes("unsubscribe%2B" + token) || unsubscribePost.includes("unsubscribe+" + token), "unsubscribe helper did not submit opaque token carrier");

  await context.close();
  return { links, subscriptionStatus, subscriptionEvent, unsubscribeState };
}

(async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(4174, "127.0.0.1", resolve));
  const browser = await chromium.launch(browserOptions());
  const report = { pass: false };
  try {
    report.reading = await readingProgress(browser);
    report.audio = await audioProgress(browser);
    report.funnel = await funnel(browser);
    report.pass = true;
    fs.writeFileSync(path.join(reportDir, "site-e2e-closeout.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
