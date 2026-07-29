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
OG_IMAGE = "IMG-33.jpg"          # dedicated 1.91:1 share crop

# ---------------------------------------------------------------- optimise
# Generated PNGs land at ~2MB each, which would wreck the LCP target. Convert
# anything raw to JPEG at a sane width once, on the way in. Idempotent: a slot
# that already has a .jpg is left alone.
MAX_W, QUALITY = 2000, 82

for png in sorted(IMG.glob("IMG-*.png")):
    jpg = png.with_suffix(".jpg")
    if not jpg.exists():
        try:
            from PIL import Image
        except ImportError:
            print(f"  ! PIL missing — leaving {png.name} unoptimised")
            break
        im = Image.open(png).convert("RGB")
        if im.width > MAX_W:
            im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
        im.save(jpg, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        before, after = png.stat().st_size, jpg.stat().st_size
        print(f"  {png.name} -> {jpg.name}  {before//1024}KB -> {after//1024}KB")
    png.unlink()

# ---------------------------------------------------------------- images
have = {p.stem: p.name for p in sorted(IMG.glob("IMG-*.*"))}


def dimensions(name):
    """Real pixel size, so the width/height attributes reserve the correct
    box and the page doesn't shift when the image loads."""
    try:
        from PIL import Image
        with Image.open(IMG / name) as im:
            return im.size
    except Exception:
        return (1456, 1092)

PLACEHOLDER = re.compile(
    r'<div class="figure__ph" data-img="(IMG-\d+)">.*?'
    r'<p class="muted">(.*?)</p>\s*</div>',
    re.S,
)
MEDIA = re.compile(r'(<div class="(?:hero|herocard)__media" data-img="(IMG-\d+)")(?:\s+style="[^"]*")?\s*>')


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s).replace("&amp;", "&").strip()


first_on_page = True


def swap_placeholder(m):
    """First image on a page is the hero: it must load eagerly and at high
    priority, or it becomes the LCP element and we've deferred it. Everything
    below the fold stays lazy."""
    global first_on_page
    slot, caption = m.group(1), strip_tags(m.group(2))
    if slot not in have:
        return m.group(0)
    w, h = dimensions(have[slot])
    if first_on_page:
        first_on_page = False
        loading = 'loading="eager" fetchpriority="high"'
    else:
        loading = 'loading="lazy"'
    return (f'<img src="{{PREFIX}}img/{have[slot]}" alt="{caption}" '
            f'{loading} decoding="async" width="{w}" height="{h}">')


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
    "telephone": "+97339949004",
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
    first_on_page = True
    out = MEDIA.sub(swap_media, PLACEHOLDER.sub(swap_placeholder, src))
    out = out.replace("{PREFIX}", "../" if page.parent != ROOT else "")

    # Normalise loading hints on images already wired by an earlier run:
    # first image on the page is the hero (eager, high priority), rest lazy.
    imgs = list(re.finditer(r'<img [^>]*src="[^"]*img/IMG-[^"]*"[^>]*>', out))
    for i, m in enumerate(imgs):
        tag = m.group(0)
        fixed = re.sub(r'\s*(loading="[a-z]*"|fetchpriority="[a-z]*")', '', tag)
        hint = ('loading="eager" fetchpriority="high"' if i == 0 else 'loading="lazy"')
        fixed = fixed.replace('<img ', f'<img {hint} ', 1)
        out = out.replace(tag, fixed, 1)

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
