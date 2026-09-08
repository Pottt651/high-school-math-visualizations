"""Regression checks for multi-paper builds, isolated from the real catalog."""

from pathlib import Path
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest


PROJECT = Path(__file__).resolve().parents[1]


class CatalogBuildTests(unittest.TestCase):
    def setUp(self):
        # TemporaryDirectory owns and removes only this newly created fixture.
        self.temporary = tempfile.TemporaryDirectory(prefix="math-catalog-build-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name).resolve()
        files = [
            "build.py", "catalog/shell.html",
            "simple/shell.html", "simple/math.js", "simple/style.css",
            "simple/lab.js", "simple/space.js", "simple/app.js",
            "vendor/katex/package-source.json", "vendor/katex/package.tgz",
            "vendor/katex/dist/katex.min.css", "vendor/katex/dist/katex.min.js",
            "vendor/katex/LICENSE", "vendor/three/package-source.json",
            "vendor/three/three.min.js", "vendor/three/LICENSE",
        ]
        # The actual builder embeds WOFF2 only; do not copy source maps or
        # duplicate font formats, project HTML, or the real paper catalog.
        files.extend(
            str(font.relative_to(PROJECT))
            for font in (PROJECT / "vendor/katex/dist/fonts").glob("*.woff2")
        )
        for relative in files:
            destination = self.root / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(PROJECT / relative, destination)

    def write(self, relative, contents):
        destination = self.root / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(contents, encoding="utf-8")
        return destination

    def module_paper(self, paper_id, *, legacy_outputs=()):
        marker = f"fixture-{paper_id}-only"
        folder = f"papers/{paper_id}/src"
        self.write(
            f"{folder}/q17.js",
            "Problems[17] = {"
            f"title: {json.dumps(marker)}, statement: '', "
            "mount(host) { return {render(){}, reset(){}, "
            "getState(){return {value:17};}}; }};\n",
        )
        self.write(
            f"{folder}/guides.js",
            f"const LessonGuides = {{17: {json.dumps(marker + '-guide')}}};\n",
        )
        self.write(
            f"{folder}/model.js",
            f"const FixtureModel = {{name: {json.dumps(marker + '-model')}}};\n",
        )
        return {
            "id": paper_id,
            "title": f"试卷 {paper_id}",
            "shortTitle": paper_id,
            "subtitle": "构建测试",
            "year": 2026,
            "source": f"来源 {paper_id}",
            "href": f"papers/{paper_id}/index.html",
            "questions": [{"id": 17, "title": marker, "topic": "几何", "page": 1}],
            "build": {
                "moduleDir": folder,
                "model": f"{folder}/model.js",
                "legacyOutputs": list(legacy_outputs),
            },
        }

    def standalone_paper(self):
        return {
            "id": "standalone", "title": "独立课件", "subtitle": "构建测试",
            "year": 2026, "href": "papers/standalone/index.html",
            "questions": [{"id": 17, "title": "独立题目", "topic": "几何"}],
        }

    def build(self, papers):
        self.write("papers/catalog.json", json.dumps(papers, ensure_ascii=False))
        environment = dict(os.environ, PYTHONIOENCODING="utf-8")
        return subprocess.run(
            [sys.executable, str(self.root / "build.py")],
            cwd=self.root, env=environment, capture_output=True,
            text=True, encoding="utf-8", timeout=30, check=False,
        )

    def paper_metadata(self, document):
        match = re.search(r"window\.PaperMeta=(.*?);</script>", document)
        self.assertIsNotNone(match, "Paper metadata must be embedded")
        return json.loads(match.group(1))

    def test_later_standalone_conflict_leaves_all_existing_html_untouched(self):
        # Order matters: the old one-pass builder wrote the earlier paper and
        # its aliases before noticing that the later standalone owned the path.
        paper = self.module_paper("alpha", legacy_outputs=(
            "legacy-alpha.html", "papers/standalone/index.html",
        ))
        standalone = self.standalone_paper()
        sentinels = {
            "index.html": "ORIGINAL-CATALOG\r\n",
            paper["href"]: "ORIGINAL-MODULE-PAPER\r\n",
            "legacy-alpha.html": "ORIGINAL-LEGACY-PAPER\r\n",
            standalone["href"]: "INDEPENDENT-PAPER-MUST-NOT-BE-OVERWRITTEN\r\n",
        }
        before = {
            relative: self.write(relative, content).read_bytes()
            for relative, content in sentinels.items()
        }
        result = self.build([paper, standalone])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Conflicting output", result.stderr)
        self.assertIn("papers/standalone/index.html", result.stderr)
        for relative, original in before.items():
            with self.subTest(file=relative):
                self.assertEqual((self.root / relative).read_bytes(), original)

    def test_same_question_number_in_two_module_directories_stays_isolated(self):
        alpha = self.module_paper("alpha", legacy_outputs=("legacy-alpha.html",))
        beta = self.module_paper("beta")
        standalone = self.standalone_paper()
        independent = self.write(standalone["href"], "INDEPENDENT-CUSTOM-HTML\r\n")
        independent_before = independent.read_bytes()
        result = self.build([alpha, beta, standalone])
        self.assertEqual(result.returncode, 0, result.stderr)

        for own, other in ((alpha, beta), (beta, alpha)):
            with self.subTest(paper=own["id"]):
                document = (self.root / own["href"]).read_text(encoding="utf-8")
                for suffix in ("", "-guide", "-model"):
                    self.assertIn(f"fixture-{own['id']}-only{suffix}", document)
                self.assertNotIn(f"fixture-{other['id']}-only", document)
                metadata = self.paper_metadata(document)
                self.assertEqual(metadata["id"], own["id"])
                self.assertEqual([question["id"] for question in metadata["questions"]], [17])
                self.assertNotIn("build", metadata)
                self.assertIn('href="../../index.html"', document)

        legacy = (self.root / "legacy-alpha.html").read_text(encoding="utf-8")
        self.assertEqual(self.paper_metadata(legacy)["id"], "alpha")
        self.assertIn('href="index.html"', legacy)
        self.assertEqual(independent.read_bytes(), independent_before)
        home = (self.root / "index.html").read_text(encoding="utf-8")
        embedded = re.search(r"const papers = (\[.*?\]);", home, re.DOTALL)
        self.assertIsNotNone(embedded)
        catalog = json.loads(embedded.group(1))
        self.assertEqual([paper["id"] for paper in catalog], ["alpha", "beta", "standalone"])
        self.assertTrue(all(paper["questions"][0]["id"] == 17 for paper in catalog))
        self.assertTrue(all("build" not in paper for paper in catalog))


if __name__ == "__main__":
    unittest.main(verbosity=2)
