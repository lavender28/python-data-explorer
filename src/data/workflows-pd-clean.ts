import type { Workflow } from './types'

/* 数据预处理：拼接与连接、缺失与重复（表格画布） */

export const pdMergeWorkflow: Workflow = {
  id: 'pd-merge',
  name: '拼接与连接',
  en: 'CONCAT & MERGE',
  subtitle: '行对齐还是键对齐，决定了结果的行数',
  category: 'clean',
  description:
    '把两张表拼在一起有两种完全不同的思路：concat 按位置/索引对齐，merge 按键对齐。前者像把两摞纸叠起来，后者像 SQL 的 join。这一章把四种连接方式、一对多膨胀和连接质量校验走一遍。',
  canvasKind: 'table',
  stages: [
    { key: 'stack', zh: '拼接', en: 'CONCAT' },
    { key: 'join', zh: '连接', en: 'MERGE' },
    { key: 'check', zh: '校验', en: 'CHECK' },
  ],
  imports: 'import pandas as pd',
  attrs: [
    { label: '阶段', value: '从多张表到一张表' },
    { label: '核心方法', value: 'concat · merge · join' },
    { label: '输入', value: '两个及以上 DataFrame' },
    { label: '输出', value: '宽表 / 长表' },
    { label: '检查点', value: '行数是否膨胀' },
    { label: '参考', value: 'pandas.pydata.org/docs/user_guide/merging' },
  ],
  steps: [
    {
      title: 'concat：按位置叠起来',
      en: 'CONCAT',
      subtitle: '默认纵向、外连接，缺的列补 NaN',
      stage: 'stack',
      body: [
        '`pd.concat([df1, df2])` 把两张表上下叠起来，列名对不上的位置补 NaN。想要横向拼就用 `axis=1`，按行索引对齐。',
        '`join="inner"` 只保留两边都有的列，相当于在列方向上求交集。数据来源不统一时，这一个参数能省掉很多手工对列名的工作。',
      ],
      code: `import pandas as pd

df1 = pd.DataFrame({"A": ["A0", "A1"], "B": ["B0", "B1"]})
df2 = pd.DataFrame({"A": ["A2", "A3"], "B": ["B2", "B3"]})
df3 = pd.DataFrame({"A": ["A1", "A3"], "D": ["D1", "D3"]})
print(pd.concat([df1, df2]).shape)
print(pd.concat([df1, df3]).columns.tolist())
print(pd.concat([df1, df3], join="inner").shape)`,
      output: { kind: 'text', lines: ['(4, 2)', "['A', 'B', 'D']", '(4, 1)'] },
      table: {
        name: 'pd.concat([df1, df3])',
        shape: [4, 3],
        indexName: '',
        index: ['0', '1', '0', '1'],
        columns: [
          { label: 'A', tone: 'key' },
          { label: 'B', tone: 'text' },
          { label: 'D', tone: 'text' },
        ],
        rows: [
          [{ v: 'A0' }, { v: 'B0' }, { v: null, tone: 'na' }],
          [{ v: 'A1' }, { v: 'B1' }, { v: null, tone: 'na' }],
          [{ v: 'A1' }, { v: null, tone: 'na' }, { v: 'D1' }],
          [{ v: 'A3' }, { v: null, tone: 'na' }, { v: 'D3' }],
        ],
        hlCols: [1, 2],
        op: 'concat axis=0',
        caption: '纵向叠起来，对方没有的列就是 NaN',
        footnote: 'join="inner" 只留共有列 → (4, 1)；行索引重复了，注意重置',
      },
    },
    {
      title: 'merge：按键连接',
      en: 'MERGE INNER',
      subtitle: '默认内连接，只留键的交集',
      stage: 'join',
      body: [
        '`pd.merge(left, right, on="userid")` 只保留两边键都存在的行。上面的例子里 df_1 的 d 在 df_2 里没有消费记录，所以结果里没有 d。',
        '这是 SQL join 的 Python 版本：`on` 指定键，键名不同时用 `left_on` / `right_on`。连接后的行数不由左表决定，而是由「匹配上的组合数」决定。',
      ],
      code: `import pandas as pd

u = pd.DataFrame({"userid": ["a", "b", "c", "d"], "age": [23, 46, 32, 19]})
o = pd.DataFrame({"userid": ["a", "c", "a", "b"], "pay": [2000, 3500, 500, 1000]})
m = pd.merge(u, o, on="userid")
print(m.shape)
print(m["userid"].tolist())`,
      output: { kind: 'text', lines: ['(4, 3)', "['a', 'a', 'b', 'c']"] },
      table: {
        name: 'pd.merge(u, o, on="userid")',
        shape: [4, 3],
        indexName: '',
        columns: [
          { label: 'userid', tone: 'key' },
          { label: 'age', align: 'right', tone: 'num' },
          { label: 'pay', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'a' }, { v: 23 }, { v: 2000 }],
          [{ v: 'a' }, { v: 23 }, { v: 500 }],
          [{ v: 'b' }, { v: 46 }, { v: 1000 }],
          [{ v: 'c' }, { v: 32 }, { v: 3500 }],
        ],
        hlRows: [0, 1],
        op: 'how="inner"',
        caption: 'a 有两条消费记录，基础信息就被复制成两行',
        footnote: 'd 没有匹配上，直接消失；4 行不是左右表的行数，而是匹配组合数',
      },
      tip: '连接前先看键是否唯一：`df["userid"].is_unique`。不唯一就一定会膨胀，这是「连完行数翻倍」的头号原因。',
    },
    {
      title: 'left / right / outer',
      en: 'JOIN TYPES',
      subtitle: '谁做基准，谁就一行不少',
      stage: 'join',
      body: [
        '`how="left"` 以左表为基准：左表每一行都保留，右表没匹配上的补 NaN。`right` 反过来。`outer` 取并集，两边独有的都留下。',
        '选哪种连接不取决于语法，取决于业务问题：要「所有用户 + 他们的消费」就用 left，要「所有发生过消费的用户」才用 inner。',
      ],
      code: `import pandas as pd

u = pd.DataFrame({"userid": ["a", "b", "c", "d"], "age": [23, 46, 32, 19]})
o2 = pd.DataFrame({"userid": ["a", "c", "e"], "pay": [2000, 3500, 600]})
left = pd.merge(u, o2, how="left", on="userid")
outer = pd.merge(u, o2, how="outer", on="userid")
print(left.shape, left["pay"].isna().sum())
print(outer.shape, outer["pay"].isna().sum())`,
      output: { kind: 'text', lines: ['(4, 3) 2', '(5, 3) 2'] },
      table: {
        name: 'pd.merge(u, o2, how="outer")',
        shape: [5, 3],
        indexName: '',
        columns: [
          { label: 'userid', tone: 'key' },
          { label: 'age', align: 'right', tone: 'num' },
          { label: 'pay', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'a' }, { v: 23 }, { v: 2000 }],
          [{ v: 'b' }, { v: 46 }, { v: null, tone: 'na' }],
          [{ v: 'c' }, { v: 32 }, { v: 3500 }],
          [{ v: 'd' }, { v: 19 }, { v: null, tone: 'na' }],
          [{ v: 'e', tone: 'new' }, { v: null, tone: 'na' }, { v: 600 }],
        ],
        hlRows: [4],
        op: 'how="outer"',
        caption: '并集：b、d 没有消费记录，e 不在用户表里',
        footnote: 'left 只有 4 行（左表基准）· outer 多出 e 这一行',
      },
    },
    {
      title: '连接质量：validate 与 indicator',
      en: 'VALIDATE',
      subtitle: '让 Pandas 帮你拦住意外的膨胀',
      stage: 'check',
      body: [
        '`validate="1:1"` 声明「键在两边都唯一」，一旦不满足直接抛错，而不是默默给你一张翻倍的表。常用取值还有 `1:m`、`m:1`、`m:m`。',
        '`indicator=True` 会多出一列 `_merge`，标出每行来自左边、右边还是两边都有。做数据核对时，这一列就是现成的来源报告。',
      ],
      code: `import pandas as pd

u = pd.DataFrame({"userid": ["a", "b", "c", "d"], "age": [23, 46, 32, 19]})
o = pd.DataFrame({"userid": ["a", "c", "a", "b"], "pay": [2000, 3500, 500, 1000]})
o2 = pd.DataFrame({"userid": ["a", "c", "e"], "pay": [2000, 3500, 600]})

mm = pd.merge(u, o2, how="outer", on="userid", indicator=True)
print(mm["_merge"].value_counts().to_dict())

try:
    pd.merge(u, o, how="outer", on="userid", validate="1:1")
except Exception as e:
    print(type(e).__name__)`,
      output: { kind: 'text', lines: ["{'left_only': 2, 'both': 2, 'right_only': 1}", 'MergeError'] },
      table: {
        name: 'mm["_merge"]',
        shape: [5, 4],
        indexName: '',
        columns: [
          { label: 'userid', tone: 'key' },
          { label: 'age', align: 'right', tone: 'num' },
          { label: 'pay', align: 'right', tone: 'num' },
          { label: '_merge', tone: 'text' },
        ],
        rows: [
          [{ v: 'a' }, { v: 23 }, { v: 2000 }, { v: 'both' }],
          [{ v: 'b' }, { v: 46 }, { v: null, tone: 'na' }, { v: 'left_only' }],
          [{ v: 'c' }, { v: 32 }, { v: 3500 }, { v: 'both' }],
          [{ v: 'd' }, { v: 19 }, { v: null, tone: 'na' }, { v: 'left_only' }],
          [{ v: 'e' }, { v: null, tone: 'na' }, { v: 600 }, { v: 'right_only' }],
        ],
        hlCols: [3],
        op: 'indicator=True',
        caption: '_merge 直接告诉你每一行的来源，省去手工核对',
        footnote: 'o 里 a 出现两次，validate="1:1" 因此抛 MergeError',
      },
    },
  ],
}

