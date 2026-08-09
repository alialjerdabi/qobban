from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "finals-4x5"
OUTPUT_DIR = ROOT / "finals-4x5-branded"
LOGO_PATH = ROOT.parent.parent / "BRAND" / "LOGO" / "qobban-lockup-transparent-light-v1.png"

YELLOW = (255, 194, 32, 118)
YELLOW_SOFT = (255, 194, 32, 72)


def contain_logo(logo: Image.Image, target_width: int) -> Image.Image:
    ratio = target_width / logo.width
    return logo.resize((target_width, round(logo.height * ratio)), Image.Resampling.LANCZOS)


def branded(image: Image.Image, logo_master: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    width, height = image.size

    logo = contain_logo(logo_master, round(width * 0.145))
    logo_x = round(width * 0.048)
    logo_y = round(height * 0.038)

    # A restrained shadow improves readability without adding a box behind the logo.
    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_alpha = logo.getchannel("A").filter(ImageFilter.GaussianBlur(max(1, width // 420)))
    shadow_mark = Image.new("RGBA", logo.size, (0, 0, 0, 122))
    shadow_mark.putalpha(shadow_alpha)
    shadow.alpha_composite(shadow_mark, (logo_x + 2, logo_y + 3))
    image = Image.alpha_composite(image, shadow)
    image.alpha_composite(logo, (logo_x, logo_y))

    pattern = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(pattern)
    line_w = max(1, round(width / 700))

    # Minimal Qobban measurement line along the upper-right edge.
    start_x = round(width * 0.30)
    end_x = round(width * 0.94)
    y = round(height * 0.055)
    draw.line((start_x, y, end_x, y), fill=YELLOW_SOFT, width=line_w)
    tick_gap = max(38, round(width * 0.062))
    for index, x in enumerate(range(start_x, end_x + 1, tick_gap)):
        tick = round(height * (0.007 if index % 2 == 0 else 0.0045))
        draw.line((x, y - tick, x, y + tick), fill=YELLOW_SOFT, width=line_w)

    # Precision target at the end of the line.
    cx, cy = end_x, y
    radius = round(width * 0.009)
    arm = round(width * 0.024)
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), outline=YELLOW, width=line_w)
    draw.line((cx - arm, cy, cx + arm, cy), fill=YELLOW, width=line_w)
    draw.line((cx, cy - arm, cx, cy + arm), fill=YELLOW, width=line_w)

    # One small technical corner marker at the bottom-right.
    margin_x = round(width * 0.055)
    margin_y = round(height * 0.050)
    corner = round(width * 0.038)
    bx, by = width - margin_x, height - margin_y
    draw.line((bx - corner, by, bx, by), fill=YELLOW_SOFT, width=line_w)
    draw.line((bx, by - corner, bx, by), fill=YELLOW_SOFT, width=line_w)

    return Image.alpha_composite(image, pattern).convert("RGB")


def make_contact_sheet(files: list[Path], destination: Path) -> None:
    thumb_w, thumb_h = 270, 338
    gap = 18
    columns = 5
    rows = 2
    sheet = Image.new("RGB", (columns * thumb_w + (columns + 1) * gap, rows * thumb_h + (rows + 1) * gap), (18, 18, 18))
    for index, path in enumerate(files):
        thumb = Image.open(path).convert("RGB").resize((thumb_w, thumb_h), Image.Resampling.LANCZOS)
        x = gap + (index % columns) * (thumb_w + gap)
        y = gap + (index // columns) * (thumb_h + gap)
        sheet.paste(thumb, (x, y))
    sheet.save(destination, quality=94)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    logo_master = Image.open(LOGO_PATH).convert("RGBA")
    outputs = []
    for source in sorted(SOURCE_DIR.glob("*.png")):
        output = OUTPUT_DIR / source.name.replace("-motion.png", "-motion-branded.png")
        result = branded(Image.open(source), logo_master)
        result.save(output, quality=96, subsampling=0)
        outputs.append(output)
    make_contact_sheet(outputs, ROOT / "editorial-motion-branded-contact-sheet.jpg")


if __name__ == "__main__":
    main()
