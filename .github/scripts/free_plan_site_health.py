#!/usr/bin/env python3
"""Read-only production checks for a GitHub Pages + GitHub Releases audiobook.
No API secrets besides GitHub's workflow token; no content writes.
"""
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SITE = "https://irenkipo.github.io/"
TAG = "audiobook-v-zone-vidimosti-v11-final"
RELEASE_API = (
    "https://api.github.com/repos/irenkipo/irenkipo.github.io/releases/tags/" + TAG
)
ZIP = "Iren_Kipo_V_zone_vidimosti_Audiobook_V11_FINAL.zip"


def fetch(url, *, timeout=25):
    headers = {"User-Agent": "book1-free-plan-site-health/1.0"}
    if url.startswith("https://api.github.com/"):
        headers["Accept"] = "application/vnd.github+json"
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = "Bearer " + token
    error = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=timeout) as response:
                if response.status != 200:
                    raise RuntimeError(f"HTTP {response.status} for {url}")
                return response.read()
        except (OSError, urllib.error.HTTPError) as exc:
            error = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"{url}: {error}")


def validate_audio_html(html: str, assets: list[dict]):
    sources = re.findall(r'data-audio-src="([^"]+)"', html)
    chapters = re.findall(r'data-audio-chapter="(\d+)"', html)
    if len(sources) != 11 or chapters != [str(i) for i in range(1, 12)]:
        raise RuntimeError(f"Homepage must list 11 sequential chapters: sources={len(sources)} chapters={chapters}")
    by_name = {item["name"]: item for item in assets}
    for i, source in enumerate(sources, 1):
        name = f"CH{i:02d}_WEB_V11_CANDIDATE.mp3"
        if not source.startswith(
            f"https://github.com/irenkipo/irenkipo.github.io/releases/download/{TAG}/"
        ) or not source.endswith("/" + name):
            raise RuntimeError(f"Chapter {i} uses an unexpected URL: {source}")
        if name not in by_name or by_name[name]["size"] < 20_000_000:
            raise RuntimeError(f"Missing/undersized MP3 asset: {name}")
    if ZIP not in by_name or by_name[ZIP]["size"] < 500_000_000:
        raise RuntimeError("Missing/undersized full audiobook ZIP")
    if ZIP not in html:
        raise RuntimeError("ZIP download not linked in production page")
    return len(sources), sum(by_name[f"CH{i:02d}_WEB_V11_CANDIDATE.mp3"]["size"] for i in range(1, 12))


def main():
    if "--self-test" in sys.argv:
        sample = "".join(
            f'<button data-audio-chapter="{i}" data-audio-src="https://github.com/irenkipo/irenkipo.github.io/releases/download/{TAG}/CH{i:02d}_WEB_V11_CANDIDATE.mp3"></button>'
            for i in range(1, 12)
        ) + ZIP
        assets = [
            {"name": f"CH{i:02d}_WEB_V11_CANDIDATE.mp3", "size": 50_000_000}
            for i in range(1, 12)
        ] + [{"name": ZIP, "size": 600_000_000}]
        chapters, total = validate_audio_html(sample, assets)
        assert chapters == 11 and total == 550_000_000
        print("FREE_SITE_SELF_TEST=PASS")
        return
    # Static existence checks protect against accidentally removing download formats.
    for name in ("index.html", "read/index.html", "read/chapter-01/index.html",
                 "assets/books/book1.epub", "assets/books/book1.pdf", "assets/js/audio.js"):
        if not (ROOT / name).is_file():
            raise RuntimeError(f"Published site source missing: {name}")
    release = json.loads(fetch(RELEASE_API).decode("utf-8"))
    assets = release.get("assets", [])
    home = fetch(SITE).decode("utf-8")
    read = fetch(SITE + "read/").decode("utf-8")
    chapter = fetch(SITE + "read/chapter-01/").decode("utf-8")
    if "<html" not in home.lower() or "<html" not in read.lower() or "<html" not in chapter.lower():
        raise RuntimeError("A live site page does not contain HTML")
    chapters, bytes_total = validate_audio_html(home, assets)
    print(json.dumps({
        "status": "PASS",
        "live_home": SITE,
        "live_reader": SITE + "read/",
        "live_chapter_1": SITE + "read/chapter-01/",
        "release_tag": TAG,
        "mp3_count": chapters,
        "mp3_total_bytes": bytes_total,
        "zip_bytes": next(a["size"] for a in assets if a["name"] == ZIP),
        "note": "Verifies remote files and URLs, not sound quality or end-user playback."
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
