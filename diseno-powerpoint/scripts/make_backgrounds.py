# Fondos del método editorial con los colores de brand.json: tres oscuros con resplandores (acento arriba,
# profundidad abajo), uno profundo para divisores y uno marfil para la parte educativa. Con grano fino
# para que los degradados no hagan bandas.
# Uso: python -X utf8 make_backgrounds.py brand.json      → crea bg/ junto a brand.json
import json
import os
import sys

import numpy as np
from PIL import Image

brand_path = sys.argv[1] if len(sys.argv) > 1 else "brand.json"
K = json.load(open(brand_path, encoding="utf-8"))["colors"]
OUT = os.path.join(os.path.dirname(os.path.abspath(brand_path)), "bg")
os.makedirs(OUT, exist_ok=True)

W, H = 1600, 900
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def rgb(h):
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32)


def glow(cx, cy, rx, ry, power=1.6):
    d = np.sqrt(((xx - cx * W) / (rx * W)) ** 2 + ((yy - cy * H) / (ry * H)) ** 2)
    return np.clip(1 - d, 0, 1) ** power


def paint(base, layers, name, grain=2.2):
    img = np.ones((H, W, 3), np.float32) * rgb(base)
    for color, a, m in layers:
        img = img * (1 - (a * m)[..., None]) + rgb(color) * (a * m)[..., None]
    img += np.random.default_rng(7).normal(0, grain, img.shape)
    Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name), quality=92)
    print("bg/" + name)


paint(K["bg"], [(K["accent"], .17, glow(.80, .06, .55, .75)), (K["depth"], .55, glow(.03, .95, .55, .85, 1.3))], "dark-a.jpg")
paint(K["bg"], [(K["accent"], .14, glow(.50, .42, .55, .70)), (K["depth"], .55, glow(.50, 1.05, .60, .65, 1.3))], "dark-b.jpg")
paint(K["bg"], [(K["accent"], .15, glow(.20, .06, .55, .75)), (K["depth"], .55, glow(.97, .95, .55, .85, 1.3))], "dark-c.jpg")
paint(K["bg"], [(K["depth"], .85, glow(.30, .55, .95, 1.25, 1.1)), (K["accent"], .10, glow(.28, .40, .40, .55))], "depth.jpg")
paint(K["ivory"], [("FFFFFF", .55, glow(.82, .05, .60, .80)), (K["accent"], .10, glow(.02, .98, .55, .80, 1.4)),
                   (K["lineLight"], .35, 1 - glow(.5, .5, .95, 1.05, .8))], "light.jpg", grain=1.4)
