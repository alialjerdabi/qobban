from pathlib import Path

from PIL import Image


ROOT = Path(r"C:\AI-Workspace\Qobban\MARKETING\product-posts\decorative-metal-stands")
SOURCE = ROOT / "source" / "decorative-metal-stands-4x5-v2-source.png"
OUTPUT = ROOT / "decorative-metal-stands-instagram-4x5-v2.png"
OUTPUT_2X = ROOT / "decorative-metal-stands-instagram-4x5-v2-2x.png"


def main() -> None:
    image = Image.open(SOURCE).convert("RGB")
    instagram = image.resize((1080, 1350), Image.Resampling.LANCZOS)
    instagram.save(OUTPUT, format="PNG", optimize=True)
    instagram.resize((2160, 2700), Image.Resampling.LANCZOS).save(
        OUTPUT_2X, format="PNG", optimize=True
    )


if __name__ == "__main__":
    main()
