from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "brand-intro-concepts" / "source-renders"
EXPORTS = ROOT / "brand-intro-concepts" / "exports-4x5"
OUTPUT_SIZE = (1080, 1350)


def convert(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    background = ImageOps.fit(image, OUTPUT_SIZE, method=Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(radius=30))
    background = Image.blend(background, Image.new("RGB", OUTPUT_SIZE, "#111111"), 0.08)

    foreground = ImageOps.contain(image, OUTPUT_SIZE, method=Image.Resampling.LANCZOS)
    x = (OUTPUT_SIZE[0] - foreground.width) // 2
    y = (OUTPUT_SIZE[1] - foreground.height) // 2
    background.paste(foreground, (x, y))
    destination.parent.mkdir(parents=True, exist_ok=True)
    background.save(destination, "PNG", optimize=True)


def contact_sheet(paths: list[Path], destination: Path) -> None:
    thumb = (324, 405)
    gutter = 24
    canvas = Image.new("RGB", (3 * thumb[0] + 4 * gutter, thumb[1] + 2 * gutter), "#111111")
    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGB")
        image = ImageOps.fit(image, thumb, method=Image.Resampling.LANCZOS)
        canvas.paste(image, (gutter + index * (thumb[0] + gutter), gutter))
    canvas.save(destination, "PNG", optimize=True)


def main() -> None:
    exports = []
    for source in sorted(SOURCE.glob("*.png")):
        destination = EXPORTS / source.name
        convert(source, destination)
        exports.append(destination)
    contact_sheet(exports, ROOT / "brand-intro-concepts-contact-sheet.png")


if __name__ == "__main__":
    main()
