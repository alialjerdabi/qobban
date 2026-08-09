from pathlib import Path

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_SIZE = (1080, 1350)


def export_4x5(source: Path, destination: Path) -> None:
    image = Image.open(source).convert("RGB")
    background = ImageOps.fit(image, OUTPUT_SIZE, method=Image.Resampling.LANCZOS)
    background = background.filter(ImageFilter.GaussianBlur(radius=28))
    background = Image.blend(background, Image.new("RGB", OUTPUT_SIZE, "#111111"), 0.10)

    foreground = ImageOps.contain(image, OUTPUT_SIZE, method=Image.Resampling.LANCZOS)
    x = (OUTPUT_SIZE[0] - foreground.width) // 2
    y = (OUTPUT_SIZE[1] - foreground.height) // 2

    mask = Image.new("L", foreground.size, 255)
    fade = min(18, foreground.width // 10)
    if fade:
        pixels = mask.load()
        for edge_x in range(fade):
            alpha = round(255 * edge_x / fade)
            for row in range(foreground.height):
                pixels[edge_x, row] = alpha
                pixels[foreground.width - 1 - edge_x, row] = alpha

    background.paste(foreground, (x, y), mask)
    destination.parent.mkdir(parents=True, exist_ok=True)
    background.save(destination, "PNG", optimize=True)


def make_contact_sheet(paths: list[Path], destination: Path) -> None:
    thumb_size = (260, 325)
    gutter = 20
    cols = 4
    rows = (len(paths) + cols - 1) // cols
    sheet = Image.new(
        "RGB",
        (cols * thumb_size[0] + (cols + 1) * gutter, rows * thumb_size[1] + (rows + 1) * gutter),
        "#111111",
    )
    for index, path in enumerate(paths):
        image = Image.open(path).convert("RGB")
        image = ImageOps.fit(image, thumb_size, method=Image.Resampling.LANCZOS)
        col = index % cols
        row = index // cols
        sheet.paste(image, (gutter + col * (thumb_size[0] + gutter), gutter + row * (thumb_size[1] + gutter)))
    destination.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(destination, "PNG", optimize=True)


def main() -> None:
    source_files = sorted(ROOT.glob("post-*/source-renders/*.png"))
    exported: list[Path] = []
    for source in source_files:
        destination = source.parent.parent / "exports-4x5" / source.name
        export_4x5(source, destination)
        exported.append(destination)

    for post_dir in sorted(ROOT.glob("post-*")):
        slides = sorted((post_dir / "exports-4x5").glob("*.png"))
        finals = [path for path in slides if "base" not in path.stem]
        if len(finals) > 1:
            make_contact_sheet(finals, post_dir / "preview-contact-sheet.png")

    make_contact_sheet(
        [path for path in exported if "base" not in path.stem],
        ROOT / "week-1-master-contact-sheet.png",
    )


if __name__ == "__main__":
    main()
