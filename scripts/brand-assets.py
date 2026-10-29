# Draws the favicon set and the default social-sharing image: gold eight-point star on deep emerald (the site's motif).
# Run once with Pillow installed: py scripts/brand-assets.py   (outputs are committed; the Malayalam text is left to the pages)
from PIL import Image, ImageDraw, ImageFont
import math

DEEP, INK, GOLD, CHAMP, IVORY = (11, 58, 44), (7, 33, 26), (201, 162, 75), (236, 220, 166), (251, 246, 234)

def star(cx, cy, r_out, r_in, points=8):
    pts = []
    for i in range(points * 2):
        a = math.pi * i / points - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def icon(size):
    s = size * 4  # draw large, shrink for smooth edges
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=DEEP)
    d.polygon(star(s / 2, s / 2, s * 0.36, s * 0.2), fill=GOLD)
    d.ellipse([s * 0.43, s * 0.43, s * 0.57, s * 0.57], fill=DEEP)
    return im.resize((size, size), Image.LANCZOS)

icon(512).save("app/icon.png")
icon(180).save("app/apple-icon.png")
icon(256).save("app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

# social image 1200x630
W, H = 1200, 630
im = Image.new("RGB", (W, H), DEEP)
d = ImageDraw.Draw(im)
for gx in range(0, W + 90, 90):  # faint star lattice
    for gy in range(0, H + 90, 90):
        d.polygon(star(gx, gy, 38, 20), outline=(32, 84, 66))
d.rectangle([0, H - 14, W, H], fill=GOLD)
big = icon(300)
im.paste(big, (90, 165), big)
bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 92)
reg = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 31)
d.text((440, 215), "Fatwa", font=bold, fill=IVORY)
d.text((440, 315), "Islamonlive", font=bold, fill=GOLD)
d.line([(444, 440), (760, 440)], fill=GOLD, width=3)
d.text((444, 462), "The comprehensive fatwa portal in Malayalam", font=reg, fill=CHAMP)
im.save("public/og-default.png", optimize=True)
print("ok")
