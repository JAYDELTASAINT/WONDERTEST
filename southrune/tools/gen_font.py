# Gera src/01_fontdata.js a partir da GNU Unifont (glifos 8x16).
# Unifont: GPL-2.0+ com exceção de embutir fontes / SIL OFL 1.1.
from PIL import Image, ImageFont, ImageDraw
import os, sys

FONT = '/usr/share/fonts/opentype/unifont/unifont.otf'
f = ImageFont.truetype(FONT, 16)
chars = [chr(c) for c in range(32, 127)]
chars += list("ÀÁÂÃÄÇÈÉÊÍÎÓÔÕÖÚÛÜàáâãäçèéêíîóôõöúûüÑñ¡¿«»°ºª…—–“”‘’•♪★☆←↑→↓©·×")
out = []
skipped = []
for ch in chars:
    w = f.getlength(ch)
    if w != 8:
        skipped.append((ch, w)); continue
    img = Image.new('L', (8, 16), 0)
    ImageDraw.Draw(img).text((0, 0), ch, font=f, fill=255)
    rows = []
    for y in range(16):
        b = 0
        for x in range(8):
            if img.getpixel((x, y)) > 127:
                b |= (0x80 >> x)
        rows.append('%02x' % b)
    out.append((ch, ''.join(rows)))
js = '// Gerado por tools/gen_font.py a partir da GNU Unifont (8x16).\n'
js += '// Unifont: GPL-2.0+ com exceção para embutir fontes / SIL OFL 1.1.\n'
js += 'const FONT_CHARS = ' + repr(''.join(c for c, _ in out)).replace("'", '"') if False else ''
import json
js += 'const FONT_CHARS = ' + json.dumps(''.join(c for c, _ in out), ensure_ascii=False) + ';\n'
js += 'const FONT_HEX = "' + ''.join(h for _, h in out) + '";\n'
dst = os.path.join(os.path.dirname(__file__), '..', 'src', '01_fontdata.js')
open(dst, 'w', encoding='utf-8').write(js)
print('glyphs', len(out), 'skipped', skipped)
