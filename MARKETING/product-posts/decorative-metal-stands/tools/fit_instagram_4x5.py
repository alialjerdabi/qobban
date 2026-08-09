from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(r"C:\AI-Workspace\Qobban\MARKETING\product-posts\decorative-metal-stands")
SOURCE = ROOT / "source" / "decorative-metal-stands-reflow.png"
OUTPUT = ROOT / "decorative-metal-stands-instagram-4x5.png"
OUTPUT_2X = ROOT / "decorative-metal-stands-instagram-4x5-2x.png"

TARGET_SIZE = (1080, 1350)


def main() -> None:
    source = Image.open(SOURCE).convert("RGB")

    target_width, target_height = TARGET_SIZE
    scaled_width = round(source.width * target_height / source.height)
    scaled = source.resize((scaled_width, target_height), Image.Resampling.LANCZOS)

    # Preserve every designed element without vertical cropping. The original
    # generated reflow is centered, while narrow side extensions complete the
    # exact 4:5 canvas: photographic texture at left and charcoal at right.
    canvas = Image.new("RGB", TARGET_SIZE, "#111314")
    x = (target_width - scaled_width) // 2

    left_extension = scaled.crop((0, 0, min(42, scaled.width), scaled.height))
    left_extension = left_extension.resize((x, target_height), Image.Resampling.BICUBIC)
    left_extension = left_extension.filter(ImageFilter.GaussianBlur(radius=4))

    # Turn the narrow photographic continuation into a controlled edge vignette.
    # This conceals repetition while allowing the image to meet the canvas edge.
    darkness = Image.new("L", (x, target_height))
    darkness.putdata(
        [
            round(205 * (1 - column / max(1, x - 1)) ** 1.45)
            for _row in range(target_height)
            for column in range(x)
        ]
    )
    left_extension = Image.composite(
        Image.new("RGB", left_extension.size, "#08090A"), left_extension, darkness
    )
    canvas.paste(left_extension, (0, 0))
    canvas.paste(scaled, (x, 0))

    canvas.save(OUTPUT, format="PNG", optimize=True)
    canvas.resize((2160, 2700), Image.Resampling.LANCZOS).save(
        OUTPUT_2X, format="PNG", optimize=True
    )


if __name__ == "__main__":
    main()
