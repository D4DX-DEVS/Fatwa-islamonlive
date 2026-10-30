# Cuts the two speech bubbles out of public/logo.png and writes them as the favicon set.
# Run once with Pillow installed: py scripts/bubble-icon.py   (outputs are committed)
from PIL import Image

logo = Image.open("public/logo.png").convert("RGBA")
alpha = logo.split()[3]
cols = [x for x in range(logo.width) if any(alpha.getpixel((x, y)) > 40 for y in range(logo.height))]
end = next(cols[i] for i in range(len(cols) - 1) if cols[i + 1] - cols[i] > 3)  # first gap: bubbles end, text begins
bubbles = logo.crop((cols[0], 0, end + 1, logo.height))
bubbles = bubbles.crop(bubbles.getbbox())

def icon(size, background=None):
    im = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    pad = int(size * 0.08)
    scale = (size - 2 * pad) / max(bubbles.size)
    art = bubbles.resize((round(bubbles.width * scale), round(bubbles.height * scale)), Image.LANCZOS)
    im.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
    return im

icon(512).save("app/icon.png")
icon(180, (251, 246, 234, 255)).save("app/apple-icon.png")  # iOS fills transparency with black, so ivory behind it
icon(256).save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("bubbles", bubbles.size, "ok")
