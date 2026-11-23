import type { Workflow } from './types'

/* Pandas 数据框：Series/DataFrame 结构与选择、读入与体检（表格画布） */

export const pdFrameWorkflow: Workflow = {
  id: 'pd-frame',
  name: 'Series 与 DataFrame',
  en: 'DATAFRAME STRUCTURE',
  subtitle: '一张表 = 若干列 Series + 一套行列标签',
  category: 'core',
  description:
    'Pandas 的表格就是「带标签的二维数组」：列有列名、行有行号，每一列单独拿出来都是一个 Series。这一章建立这张表的心智模型，然后练最常用的四种取值方式：选列、选行、按标签取、按位置取。',
  canvasKind: 'table',
  stages: [
    { key: 'build', zh: '建表', en: 'BUILD' },
    { key: 'select', zh: '取值', en: 'SELECT' },
    { key: 'derive', zh: '变换', en: 'DERIVE' },
  ],
  imports: 'import pandas as pd',
  attrs: [
    { label: '阶段', value: '从字典到表格' },
    { label: '核心对象', value: 'Series · DataFrame' },
    { label: '输入', value: 'dict / list / ndarray' },
    { label: '输出', value: '带标签的二维表' },
    { label: '关键方法', value: 'loc · iloc · [] · assign' },
    { label: '参考', value: 'pandas.pydata.org/docs/user_guide' },
  ],
  steps: [
    {
      title: '从字典建一张表',
      en: 'BUILD FRAME',
      subtitle: '键是列名，值是整列数据',
      stage: 'build',
      body: [
        '最直观的建表方式就是给一个字典：每个键是一列的名字，每个值是一列的整列数据，长度必须一致。Pandas 会自动补上 0、1、2… 的行号。',
        '`shape` 返回 (行数, 列数)。注意这里和 NumPy 一致：先行列，后列数。',
      ],
      code: `import pandas as pd

df = pd.DataFrame({
    "城市": ["上海", "成都", "西安"],
    "人口": [2487, 2126, 1300],
    "销售额": [986420, 492360, 312400],
})
print(df.shape)
print(df.columns.tolist())
print(df["销售额"].tolist())`,
      output: { kind: 'text', lines: ['(3, 3)', "['城市', '人口', '销售额']", '[986420, 492360, 312400]'] },
      table: {
        name: 'df',
        shape: [3, 3],
        columns: [
          { label: '城市', tone: 'text' },
          { label: '人口', align: 'right', tone: 'num' },
          { label: '销售额', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: '上海' }, { v: 2487 }, { v: 986420 }],
          [{ v: '成都' }, { v: 2126 }, { v: 492360 }],
          [{ v: '西安' }, { v: 1300 }, { v: 312400 }],
        ],
        op: 'DataFrame()',
        caption: '三个列表 → 三列，行号自动生成 0/1/2',
        footnote: 'shape (3, 3) · 每列类型可以不同',
      },
    },
    {
      title: '一列就是一个 Series',
      en: 'COLUMN AS SERIES',
      subtitle: '取单列返回 Series，取多列返回 DataFrame',
      stage: 'build',
      body: [
        '`df["销售额"]` 拿到的是一个 Series：一维数据 + 一组行标签。它和 DataFrame 的关系就是「一列」与「整张表」的关系。',
        '记住这条差异：单方括号取单列得到 Series（一维），双方括号 `df[["销售额"]]` 得到 DataFrame（仍是二维）。后面很多报错都源于这里拿错了类型。',
      ],
      code: `import pandas as pd

df = pd.DataFrame({
    "城市": ["上海", "成都", "西安"],
    "人口": [2487, 2126, 1300],
    "销售额": [986420, 492360, 312400],
})
col = df["销售额"]
print(type(col).__name__)
print(col.tolist())
print(col.dtype)
print(type(df[["销售额"]]).__name__)`,
      output: { kind: 'text', lines: ['Series', '[986420, 492360, 312400]', 'int64', 'DataFrame'] },
      table: {
        name: 'df["销售额"]',
        shape: [3, 1],
        indexName: 'index',
        columns: [{ label: '销售额', align: 'right', tone: 'num' }],
        rows: [[{ v: 986420 }], [{ v: 492360 }], [{ v: 312400 }]],
        hlCols: [0],
        op: 'Series',
        caption: '单列拿出来是一维的 Series，行标签还在',
        footnote: 'df[["销售额"]] 才是 DataFrame · Series.dtype = int64',
      },
    },
    {
      title: '自定义行标签',
      en: 'INDEX & COLUMNS',
      subtitle: 'index 是行名，columns 是列名',
      stage: 'select',
      body: [
        '建表时传 `index` 就能替换掉默认的 0/1/2 行号，比如用城市代码当行标签。之后所有「按标签取」的操作都以它为准。',
        '`index` 和 `columns` 都是可读可写的属性：`df.index.name` 给索引起个名字，`df.columns = [...]` 整批改列名，比逐个 rename 快。',
      ],
      code: `import pandas as pd

df = pd.DataFrame(
    {"城市": ["上海", "成都", "西安", "南京"],
     "销售额": [986420, 492360, 312400, 214860]},
    index=["SH", "CD", "XA", "NJ"])
df.index.name = "代码"
print(df.index.tolist())
print(df.loc["CD", "城市"])
print(df.shape)`,
      output: { kind: 'text', lines: ["['SH', 'CD', 'XA', 'NJ']", '成都', '(4, 2)'] },
      table: {
        name: 'df',
        shape: [4, 2],
        indexName: '代码',
        index: ['SH', 'CD', 'XA', 'NJ'],
        columns: [
          { label: '城市', tone: 'text' },
          { label: '销售额', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: '上海' }, { v: 986420 }],
          [{ v: '成都' }, { v: 492360 }],
          [{ v: '西安' }, { v: 312400 }],
          [{ v: '南京' }, { v: 214860 }],
        ],
        op: 'set index',
        caption: '行标签换成了城市代码，不再是 0~3',
      },
    },
    {
      title: 'loc 与 iloc',
      en: 'LOC VS ILOC',
      subtitle: '一个按标签，一个按位置，别混用',
      stage: 'select',
      body: [
        '`loc` 只认标签：`df.loc[["CD", "XA"], "销售额"]`。`iloc` 只认位置：`df.iloc[1:3, 1]` 表示第 2~3 行、第 2 列。',
        '最容易踩的坑是 loc 的切片——`df.loc["SH":"CD"]` 是**含右端点**的（因为按标签），而 iloc 的切片和 Python 一样不含右端。',
      ],
      code: `import pandas as pd

df = pd.DataFrame(
    {"城市": ["上海", "成都", "西安", "南京"],
     "销售额": [986420, 492360, 312400, 214860]},
    index=["SH", "CD", "XA", "NJ"])
print(df.loc[["CD", "XA"], "销售额"].tolist())
print(df.iloc[1:3, 1].tolist())
print(df.loc["NJ", "城市"], int(df.loc["NJ", "销售额"]))`,
      output: {
        kind: 'text',
        lines: ['[492360, 312400]', '[492360, 312400]', '南京 214860'],
      },
      table: {
        name: 'df.loc[["CD", "XA"]]',
        shape: [2, 2],
        indexName: '代码',
        index: ['CD', 'XA'],
        columns: [
          { label: '城市', tone: 'text' },
          { label: '销售额', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: '成都' }, { v: 492360 }],
          [{ v: '西安' }, { v: 312400 }],
        ],
        hlRows: [0, 1],
        hlCols: [1],
        op: 'loc / iloc',
        caption: '两种写法选中同一块区域，只是索引语言不同',
        footnote: 'loc 切片含右端 · iloc 切片不含右端',
      },
    },
    {
      title: '布尔筛选与派生列',
      en: 'FILTER & ASSIGN',
      subtitle: '条件写进方括号，新列直接赋值',
      stage: 'derive',
      body: [
        '`df[df["销售额"] > 300000]` 是行筛选：方括号里放一个同长度的布尔 Series。`isin([...])` 适合多值匹配，`&`、`|` 组合条件时每个条件都要加括号。',
        '派生列不需要 apply：`df["万元"] = (df["销售额"] / 10000).round(1)` 直接整列算完。想不改原表就用 `df.assign(...)`，它返回新表。',
      ],
      code: `import pandas as pd

df = pd.DataFrame(
    {"城市": ["上海", "成都", "西安", "南京"],
     "销售额": [986420, 492360, 312400, 214860]},
    index=["SH", "CD", "XA", "NJ"])
big = df[df["销售额"] > 300000]
df["万元"] = (df["销售额"] / 10000).round(1)
print(big["城市"].tolist())
print(df["万元"].tolist())
print(df.loc[df["销售额"].isin([214860, 986420]), "城市"].tolist())`,
      output: {
        kind: 'text',
        lines: ["['上海', '成都', '西安']", '[98.6, 49.2, 31.2, 21.5]', "['上海', '南京']"],
      },
      table: {
        name: 'df',
        shape: [4, 3],
        indexName: '代码',
        index: ['SH', 'CD', 'XA', 'NJ'],
        columns: [
          { label: '城市', tone: 'text' },
          { label: '销售额', align: 'right', tone: 'num' },
          { label: '万元', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: '上海' }, { v: 986420 }, { v: 98.6, tone: 'new' }],
          [{ v: '成都' }, { v: 492360 }, { v: 49.2, tone: 'new' }],
          [{ v: '西安' }, { v: 312400 }, { v: 31.2, tone: 'new' }],
          [{ v: '南京' }, { v: 214860 }, { v: 21.5, tone: 'new' }],
        ],
        hlRows: [0, 1, 2],
        hlCols: [2],
        op: 'filter + assign',
        caption: '前三行命中「销售额 > 30 万」，右侧新增 万元 列',
        footnote: 'df.assign(万元=...) 会返回新表，不动原数据',
      },
    },
  ],
}

