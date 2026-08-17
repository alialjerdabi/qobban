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
# SERVICES. CATEGORIES and PRODUCTS are the single source: the category cards,
# the product cards, each order form's dropdown and all Product structured data
# are generated from them. Never hand-edit a generated block.
#
# CATEGORIES: `slug` becomes the filename — products/<slug>.html — so a page
# must exist at that path. Renaming a slug means renaming the file too.
#
# >>> The four slugs below are PLACEHOLDERS awaiting real category names. They
# >>> are listed in NOINDEX so Google never sees "category-one", and they must
# >>> be renamed and removed from NOINDEX before launch. Renaming now is free;
# >>> renaming after indexing costs redirects.
CATEGORIES = [
    {"slug": "category-one",   "name": "Category One",
     "blurb": "Placeholder. Replace with the real category name and description."},
    {"slug": "category-two",   "name": "Category Two",
     "blurb": "Placeholder. Replace with the real category name and description."},
    {"slug": "category-three", "name": "Category Three",
     "blurb": "Placeholder. Replace with the real category name and description."},
    {"slug": "category-four",  "name": "Category Four",
     "blurb": "Placeholder. Replace with the real category name and description."},
]

# The promotion banner on the products landing page. Set "active": False to
# take it down without deleting the copy. Nothing else needs changing — the
# whole band disappears and the grid moves up.
SALE = {
    "active": True,
    "eyebrow": "Launch offer",          # PLACEHOLDER — real offer copy needed
    "headline": "Opening prices on the first run",
    "blurb": "Introductory pricing while the first batches come out of the "
             "workshop. Same steel and coating system as the commissioned work.",
    "cta": "See what's on offer",
    "href": "#on-sale",
}

