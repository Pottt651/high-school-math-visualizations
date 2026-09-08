from pathlib import Path
import base64
import re
import hashlib
import json

ROOT = Path(__file__).resolve().parent
BASE = ROOT / 'simple'
VENDOR = ROOT / 'vendor/katex'
source = json.loads((VENDOR / 'package-source.json').read_text(encoding='utf-8-sig'))
algorithm, expected = source['integrity'].split('-', 1)
actual = base64.b64encode(hashlib.new(algorithm, (VENDOR / 'package.tgz').read_bytes()).digest()).decode()
assert actual == expected, 'KaTeX package integrity mismatch'
css = (VENDOR / 'dist/katex.min.css').read_text(encoding='utf-8')
def font_source(match):
    font = VENDOR / 'dist' / match[1]
    return 'src:url(data:font/woff2;base64,' + base64.b64encode(font.read_bytes()).decode() + ') format("woff2")'
css = re.sub(r'src:url\(([^)]+\.woff2)\)[^}]+', font_source, css)
three_dir = ROOT / 'vendor/three'
three_source = json.loads((three_dir / 'package-source.json').read_text(encoding='utf-8'))
three_bundle = (three_dir / 'three.min.js').read_bytes()
assert hashlib.sha256(three_bundle).hexdigest() == three_source['sha256'], 'Three.js bundle integrity mismatch'
ids = [10, 11, 12, 16, 17, 18, 20, 21]
modules = '\n'.join((BASE / f'q{i}.js').read_text(encoding='utf-8') for i in ids)
template = (BASE / 'shell.html').read_text(encoding='utf-8')
for marker, content in [
    ('/*KATEX_CSS*/', css),
    ('/*KATEX_JS*/', (VENDOR / 'dist/katex.min.js').read_text(encoding='utf-8').replace('</script', '<\\/script')),
    ('/*MATH*/', (BASE / 'math.js').read_text(encoding='utf-8')),
    ('/*STYLE*/', (BASE / 'style.css').read_text(encoding='utf-8')),
    ('/*LAB*/', (BASE / 'lab.js').read_text(encoding='utf-8')),
    ('/*THREE*/', three_bundle.decode('utf-8').replace('</script', '<\\/script')),
    ('/*SPACE*/', (BASE / 'space.js').read_text(encoding='utf-8')),
    ('/*MODEL*/', (ROOT / 'src/model.js').read_text(encoding='utf-8')),
    ('/*MODULES*/', modules),
    ('/*GUIDES*/', (BASE / 'guides.js').read_text(encoding='utf-8')),
    ('/*APP*/', (BASE / 'app.js').read_text(encoding='utf-8')),
]:
    assert template.count(marker) == 1
    template = template.replace(marker, content)
template += '\n<!-- KaTeX license\n' + (VENDOR / 'LICENSE').read_text(encoding='utf-8') + '\n-->\n'
template += '\n<!-- Three.js license\n' + (three_dir / 'LICENSE').read_text(encoding='utf-8') + '\n-->\n'
output = ROOT / '嘉定一模_互动讲题.html'
output.write_text(template, encoding='utf-8')
# Preserve the original reviewed sample, then make its old link open the simplified lesson.
old = ROOT / '嘉定一模_第20题_交互样章.html'
archive = ROOT / 'archive' / '第20题_首轮样章.html'
if old.exists() and not archive.exists():
    archive.parent.mkdir(exist_ok=True)
    archive.write_bytes(old.read_bytes())
old.write_text(template, encoding='utf-8')
print(f'Built {output.name}: {output.stat().st_size:,} bytes; {len(ids)} questions, all resources inline.')
