# Hojas de contacto numeradas (2x2) para revisar un deck renderizado con render.ps1.
# Uso: python -X utf8 contact_sheets.py <carpeta_render> <carpeta_salida>               → qa_01.png, qa_02.png…
#      python -X utf8 contact_sheets.py <carpeta_render> <carpeta_salida> --pick 3,8,12 → pick.png (solo esas)
import glob
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
num = lambda f: int(re.findall(r"(\d+)", os.path.basename(f))[-1])
files = sorted({f for f in glob.glob(os.path.join(src, "*.png")) + glob.glob(os.path.join(src, "*.PNG"))}, key=num)
if "--pick" in sys.argv:
    want = [int(n) for n in sys.argv[sys.argv.index("--pick") + 1].split(",")]
    files = [f for n in want for f in files if num(f) == n]
try:
    font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
except OSError:
    font = ImageFont.load_default()

cw, ch, cols, per = 960, 540, 2, 4
groups = [files] if "--pick" in sys.argv else [files[i:i + per] for i in range(0, len(files), per)]
for gi, grp in enumerate(groups):
    cols = 1 if len(grp) == 1 else 2
    rows = (len(grp) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cw + 10, rows * (ch + 10)), (255, 0, 255))
    for k, f in enumerate(grp):
        x, y = (k % cols) * (cw + 10), (k // cols) * (ch + 10)
        sheet.paste(Image.open(f).convert("RGB").resize((cw, ch), Image.LANCZOS), (x, y))
        d = ImageDraw.Draw(sheet)
        d.rectangle([x, y, x + 56, y + 36], fill=(255, 0, 255))
        d.text((x + 6, y + 3), str(num(f)), fill="white", font=font)
    name = "pick.png" if "--pick" in sys.argv else f"qa_{gi + 1:02d}.png"
    sheet.save(os.path.join(out, name))
    print(os.path.join(out, name))
