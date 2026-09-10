const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("./.qa/node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const reportDir = path.join(root, "reports");
fs.mkdirSync(reportDir, { recursive: true });
const mime = {".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".jpg":"image/jpeg",".epub":"application/epub+zip",".pdf":"application/pdf",".json":"application/json; charset=utf-8"};
const server = http.createServer((request, response) => {
  const requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
  let file = path.resolve(root, "." + requestPath);
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end("Not found"); return; }
  response.writeHead(200, {"content-type":mime[path.extname(file).toLowerCase()] || "application/octet-stream","content-length":fs.statSync(file).size});
  fs.createReadStream(file).pipe(response);
});

async function runViewport(browser, name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const badResponses = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => pageErrors.push(error.message));
  page.on("response", response => { if (response.status() >= 400) badResponses.push({url:response.url(),status:response.status()}); });
  await page.goto("http://127.0.0.1:4173/", { waitUntil:"networkidle" });
  const main = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.getAttribute("src")),
    missingAnchors: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute("href")).filter(href => href.length > 1 && !document.querySelector(href)),
    title: document.title
  }));
  await page.screenshot({ path:path.join(reportDir, `candidate-${name}.png`), fullPage:true });
  await page.locator('[data-open="download"]').first().click();
  const dialogVisible = await page.locator("#download").isVisible();
  await page.locator("[data-close]").click();
  const pages = ["/read/", ...Array.from({length:11}, (_, index) => `/read/chapter-${String(index + 1).padStart(2,"0")}/`)];
  const checked = [];
  for (const item of pages) {
    const response = await page.goto("http://127.0.0.1:4173" + item, { waitUntil:"domcontentloaded" });
    checked.push({path:item,status:response.status(),overflow:await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),brokenImages:await page.evaluate(() => [...document.images].filter(image => !image.complete || image.naturalWidth === 0).length)});
  }
  await context.close();
  return {name,viewport,main,dialogVisible,checked,consoleErrors,pageErrors,badResponses};
}

(async () => {
  await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));
  const browser = await chromium.launch({ executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless:true });
  try {
    const results = [];
    results.push(await runViewport(browser, "desktop", {width:1440,height:1000}));
    results.push(await runViewport(browser, "tablet", {width:820,height:1180}));
    results.push(await runViewport(browser, "mobile", {width:390,height:844}));
    fs.writeFileSync(path.join(reportDir, "candidate-qa.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
    if (results.some(result => result.main.overflow > 0 || result.main.brokenImages.length || result.main.missingAnchors.length || !result.dialogVisible || result.consoleErrors.length || result.pageErrors.length || result.badResponses.length || result.checked.some(page => page.status !== 200 || page.overflow > 0 || page.brokenImages))) process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); server.close(); process.exit(1); });
