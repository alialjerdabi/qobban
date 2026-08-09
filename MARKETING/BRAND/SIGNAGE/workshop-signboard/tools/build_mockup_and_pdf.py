from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader

ROOT = Path(r"C:\AI-Workspace\Qobban\MARKETING")
DIR = ROOT / "BRAND" / "SIGNAGE" / "workshop-signboard"
SOURCE_PHOTO = DIR / "assets" / "workshop-facade-original.png"
FLAT = DIR / "workshop-signboard-flat.png"
PRINT = DIR / "workshop-signboard-print.png"
MOCKUP = DIR / "workshop-signboard-mockup.png"
MOCKUP_WEB = DIR / "workshop-signboard-mockup-web.jpg"
PDF = DIR / "workshop-signboard-print.pdf"


def find_coeffs(output_points, input_points):
    matrix = []
    for (x, y), (u, v) in zip(output_points, input_points):
        matrix.extend([
            [x, y, 1, 0, 0, 0, -u * x, -u * y],
            [0, 0, 0, x, y, 1, -v * x, -v * y],
        ])
    a = np.asarray(matrix, dtype=float)
    b = np.asarray(input_points, dtype=float).reshape(8)
    return np.linalg.solve(a, b)


def build_mockup():
    facade = Image.open(SOURCE_PHOTO).convert("RGBA")
    sign = Image.open(FLAT).convert("RGBA")

    # One continuous fascia spanning the workshop frontage, matched to the supplied
    # architectural photo and the client's revised wide-sign reference.
    quad = [(69, 329), (1395, 363), (1410, 648), (61, 616)]
    min_x = min(x for x, _ in quad) - 20
    min_y = min(y for _, y in quad) - 20
    max_x = max(x for x, _ in quad) + 20
    max_y = max(y for _, y in quad) + 20
    box_w, box_h = max_x - min_x, max_y - min_y
    local_quad = [(x - min_x, y - min_y) for x, y in quad]

    src = [(0, 0), (sign.width, 0), (sign.width, sign.height), (0, sign.height)]
    coeffs = find_coeffs(local_quad, src)
    warped = sign.transform(
        (box_w, box_h),
        Image.Transform.PERSPECTIVE,
        coeffs,
        resample=Image.Resampling.BICUBIC,
    )

    mask = Image.new("L", (box_w, box_h), 0)
    ImageDraw.Draw(mask).polygon(local_quad, fill=255)
    warped.putalpha(mask)

    # Restrained mounting depth, upper return and contact shadow for the ACP fascia.
    shadow_layer = Image.new("RGBA", facade.size, (0, 0, 0, 0))
    shadow_quad = [(x + 2, y + 10) for x, y in quad]
    ImageDraw.Draw(shadow_layer).polygon(shadow_quad, fill=(0, 0, 0, 100))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(7))
    facade = Image.alpha_composite(facade, shadow_layer)

    return_layer = Image.new("RGBA", facade.size, (0, 0, 0, 0))
    top_return = [
        (quad[0][0] - 2, quad[0][1] - 39),
        (quad[1][0] + 2, quad[1][1] - 39),
        quad[1],
        quad[0],
    ]
    ImageDraw.Draw(return_layer).polygon(top_return, fill=(35, 38, 40, 255))
    ImageDraw.Draw(return_layer).line(top_return[:2], fill=(82, 86, 88, 150), width=2)
    facade = Image.alpha_composite(facade, return_layer)

    depth_layer = Image.new("RGBA", facade.size, (0, 0, 0, 0))
    ImageDraw.Draw(depth_layer).polygon(
        [quad[3], quad[2], (quad[2][0] + 1, quad[2][1] + 9), (quad[3][0] + 1, quad[3][1] + 9)],
        fill=(32, 33, 33, 230),
    )
    facade = Image.alpha_composite(facade, depth_layer)
    facade.alpha_composite(warped, (min_x, min_y))

    facade.convert("RGB").save(MOCKUP, quality=96, subsampling=0)
    facade.convert("RGB").resize((1600, 1200), Image.Resampling.LANCZOS).save(
        MOCKUP_WEB, quality=92, subsampling=0
    )


def build_pdf():
    page_w = 4000 * mm
    page_h = 1000 * mm
    c = canvas.Canvas(str(PDF), pagesize=(page_w, page_h), pageCompression=1)
    c.setTitle("Qobban Fabrication Workshop Signboard")
    c.setAuthor("Qobban")
    c.setSubject("Full-size 4000 x 1000 mm workshop fascia artwork")
    c.drawImage(ImageReader(str(PRINT)), 0, 0, width=page_w, height=page_h, preserveAspectRatio=False, mask='auto')
    c.showPage()
    c.save()


if __name__ == "__main__":
    DIR.mkdir(parents=True, exist_ok=True)
    build_mockup()
    build_pdf()
