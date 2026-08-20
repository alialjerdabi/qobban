from pathlib import Path

from PIL import Image, ImageDraw


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "qobban-spirit-level-macro-master.png"
OUTPUT = HERE / "qobban-spirit-level-macro-framed.png"

canvas_size = (1600, 1253)
margin = 58
corner_radius = 58
background = (242, 240, 235, 255)

with Image.open(SOURCE) as source:
    source = source.convert("RGB")
    panel_size = (canvas_size[0] - margin * 2, canvas_size[1] - margin * 2)
    panel = source.resize(panel_size, Image.Resampling.LANCZOS)

canvas = Image.new("RGBA", canvas_size, background)
mask = Image.new("L", panel_size, 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle(
    (0, 0, panel_size[0] - 1, panel_size[1] - 1),
    radius=corner_radius,
    fill=255,
)
canvas.paste(panel, (margin, margin), mask)
canvas.convert("RGB").save(OUTPUT, quality=96)

