from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
DIST = ROOT / "dist"
BASE_URL = "https://irenkipo.github.io"
EXPECTED_CHAPTERS = [f"chapter-{index:02d}" for index in range(1, 12)]


def copy_file(source: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)


def discover_chapters() -> list[str]:
    chapters = sorted(path.parent.name for path in (SRC / "read").glob("chapter-*/index.html"))
    if chapters != EXPECTED_CHAPTERS:
        raise RuntimeError(f"Chapter set must be exactly {EXPECTED_CHAPTERS}; found {chapters}")
    return chapters


def copy_verification_files() -> None:
    site_source = SRC / "site"
    for source in site_source.iterdir():
        is_google_file = bool(re.fullmatch(r"google[A-Za-z0-9_-]+\.html", source.name))
        is_bing_file = source.name == "BingSiteAuth.xml"
        is_tiktok_file = bool(re.fullmatch(r"tiktok[A-Za-z0-9_-]+\.txt", source.name))
        if source.is_file() and (is_google_file or is_bing_file or is_tiktok_file):
            copy_file(source, DIST / source.name)


def build() -> None:
    chapters = discover_chapters()
    if DIST.exists():
        if DIST.parent != ROOT or DIST.name != "dist":
            raise RuntimeError(f"Unsafe dist path: {DIST}")
        shutil.rmtree(DIST)
    DIST.mkdir()

    copy_file(SRC / "site" / "index.html", DIST / "index.html")
    copy_file(SRC / "site" / "404.html", DIST / "404.html")
    copy_file(SRC / "site" / "audio-test.html", DIST / "audio-test.html")
    copy_verification_files()
    copy_file(SRC / "legal" / "privacy.html", DIST / "privacy.html")
    copy_file(SRC / "legal" / "terms.html", DIST / "terms.html")
    shutil.copytree(SRC / "assets", DIST / "assets")
    shutil.copytree(SRC / "read", DIST / "read")
    (DIST / ".nojekyll").write_text("", encoding="utf-8")

    urls = [f"{BASE_URL}/", f"{BASE_URL}/read/"]
    urls.extend(f"{BASE_URL}/read/{chapter}/" for chapter in chapters)
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
    required.extend(DIST / "read" / chapter / "index.html" for chapter in chapters)
    missing = [str(path.relative_to(DIST)) for path in required if not path.is_file()]
    if missing:
        raise RuntimeError(f"Missing deploy files: {', '.join(missing)}")

    print(f"Built {sum(1 for path in DIST.rglob('*') if path.is_file())} files in {DIST}")


if __name__ == "__main__":
    build()