export const pdSelectWorkflow: Workflow = {
  id: 'pd-select',
  name: '读入、体检与排序',
  en: 'LOAD & PROFILE',
  subtitle: '先看清表长什么样，再谈分析',
  category: 'core',
  description:
    '真实工作的第一步不是 groupby，而是把文件读进来、确认类型对不对、看一眼分布、按需要排序。这一章用一张 5 行的订单表走完这套体检流程，每一步都在讲「先验证再分析」。',
  canvasKind: 'table',
  stages: [
    { key: 'load', zh: '读入', en: 'LOAD' },
    { key: 'profile', zh: '体检', en: 'PROFILE' },
    { key: 'sort', zh: '排序', en: 'SORT' },
  ],
  imports: 'import pandas as pd',
  attrs: [
    { label: '阶段', value: '从文件到可信数据' },
    { label: '核心方法', value: 'read_csv · info · describe' },
    { label: '输入', value: 'CSV / Excel / JSON' },
    { label: '输出', value: '类型正确的 DataFrame' },
    { label: '检查点', value: 'shape / dtypes / 缺失' },
    { label: '参考', value: 'pandas.pydata.org/docs/reference/io' },
  ],
  steps: [
    {
      title: 'read_csv 与 sep',
      en: 'READ CSV',
      subtitle: '分隔符对不上，表就读歪了',
      stage: 'load',
      body: [
        '`read_csv` 默认用逗号分隔、把第一行当表头。如果文件用的是竖线或分号，必须显式传 `sep`，否则整行会被当成一列。',
        '这里用 `io.StringIO` 模拟已经打开的文件对象，真实项目里换成文件路径即可，两者都是 `read_csv` 接受的输入。',
      ],
      code: `import io
import pandas as pd

CSV = """订单号,城市,类别,数量,单价,日期
A001,上海,办公,3,120.5,2024-01-05
A002,成都,家具,1,880.0,2024-01-07
A003,上海,办公,5,99.9,2024-02-11
A004,西安,数码,2,1599.0,2024-02-18
A005,成都,办公,4,88.0,2024-03-02
"""
df = pd.read_csv(io.StringIO(CSV))
print(df.shape)
print(df.columns.tolist())`,
      output: {
        kind: 'text',
        lines: ['(5, 6)', "['订单号', '城市', '类别', '数量', '单价', '日期']"],
      },
      table: {
        name: 'df',
        shape: [5, 6],
        columns: [
          { label: '订单号', tone: 'key' },
          { label: '城市', tone: 'text' },
          { label: '类别', tone: 'text' },
          { label: '数量', align: 'right', tone: 'num' },
          { label: '单价', align: 'right', tone: 'num' },
          { label: '日期', tone: 'date' },
        ],
        rows: [
          [{ v: 'A001' }, { v: '上海' }, { v: '办公' }, { v: 3 }, { v: 120.5 }, { v: '2024-01-05' }],
          [{ v: 'A002' }, { v: '成都' }, { v: '家具' }, { v: 1 }, { v: 880.0 }, { v: '2024-01-07' }],
          [{ v: 'A003' }, { v: '上海' }, { v: '办公' }, { v: 5 }, { v: 99.9 }, { v: '2024-02-11' }],
          [{ v: 'A004' }, { v: '西安' }, { v: '数码' }, { v: 2 }, { v: 1599.0 }, { v: '2024-02-18' }],
          [{ v: 'A005' }, { v: '成都' }, { v: '办公' }, { v: 4 }, { v: 88.0 }, { v: '2024-03-02' }],
        ],
        op: 'read_csv',
        caption: '6 列 5 行，第一行被识别成列名',
        footnote: '真实项目：pd.read_csv("orders.csv", sep=",")',
      },
      tip: '打开文件看到的是乱码或只有一列时，先检查编码（encoding="gbk"）和分隔符，八成是这两个。',
    },
    {
      title: '先定类型，再谈分析',
      en: 'DTYPES',
      subtitle: 'str / int64 / float64 / datetime64',
      stage: 'load',
      body: [
        '读进来第一件要确认的事是 `dtypes`。日期列如果不传 `parse_dates`，会被读成字符串，后面做时间筛选、按月分组全都做不了。',
        '`dtype` 参数可以在读入时就固定类型，比读进来再 astype 更省内存也更安全。金额、编号这类「看起来是数字」的列，尤其要确认一下。',
      ],
      code: `import io
import pandas as pd

CSV = """订单号,城市,类别,数量,单价,日期
A001,上海,办公,3,120.5,2024-01-05
A002,成都,家具,1,880.0,2024-01-07
"""
df = pd.read_csv(io.StringIO(CSV), parse_dates=["日期"])
print(df["日期"].dtype)
print(df.dtypes.astype(str).tolist())`,
      output: {
        kind: 'text',
        lines: ['datetime64[us]', "['str', 'str', 'str', 'int64', 'float64', 'datetime64[us]']"],
      },
      table: {
        name: 'df.dtypes',
        shape: [6, 2],
        indexName: 'column',
        index: ['订单号', '城市', '类别', '数量', '单价', '日期'],
        columns: [
          { label: '列名', tone: 'key' },
          { label: '类型', align: 'right', tone: 'text' },
        ],
        rows: [
          [{ v: '订单号' }, { v: 'str' }],
          [{ v: '城市' }, { v: 'str' }],
          [{ v: '类别' }, { v: 'str' }],
          [{ v: '数量' }, { v: 'int64' }],
          [{ v: '单价' }, { v: 'float64' }],
          [{ v: '日期', tone: 'hit' }, { v: 'datetime64[us]', tone: 'hit' }],
        ],
        hlRows: [5],
        op: 'parse_dates',
        caption: '日期列被解析成 datetime64，才能做时间运算',
        footnote: 'pandas 3 的字符串列统一显示为 str（旧版是 object）',
      },
    },
    {
      title: '体检三件套',
      en: 'PROFILE',
      subtitle: 'info 看结构，describe 看分布，value_counts 看频次',
      stage: 'profile',
      body: [
        '`info()` 一行看全：有哪些列、每列多少非空值、什么类型。`describe()` 默认对数值列给出计数、均值、标准差和四分位。',
        '`value_counts()` 是分类列的频次表，比 `groupby().size()` 更顺手，默认按次数降序。`nunique()` 只回答「有几个不同的值」。',
      ],
      code: `import io
import pandas as pd

CSV = """订单号,城市,类别,数量,单价,日期
A001,上海,办公,3,120.5,2024-01-05
A002,成都,家具,1,880.0,2024-01-07
A003,上海,办公,5,99.9,2024-02-11
A004,西安,数码,2,1599.0,2024-02-18
A005,成都,办公,4,88.0,2024-03-02
"""
df = pd.read_csv(io.StringIO(CSV))
print(df["数量"].describe().round(2).tolist())
print(df["类别"].value_counts().to_dict())
print(df["城市"].nunique())`,
      output: {
        kind: 'text',
        lines: [
          '[5.0, 3.0, 1.58, 1.0, 2.0, 3.0, 4.0, 5.0]',
          "{'办公': 3, '家具': 1, '数码': 1}",
          '3',
        ],
      },
      table: {
        name: 'df["类别"].value_counts()',
        shape: [3, 2],
        indexName: '',
        columns: [
          { label: '类别', tone: 'key' },
          { label: 'count', align: 'right', tone: 'num' },
        ],
        rows: [[{ v: '办公' }, { v: 3 }], [{ v: '家具' }, { v: 1 }], [{ v: '数码' }, { v: 1 }]],
        hlRows: [0],
        op: 'value_counts',
        caption: '办公用品出现 3 次，家具与数码各 1 次',
        footnote: 'describe(): count 5 · mean 3.0 · std 1.58 · min 1 · max 5',
      },
    },
    {
      title: '排序',
      en: 'SORT',
      subtitle: '单键、多键，以及别忘了 reset_index',
      stage: 'sort',
      body: [
        '`sort_values(by=..., ascending=False)` 是最常用的降序榜。传列表就是多键排序：先按第一个键分块，块内再按第二个键。',
        '排序不会重置行号，所以结果的行标签是乱的。要连续就接 `.reset_index(drop=True)`，否则后面按位置取值容易看错。',
      ],
      code: `import io
import pandas as pd

CSV = """订单号,城市,类别,数量,单价,日期
A001,上海,办公,3,120.5,2024-01-05
A002,成都,家具,1,880.0,2024-01-07
A003,上海,办公,5,99.9,2024-02-11
A004,西安,数码,2,1599.0,2024-02-18
A005,成都,办公,4,88.0,2024-03-02
"""
df = pd.read_csv(io.StringIO(CSV))
print(df.sort_values("单价", ascending=False)["订单号"].head(3).tolist())
print(df.sort_values(["城市", "数量"])["订单号"].tolist())`,
      output: {
        kind: 'text',
        lines: ["['A004', 'A002', 'A001']", "['A001', 'A003', 'A002', 'A005', 'A004']"],
      },
      table: {
        name: 'df.sort_values("单价", ascending=False)',
        shape: [5, 3],
        indexName: '',
        index: ['3', '1', '0', '2', '4'],
        columns: [
          { label: '订单号', tone: 'key' },
          { label: '城市', tone: 'text' },
          { label: '单价', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'A004' }, { v: '西安' }, { v: 1599.0 }],
          [{ v: 'A002' }, { v: '成都' }, { v: 880.0 }],
          [{ v: 'A001' }, { v: '上海' }, { v: 120.5 }],
          [{ v: 'A003' }, { v: '上海' }, { v: 99.9 }],
          [{ v: 'A005' }, { v: '成都' }, { v: 88.0 }],
        ],
        hlCols: [2],
        op: 'sort_values',
        caption: '按单价降序，行标签仍是原来的 3/1/0/2/4',
        footnote: '想按位置重新编号：sort_values(...).reset_index(drop=True)',
      },
    },
  ],
}
