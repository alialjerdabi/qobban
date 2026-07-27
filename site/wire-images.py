#!/usr/bin/env python3
"""Swap IMG-XX placeholders for real <img> tags wherever site/img/IMG-XX.* exists.

Re-runnable: drop new files into site/img/ and run again. Slots with no file
keep their placeholder. Alt text is lifted from the placeholder's caption.

    python wire-images.py
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).parent
IMG = ROOT / "img"

# slot -> filename, for whatever has actually been generated
have = {p.stem: p.name for p in sorted(IMG.glob("IMG-*.*"))}

# <div class="figure__ph" data-img="IMG-05"> ...caption... </div>
PLACEHOLDER = re.compile(
    r'<div class="figure__ph" data-img="(IMG-\d+)">.*?'
    r'<p class="muted">(.*?)</p>\s*</div>',
    re.S,
)
# <div class="hero__media" data-img="IMG-01"></div>  (and herocard__media)
MEDIA = re.compile(r'(<div class="(?:hero|herocard)__media" data-img="(IMG-\d+)")(\s*)>')


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).replace("&amp;", "&").strip()


def swap_placeholder(m):
    slot, caption = m.group(1), strip_tags(m.group(2))
    if slot not in have:
        return m.group(0)
    return (
        f'<img src="{{PREFIX}}img/{have[slot]}" alt="{caption}" '
        f'loading="lazy" decoding="async" width="1456" height="1092">'
    )


def swap_media(m):
    head, slot = m.group(1), m.group(2)
    if slot not in have:
        return m.group(0)
    return f"{head} style=\"background-image:url('{{PREFIX}}img/{have[slot]}')\">"


changed = 0
for page in list(ROOT.glob("*.html")) + list(ROOT.glob("*/*.html")):
    src = page.read_text(encoding="utf-8")
    out = MEDIA.sub(swap_media, PLACEHOLDER.sub(swap_placeholder, src))
    # pages one level deep need ../ to reach site/img
    out = out.replace("{PREFIX}", "../" if page.parent != ROOT else "")
    if out != src:
        page.write_text(out, encoding="utf-8")
        changed += 1
        print(f"  {page.relative_to(ROOT)}")

print(f"\n{len(have)} images available, {changed} pages updated.")
missing = [f"IMG-{n:02d}" for n in range(1, 34) if f"IMG-{n:02d}" not in have]
print(f"still placeholders: {', '.join(missing)}")
