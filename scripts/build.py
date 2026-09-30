"""Produce an optional clean static artifact; GitHub Pages can serve the root directly."""
from pathlib import Path
import shutil
ROOT = Path(__file__).resolve().parents[1]
output = ROOT / 'dist'
output.mkdir(exist_ok=True)
for name in ['.nojekyll', 'index.html', '404.html', 'styles.css', 'script.js', 'robots.txt', 'sitemap.xml', 'app-ads.txt']:
    shutil.copy2(ROOT / name, output / name)
shutil.copytree(ROOT / 'assets', output / 'assets', dirs_exist_ok=True)
print('Static deployment artifact: dist/ (no server runtime required).')
