from pathlib import Path
from sys import argv
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile

source = Path(argv[1]).resolve()
target = Path(argv[2]).resolve()
if source.name != "epub" or source.parent.name != ".build":
    raise SystemExit(f"Unsafe EPUB source: {source}")
if target.suffix.lower() != ".epub" or target.parent.name != "downloads":
    raise SystemExit(f"Unsafe EPUB target: {target}")

target.unlink(missing_ok=True)
with ZipFile(target, "w") as archive:
    archive.write(source / "mimetype", "mimetype", compress_type=ZIP_STORED)
    for file in sorted(source.rglob("*")):
        if file.is_file() and file.name != "mimetype":
            archive.write(file, file.relative_to(source).as_posix(), compress_type=ZIP_DEFLATED)
