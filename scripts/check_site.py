"""Check static deployment links, accessibility basics and asset budgets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.controls = set(), [], []
        self.featured_cases = []
        self.h1 = 0
        self.file = filename

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"Duplicate ID: {attrs['id']}"
            self.ids.add(attrs['id'])
        if tag == 'h1':
            self.h1 += 1
        if tag == 'article' and any(name.startswith('case-') for name in attrs.get('class', '').split()):
            self.featured_cases.append(attrs.get('id'))
        if tag == 'img':
            assert 'alt' in attrs, f'{self.file}: image missing alt'
            assert 'width' in attrs and 'height' in attrs, 'Reserve image geometry'
        if tag == 'button':
            assert attrs.get('type') == 'button', 'Explicit button type required'
        if attrs.get('aria-controls'):
            self.controls.extend(attrs['aria-controls'].split())
        for attr in ['href', 'src']:
            if attrs.get(attr):
                self.refs.append(attrs[attr])


pages = {}
for filename in ['index.html', '404.html']:
    page = Page(filename)
    source = (ROOT / filename).read_text()
    assert not re.search(r'\u2014|&mdash;|&#8212;|&#x2014;', source, re.I), 'Em dash in page copy'
    page.feed(source)
    assert page.h1 == 1, f'{filename}: expected one h1'
    assert all(control in page.ids for control in page.controls), 'Broken aria-controls'
    pages[filename] = page

for filename, page in pages.items():
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc:
            assert url.scheme in ['https', 'mailto'], f'Unexpected URL {ref}'
            continue
        relative = unquote(url.path).lstrip('/')
        target_file = relative or ('index.html' if url.path == '/' else filename)
        assert (ROOT / target_file).is_file(), f'{filename}: missing target {ref}'
        if url.fragment:
            target = pages.get(target_file)
            assert target and unquote(url.fragment) in target.ids, f'Broken anchor {ref}'

for css_file in [ROOT / 'styles.css', *sorted((ROOT / 'assets').rglob('*.css'))]:
    css = css_file.read_text()
    for asset in re.findall(r'url\(\s*[\'\"]?([^\)\'\"]+)', css):
        asset = asset.strip()
        url = urlsplit(asset)
        if url.scheme or url.netloc:
            continue
        if not url.path and url.fragment:
            assert any(unquote(url.fragment) in page.ids for page in pages.values()), f'Missing SVG fragment {asset}'
        else:
            relative = unquote(url.path)
            target = ROOT / relative.lstrip('/') if relative.startswith('/') else css_file.parent / relative
            assert target.is_file(), f'{css_file.relative_to(ROOT)}: missing CSS asset {asset}'

homepage = pages['index.html']
assert homepage.featured_cases == ['orion', 'sysai', 'relay', 'vyren'], 'Expected four featured cases in order: Orion, SysAI, Relay, Vyren'
for anchor in [
    'top', 'main', 'work', 'expertise', 'about', 'contact',
    'orion', 'sysai', 'relay', 'vyren', 'aether', 'orbis', 'arthrekha',
    'vector', 'quanta', 'veyra', 'serein', 'aura', 'lumina', 'foresight', 'novarx',
    'systems', 'index', 'principles', 'approach', 'future',
]:
    assert anchor in homepage.ids, f'Missing preserved anchor: #{anchor}'
for filename, budget in [('index.html', 45000), ('styles.css', 45000), ('script.js', 12000), ('assets/research-plate.js', 8000), ('assets/research-plate.css', 8000), ('assets/surface-physics.js', 8000), ('assets/neuron-demo.js', 20000), ('assets/neuron-demo.css', 12800), ('assets/neuron-math.js', 16000), ('assets/neural-network.js', 8000), ('assets/digit-model.js', 32000), ('assets/theme.js', 4000)]:
    size = (ROOT / filename).stat().st_size
    assert size <= budget, f'{filename}: {size} exceeds {budget} bytes'
assert (ROOT / 'app-ads.txt').is_file()
print('PASS: 2 pages, IDs, internal links, controls, image geometry, all CSS assets, four ordered features, preserved anchors and size budgets.')
