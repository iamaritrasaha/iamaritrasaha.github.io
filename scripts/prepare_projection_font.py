"""Subset an official STIX v2.13b171 static_otf.zip for this study's MathML.

Optional authoring tool: pip install fonttools[woff] brotli
Usage: python3 scripts/prepare_projection_font.py /path/to/static_otf.zip
The original OFL is retained separately; the derivative has a distinct name.
"""
import sys
import unicodedata
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
from fontTools import subset
from fontTools.ttLib import TTFont

with ZipFile(sys.argv[1]) as archive:
    name = next(name for name in archive.namelist() if name.endswith('STIXTwoMath-Regular.otf'))
    font = TTFont(BytesIO(archive.read(name)))
characters = set(range(32, 127)) | {ord(char) for char in 'αβγθπ−'}
# MathML Core maps single-letter identifiers to mathematical italic code points.
for letter in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz':
    case = 'CAPITAL' if letter.isupper() else 'SMALL'
    try:
        characters.add(ord(unicodedata.lookup(f'MATHEMATICAL ITALIC {case} {letter.upper()}')))
    except KeyError:
        characters.add(0x210E)  # italic h is the Planck constant character
for name in ['ALPHA', 'BETA', 'GAMMA', 'THETA', 'PI']:
    characters.add(ord(unicodedata.lookup(f'MATHEMATICAL ITALIC SMALL {name}')))
options = subset.Options()
options.layout_features = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=characters)
subsetter.subset(font)
for record in font['name'].names:
    if record.nameID in [1, 3, 4, 6, 16]:
        name = 'PortfolioMath' if record.nameID == 6 else 'Portfolio Math'
        record.string = name.encode(record.getEncoding())
assert 'MATH' in font
font.flavor = 'woff2'
font.save(Path(__file__).resolve().parents[1] / 'assets/fonts/PortfolioMath.woff2')
