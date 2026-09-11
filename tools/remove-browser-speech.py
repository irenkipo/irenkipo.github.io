from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
for page in sorted((root/"read").glob("chapter-*/index.html")):
    text=page.read_text(encoding="utf-8")
    text=re.sub(r'<script src="\.\./\.\./assets/reader\.js" defer></script>','',text)
    text=re.sub(r'<div class="chapter-tools".*?</div>','',text,count=1)
    page.write_text(text,encoding="utf-8")