export const pdCleanWorkflow: Workflow = {
  id: 'pd-clean',
  name: '缺失值与重复值',
  en: 'MISSING & DUPLICATES',
  subtitle: '先看清缺在哪，再决定删还是填',
  category: 'clean',
  description:
    '缺失值处理没有标准答案，只有「业务上说得通」的答案。这一章先把三种缺失表示搞清楚，再看删与填各自的口径，最后处理重复行——它们经常一起出现，也一起毁掉后续统计。',
  canvasKind: 'table',
  stages: [
    { key: 'detect', zh: '识别', en: 'DETECT' },
    { key: 'drop', zh: '删除', en: 'DROP' },
    { key: 'fill', zh: '填充', en: 'FILL' },
  ],
  imports: 'import numpy as np\nimport pandas as pd',
  attrs: [
    { label: '阶段', value: '从脏数据到可用数据' },
    { label: '缺失表示', value: 'NaN · None · NA · NaT' },
    { label: '核心方法', value: 'isna · dropna · fillna' },
    { label: '输出', value: '无缺失、无重复的表' },
    { label: '检查点', value: '每列缺失率' },
    { label: '参考', value: 'pandas.pydata.org/docs/user_guide/missing_data' },
  ],
  steps: [
    {
      title: '三种缺失值',
      en: 'NA TYPES',
      subtitle: 'NaN 连自己都不等于自己',
      stage: 'detect',
      body: [
        '`np.nan` 是浮点缺失，特点是 `nan != nan`，所以判断缺失只能用 `isna()`，不能用 `==`。时间列缺失用 `NaT`，长得像 NaN 但是时间类型。',
        '`pd.NA` 是 Pandas 1.0 引入的统一缺失标量，配合 `Int64`、`boolean` 这类可空类型使用，能避免「整数列因为缺一个值就整列变成 float」。',
      ],
      code: `import numpy as np
import pandas as pd

print(np.nan == np.nan)
print(None == None)
s = pd.Series([1, 2], dtype="Int64")
s[1] = pd.NA
print(s.tolist(), s.dtype)`,
      output: { kind: 'text', lines: ['False', 'True', '[1, <NA>] Int64'] },
      table: {
        name: 's',
        shape: [2, 1],
        indexName: '',
        columns: [{ label: 'Int64', align: 'right', tone: 'num' }],
        rows: [[{ v: 1 }], [{ v: null, tone: 'na' }]],
        hlRows: [1],
        op: 'pd.NA',
        caption: '可空整数类型里放缺失，整列仍然是 Int64',
        footnote: 'float 列的缺失显示为 NaN；时间列缺失是 NaT',
      },
      tip: '判断缺失永远用 `isna()` / `notna()`，不要写 `df[df["列"] == np.nan]`——那永远是空结果。',
    },
    {
      title: 'dropna 的四种口径',
      en: 'DROPNA',
      subtitle: 'any / all / thresh / subset',
      stage: 'drop',
      body: [
        '默认 `how="any"`：只要有一个缺失就删整行。`how="all"` 只删全空行。`subset` 限定只看某几列，`thresh` 要求至少有多少个非空值。',
        '前三种是「删」，`thresh` 更像「保留达标行」。选哪个取决于你能接受丢多少数据——先算一下删完剩几行，别一口气删到没数据。',
      ],
      code: `import pandas as pd

d = pd.DataFrame({"城市": ["上海", "成都", "西安", "南京"],
                  "人口": [2487, None, 1300, 942],
                  "销售": [986, 492, None, 214]})
print(d.shape)
print(d.dropna().shape)
print(d.dropna(subset=["销售"]).shape)
print(d.dropna(axis=1).shape)`,
      output: { kind: 'text', lines: ['(4, 3)', '(2, 3)', '(3, 3)', '(4, 1)'] },
      table: {
        name: 'd',
        shape: [4, 3],
        indexName: '',
        columns: [
          { label: '城市', tone: 'key' },
          { label: '人口', align: 'right', tone: 'num' },
          { label: '销售', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: '上海' }, { v: 2487 }, { v: 986 }],
          [{ v: '成都' }, { v: null, tone: 'na' }, { v: 492 }],
          [{ v: '西安' }, { v: 1300 }, { v: null, tone: 'na' }],
          [{ v: '南京' }, { v: 942 }, { v: 214 }],
        ],
        hlRows: [1, 2],
        op: 'dropna()',
        caption: '默认口径会删掉第 2、3 行，只剩上海和南京',
        footnote: 'subset=["销售"] 只删销售缺失 → 剩 3 行；axis=1 会删掉两个有缺失的列',
      },
    },
    {
      title: 'fillna：填什么取决于业务',
      en: 'FILLNA',
      subtitle: '均值、指定值、前后向填充',
      stage: 'fill',
      body: [
        '`fillna(0)` 最粗暴，适合「没有就是 0」的计数型字段。`fillna(均值/中位数)` 保住样本量，但会压缩方差，让分布变尖。',
        '时间序列常用前后向填充：`ffill()` 用上一个有效值往下补，`bfill()` 反过来。注意新版 Pandas 里 `fillna(method="ffill")` 已移除，直接用 `ffill()`。',
      ],
      code: `import pandas as pd

d = pd.DataFrame({"人口": [2487, None, 1300, 942],
                  "销售": [986, 492, None, 214]})
print(d["销售"].fillna(0).tolist())
print(d["人口"].fillna(d["人口"].mean()).round(1).tolist())
print(pd.Series([1, None, None, 4]).ffill().tolist())`,
      output: {
        kind: 'text',
        lines: ['[986.0, 492.0, 0.0, 214.0]', '[2487.0, 1576.3, 1300.0, 942.0]', '[1.0, 1.0, 1.0, 4.0]'],
      },
      table: {
        name: 'd["人口"].fillna(mean)',
        shape: [4, 2],
        indexName: '',
        columns: [
          { label: '人口', align: 'right', tone: 'num' },
          { label: '说明', tone: 'text' },
        ],
        rows: [
          [{ v: 2487.0 }, { v: '原值' }],
          [{ v: 1576.3, tone: 'new' }, { v: '均值填充' }],
          [{ v: 1300.0 }, { v: '原值' }],
          [{ v: 942.0 }, { v: '原值' }],
        ],
        hlRows: [1],
        op: 'fillna(mean)',
        caption: '缺失那一格被均值 1576.3 填上',
        footnote: '均值 = 4729 / 3 · 填充后样本量不变，但标准差被拉低',
      },
    },
    {
      title: '重复值',
      en: 'DUPLICATES',
      subtitle: 'subset 决定「什么算重复」',
      stage: 'fill',
      body: [
        '`drop_duplicates()` 默认比较所有列，一行完全一样才算重复。多数业务场景里，「什么算重复」需要自己定义，这时就用 `subset` 指定关键列。',
        '`keep="first"` 保留第一次出现，`keep="last"` 保留最后一次，`keep=False` 把所有重复项一起删掉。选哪个取决于你信第一条还是最后一条记录。',
      ],
      code: `import pandas as pd

df = pd.DataFrame({"brand": ["Yum Yum", "Yum Yum", "Indomie", "Indomie", "Indomie"],
                   "style": ["cup", "cup", "cup", "pack", "pack"],
                   "rating": [4, 4, 3.5, 15, 5]})
print(df.shape, df.drop_duplicates().shape)
print(df.drop_duplicates(subset=["brand"]).shape)
print(df.drop_duplicates(subset=["brand", "style"], keep="last").shape)`,
      output: { kind: 'text', lines: ['(5, 3) (4, 3)', '(2, 3)', '(3, 3)'] },
      table: {
        name: 'df',
        shape: [5, 3],
        indexName: '',
        columns: [
          { label: 'brand', tone: 'key' },
          { label: 'style', tone: 'text' },
          { label: 'rating', align: 'right', tone: 'num' },
        ],
        rows: [
          [{ v: 'Yum Yum' }, { v: 'cup' }, { v: 4 }],
          [{ v: 'Yum Yum', tone: 'drop' }, { v: 'cup', tone: 'drop' }, { v: 4, tone: 'drop' }],
          [{ v: 'Indomie' }, { v: 'cup' }, { v: 3.5 }],
          [{ v: 'Indomie' }, { v: 'pack' }, { v: 15 }],
          [{ v: 'Indomie' }, { v: 'pack' }, { v: 5 }],
        ],
        hlRows: [1],
        op: 'drop_duplicates',
        caption: '第 2 行与第 1 行完全相同，默认口径会删掉它',
        footnote: '按 brand 去重 → 2 行；按 brand+style 去重并保留最后一条 → 3 行',
      },
    },
  ],
}
