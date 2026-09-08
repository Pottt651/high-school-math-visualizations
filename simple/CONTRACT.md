# 模块维护约定

每题在 `q题号.js` 注册 `Problems[题号]`，包含 `title`、`statement` 与 `mount(host)`。挂载后返回 `render`、`reset`、`getState`，有清理需求时提供 `destroy`。

## 页面结构

- `.controls`：必要的控件；元素 ID 加题号前缀，查询限定在当前 `host` 内。
- `.figures`：一个 SVG 或两幅同步图。单图用 `.main-figure`，并排图用 `.figure`。
- `.readout`：由当前坐标计算的数值，以及始终可见的答案。
- `.explain`：证明或解析，由公共按钮控制；`.aux` 可用于同步显示辅助线。
- `guides.js`：每题一两句看图思路，说明题设、操作和所求量之间的关系。

保持直接操作的简洁界面。特殊构型和定义域例外必须明确说明；数值试验不能代替证明。

## 公式与颜色

- `M.inline(tex)`：行内公式。
- `M.block(tex)`：块公式；长式子用 `aligned` 分行。
- `M.answer(html)`：放在读数区域内的答案条。
- `M.rational('2/3')`、`M.number(value, digits)`：生成供排版的分数或数值 TeX。
- `Lab.C.target` 和 `.target`：所求量及答案统一红色，深色模式提高明度。辅助对象使用 `blue`、`green`、`gold`、`gray`。
- 颜色使用 `style.css` 中的主题变量。图形画布为 `--canvas`，不要硬编码白色背景或描边；`Lab.C` 与数学图注共享 `--plot-*` 变量，切换主题时无需重建数学状态。
- `.explain` 内按思路使用 `<section class="proof-step"><h3>短标题</h3>…</section>`；重要限制可用 `.proof-note`，保留分段与公式分行。

KaTeX 与字体已内嵌到输出文件，运行时不依赖联网。源码用 `String.raw` 模板保留 TeX 反斜杠，动态插值只使用明确的数学数据。

## 绘图与交互

`Lab.plot(svg, bounds)` 接收 `{xmin,xmax,ymin,ymax,equal=true,pad=34}`，返回绘图对象 `p`。坐标点使用 `[x,y]`。

常用方法：`axes`、`line`、`poly`、`circle`、`dot`、`text`、`screenText`、`curve`、`add`、`finish`。`poly` 是闭合多边形；曲线采样必须服从同一数学模型。

`p.math(point, tex, options)` 与 `p.screenMath(x,y,tex,options)` 在图中排版公式。`p.to(point)` 将数学坐标变成屏幕坐标，`p.fromEvent(event)` 反向转换；线型和文字通过 `color`、`stroke`、`width`、`dash`、`dx`、`dy`、`anchor` 等选项调整。

将鼠标事件绑定在 SVG 容器上，避免重绘后子元素事件丢失。各视图读取同一个状态；不要分别手调图形以制造不变量。公共入口观察图形区大小和字体加载并重绘。

`text`、`math` 和点名默认按真实字体尺寸避让已有标注与点。`screenText`、`screenMath` 默认固定，用于坐标刻度、标题和独立读数。可用 `avoid:false` 固定对象标注、`priority` 调整顺序；较远位移默认绘制引线。面积标注传入 `region:[…多边形顶点]`，保证字框留在凸多边形内；空间不足时省略图内标签，并保留独立数值读数。图内独立面板需要完整命中区域，不能让透明文字所在位置触发底层图形拖动。

## 空间图

`Space.create(svg,{center,span,view})` 创建正交三维观察器。`setScene({points,edges,faces,annotations})` 接收真实三维坐标；各对象使用稳定 `id`，更新时复用 SVG 节点与网格。`setView`、`resetView` 只改变相机。题目卸载时必须调用 `destroy()`，清除事件、待绘制帧并释放三维资源。

空间面参与深度排序与射线遮挡，线段在投影边界和面穿越处切分后判断前后。需要始终可见的教学辅助线应显式设 `occlude:false`，不要伪造点的位置来躲避遮挡。底面积等区域标签在侧面投影过窄时可以隐藏，题目读数保持完整。

旋转采用 `requestAnimationFrame` 合并绘制；不要在每个旋转事件中重排证明或重建 KaTeX。`getState()` 只返回稳定状态；帧耗时等诊断数据通过 `getDiagnostics()` 读取，避免污染数学状态比较。

修改后运行 `npm run build` 和 `npm test`，同时提交源码与生成的 HTML。
