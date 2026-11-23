import type { Workflow } from './types'

/* 分组聚合：groupby 四件套（表格画布）、透视表（3D 场景画布） */

export const pdGroupWorkflow: Workflow = {
  id: 'pd-group',
  name: 'groupby 四件套',
  en: 'GROUP BY',
  subtitle: '拆开、算完、再拼回去',
  category: 'group',
  description:
    '分组聚合的所有操作都可以拆成三步：按某个字段把表切成若干块（Split），对每块做计算（Apply），把结果拼回一张表（Combine）。这一章讲清 agg / transform / filter / apply 分别在哪个环节动手，以及为什么能用 agg 就别用 apply。',
  canvasKind: 'table',
  stages: [
    { key: 'split', zh: '拆分', en: 'SPLIT' },
    { key: 'apply', zh: '应用', en: 'APPLY' },
    { key: 'combine', zh: '合并', en: 'COMBINE' },
  ],
  imports: 'import pandas as pd',
  attrs: [
    { label: '阶段', value: '从明细到汇总' },
    { label: '核心方法', value: 'agg · transform · filter · apply' },
    { label: '输入', value: '明细表' },
    { label: '输出', value: '每组一行 / 与原表等长' },
    { label: '检查点', value: '组数与组容量' },
    { label: '参考', value: 'pandas.pydata.org/docs/user_guide/groupby' },
  ],
  steps: [
    {
      title: 'SAC：先看它拆成了几块',
      en: 'SPLIT',
      subtitle: 'groupby 对象本身不算，调方法才算',
      stage: 'split',
      body: [
        '`data.groupby("company")` 只是记下「按 company 分组」这件事，它不会立刻计算任何东西。真正的计算发生在 `.size()`、`.mean()`、`.agg()` 被调用的时候。',
        '`size()` 是每组的行数，`ngroups` 是组的个数。分组后每个组就是一个子 DataFrame，后面所有操作都是在这个子表上做的。',
      ],
      code: `import pandas as pd

data = pd.DataFrame({"company": ["C", "C", "C", "A", "B", "B", "A", "C", "B"],
                     "salary": [43, 17, 8, 20, 10, 21, 23, 49, 8],
                     "age": [35, 25, 30, 22, 17, 40, 33, 19, 30]})
g = data.groupby("company")
print(type(g).__name__)
print(g.size().to_dict())
print(g.ngroups)`,
      output: { kind: 'text', lines: ['DataFrameGroupBy', "{'A': 2, 'B': 3, 'C': 4}", '3'] },
      table: {
        name: 'data',
        shape: [9, 3],
        indexName: '',
        columns: [
          { label: 'company', tone: 'key' },
          { label: 'salary', align: 'right', tone: 'num' },
          { label: 'age', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'C' }, { v: 43 }, { v: 35 }],
          [{ v: 'C' }, { v: 17 }, { v: 25 }],
          [{ v: 'C' }, { v: 8 }, { v: 30 }],
          [{ v: 'A' }, { v: 20 }, { v: 22 }],
          [{ v: 'B' }, { v: 10 }, { v: 17 }],
          [{ v: 'B' }, { v: 21 }, { v: 40 }],
          [{ v: 'A' }, { v: 23 }, { v: 33 }],
          [{ v: 'C' }, { v: 49 }, { v: 19 }],
          [{ v: 'B' }, { v: 8 }, { v: 30 }],
        ],
        hlCols: [0],
        op: 'groupby("company")',
        caption: '9 行明细按 company 切成 3 块：A 两块、B 三块、C 四块',
        footnote: 'sizes: A 2 · B 3 · C 4 · 共 3 组',
      },
    },
    {
      title: 'agg：每组塌缩成一行',
      en: 'AGG',
      subtitle: '一列多函数，或字典指定多列多函数',
      stage: 'apply',
      body: [
        '`agg(["mean", "max", "min"])` 一次算多个统计量，结果会自动变成多级列。传字典就能给不同列指定不同函数：`{"salary": ["mean"], "age": "mean"}`。',
        '结果的行数等于组数，这是 agg 的本质：每组只剩一行。如果你需要的行数和原表一样，那就不该用 agg。',
      ],
      code: `import pandas as pd

data = pd.DataFrame({"company": ["C", "C", "C", "A", "B", "B", "A", "C", "B"],
                     "salary": [43, 17, 8, 20, 10, 21, 23, 49, 8],
                     "age": [35, 25, 30, 22, 17, 40, 33, 19, 30]})
g = data.groupby("company")
print(g["salary"].agg(["mean", "max", "min"]).round(2).to_dict())
print(g.agg({"salary": "mean", "age": "max"}).round(2).to_dict())`,
      output: {
        kind: 'text',
        lines: [
          "{'mean': {'A': 21.5, 'B': 13.0, 'C': 29.25}, 'max': {'A': 23, 'B': 21, 'C': 49}, 'min': {'A': 20, 'B': 8, 'C': 8}}",
          "{'salary': {'A': 21.5, 'B': 13.0, 'C': 29.25}, 'age': {'A': 33, 'B': 40, 'C': 35}}",
        ],
      },
      table: {
        name: 'g.agg({...})',
        shape: [3, 3],
        indexName: 'company',
        index: ['A', 'B', 'C'],
        columns: [
          { label: 'salary_mean', align: 'right', tone: 'num' },
          { label: 'salary_max', align: 'right', tone: 'num' },
          { label: 'salary_min', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 21.5 }, { v: 23 }, { v: 20 }],
          [{ v: 13.0 }, { v: 21 }, { v: 8 }],
          [{ v: 29.25 }, { v: 49 }, { v: 8 }],
        ],
        hlCols: [0],
        op: 'agg',
        caption: '9 行明细 → 3 行汇总，每个公司一行',
        footnote: 'age 那一列的 max 另算：A 33 · B 40 · C 35',
      },
    },
    {
      title: '命名聚合：一行写清列名',
      en: 'NAMED AGG',
      subtitle: '现代写法，不再有多级列头',
      stage: 'apply',
      body: [
        '传统 `agg+字典` 出来的是多级列（salary/mean），取用时得写 `df[("salary","mean")]`，很难受。命名聚合直接规定输出列名：`avg_salary=("salary","mean")`。',
        '这是现在推荐的写法：可读、列名可控、还能和普通字符串函数混用。写报表时基本都用它。',
      ],
      code: `import pandas as pd

data = pd.DataFrame({"company": ["C", "C", "C", "A", "B", "B", "A", "C", "B"],
                     "salary": [43, 17, 8, 20, 10, 21, 23, 49, 8],
                     "age": [35, 25, 30, 22, 17, 40, 33, 19, 30]})
out = data.groupby("company").agg(
    avg_salary=("salary", "mean"),
    top_age=("age", "max"),
)
print(out.round(2).to_dict())`,
      output: {
        kind: 'text',
        lines: ["{'avg_salary': {'A': 21.5, 'B': 13.0, 'C': 29.25}, 'top_age': {'A': 33, 'B': 40, 'C': 35}}"],
      },
      table: {
        name: 'out',
        shape: [3, 2],
        indexName: 'company',
        index: ['A', 'B', 'C'],
        columns: [
          { label: 'avg_salary', align: 'right', tone: 'num' },
          { label: 'top_age', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 21.5 }, { v: 33 }],
          [{ v: 13.0 }, { v: 40 }],
          [{ v: 29.25 }, { v: 35 }],
        ],
        hlCols: [0, 1],
        op: 'agg(**named)',
        caption: '列名直接是 avg_salary / top_age，不再有二级列头',
        footnote: 'groupby(...).agg(新列名=("原列","函数"))',
      },
    },
    {
      title: 'transform：把统计量贴回原表',
      en: 'TRANSFORM',
      subtitle: '结果与原表等长，所以能直接变成新列',
      stage: 'combine',
      body: [
        '想加一列「本公司的平均薪水」，用 agg 得先算出 3 行再 map 回去，很绕。`transform("mean")` 直接把每组的均值复制到该组每一行，长度与原表一致，可以直接赋值成新列。',
        '这是 agg 与 transform 最本质的区别：agg 每组一行，transform 每行一行。判断标准就是「我要不要跟原表对齐」。',
      ],
      code: `import pandas as pd

data = pd.DataFrame({"company": ["C", "C", "C", "A", "B", "B", "A", "C", "B"],
                     "salary": [43, 17, 8, 20, 10, 21, 23, 49, 8]})
data["avg_salary"] = data.groupby("company")["salary"].transform("mean")
print(data["avg_salary"].round(2).tolist())
print(data.groupby("company")["salary"].transform(lambda x: x.max() - x.min()).tolist())`,
      output: {
        kind: 'text',
        lines: [
          '[29.25, 29.25, 29.25, 21.5, 13.0, 13.0, 21.5, 29.25, 13.0]',
          '[41, 41, 41, 3, 13, 13, 3, 41, 13]',
        ],
      },
      table: {
        name: 'data',
        shape: [9, 3],
        indexName: '',
        columns: [
          { label: 'company', tone: 'key' },
          { label: 'salary', align: 'right', tone: 'num' },
          { label: 'avg_salary', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'C' }, { v: 43 }, { v: 29.25, tone: 'new' }],
          [{ v: 'C' }, { v: 17 }, { v: 29.25, tone: 'new' }],
          [{ v: 'C' }, { v: 8 }, { v: 29.25, tone: 'new' }],
          [{ v: 'A' }, { v: 20 }, { v: 21.5, tone: 'new' }],
          [{ v: 'B' }, { v: 10 }, { v: 13.0, tone: 'new' }],
          [{ v: 'B' }, { v: 21 }, { v: 13.0, tone: 'new' }],
          [{ v: 'A' }, { v: 23 }, { v: 21.5, tone: 'new' }],
          [{ v: 'C' }, { v: 49 }, { v: 29.25, tone: 'new' }],
          [{ v: 'B' }, { v: 8 }, { v: 13.0, tone: 'new' }],
        ],
        hlCols: [2],
        op: 'transform',
        caption: '9 行仍然是 9 行，同一公司的人拿到同一个均值',
        footnote: '极差那行同理：每组一个数，复制到组内每一行',
      },
    },
    {
      title: 'filter 与 apply',
      en: 'FILTER & APPLY',
      subtitle: '筛组看整组表现，apply 处理任意子表',
      stage: 'combine',
      body: [
        '`filter` 返回的是**整组**：函数对一个组的子表返回 True/False，决定这个组留不留下。注意它筛的是组，不是行——这是和布尔筛选最容易混的地方。',
        '`apply` 最灵活，也最慢：它把每个子表交给你的函数，返回什么由你决定。能 agg 或 transform 解决的就别用 apply，因为 apply 是逐组跑 Python 代码。',
      ],
      code: `import pandas as pd

data = pd.DataFrame({"company": ["C", "C", "C", "A", "B", "B", "A", "C", "B"],
                     "salary": [43, 17, 8, 20, 10, 21, 23, 49, 8],
                     "age": [35, 25, 30, 22, 17, 40, 33, 19, 30]})
print(data.groupby("company").filter(lambda x: len(x) > 2).shape)

big = data.groupby("company", group_keys=False).apply(
    lambda x: x.nlargest(1, "age"), include_groups=False)
print(big.shape, big["age"].tolist())`,
      output: { kind: 'text', lines: ['(7, 3)', '(3, 2) [33, 40, 35]'] },
      table: {
        name: 'filter(len > 2)',
        shape: [7, 3],
        indexName: '',
        columns: [
          { label: 'company', tone: 'key' },
          { label: 'salary', align: 'right', tone: 'num' },
          { label: 'age', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'C' }, { v: 43 }, { v: 35 }],
          [{ v: 'C' }, { v: 17 }, { v: 25 }],
          [{ v: 'C' }, { v: 8 }, { v: 30 }],
          [{ v: 'B' }, { v: 10 }, { v: 17 }],
          [{ v: 'B' }, { v: 21 }, { v: 40 }],
          [{ v: 'C' }, { v: 49 }, { v: 19 }],
          [{ v: 'B' }, { v: 8 }, { v: 30 }],
        ],
        hlRows: [0, 1, 2, 6],
        op: 'filter',
        caption: 'A 只有 2 行被整组剔除；B、C 的每一行都保留',
        footnote: 'apply(nlargest) 每组取年龄最大的一行 → 3 行 · 年龄 33/40/35',
      },
      tip: '`include_groups=False` 是新版要求：不让分组键重复出现在子表里，否则会报错或产生重复列。',
    },
  ],
}

