from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent
source = root.parent.parent / "product-posts" / "gas-cylinder-cabinet" / "assets" / "qobban-logo-lockup-dark.png"

image = Image.open(source).convert("RGBA")
scale = 6
image = image.resize((image.width * scale, image.height * scale), Image.Resampling.LANCZOS)

light_pixels = []
dark_pixels = []
for red, green, blue, alpha in image.getdata():
    if alpha == 0:
        light_pixels.append((0, 0, 0, 0))
        dark_pixels.append((0, 0, 0, 0))
        continue

    is_yellow = red > 120 and green > 70 and blue < 120
    if is_yellow:
        color = (255, 194, 32, alpha)
        light_pixels.append(color)
        dark_pixels.append(color)
    else:
        light_pixels.append((242, 242, 242, alpha))
        dark_pixels.append((26, 26, 26, alpha))

light = Image.new("RGBA", image.size)
light.putdata(light_pixels)
dark = Image.new("RGBA", image.size)
dark.putdata(dark_pixels)

light.save(root / "qobban-lockup-transparent-light-v1.png", optimize=True)
dark.save(root / "qobban-lockup-transparent-dark-v1.png", optimize=True)

