from __future__ import annotations

from datetime import datetime, timezone
from email.utils import format_datetime
from html import escape
import json
from pathlib import Path


def _head(title: str, description: str, canonical: str, base_url: str, page_type: str = "article") -> str:
    payload = {
        "@context": "https://schema.org",
        "@type": "BlogPosting" if page_type == "article" else "CollectionPage",
        "headline": title,
        "description": description,
        "inLanguage": "ru",
        "url": canonical,
        "author": {"@type": "Person", "name": "Ирэн Кипо", "url": f"{base_url}/"},
        "publisher": {"@type": "Person", "name": "Ирэн Кипо", "url": f"{base_url}/"},
    }
    return (
        '<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        '<meta name="robots" content="index,follow,max-image-preview:large">'
        f'<meta name="description" content="{escape(description, quote=True)}">'
        f'<title>{escape(title)} — Ирэн Кипо</title>'
        f'<link rel="canonical" href="{escape(canonical, quote=True)}">'
        f'<meta property="og:title" content="{escape(title, quote=True)}">'
        f'<meta property="og:description" content="{escape(description, quote=True)}">'
        f'<meta property="og:type" content="{page_type}">'
        f'<meta property="og:url" content="{escape(canonical, quote=True)}">'
        f'<meta property="og:image" content="{base_url}/assets/approved/social-share.png">'
        '<meta property="og:site_name" content="Ирэн Кипо"><meta property="og:locale" content="ru_RU">'
        '<meta name="twitter:card" content="summary_large_image">'
        f'<link rel="alternate" type="application/rss+xml" title="О книге и вокруг неё" href="{base_url}/notes/feed.xml">'
        '<link rel="icon" href="/assets/brand/ik-logo.jpg" type="image/jpeg">'
        '<link rel="stylesheet" href="/assets/css/site.css"><link rel="stylesheet" href="/assets/css/final.css">'
        f'<script type="application/ld+json">{json.dumps(payload, ensure_ascii=False)}</script>'
        '</head><body>'
    )


def _header(base_url: str) -> str:
    return (
        '<a class="skip-link" href="#content">К содержанию</a>'
        '<header class="site-header" id="top" aria-label="Шапка сайта">'
        f'<a class="brand" href="{base_url}/" aria-label="Ирэн Кипо — на главную">'
        '<img src="/assets/brand/ik-logo.jpg" alt="Авторский знак Ирэн Кипо" width="72" height="72"><span>Ирэн Кипо</span></a>'
        '<nav class="nav" aria-label="Основная навигация">'
        f'<a href="{base_url}/">Главная</a><a href="{base_url}/read/">Читать</a><a href="{base_url}/notes/">Заметки</a>'
        '</nav></header>'
    )


def _footer(base_url: str) -> str:
    return (
        '<footer class="footer">'
        f'<a class="footer-brand" href="{base_url}/"><img src="/assets/brand/ik-logo.jpg" alt="" width="52" height="52"><span>Ирэн Кипо</span></a>'
        '<p>© 2026 Ирэн Кипо. Все права защищены.</p>'
        f'<nav aria-label="Правовая информация"><a href="{base_url}/privacy.html">Конфиденциальность</a>'
        f'<a href="{base_url}/terms.html">Условия</a></nav></footer></body></html>'
    )


def build_notes(src: Path, dist: Path, base_url: str) -> list[tuple[str, Path]]:
    manifest_path = src / "notes" / "notes.json"
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = [item for item in data.get("items", []) if item.get("status") == "APPROVED"]
    items.sort(key=lambda item: (item.get("published_on", ""), item.get("content_id", "")), reverse=True)

    notes_dir = dist / "notes"
    notes_dir.mkdir(parents=True, exist_ok=True)
    sitemap_sources: list[tuple[str, Path]] = []

    cards = []
    rss_items = []
    for item in items:
        slug = item["slug"]
        title = item["title"]
        description = item["description"]
        published_on = item["published_on"]
        canonical = f"{base_url}/notes/{slug}/"
        paragraphs = "".join(f"<p>{escape(str(p))}</p>" for p in item.get("body", []))
        article_html = (
            _head(title, description, canonical, base_url)
            + _header(base_url)
            + '<main id="content">'
            + '<article class="section">'
            + '<p class="eyebrow">О КНИГЕ И ВОКРУГ НЕЁ</p>'
            + f'<h1>{escape(title)}</h1>'
            + f'<p><time datetime="{escape(published_on)}">{escape(published_on)}</time></p>'
            + f'<div class="approved-description">{paragraphs}</div>'
            + '<div class="actions">'
            + f'<a class="button primary" href="{base_url}/read/">Читать «В зоне видимости» бесплатно</a>'
            + f'<a class="button secondary" href="{base_url}/">О книге</a>'
            + '</div></article></main>'
            + _footer(base_url)
        )
        article_path = notes_dir / slug / "index.html"
        article_path.parent.mkdir(parents=True, exist_ok=True)
        article_path.write_text(article_html, encoding="utf-8")
        sitemap_sources.append((canonical, manifest_path))

        cards.append(
            '<article class="reader-review">'
            f'<p class="review-kind">{escape(published_on)}</p>'
            f'<h3><a href="/notes/{escape(slug)}/">{escape(title)}</a></h3>'
            f'<p>{escape(description)}</p>'
            f'<p><a href="/notes/{escape(slug)}/">Читать заметку</a></p>'
            '</article>'
        )

        dt = datetime.strptime(published_on, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        rss_items.append(
            '<item>'
            f'<title>{escape(title)}</title><link>{canonical}</link><guid>{canonical}</guid>'
            f'<pubDate>{format_datetime(dt)}</pubDate><description>{escape(description)}</description>'
            '</item>'
        )

    index_title = data.get("section_title", "О книге и вокруг неё")
    index_description = data.get("section_description", "Заметки Ирэн Кипо.")
    index_canonical = f"{base_url}/notes/"
    index_html = (
        _head(index_title, index_description, index_canonical, base_url, "website")
        + _header(base_url)
        + '<main id="content"><section class="section reviews-section">'
        + f'<header class="reviews-heading"><p class="eyebrow">ЗАМЕТКИ</p><h1>{escape(index_title)}</h1>'
        + f'<p>{escape(index_description)}</p></header>'
        + "".join(cards)
        + '</section></main>'
        + _footer(base_url)
    )
    (notes_dir / "index.html").write_text(index_html, encoding="utf-8")
    sitemap_sources.insert(0, (index_canonical, manifest_path))

    rss = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<rss version="2.0"><channel>'
        f'<title>{escape(index_title)}</title><link>{base_url}/notes/</link>'
        f'<description>{escape(index_description)}</description><language>ru</language>'
        + "".join(rss_items)
        + '</channel></rss>\n'
    )
    (notes_dir / "feed.xml").write_text(rss, encoding="utf-8")

    home_path = dist / "index.html"
    if home_path.exists():
        home = home_path.read_text(encoding="utf-8")
        latest = "".join(cards[:3])
        block = (
            '<section class="section reviews-section" id="notes" aria-labelledby="notes-title">'
            '<header class="reviews-heading"><p class="eyebrow">О КНИГЕ И ВОКРУГ НЕЁ</p>'
            '<h2 id="notes-title">Заметки</h2></header>'
            + latest
            + '<div class="actions"><a class="button secondary" href="/notes/">Все заметки</a></div></section>'
        )
        marker = "<!-- NOTES_LATEST -->"
        if marker not in home:
            raise RuntimeError("Homepage notes marker missing")
        home_path.write_text(home.replace(marker, block), encoding="utf-8")

    return sitemap_sources
