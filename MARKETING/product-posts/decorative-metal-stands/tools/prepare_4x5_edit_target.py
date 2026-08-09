from pathlib import Path

from PIL import Image


ROOT = Path(r"C:\AI-Workspace\Qobban\MARKETING\product-posts\decorative-metal-stands")
SOURCE = ROOT / "source" / "original-9x16-reference.png"
OUTPUT = ROOT / "source" / "layout-target-4x5.png"


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")
    canvas = Image.new("RGB", (1080, 1350), "#111314")

    # Establish the non-negotiable split before the generative polish pass:
    # full-colour base photography on the left, matte-black information panel
    # only on the right. No overlay or vignette crosses into the photo.
    photo = source.crop((0, 0, 570, 1480)).resize(
        (600, 1350), Image.Resampling.LANCZOS
    )
    panel = source.crop((570, 0, source.width, 1480)).resize(
        (480, 1350), Image.Resampling.LANCZOS
    )
    canvas.paste(photo, (0, 0))
    canvas.paste(panel, (600, 0))

    # Preserve the original full-width contact hierarchy as a structural cue.
    contact = source.crop((42, 1480, 915, 1592)).resize(
        (1010, 130), Image.Resampling.LANCZOS
    )
    canvas.paste(contact, (35, 1175))

    footer = source.crop((250, 1592, 700, source.height)).resize(
        (420, 58), Image.Resampling.LANCZOS
    )
    canvas.paste(footer, (330, 1292))

    canvas.save(OUTPUT, format="PNG", optimize=True)


if __name__ == "__main__":
    main()
