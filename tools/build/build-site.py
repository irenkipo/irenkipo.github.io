from pathlib import Path
import re
import shutil

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "src"
DIST = ROOT / "dist"
BASE_URL = "https://irenkipo.github.io"
EXPECTED_CHAPTERS = [f"chapter-{index:02d}" for index in range(1, 12)]
INDEXNOW_KEY = "3f2c9d7a51b84e6ca04d9827f1ab63e5"
LASTMOD = "2026-09-22"
RETIRED_FACEBOOK_URL = "https://www.facebook.com/profile.php?id=122107606821454086"
CANONICAL_FACEBOOK_URL = "https://www.facebook.com/irenkipo/"


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


def normalize_runtime_links() -> None:
    index = DIST / "index.html"
    html = index.read_text(encoding="utf-8")
    html = html.replace(RETIRED_FACEBOOK_URL, CANONICAL_FACEBOOK_URL)
    index.write_text(html, encoding="utf-8")


def validate_runtime_artifact() -> None:
    index = DIST / "index.html"
    html = index.read_text(encoding="utf-8")
    if RETIRED_FACEBOOK_URL in html or "122107606821454086" in html:
        raise RuntimeError("Retired Facebook identity leaked into deploy artifact")
    required_external = (
        "https://www.instagram.com/irenkipo/",
        CANONICAL_FACEBOOK_URL,
        "https://www.threads.com/@irenkipo",
        "https://www.youtube.com/@irenkipo",
        "https://t.me/irenkipo",
        "https://www.tiktok.com/@irenkipo",
        "https://www.litres.ru/74382683/",
    )
    missing = [url for url in required_external if url not in html]
    if missing:
        raise RuntimeError(f"Missing canonical external links in deploy artifact: {', '.join(missing)}")


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
    normalize_runtime_links()
    (DIST / ".nojekyll").write_text("", encoding="utf-8")
    (DIST / f"{INDEXNOW_KEY}.txt").write_text(INDEXNOW_KEY + "\n", encoding="utf-8")

    urls = [f"{BASE_URL}/", f"{BASE_URL}/read/"]
    urls.extend(f"{BASE_URL}/read/{chapter}/" for chapter in chapters)
    urls.extend((f"{BASE_URL}/privacy.html", f"{BASE_URL}/terms.html"))
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += "".join(f"  <url><loc>{url}</loc><lastmod>{LASTMOD}</lastmod></url>\n" for url in urls)
    sitemap += "</urlset>\n"
    (DIST / "sitemap.xml").write_text(sitemap, encoding="utf-8")

    image_entries = {
        f"{BASE_URL}/": [
            ("assets/approved/series-banner.png", "Серия романов «Всё хорошо» — Ирэн Кипо"),
            ("assets/approved/book-1-3d.png", "Книга «В зоне видимости» — Ирэн Кипо"),
            ("assets/approved/book-1-cover.png", "Обложка книги «В зоне видимости»"),
            ("assets/approved/book-2-cover.png", "Обложка книги «Правила игры»"),
            ("assets/approved/book-3-cover.png", "Обложка книги «Другая Вера»"),
            ("assets/approved/book-4-cover.png", "Обложка книги «Ничего личного»"),
            ("assets/approved/social-share.png", "Ирэн Кипо — серия «Всё хорошо»"),
            ("assets/brand/ik-logo.jpg", "Авторский знак Ирэн Кипо"),
        ],
        f"{BASE_URL}/read/": [("assets/approved/book-1-cover.png", "Обложка книги «В зоне видимости»")],
    }
    image_sitemap = '<?xml version="1.0" encoding="UTF-8"?>\\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\\n'
    for page_url, images in image_entries.items():
        image_sitemap += f"  <url><loc>{page_url}</loc>\\n"
        for image_path, image_title in images:
            image_sitemap += f"    <image:image><image:loc>{BASE_URL}/{image_path}</image:loc><image:title>{image_title}</image:title></image:image>\\n"
        image_sitemap += "  </url>\\n"
    image_sitemap += "</urlset>\\n"
    (DIST / "image-sitemap.xml").write_text(image_sitemap, encoding="utf-8")

    robots = "\n".join((
        "User-agent: *",
        "Allow: /",
        "Disallow: /preview/",
        "Disallow: /dev/",
        "Disallow: /legacy/",
        "Disallow: /v2/",
        f"Sitemap: {BASE_URL}/sitemap.xml",
        f"Sitemap: {BASE_URL}/image-sitemap.xml",
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

    validate_runtime_artifact()
    print(f"Built {sum(1 for path in DIST.rglob('*') if path.is_file())} files in {DIST}")


if __name__ == "__main__":
    build()