#   category — must match a CATEGORIES slug, or the product appears nowhere.
#   price    — whole BHD. Use None for "price on request".
#   was      — optional original price. Setting it marks the product as on
#              sale: it gets a strikethrough, a "Save N%" badge, and it sorts
#              to the front of the landing grid. Omit for full-price items.
#   specs    — short factual lines. No marketing copy; the card is small.
#   image    — a filename in site/img/. Empty string renders a placeholder,
#              so a product can go live before its photograph exists.
CURRENCY = "BHD"
PRODUCTS = [
    {
        "category": "category-one",
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


def category_of(page):
    """products/<slug>.html -> slug. Anything else -> None."""
    rel = page.relative_to(ROOT).as_posix()
    if rel.startswith("products/") and rel.endswith(".html"):
        return rel[len("products/"):-len(".html")]
    return None


def in_category(cat):
    return [p for p in PRODUCTS if cat is None or p.get("category") == cat]


def on_sale(p):
    return p.get("was") is not None and p.get("price") is not None


def landing_order(items):
    """Sale items first on the landing grid — the page opens on what is
    discounted, then everything else in list order."""
    return sorted(items, key=lambda p: not on_sale(p))


def category_strip(current, prefix=""):
    """Horizontal category rail, the row of chips a shop puts above the grid.
    Plain overflow-x with scroll-snap — no carousel, no JS. `current` is the
    active slug, or None for the All chip on the landing page."""
    import html as _html
    chips = [(None, "All", f"{prefix}products.html")]
    chips += [(c["slug"], c["name"], f'{prefix}products/{c["slug"]}.html')
              for c in CATEGORIES]
    out = []
    for slug, label, href in chips:
        here = slug == current
        aria = ' aria-current="page"' if here else ""
        cls = "chip is-current" if here else "chip"
        out.append(f'        <a class="{cls}" href="{href}"{aria}>{_html.escape(label)}</a>')
    return "\n".join(out)


def sale_band(prefix=""):
    """The promotion card. Renders nothing at all when the sale is off, so the
    markers can stay in the page permanently."""
    import html as _html
    if not SALE.get("active"):
        return "      <!-- sale inactive -->"
    return f"""      <aside class="saleband reveal">
        <div class="saleband__body">
          <p class="spec">{_html.escape(SALE["eyebrow"])}</p>
          <h2>{_html.escape(SALE["headline"])}</h2>
          <p class="lede">{_html.escape(SALE["blurb"])}</p>
          <p style="margin-block-start:var(--s-3)">
            <a class="btn btn--primary" href="{SALE["href"]}">{_html.escape(SALE["cta"])} <span class="btn__arrow">→</span></a>
          </p>
        </div>
        <div class="saleband__mark" aria-hidden="true">
          <svg viewBox="0 0 100 72" fill="none">
            <path d="M12 8h64a8 8 0 0 1 8 8v34a8 8 0 0 1-8 8H12a8 8 0 0 1-8-8V16a8 8 0 0 1 8-8Z" stroke="currentColor" stroke-width="5"/>
            <path d="M62 46l22 22" stroke="currentColor" stroke-width="5" stroke-linecap="square"/>
            <rect x="22" y="24" width="44" height="18" rx="2" fill="#FFC220"/>
          </svg>
        </div>
      </aside>"""


def category_cards(prefix=""):
    """The hub's directory of categories. Reuses the .cards/.card pattern the
    services page already uses, so there is no new component to maintain."""
    import html as _html
    out = []
    for i, c in enumerate(CATEGORIES, 1):
        count = len(in_category(c["slug"]))
        tally = "Coming soon" if count == 0 else (
            "1 product" if count == 1 else f"{count} products")
        out.append(
            f'      <a class="card reveal" data-delay="{(i - 1) % 3 + 1}" '
            f'href="{prefix}products/{c["slug"]}.html">\n'
            f'        <h3>{_html.escape(c["name"])}</h3>\n'
            f'        <p>{_html.escape(c["blurb"])}</p>\n'
            f'        <span class="spec">{tally}</span>\n'
            f'        <span class="card__more">View →</span>\n'
            f'      </a>')
    return "\n".join(out)


def product_cards(cat=None, prefix=""):
    """One card per product in `cat`. Image when we have one, placeholder when
    we don't — a product without a photograph still has to be orderable."""
    import html as _html
    import urllib.parse as _url
    items = landing_order(in_category(cat))
    if not items:
        return ('      <p class="muted">These are being photographed and priced. '
                '<a href="' + prefix + 'contact.html" style="color:var(--accent-text)">'
                'Ask us what is available</a> in the meantime.</p>')
    out = []
    for i, p in enumerate(items, 1):
        name = _html.escape(p["name"])
        text = f'Order: {p["name"]} — {money(p["price"])}'
        wa = "https://wa.me/" + PHONE + "?text=" + _url.quote(text)
        if p["image"] and (ROOT / "img" / p["image"]).exists():
            w, h = dimensions(p["image"])
            media = (f'<img loading="lazy" decoding="async" src="{prefix}img/{p["image"]}" '
                     f'alt="{name}" width="{w}" height="{h}">')
        else:
            media = ('<div class="product__ph" aria-hidden="true">'
                     '<span class="spec">Photograph to follow</span></div>')
        specs = "".join(f"<li>{_html.escape(s)}</li>" for s in p["specs"])
        if on_sale(p):
            off = round((p["was"] - p["price"]) / p["was"] * 100)
            # aria-hidden on the old price: a screen reader announcing two
            # numbers in a row is confusing, so the saving is spelled out.
            # The percentage sits in its own element so "Save" is a whole text
            # node the Arabic dictionary can match — "Save 25%" never could.
            price = (f'<p class="product__price">{money(p["price"])} '
                     f'<s aria-hidden="true">{money(p["was"])}</s> '
                     f'<span class="product__save">Save <span>{off}%</span></span></p>')
            badge = '<span class="product__flag">On offer</span>'
        else:
            price = f'<p class="product__price">{money(p["price"])}</p>'
            badge = ""
        out.append(f"""      <article class="product reveal" data-delay="{(i - 1) % 3 + 1}" id="{p["slug"]}">
        <div class="product__media">{media}{badge}</div>
        <div class="product__body">
          <h3>{name}</h3>
          {price}
          <p>{_html.escape(p["blurb"])}</p>
          <ul class="product__specs">{specs}</ul>
          <div class="product__actions">
            <a class="btn btn--primary" href="{wa}" target="_blank" rel="noopener">Order on WhatsApp <span class="btn__arrow">→</span></a>
            <a class="btn btn--ghost" href="#order">Order by form</a>
          </div>
        </div>
      </article>""")
    return "\n".join(out)


def order_section(cat, prefix=""):
    """The ordering explainer and form, generated so all category pages share
    one source. When the category is empty the form is replaced outright: a
    required <select> with no options can never be submitted."""
    if not in_category(cat):
        return f"""      <div class="wrap">
        <div class="head reveal" style="max-inline-size:44rem">
          <p class="spec">Ordering</p>
          <h2>Not listed yet</h2>
          <p class="lede">These pieces are being photographed and priced. Tell us what
            you are after and we will confirm what is available and what it costs.</p>
          <p style="margin-block-start:var(--s-4)">
            <a class="btn btn--primary" href="https://wa.me/{PHONE}" target="_blank" rel="noopener">Ask on WhatsApp <span class="btn__arrow">→</span></a>
            <a class="btn btn--ghost" href="{prefix}contact.html">Contact us</a>
          </p>
        </div>
      </div>"""
    return f"""      <div class="wrap split">
        <div class="reveal">
          <p class="spec">Ordering</p>
          <h2 style="margin-block:var(--s-3)">Two ways, both reach the same place</h2>
          <div class="stack">
            <p><strong>WhatsApp is fastest.</strong> The button on each product opens a message
              with the item and price already written. Tell us the quantity and where you are,
              and we confirm availability and delivery in the same conversation.</p>
            <p>Prefer not to use WhatsApp? The form sends the same details to us directly.
              We reply by phone or email.</p>
            <p class="muted" style="font-size:.9375rem">Prices are per item and exclude delivery,
              which depends on where in Bahrain you are. We confirm the total before anything
              is dispatched.</p>
          </div>
        </div>

        <div class="reveal" data-delay="2">
          <p class="spec">Send an order</p>
          <h2 style="margin-block:var(--s-3)">Order by form</h2>
          <form class="form" data-lead-form>
            <div class="field">
              <label for="o-name">Name</label>
              <input id="o-name" name="Name" type="text" required>
            </div>
            <div class="field">
              <label for="o-phone">Phone / WhatsApp</label>
              <input id="o-phone" name="Phone" type="tel" inputmode="tel" placeholder="+973 …" required>
            </div>
            <div class="field">
              <label for="o-product">Product</label>
              <select id="o-product" name="Message" required>
{product_options(cat)}
              </select>
            </div>
            <div class="field">
              <label for="o-notes">Quantity, size and area in Bahrain</label>
              <textarea id="o-notes" name="Notes" maxlength="1500" placeholder="e.g. two of the medium size, delivered to Riffa."></textarea>
            </div>
            <div class="sr" aria-hidden="true">
              <label for="o-company">Company</label>
              <input id="o-company" name="company" type="text" tabindex="-1" autocomplete="off">
            </div>
            <button class="btn btn--primary" type="submit">Send Order <span class="btn__arrow">→</span></button>
            <p class="field__hint" data-form-status role="status"></p>
          </form>
        </div>
      </div>"""


def product_options(cat=None):
    """Leading empty option so `required` actually forces a choice — without
    it the first product is preselected and silently ordered."""
    import html as _html
    return "\n".join(
        ['              <option value="">Select…</option>']
        + [f'              <option>Order: {_html.escape(p["name"])} — {money(p["price"])}</option>'
           for p in in_category(cat)])


def products_ld(cat):
    """ItemList of Product/Offer for one category, plus the breadcrumb trail.
    The Offer is what puts a price in the Google result rather than a bare
    blue link; the breadcrumb is what shows the Products > Category path."""
    import json
    page = f"{SITE}/products/{cat}.html"
    items = []
    for i, p in enumerate(in_category(cat), 1):
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
                "url": f"{page}#{p['slug']}",
                "seller": {"@type": "Organization", "name": "Qobban"},
            }
        items.append({"@type": "ListItem", "position": i, "item": product})

    name = next((c["name"] for c in CATEGORIES if c["slug"] == cat), cat)
    crumbs = {"@context": "https://schema.org", "@type": "BreadcrumbList",
              "itemListElement": [
                  {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
                  {"@type": "ListItem", "position": 2, "name": "Products",
                   "item": SITE + "/products.html"},
                  {"@type": "ListItem", "position": 3, "name": name, "item": page},
              ]}
    out = ['<script type="application/ld+json">'
           + json.dumps(crumbs, ensure_ascii=False, separators=(",", ":"))
           + "</script>"]
    if items:
        out.append('<script type="application/ld+json">'
                   + json.dumps({"@context": "https://schema.org",
                                 "@type": "ItemList", "itemListElement": items},
                                ensure_ascii=False, separators=(",", ":"))
                   + "</script>")
    return "\n".join(out)


PRODUCTS_BLOCK = re.compile(
    r"<!-- products:begin -->.*?<!-- products:end -->", re.S)
OPTIONS_BLOCK = re.compile(
    r"<!-- productoptions:begin -->.*?<!-- productoptions:end -->", re.S)
CATEGORIES_BLOCK = re.compile(
    r"<!-- categories:begin -->.*?<!-- categories:end -->", re.S)
STRIP_BLOCK = re.compile(
    r"<!-- strip:begin -->.*?<!-- strip:end -->", re.S)
SALE_BLOCK = re.compile(
    r"<!-- sale:begin -->.*?<!-- sale:end -->", re.S)
# The whole ordering section, dropped when a category has nothing to order —
# a required <select> with no options is a form that can never be submitted.
ORDER_BLOCK = re.compile(
    r"<!-- order:begin -->.*?<!-- order:end -->", re.S)


# Pages that must never be indexed or listed: no canonical, no sitemap entry.
# The placeholder categories are here so Google never sees "category-one".
# Remove each one as it gets a real name and real products.
NOINDEX = {"404.html"} | {f"products/{c['slug']}.html" for c in CATEGORIES
                          if c["slug"].startswith("category-")}


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
    cat = category_of(page)
    if cat is not None:
        lines.append(products_ld(cat))
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

    # Category cards, product cards, order dropdown and the Product structured
    # data all generate from CATEGORIES/PRODUCTS, so no page can drift from the
    # price list. Which products appear follows from the page's own path.
    cat = category_of(page)
    prefix = "../" if page.parent != ROOT else ""
    if STRIP_BLOCK.search(out):
        out = STRIP_BLOCK.sub(
            lambda _: "<!-- strip:begin -->\n" + category_strip(cat, prefix)
                      + "\n        <!-- strip:end -->", out)
    if SALE_BLOCK.search(out):
        out = SALE_BLOCK.sub(
            lambda _: "<!-- sale:begin -->\n" + sale_band(prefix)
                      + "\n      <!-- sale:end -->", out)
    if CATEGORIES_BLOCK.search(out):
        out = CATEGORIES_BLOCK.sub(
            lambda _: "<!-- categories:begin -->\n" + category_cards(prefix)
                      + "\n      <!-- categories:end -->", out)
    if PRODUCTS_BLOCK.search(out):
        out = PRODUCTS_BLOCK.sub(
            lambda _: "<!-- products:begin -->\n" + product_cards(cat, prefix)
                      + "\n      <!-- products:end -->", out)
    if ORDER_BLOCK.search(out):
        out = ORDER_BLOCK.sub(
            lambda _: "<!-- order:begin -->\n" + order_section(cat, prefix)
                      + "\n      <!-- order:end -->", out)
    elif OPTIONS_BLOCK.search(out):
        out = OPTIONS_BLOCK.sub(
            lambda _: "<!-- productoptions:begin -->\n" + product_options(cat)
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
listed = [p for p in pages if p.relative_to(ROOT).as_posix() not in NOINDEX]
urls = "".join(
    f"<url><loc>{SITE}/" + ("" if p.relative_to(ROOT).as_posix() == 'index.html'
                            else p.relative_to(ROOT).as_posix())
    + "</loc></url>"
    for p in listed
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
      f"sitemap has {len(listed)} urls "
      f"({len(pages) - len(listed)} noindex: {', '.join(sorted(NOINDEX))})")
print(f"still placeholders: {', '.join(missing) or 'none'}")
