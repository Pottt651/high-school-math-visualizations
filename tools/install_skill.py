"""Install this project's reusable skill without overwriting local edits."""
import argparse
import os
from pathlib import Path
import shutil

NAME = 'math-problem-visualizer'
SOURCE = Path(__file__).resolve().parents[1] / 'skills' / NAME
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--skills-dir', type=Path, help='Alternative skills directory')
args = parser.parse_args()
codex_dir = Path(os.environ.get('CODEX_HOME') or Path.home() / '.codex')
skills_dir = (args.skills_dir or codex_dir / 'skills').expanduser().resolve()
target = skills_dir / NAME
assert (SOURCE / 'SKILL.md').is_file(), 'Missing repository skill'

def contents(folder):
    return {p.relative_to(folder): p.read_bytes() for p in folder.rglob('*') if p.is_file()}

if target.exists():
    if target.is_symlink() or target.resolve().parent != skills_dir:
        raise SystemExit('Refusing to follow an unexpected skill-directory link.')
    if contents(target) != contents(SOURCE):
        raise SystemExit('Existing skill differs. Compare and merge local edits before synchronizing; nothing was overwritten.')
    print('Skill already matches the repository.')
else:
    skills_dir.mkdir(parents=True, exist_ok=True)
    shutil.copytree(SOURCE, target)
    print(f'Installed {NAME}.')
