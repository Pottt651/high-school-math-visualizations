# 嘉定一模 · 八题互动讲解

双击 **[嘉定一模_互动讲题.html](嘉定一模_互动讲题.html)** 即可使用，无需联网或安装依赖。新版按教师反馈简化为直接操作图形、观察关系、展开解释。

每题题目下有“看图思路”，说明图形与解题目标的关系。答案始终可见；所求量、图中对应标注与答案统一红色，辅助对象保留其他颜色。公式采用规范的分数、根式与上下标排版，输入框仍支持键入 `2/3` 这样的便捷语法。

| 题目 | 建议先做的操作 |
|---|---|
| 10 · 空间距离 | 改变 AP，观察三个单位距离与 OA；拖动图形旋转视角。 |
| 11 · 拱桥费用 | 改变坡角，对照桥形及直线段、圆弧、总费用三条曲线。 |
| 12 · 绝对值距离 | 拖动圆周转动两点，比较两段垂线的长度；定位一个点在线上的情形。 |
| 16 · 递推数列 | 选择 r 和初值，逐项计算，对照蛛网图与数列项图。 |
| 17 · 斜三棱柱 | 第一问观察侧棱与高；第二问改变偏移及高度，展开辅助线。 |
| 18 · 区间极值 | 切换零点条件下的候选 ω，观察极值点是否进入开区间。 |
| 20 · 椭圆面积 | 转动弦，取消条件后平移；勾选单位圆，对照弦心距与面积。 |
| 21 · A 值 | 切换函数、拖动候选点，比较原函数与整条差值曲线。 |

“显示关键关系”展开辅助线或推导，“复位”恢复当前题，“全屏”方便投屏。也可用左右方向键换题，R 复位、F 全屏；在输入框中操作不会触发这些快捷键。第 18、20 题分别聚焦第二、第三问。

## 文件与维护

- `simple/`：新版八题模块、公共绘图工具、样式与页面入口。运行 `python build.py` 重建独立 HTML；第 20 题沿用已核验的 `src/model.js` 数学模型。
- `vendor/katex/`：固定版本 KaTeX 0.18.7。构建时核验包完整性，并将脚本、字体和许可证内嵌进 HTML；只复制一个 HTML 到其他文件夹也可离线使用。[KaTeX API 文档](https://katex.org/docs/api)说明所用的公式排版接口。
- `src/`：保留旧样章的界面源码及椭圆数学模型。旧版完整页面在 `archive/第20题_首轮样章.html`；原来的“第20题_交互样章”文件名现在也打开新版，并默认进入第 20 题。
- [八题教学设计与审阅稿.md](八题教学设计与审阅稿.md)：保留详细推导；其中分幕与交付安排属于历史设计，不是新版操作流程。
- [验证记录.md](验证记录.md)：新版实际检查范围与旧样章历史记录。

椭圆模型检查：`node tests/model.test.cjs`。新版浏览器检查：`node tests/simple-browser.cjs` 和 `node tests/simple-interactions.cjs`，需要 Playwright 和 Chrome，可用 `MATH_PLAYWRIGHT_PATH`、`MATH_BROWSER_PATH` 指定路径。`tests/browser.test.cjs` 只测试归档的旧版界面。

## 多设备维护

仓库：<https://github.com/Pottt651/jiading-math-interactive>

新电脑先安装 Git、Python 3.11 或更新版本、Node.js 20 或更新版本，然后：

```bash
git clone https://github.com/Pottt651/jiading-math-interactive.git
cd jiading-math-interactive
npm ci
npx playwright install chromium
npm run build
npm test
```

只查看课件不需要安装这些工具：在仓库的 **Code → Download ZIP** 下载项目，解压后打开 `嘉定一模_互动讲题.html`。

每次换设备，先运行 `git pull --ff-only` 更新。修改对应的 `simple/q题号.js`，或公共的 `simple/guides.js`、`simple/style.css`，然后构建、检查并同步：

```bash
npm run build
npm test
git add .
git commit -m "说明本次修改"
git push
```

维护源码后重新生成 HTML，保证仓库里的课件与源码一致。尽量在一台设备提交并推送完成后，再切换另一台；若拉取提示冲突，先保留本机修改再处理合并。

GitHub Actions 会在推送后构建并检查课件。通过后，可从对应运行的 **Artifacts → jiading-math-courseware** 下载可独立使用的 HTML。

## 开发检查

- `npm run test:model`：独立数学模型与边界检查。
- `npm run test:browser`：交互、布局、答案、公式与离线资源检查。
- `npm run test:legacy`：归档旧版的可选回归检查。

浏览器测试默认使用 Playwright 安装的 Chromium。Linux 首次安装可执行 `npx playwright install --with-deps chromium`。已有浏览器时可通过 `MATH_BROWSER_PATH` 指定可执行文件；有现成 Playwright 环境时可用 `MATH_PLAYWRIGHT_PATH` 指定模块路径。
