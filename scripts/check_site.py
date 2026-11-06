"""Check static deployment links, accessibility basics and asset budgets."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import struct

ROOT = Path(__file__).resolve().parents[1]


def source_size(filename):
    """Budget canonical UTF-8/LF source, independent of checkout line endings."""
    return len((ROOT / filename).read_text(encoding='utf-8').encode('utf-8'))


class Page(HTMLParser):
    def __init__(self, filename):
        super().__init__(convert_charrefs=True)
        self.ids, self.refs, self.controls = set(), [], []
        self.featured_cases = []
        self.metadata = {}
        self.h1 = 0
        self.file = filename

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta' and (attrs.get('property') or attrs.get('name')):
            self.metadata[attrs.get('property') or attrs.get('name')] = attrs.get('content', '')
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
for filename in ['index.html', '404.html', 'embedded/index.html', 'explorations/index.html']:
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
        path = unquote(url.path)
        target_path = ((ROOT / path.lstrip('/')) if path.startswith('/') else (ROOT / filename).parent / path) if path else ROOT / filename
        if target_path.is_dir():
            target_path /= 'index.html'
        target_path = target_path.resolve()
        assert target_path.is_relative_to(ROOT), f'Outside public root: {ref}'
        target_file = target_path.relative_to(ROOT).as_posix()
        assert target_path.is_file(), f'{filename}: missing target {ref}'
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

# Imports are dependencies too: a page can exist while an indirect module is missing.
for module in [ROOT / 'script.js', *sorted((ROOT / 'assets').glob('*.js'))]:
    for ref in re.findall(r'(?:from\s+|import\s*)[\'\"](\.[^\'\"]+)[\'\"]', module.read_text(encoding='utf-8')):
        target = (module.parent / unquote(urlsplit(ref).path)).resolve()
        assert target.is_relative_to(ROOT) and target.is_file(), f'{module.name}: missing module {ref}'

# Social crawlers read the source HTML without running the welcome scripts.
for filename, page in pages.items():
    meta = page.metadata
    image_url = urlsplit(meta['og:image'])
    assert image_url.scheme == 'https' and image_url.netloc == 'iamaritrasaha.github.io', f'{filename}: social image must be publicly hosted on the canonical site'
    assert meta['twitter:image'] == meta['og:image'], f'{filename}: social image sources disagree'
    assert image_url.path != '/assets/portfolio-open-graph.png', f'{filename}: use a fresh image URL to avoid the old preview cache'
    image = (ROOT / image_url.path.lstrip('/')).read_bytes()
    assert image[:8] == b'\x89PNG\r\n\x1a\n', 'Social card must be a crawler-compatible PNG'
    width, height = struct.unpack('>II', image[16:24])
    assert (width, height) == (1200, 630), 'Social card must be 1200 by 630'
    assert (int(meta['og:image:width']), int(meta['og:image:height'])) == (width, height), 'Social metadata dimensions do not match the actual image'
    assert meta['twitter:card'] == 'summary_large_image'
    assert 'Aritra Saha' in meta['og:image:alt'] and 'Aritra Saha' in meta['twitter:image:alt']
    assert len(image) < 500_000, 'Keep the preview image small enough for chat crawlers'
    assert (ROOT / 'assets/portfolio-open-graph.png').read_bytes() == image, 'The legacy image URL should serve the current card for cached metadata'

homepage = pages['index.html']
assert homepage.featured_cases == ['seedl', 'infera', 'orion', 'sysai'], 'The homepage features AI/ML work only'
assert pages['embedded/index.html'].featured_cases == ['pulseshift'], 'PulseShift retains one full presentation in the Embedded Lab'
assert pages['explorations/index.html'].featured_cases == ['vyren'], 'Vyren, not Relay, is the featured systems study'
for anchor in ['vector', 'quanta', 'arthrekha', 'vyren', 'aether', 'orbis', 'serein', 'veyra', 'aura', 'lumina', 'foresight', 'novarx', 'relay']:
    assert anchor in pages['explorations/index.html'].ids, f'Missing exploration: {anchor}'
for anchor in [
    'top', 'main', 'work', 'expertise', 'about', 'contact',
    'seedl', 'orion', 'sysai', 'relay', 'vyren', 'aether', 'orbis', 'arthrekha',
    'vector', 'quanta', 'veyra', 'serein', 'aura', 'lumina', 'foresight', 'novarx',
    'systems', 'index', 'principles', 'approach', 'future',
]:
    assert anchor in homepage.ids, f'Missing preserved anchor: #{anchor}'
for filename, budget in [('index.html', 60000), ('embedded/index.html', 56000), ('assets/embedded.css', 18000), ('assets/electronics-math.js', 5000), ('assets/embedded.js', 18000), ('assets/navigation.js', 3500), ('assets/bitbench.css', 13500), ('assets/bitbench.js', 13000), ('styles.css', 45000), ('assets/editorial.css', 22000), ('script.js', 14000), ('assets/research-plate.js', 8000), ('assets/research-plate.css', 8000), ('assets/surface-physics.js', 8000), ('assets/neuron-demo.js', 20000), ('assets/neuron-demo.css', 12800), ('assets/neuron-math.js', 16000), ('assets/neural-network.js', 8000), ('assets/digit-model.js', 32000), ('assets/theme.js', 4000)]:
    # Git's Windows checkout may use CRLF; budget the canonical UTF-8/LF source.
    size = source_size(filename)
    assert size <= budget, f'{filename}: {size} exceeds {budget} bytes'
for filename, budget in [('assets/welcome-start.js', 3000), ('assets/welcome-math.js', 6500), ('assets/welcome-math.css', 9500), ('assets/pulse-rpm.js', 4000), ('assets/pulse-rpm.css', 5000)]:
    assert source_size(filename) <= budget, f'{filename}: scoped motion asset exceeds budget'
assert (ROOT / 'app-ads.txt').is_file()
assert source_size('assets/seedl-feature.css') <= 6000, 'SeeDL styles exceed the scoped feature budget'
for filename, budget in [('explorations/index.html', 36000), ('assets/explorations.css', 10000), ('assets/explorations.js', 5000), ('assets/architecture.css', 4000), ('assets/legacy-fragments.js', 2500)]:
    assert source_size(filename) <= budget, f'{filename}: scoped page budget exceeded'
for filename, budget in [('assets/chapter-entry.js', 13000), ('assets/chapter-entry.css', 7000), ('assets/page-transitions.js', 3000)]:
    assert source_size(filename) <= budget, f'{filename}: chapter entrance budget exceeded'
print('PASS: 4 pages, IDs, internal links, controls, image geometry, CSS assets, AI/ML features, relocated studies, legacy anchors and size budgets.')
