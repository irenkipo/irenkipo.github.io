from __future__ import annotations

import hashlib
import re
import shutil
import subprocess
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = ROOT / "src" / "assets" / "approved"
PUBLIC_DIR = ROOT / "assets" / "approved"
QA_FILE = ROOT / "tools" / "qa" / "qa-site.cjs"
CURRENT_FILE = ROOT / "project-control" / "CURRENT.md"

LOCKED = [
    "book-1-3d.png",
    "book-1-cover.png",
    "book-2-3d.png",
    "book-2-cover.png",
    "book-3-cover.png",
    "book-4-cover.png",
    "series-banner.png",
]
ALL_PNGS = LOCKED + ["social-share.png"]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def decoded_rgba(path: Path) -> tuple[tuple[int, int], bytes]:
    with Image.open(path) as image:
        rgba = image.convert("RGBA")
        return rgba.size, rgba.tobytes()


before_total = 0
after_total = 0
changed: list[tuple[str, int, int]] = []

for name in ALL_PNGS:
    source = SRC_DIR / name
    public = PUBLIC_DIR / name
    if not source.is_file() or not public.is_file():
        raise SystemExit(f"Missing approved image pair: {name}")
    if source.read_bytes() != public.read_bytes():
        raise SystemExit(f"Source/public image pair differs before optimization: {name}")

    before = source.stat().st_size
    before_total += before
    original_size, original_pixels = decoded_rgba(source)

    subprocess.run(
        ["optipng", "-o7", "-quiet", "-preserve", str(source)],
        check=True,
    )

    new_size, new_pixels = decoded_rgba(source)
    if original_size != new_size or original_pixels != new_pixels:
        raise SystemExit(f"Decoded pixels changed: {name}")

    after = source.stat().st_size
    if after > before:
        raise SystemExit(f"Optimizer enlarged {name}: {before} -> {after}")

    shutil.copy2(source, public)
    if source.read_bytes() != public.read_bytes():
        raise SystemExit(f"Source/public image pair differs after optimization: {name}")

    after_total += after
    if after < before:
        changed.append((name, before, after))

qa = QA_FILE.read_text(encoding="utf-8")
for name in LOCKED:
    digest = sha256(SRC_DIR / name)
    pattern = rf'("assets/approved/{re.escape(name)}":\s*")[0-9a-f]{{64}}(")'
    qa, count = re.subn(pattern, rf'\g<1>{digest}\2', qa, count=1)
    if count != 1:
        raise SystemExit(f"Could not update locked hash for {name}")
QA_FILE.write_text(qa, encoding="utf-8")

saved = before_total - after_total
pct = (saved / before_total * 100.0) if before_total else 0.0
summary = (
    f"LOSSLESS_IMAGE_RESULT: {len(changed)}/{len(ALL_PNGS)} PNG files became smaller; "
    f"{before_total} -> {after_total} bytes; saved {saved} bytes ({pct:.1f}%); "
    "decoded RGBA pixels verified identical for every optimized image."
)
current = CURRENT_FILE.read_text(encoding="utf-8")
current = current.replace("LOSSLESS_IMAGE_RESULT_PENDING.", summary)
CURRENT_FILE.write_text(current, encoding="utf-8")

print(summary)
for name, before, after in changed:
    print(f"{name}: {before} -> {after} ({before-after} bytes saved)")
