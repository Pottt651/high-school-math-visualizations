from pathlib import Path
import base64
import re
import hashlib
import json
import html
import os

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
common = [
    ('/*KATEX_CSS*/', css),
    ('/*KATEX_JS*/', (VENDOR / 'dist/katex.min.js').read_text(encoding='utf-8').replace('</script', '<\\/script')),
    ('/*MATH*/', (BASE / 'math.js').read_text(encoding='utf-8')),
    ('/*STYLE*/', (BASE / 'style.css').read_text(encoding='utf-8')),
    ('/*LAB*/', (BASE / 'lab.js').read_text(encoding='utf-8')),
    ('/*THREE*/', three_bundle.decode('utf-8').replace('</script', '<\\/script')),
    ('/*SPACE*/', (BASE / 'space.js').read_text(encoding='utf-8')),
    ('/*APP*/', (BASE / 'app.js').read_text(encoding='utf-8')),
]

def project_path(value):
    candidate = (ROOT / value).resolve()
    if not candidate.is_relative_to(ROOT) or candidate == ROOT:
        raise ValueError(f'Path must stay inside this project: {value}')
    return candidate

def inline_json(value):
    return json.dumps(value, ensure_ascii=False).replace('<', '\\u003c')

def substitute(template, replacements):
    for marker, content in replacements:
        assert template.count(marker) == 1, f'Expected one {marker}'
        template = template.replace(marker, content)
    return template

papers = json.loads((ROOT / 'papers/catalog.json').read_text(encoding='utf-8'))
assert papers and len({p['id'] for p in papers}) == len(papers), 'Duplicate or empty paper catalog'
outputs = {ROOT / 'index.html'}
# Check all destinations before writing: a later record may own an earlier
# record's mistaken alias, including an independently authored paper.
for paper in papers:
    assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', paper['id']), 'Invalid paper id'
    ids = [q['id'] for q in paper['questions']]
    assert ids and len(set(ids)) == len(ids) and all(type(i) is int and i > 0 for i in ids), 'Invalid question ids'
    target = project_path(paper['href'])
    assert target.suffix == '.html', 'A paper must link to a local HTML file'
    configuration = paper.get('build')
    if not configuration:
        assert target.exists(), f'Missing standalone paper: {target.name}'
        assert target not in outputs, f'Conflicting output: {paper["href"]}'
        outputs.add(target)
        continue
    for filename in [paper['href'], *configuration.get('legacyOutputs', [])]:
        output = project_path(filename)
        assert output not in outputs and output.suffix == '.html', f'Conflicting output: {filename}'
        outputs.add(output)
    module_dir = project_path(configuration['moduleDir'])
    for source_file in [module_dir / 'guides.js', *(module_dir / f'q{i}.js' for i in ids)]:
        assert source_file.is_file(), f'Missing source: {source_file.name}'
    if configuration.get('model'):
        assert project_path(configuration['model']).is_file(), 'Missing model'

for paper in papers:
    configuration = paper.get('build')
    if not configuration:
        continue
    ids = [q['id'] for q in paper['questions']]
    module_dir = project_path(configuration['moduleDir'])
    modules = '\n'.join((module_dir / f'q{i}.js').read_text(encoding='utf-8') for i in ids)
    model = project_path(configuration['model']).read_text(encoding='utf-8') if configuration.get('model') else ''
    metadata = {k: v for k, v in paper.items() if k != 'build'}
    for filename in [paper['href'], *configuration.get('legacyOutputs', [])]:
        output = project_path(filename)
        template = substitute((BASE / 'shell.html').read_text(encoding='utf-8'), common + [
            ('/*MODEL*/', model),
            ('/*MODULES*/', modules),
            ('/*GUIDES*/', (module_dir / 'guides.js').read_text(encoding='utf-8')),
            ('/*PAPER_DATA*/', inline_json(metadata)),
            ('/*PAGE_TITLE*/', html.escape('高中数学题可视化 · ' + paper['title'])),
            ('/*PAPER_LABEL*/', html.escape(paper.get('shortTitle', paper['title']))),
            ('/*HOME_HREF*/', html.escape(os.path.relpath(ROOT / 'index.html', output.parent).replace(os.sep, '/'))),
        ])
        for name, folder in [('KaTeX', VENDOR), ('Three.js', three_dir)]:
            template += f'\n<!-- {name} license\n' + (folder / 'LICENSE').read_text(encoding='utf-8') + '\n-->\n'
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(template, encoding='utf-8')
    print(f"Built {paper['id']}: {len(ids)} questions, all resources inline.")

catalog_data = [{k: v for k, v in paper.items() if k != 'build'} for paper in papers]
home = substitute((ROOT / 'catalog/shell.html').read_text(encoding='utf-8'), [('/*CATALOG_DATA*/', inline_json(catalog_data))])
(ROOT / 'index.html').write_text(home, encoding='utf-8')
print(f'Built catalog: {len(papers)} paper(s).')
