from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
DIST = ROOT / "dist"
BASE_URL = "https://irenkipo.github.io"
CHAPTERS = [f"chapter-{index:02d}" for index in range(1, 12)]


def copy_file(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def build() -> None:
    if DIST.exists():
        if DIST.parent != ROOT or DIST.name != "dist":
            raise RuntimeError(f"Unsafe dist path: {DIST}")
        shutil.rmtree(DIST)
    DIST.mkdir()

    copy_file(SRC / "site" / "index.html", DIST / "index.html")
    copy_file(SRC / "site" / "404.html", DIST / "404.html")
    copy_file(SRC / "legal" / "privacy.html", DIST / "privacy.html")
    copy_file(SRC / "legal" / "terms.html", DIST / "terms.html")
    shutil.copytree(SRC / "assets", DIST / "assets")
    copy_file(SRC / "config" / "subscription.json", DIST / "assets" / "config" / "subscription.json")
    shutil.copytree(SRC / "read", DIST / "read")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    urls = [f"{BASE_URL}/", f"{BASE_URL}/read/"]
    urls.extend(f"{BASE_URL}/read/{chapter}/" for chapter in CHAPTERS)
    urls.extend((f"{BASE_URL}/privacy.html", f"{BASE_URL}/terms.html"))
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "".join(f"  <url><loc>{url}</loc></url>\n" for url in urls)
    sitemap += "</urlset>\n"
    (DIST / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    robots = "\n".join((
        "User-agent: *",
        "Allow: /",
        "Disallow: /preview/",
        "Disallow: /dev/",
        "Disallow: /legacy/",
        "Disallow: /v2/",
        f"Sitemap: {BASE_URL}/sitemap.xml",
        "",
    ))
    (DIST / "robots.txt").write_text(robots, encoding="utf-8")

    forbidden_names = {"tools", "src", "project-control", "preview", "v2", "legacy"}
    forbidden_suffixes = {".b64", ".md"}
    for path in DIST.rglob("*"):
        relative = path.relative_to(DIST)
        if any(part in forbidden_names for part in relative.parts):
            raise RuntimeError(f"Forbidden deploy path: {relative}")
        if path.is_file() and (path.suffix.lower() in forbidden_suffixes or path.name.startswith(".env")):
            raise RuntimeError(f"Forbidden deploy file: {relative}")

    required = [DIST / "index.html", DIST / "assets" / "approved" / "series-banner.png", DIST / "assets" / "approved" / "social-share.png", DIST / "assets" / "books" / "book1.epub", DIST / "assets" / "books" / "book1.pdf"]
    required.extend(DIST / "read" / chapter / "index.html" for chapter in CHAPTERS)
    missing = [str(path.relative_to(DIST)) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError(f"Missing deploy files: {', '.join(missing)}")

    print(f"Built {sum(1 for path in DIST.rglob('*') if path.is_file())} files in {DIST}")


if __name__ == "__main__":
    build()