export const pdPivotWorkflow: Workflow = {
  id: 'pd-pivot',
  name: '透视表',
  en: 'PIVOT TABLE',
  subtitle: '把长表摊成矩阵：行、列、值各就各位',
  category: 'group',
  description:
    '透视表是 groupby 的二维版本：index 决定行、columns 决定列、values 决定格子里填什么。它把「两两组合的汇总」摊成一张矩阵，是报表里最常见的最终形态。',
  canvasKind: 'scene',
  stages: [
    { key: 'pivot', zh: '透视', en: 'PIVOT' },
    { key: 'total', zh: '合计', en: 'TOTAL' },
    { key: 'slice', zh: '筛选', en: 'SLICE' },
  ],
  imports: 'import pandas as pd',
  attrs: [
    { label: '阶段', value: '从长表到矩阵' },
    { label: '核心函数', value: 'pivot_table' },
    { label: '三要素', value: 'index · columns · values' },
    { label: '输出', value: '二维汇总矩阵' },
    { label: '检查点', value: '空格是 0 还是没有' },
    { label: '参考', value: 'pandas.pydata.org/docs/reference/api/pandas.pivot_table' },
  ],
  steps: [
    {
      title: '三要素：行、列、值',
      en: 'PIVOT',
      subtitle: 'index 是行标签，columns 是列标签',
      stage: 'pivot',
      body: [
        '`pd.pivot_table(data, values="销售额", index="省", columns="类别", aggfunc="sum")`：省决定行，类别决定列，格子填销售额的和。',
        '如果某个「省 × 类别」组合在原始数据里根本不存在，格子会是 NaN 而不是 0。这个区别很重要：NaN 是「没有这个组合」，0 是「有但值等于 0」。',
        '也正因为有 NaN 占位，整张表的数值类型会被提升成浮点数——所以等一下打印出来是 `100.0` 而不是 `100`。这跟你的原始数据是整数没有关系。',
      ],
      code: `import pandas as pd

s = pd.DataFrame({"省": ["江苏", "江苏", "浙江", "浙江", "江苏"],
                  "类别": ["办公", "家具", "办公", "家具", "数码"],
                  "销售额": [100, 200, 300, 400, 50]})
pt = pd.pivot_table(s, values="销售额", index="省",
                    columns="类别", aggfunc="sum")
print(pt.shape)
print(pt.loc["江苏"].to_dict())`,
      output: {
        kind: 'text',
        lines: ['(2, 3)', "{'办公': 100.0, '家具': 200.0, '数码': 50.0}"],
      },
      scene: {
        kind: 'pivot',
        rows: ['江苏', '浙江'],
        cols: ['办公', '家具', '数码'],
        values: [
          [100, 200, 50],
          [300, 400, 0],
        ],
        caption: '行 = 省，列 = 类别，柱高 = 销售额；浙江没有数码记录，格子是 NaN',
      },
    },
    {
      title: 'margins：加一行一列合计',
      en: 'MARGINS',
      subtitle: '行列小计一次算完',
      stage: 'total',
      canvas: 'table',
      body: [
        '`margins=True` 会在最后多出一行和一列合计，名字由 `margins_name` 决定。不用再单独 groupby 一次求和。',
        '注意合计是「重新汇总」而不是「把格子加起来」——如果 aggfunc 是 mean，合计行给的是整体均值，不是各格均值的平均。',
      ],
      code: `import pandas as pd

s = pd.DataFrame({"省": ["江苏", "江苏", "浙江", "浙江", "江苏"],
                  "类别": ["办公", "家具", "办公", "家具", "数码"],
                  "销售额": [100, 200, 300, 400, 50]})
pt = pd.pivot_table(s, values="销售额", index="省", columns="类别",
                    aggfunc="sum", margins=True, margins_name="合计")
print(pt.shape)
print(pt.loc["合计"].to_dict())`,
      output: {
        kind: 'text',
        lines: ['(3, 4)', "{'办公': 400.0, '家具': 600.0, '数码': 50.0, '合计': 1050.0}"],
      },
      table: {
        name: 'pt',
        shape: [3, 4],
        indexName: '省',
        index: ['江苏', '浙江', '合计'],
        columns: [
          { label: '办公', align: 'right', tone: 'num' },
          { label: '家具', align: 'right', tone: 'num' },
          { label: '数码', align: 'right', tone: 'num' },
          { label: '合计', align: 'right', tone: 'key' },
        ],
        rows: [
          [{ v: 100 }, { v: 200 }, { v: 50 }, { v: 350 }],
          [{ v: 300 }, { v: 400 }, { v: null, tone: 'na' }, { v: 700 }],
          [
            { v: 400, tone: 'key' },
            { v: 600, tone: 'key' },
            { v: 50, tone: 'key' },
            { v: 1050, tone: 'key' },
          ],
        ],
        hlRows: [2],
        hlCols: [3],
        op: 'pivot_table(margins=True, margins_name="合计")',
        delta: '+1 行 · +1 列',
        caption: '灰底那行与那列是重新汇总出来的合计，不是原有数据',
        footnote: '浙江 × 数码 = NaN：这个组合在明细里不存在',
      },
    },
    {
      title: 'xs：从矩阵里横切一刀',
      en: 'CROSS SECTION',
      subtitle: '多级列/行，用 xs 取某一层',
      stage: 'slice',
      body: [
        '透视表结果常常是多级索引，直接 `pt["办公"]` 也行，但层数一多就难读。`xs(key, axis=1)` 表示「在第 1 层（列）里切出 key 这一片」，`axis=0` 则是切行。',
        '切出来就是一维的 Series 或普通 DataFrame，可以接着排序、画图、导出。',
      ],
      code: `import pandas as pd

s = pd.DataFrame({"省": ["江苏", "江苏", "浙江", "浙江", "江苏"],
                  "类别": ["办公", "家具", "办公", "家具", "数码"],
                  "销售额": [100, 200, 300, 400, 50]})
pt = pd.pivot_table(s, values="销售额", index="省", columns="类别",
                    aggfunc="sum", margins=True, margins_name="合计")
print(pt.xs("合计", axis=0).to_dict())
print(pt.xs("办公", axis=1).to_dict())`,
      output: {
        kind: 'text',
        lines: [
          "{'办公': 400.0, '家具': 600.0, '数码': 50.0, '合计': 1050.0}",
          "{'江苏': 100.0, '浙江': 300.0, '合计': 400.0}",
        ],
      },
      scene: {
        kind: 'pivot',
        rows: ['江苏', '浙江', '合计'],
        cols: ['办公'],
        values: [[100], [300], [400]],
        caption: 'xs("办公", axis=1) 只留办公这一列，三行原样保留',
      },
      tip: '透视表的结果想变回平表：`.reset_index()`，多级列会自动摊平成列名。',
    },
  ],
}
