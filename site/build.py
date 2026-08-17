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
# www is the canonical host: the apex 308-redirects to it, so canonicals and OG
# URLs must name www or every one of them points at a redirect.
SITE = "https://www.qobban.store"
OG_IMAGE = "IMG-33.jpg"          # dedicated 1.91:1 share crop
PHONE = "97339949004"            # no +, as wa.me and the JSON-LD both want it

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
    "telephone": "+" + PHONE,
    "address": {"@type": "PostalAddress", "addressCountry": "BH"},
    "areaServed": {"@type": "Country", "name": "Bahrain"},
}


def json_ld():
    import json
    return ('<script type="application/ld+json">'
            + json.dumps(BUSINESS, ensure_ascii=False, separators=(",", ":"))
            + "</script>")


# ---------------------------------------------------------------- products
# Ready-made items sold directly, as opposed to the quoted custom work under
# SERVICES. This list is the single source: the cards, the order form's
# dropdown and the Product structured data are all generated from it. Add a
# product here and re-run — never hand-edit the generated block.
#
#   price  — whole BHD. Use None for "price on request".
#   specs  — short factual lines. No marketing copy; the card is small.
#   image  — a filename in site/img/. Empty string renders a placeholder,
#            so a product can go live before its photograph exists.
CURRENCY = "BHD"
PRODUCTS = [
    {
        "slug": "decorative-metal-stands",
        "name": "Decorative Metal Stands",
        "price": 33,
        "blurb": "Three sizes, one design. Powder-coated steel stands for "
                 "plants, display or storage — built to the same tolerance as "
                 "the architectural work.",
        "specs": ["12 x 12 mm square tube", "Powder-coated steel",
                  "Three sizes", "Indoor or shaded outdoor"],
        "image": "",
    },
]


def money(price):
    return "Price on request" if price is None else f"BD {price}"


def product_cards():
    """One card per product. Image when we have one, placeholder when we
    don't — a product without a photograph still has to be orderable."""
    import html as _html
    import urllib.parse as _url
    out = []
    for i, p in enumerate(PRODUCTS, 1):
        name = _html.escape(p["name"])
        text = f'Order: {p["name"]} — {money(p["price"])}'
        wa = "https://wa.me/" + PHONE + "?text=" + _url.quote(text)
        if p["image"] and (ROOT / "img" / p["image"]).exists():
            w, h = dimensions(p["image"])
            media = (f'<img loading="lazy" decoding="async" src="img/{p["image"]}" '
                     f'alt="{name}" width="{w}" height="{h}">')
        else:
            media = ('<div class="product__ph" aria-hidden="true">'
                     '<span class="spec">Photograph to follow</span></div>')
        specs = "".join(f"<li>{_html.escape(s)}</li>" for s in p["specs"])
        out.append(f"""      <article class="product reveal" data-delay="{(i - 1) % 3 + 1}" id="{p["slug"]}">
        <div class="product__media">{media}</div>
        <div class="product__body">
          <h3>{name}</h3>
          <p class="product__price">{money(p["price"])}</p>
          <p>{_html.escape(p["blurb"])}</p>
          <ul class="product__specs">{specs}</ul>
          <div class="product__actions">
            <a class="btn btn--primary" href="{wa}" target="_blank" rel="noopener">Order on WhatsApp <span class="btn__arrow">→</span></a>
            <a class="btn btn--ghost" href="#order">Order by form</a>
          </div>
        </div>
      </article>""")
    return "\n".join(out)


def product_options():
    """Leading empty option so `required` actually forces a choice — without
    it the first product is preselected and silently ordered."""
    import html as _html
    return "\n".join(
        ['              <option value="">Select…</option>']
        + [f'              <option>Order: {_html.escape(p["name"])} — {money(p["price"])}</option>'
           for p in PRODUCTS])


def products_ld():
    """ItemList of Product/Offer. This is what puts a price in the Google
    result rather than a bare blue link."""
    import json
    items = []
    for i, p in enumerate(PRODUCTS, 1):
        product = {
            "@type": "Product",
            "name": p["name"],
            "description": p["blurb"],
            "brand": {"@type": "Brand", "name": "Qobban"},
        }
        if p["image"] and (ROOT / "img" / p["image"]).exists():
            product["image"] = f"{SITE}/img/{p['image']}"
        if p["price"] is not None:
            product["offers"] = {
                "@type": "Offer",
                "price": str(p["price"]),
                "priceCurrency": CURRENCY,
                "availability": "https://schema.org/InStock",
                "url": f"{SITE}/products.html#{p['slug']}",
                "seller": {"@type": "Organization", "name": "Qobban"},
            }
        items.append({"@type": "ListItem", "position": i, "item": product})
    return ('<script type="application/ld+json">'
            + json.dumps({"@context": "https://schema.org", "@type": "ItemList",
                          "itemListElement": items},
                         ensure_ascii=False, separators=(",", ":"))
            + "</script>")


PRODUCTS_BLOCK = re.compile(
    r"<!-- products:begin -->.*?<!-- products:end -->", re.S)
OPTIONS_BLOCK = re.compile(
    r"<!-- productoptions:begin -->.*?<!-- productoptions:end -->", re.S)


# Pages that must never be indexed or listed: no canonical, no sitemap entry.
NOINDEX = {"404.html"}


def seo_for(page):
    rel = page.relative_to(ROOT).as_posix()
    url = SITE + "/" + ("" if rel == "index.html" else rel)
    if rel in NOINDEX:
        return "\n".join([BEGIN,
                          '<meta name="robots" content="noindex">',
                          '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
                          '<meta name="theme-color" content="#111111">',
                          END])
    lines = [BEGIN,
             f'<link rel="canonical" href="{url}">',
             f'<meta property="og:url" content="{url}">',
             f'<meta property="og:image" content="{SITE}/img/{OG_IMAGE}">',
             '<meta property="og:site_name" content="Qobban">',
             '<meta property="og:image:width" content="1731">',
             '<meta property="og:image:height" content="909">',
             '<meta name="twitter:card" content="summary_large_image">',
             '<meta name="theme-color" content="#111111">',
             # SVG only, deliberately. Declaring rel="icon" also stops the
             # browser's implicit /favicon.ico request, which was 404ing.
             '<link rel="icon" href="/favicon.svg" type="image/svg+xml">',
             # Vercel Web Analytics: first-party, cookieless, no personal data.
             # That is why the site needs no cookie consent banner.
             '<script defer src="/_vercel/insights/script.js"></script>']
    if rel == "index.html":
        lines.append(json_ld())
    if rel == "products.html":
        lines.append(products_ld())
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

    # Product cards, order dropdown and Product structured data are generated
    # from PRODUCTS, so the page can never drift from the price list.
    if PRODUCTS_BLOCK.search(out):
        out = PRODUCTS_BLOCK.sub(
            lambda _: "<!-- products:begin -->\n" + product_cards()
                      + "\n      <!-- products:end -->", out)
    if OPTIONS_BLOCK.search(out):
        out = OPTIONS_BLOCK.sub(
            lambda _: "<!-- productoptions:begin -->\n" + product_options()
                      + "\n              <!-- productoptions:end -->", out)

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
    if p.relative_to(ROOT).as_posix() not in NOINDEX
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
