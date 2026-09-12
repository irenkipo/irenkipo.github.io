const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "../..");
const excluded = new Set([".git", "dist", "node_modules", "reports"]);
const brevoKeyName = ["BREVO", "API", "KEY"].join("_");
const openAiKeyName = ["OPENAI", "API", "KEY"].join("_");
const patterns = [
  ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["github-token", /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/],
  ["openai-key", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["bearer-token", /\bBearer\s+[A-Za-z0-9._~-]{16,}/i],
  ["named-secret", new RegExp(`(?:${brevoKeyName}|${openAiKeyName})\\s*[:=]\\s*["']?[^\\s"']{8,}`, "i")],
  ["assigned-secret", /(?:api[_-]?key|client[_-]?secret|access[_-]?token|password|credentials?)\s*[:=]\s*["'][A-Za-z0-9._~+\/=:-]{12,}["']/i]
];
function walk(dir, output = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, output);
    else output.push(full);
  }
  return output;
}
function scanText(text, location, findings) {
  text.split(/\r?\n/).forEach((line, index) => {
    for (const [type, pattern] of patterns) if (pattern.test(line)) findings.push({ type, location, line: index + 1 });
  });
}
const findings = [];
for (const file of walk(root)) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (/\.(?:png|jpe?g|pdf|epub)$/i.test(file)) continue;
  try { scanText(fs.readFileSync(file, "utf8"), relative, findings); } catch {}
}
const names = spawnSync("git", ["-C", root, "log", "--all", "--name-only", "--pretty=format:"], { encoding: "utf8" });
if (names.status !== 0) throw new Error("Unable to inspect Git history filenames");
const suspiciousHistoryFiles = [...new Set(names.stdout.split(/\r?\n/).filter(Boolean).filter(name => /(^|\/)(\.env(?:\..*)?|[^/]*(?:credential|secret|token)[^/]*|[^/]+\.(?:pem|key))$/i.test(name)))];
const history = spawnSync("git", ["-C", root, "log", "--all", "--patch", "--no-ext-diff", "--text", "--format=commit:%H"], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
if (history.status !== 0) throw new Error("Unable to scan Git history content");
const historyFindings = [];
for (const [type, pattern] of patterns) {
  pattern.lastIndex = 0;
  if (pattern.test(history.stdout)) historyFindings.push({ type, location: "git-history" });
}
const report = { pass: findings.length === 0 && historyFindings.length === 0 && suspiciousHistoryFiles.length === 0, currentFindings: findings, historyFindings, suspiciousHistoryFiles };
fs.mkdirSync(path.join(root, "reports"), { recursive: true });
fs.writeFileSync(path.join(root, "reports", "security-scan.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ pass: report.pass, currentFindingCount: findings.length, historyFindingCount: historyFindings.length, suspiciousHistoryFileCount: suspiciousHistoryFiles.length, locations: [...new Set([...findings.map(item => `${item.location}:${item.line}`), ...historyFindings.map(item => item.location), ...suspiciousHistoryFiles])] }, null, 2));
if (!report.pass) process.exitCode = 1;