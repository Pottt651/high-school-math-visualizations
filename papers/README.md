# 接入另一份试卷

根目录的 `index.html` 是通用入口；`papers/catalog.json` 是登记表。题号在各自试卷内使用，两个试卷都可以有“第 17 题”，链接用 `papers/<id>/index.html#q17` 区分。

## 先完成题目与课件

先核对原卷，选择有必要互动的题目，使用 `math-problem-visualizer` 的方法设计和复核。不要复制旧题的条件、答案或参数范围。原卷 PDF 是否纳入仓库由具体授权决定，读取原卷不等于公开上传原卷。

两种接入方式：

- **复用现有模块接口**：在 `papers/<id>/src/` 写本试卷的 `q题号.js` 与 `guides.js`，需要独立公共模型时另写 `model.js`。模块接口见 [维护约定](../simple/CONTRACT.md)。公共外壳、KaTeX、二维和空间绘图可复用，具体交互由题目决定。
- **使用不同结构的独立课件**：先生成资源内嵌的 `papers/<id>/index.html`，再登记；省略下面的 `build` 字段。目录构建只核对目标存在，不覆盖这份课件。

## 登记元数据

在数组中新增一条记录，标识使用不重复的小写英文、数字和连字符。例如以下为字段说明，尚未对应真实试卷，不应直接当作已完成课件登记：

```json
{
  "id": "example-paper",
  "title": "试卷完整名称",
  "shortTitle": "题页中的短名称",
  "subtitle": "学年与考试阶段",
  "year": 2026,
  "source": "原题来源",
  "href": "papers/example-paper/index.html",
  "questions": [
    {"id": 17, "title": "题目名称", "topic": "空间几何", "page": 3}
  ],
  "build": {
    "moduleDir": "papers/example-paper/src",
    "model": "papers/example-paper/src/model.js"
  }
}
```

`model` 在没有公共模型时可以省略。`build.legacyOutputs` 只用于需要兼容的旧链接，新试卷通常无需设置。路径相对仓库根目录；构建拒绝重复题号、重复输出和越出项目的路径。目录展示的题目名称、页码与课件应一致。

运行 `npm run build` 和 `npm test`，再实际打开首页，进入新试卷，操作关键图形并返回目录。为新增数学模型和容易退化的交互补有意义的检查；现有嘉定专项测试不能替新试卷证明正确性。

新试卷记录自己的验证结果，通用经验有实际证据时才更新 Skill。发布与同步按当前任务的授权进行。
