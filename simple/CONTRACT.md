# 模块维护约定

每题在 `q题号.js` 注册 `Problems[题号]`，包含 `title`、`statement` 与 `mount(host)`。挂载后返回 `render`、`reset`、`getState`，有清理需求时提供 `destroy`。

此接口用于愿意复用现有外壳的试卷。题目模块与 `guides.js` 放入各试卷自己的源码目录，构建从 `papers/catalog.json` 读取题号、来源和显示名称，内嵌为 `PaperMeta`。题号只在当前试卷内有效；首页按试卷路径区分同题号。嘉定案例目前保留在 `simple/q*.js`，新试卷不应覆盖这些文件。其他交互结构也可以用独立 HTML 接入，见 [试卷接入说明](../papers/README.md)。

## 页面结构

公共外壳在模块 `mount(host)` 后将内容归入 `host` 内的 `.diagram-pane` 和 `.reading-pane`。桌面默认左文右图；按钮显示下一种排版的名称“上下排版”或“左右排版”，只在左右与上下排列间切换，不提供左图右文。`html[data-layout="side-by-side"]` 表示左文右图，`html[data-layout="stacked"]` 表示上下排列；窄屏自动上下排列，保留宽屏偏好。左右模式的两栏在隐藏关键关系时仍存在，展开解析不得改变图形宽度。题干、看图思路、答案、命题或解析及构图说明留在文字栏，控件与图形留在图形栏。新增题目沿用这项约定，不按某个题号添加跨试卷生效的布局特例。

归类后所有模块节点仍在原 `host` 中，题目查询和事件委托继续限定在 `host` 内；不要假定 `.controls`、`.figures`、`.readout` 必须是 `host` 的直接子元素。排版切换通过显示状态完成，不重新执行 `mount`、`reset` 或重建数学模型，保留参数、相机、解析显示与构图步骤。偏好写入浏览器本地存储键 `math-visualizations-layout`；不可用时不影响本次切换。

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

大屏线宽由 `Lab.lineWidth` 统一放大为基础值的 1.45 倍，虚线段长与间距由 `Lab.dashPattern` 同比例调整。二维图在 `finish` 时处理几何线条（包括 `add` 写入的图形），空间图在绘制棱时应用；题目模块仍填写基础线宽，不要重复放大。圆形点标记、文字描边与 KaTeX 字形不参与几何线宽放大。

`p.math(point, tex, options)` 与 `p.screenMath(x,y,tex,options)` 在图中排版公式。`p.to(point)` 将数学坐标变成屏幕坐标，`p.fromEvent(event)` 反向转换；线型和文字通过 `color`、`stroke`、`width`、`dash`、`dx`、`dy`、`anchor` 等选项调整。

将鼠标事件绑定在 SVG 容器上，避免重绘后子元素事件丢失。各视图读取同一个状态；不要分别手调图形以制造不变量。公共入口观察图形区大小和字体加载并重绘。

`text`、`math` 和点名默认按真实字体尺寸避让已有标注与点。`screenText`、`screenMath` 默认固定，用于坐标刻度、标题和独立读数。可用 `avoid:false` 固定对象标注、`priority` 调整顺序；较远位移默认绘制引线。面积标注传入 `region:[…多边形顶点]`，保证字框留在凸多边形内；空间不足时省略图内标签，并保留独立数值读数。图内独立面板需要完整命中区域，不能让透明文字所在位置触发底层图形拖动。

图内文字和刻度统一使用 700 字重。`M.svg` 使用 KaTeX 的真实粗体数学字形，`M.measure(tex,size,true)` 测量同样的字形后再避让；不要只用 CSS 或文字描边加粗公式，否则上下标位置与测量可能不匹配。

区域标记需要避开内部辅助线时，传入 `avoidSegments:[[起点,终点],…]`。标签同时满足区域边界与线段留白；放不下时省略图内标记并保留独立读数，不能移到所属区域之外。

## 按条件逐步画图

支持此功能的模块提供 `getConstructionSteps()`、`getConstructionStep()`、`setConstructionStep(index)`。步骤数组为 `{title,body}`，`body` 用 HTML 与 `M.inline` 说明“题设或等价关系 → 这步画出的对象”。序号从 0 开始，`null` 表示原来的完整交互图。步骤必须真正控制几何对象、对应标签及相关视图的出现；未出现的空间面不能参与遮挡。

步骤只改变显示状态，继续使用原数学模型和当前合法参数。分问或函数类型改变时，从当前新题设的第 0 步重画，并向 `host` 发送 `constructionchange` 事件；完整模式下保持 `null`。三维场景缓存键需要包含步骤。默认完整图保持原交互；公共外壳负责上一步、下一步、重画、返回完整图，并暂收起答案与证明。返回完整图时恢复教师原来的证明显示状态。

首项为不动点、垂距为零、斜率不存在等情况须在相应步骤如实说明；不能为了看清绘制过程移动数学对象。最后的画图步骤应接到所求量，不能只剩一段与画面无关的文字。`tests/construction.cjs` 检查实际对象随步骤出现/撤回、状态保持和模式切换；仍需实际查看每题步骤图。

## 空间图

`Space.create(svg,{center,span,view})` 创建正交三维观察器。`setScene({points,edges,faces,annotations})` 接收真实三维坐标；各对象使用稳定 `id`，更新时复用 SVG 节点与网格。`setView`、`resetView` 只改变相机。题目卸载时必须调用 `destroy()`，清除事件、待绘制帧并释放三维资源。

空间面参与深度排序与射线遮挡，线段在投影边界和面穿越处切分后判断前后。需要始终可见的教学辅助线应显式设 `occlude:false`，不要伪造点的位置来躲避遮挡。底面积等区域标签在侧面投影过窄时可以隐藏，题目读数保持完整。

旋转采用 `requestAnimationFrame` 合并绘制；不要在每个旋转事件中重排证明或重建 KaTeX。`getState()` 只返回稳定状态；帧耗时等诊断数据通过 `getDiagnostics()` 读取，避免污染数学状态比较。

修改后运行 `npm run build` 和 `npm test`，同时提交源码与生成的 HTML。
