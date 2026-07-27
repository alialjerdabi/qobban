#!/usr/bin/env python3
"""Idempotent site build: wire generated images in, inject SEO head tags.

    python build.py

Re-run any time. Drop new files into site/img/ named IMG-XX.jpg and the
matching placeholders are replaced; slots with no file keep theirs.
SEO tags are injected once per page and refreshed on later runs.
"""
import re
import pathlib

ROOT = pathlib.Path(__file__).parent
IMG = ROOT / "img"

# Replace before launch, then re-run. Everything canonical derives from it.
SITE = "https://qobban.com"
OG_IMAGE = "IMG-01.jpg"          # until IMG-33 (the dedicated 1.91:1) exists

# ---------------------------------------------------------------- images
have = {p.stem: p.name for p in sorted(IMG.glob("IMG-*.*"))}

PLACEHOLDER = re.compile(
    r'<div class="figure__ph" data-img="(IMG-\d+)">.*?'
    r'<p class="muted">(.*?)</p>\s*</div>',
    re.S,
)
MEDIA = re.compile(r'(<div class="(?:hero|herocard)__media" data-img="(IMG-\d+)")(?:\s+style="[^"]*")?\s*>')


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).replace("&amp;", "&").strip()


def swap_placeholder(m):
    slot, caption = m.group(1), strip_tags(m.group(2))
    if slot not in have:
        return m.group(0)
    return (f'<img src="{{PREFIX}}img/{have[slot]}" alt="{caption}" '
            f'loading="lazy" decoding="async" width="1456" height="1092">')


def swap_media(m):
    head, slot = m.group(1), m.group(2)
    if slot not in have:
        return f"{head}>"
    return f"{head} style=\"background-image:url('{{PREFIX}}img/{have[slot]}')\">"


# ---------------------------------------------------------------- seo
BEGIN, END = "<!-- seo:begin -->", "<!-- seo:end -->"
SEO_BLOCK = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)

BUSINESS = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Qobban",
    "description": "Architectural metalwork in Bahrain — gates, pergolas, "
                   "railings, canopies and custom fabrication.",
    "slogan": "Precision is our standard.",
    "url": SITE,
    "image": f"{SITE}/img/{OG_IMAGE}",
    "address": {"@type": "PostalAddress", "addressCountry": "BH"},
    "areaServed": {"@type": "Country", "name": "Bahrain"},
}


def json_ld():
    import json
    return ('<script type="application/ld+json">'
            + json.dumps(BUSINESS, ensure_ascii=False, separators=(",", ":"))
            + "</script>")


def seo_for(page):
    rel = page.relative_to(ROOT).as_posix()
    url = SITE + "/" + ("" if rel == "index.html" else rel)
    lines = [BEGIN,
             f'<link rel="canonical" href="{url}">',
             f'<meta property="og:url" content="{url}">',
             f'<meta property="og:image" content="{SITE}/img/{OG_IMAGE}">',
             '<meta property="og:site_name" content="Qobban">',
             '<meta name="twitter:card" content="summary_large_image">',
             '<meta name="theme-color" content="#111111">',
             # Vercel Web Analytics: first-party, cookieless, no personal data.
             # That is why the site needs no cookie consent banner.
             '<script defer src="/_vercel/insights/script.js"></script>']
    if rel == "index.html":
        lines.append(json_ld())
    lines.append(END)
    return "\n".join(lines)


# ---------------------------------------------------------------- run
pages = sorted(list(ROOT.glob("*.html")) + list(ROOT.glob("*/*.html")))
changed = 0

for page in pages:
    src = page.read_text(encoding="utf-8")
    out = MEDIA.sub(swap_media, PLACEHOLDER.sub(swap_placeholder, src))
    out = out.replace("{PREFIX}", "../" if page.parent != ROOT else "")

    block = seo_for(page)
    if SEO_BLOCK.search(out):
        out = SEO_BLOCK.sub(lambda _: block, out)
    else:
        out = out.replace("</head>", block + "\n</head>", 1)

    if out != src:
        page.write_text(out, encoding="utf-8")
        changed += 1

# sitemap + robots, generated from the pages that actually exist
urls = "".join(
    f"<url><loc>{SITE}/" + ("" if p.relative_to(ROOT).as_posix() == 'index.html'
                            else p.relative_to(ROOT).as_posix())
    + "</loc></url>"
    for p in pages
)
(ROOT / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    + urls + "</urlset>\n", encoding="utf-8")

(ROOT / "robots.txt").write_text(
    f"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {SITE}/sitemap.xml\n",
    encoding="utf-8")

missing = [f"IMG-{n:02d}" for n in range(1, 34) if f"IMG-{n:02d}" not in have]
print(f"{len(have)} images wired, {changed}/{len(pages)} pages updated, "
      f"sitemap has {len(pages)} urls")
print(f"still placeholders: {', '.join(missing) or 'none'}")
