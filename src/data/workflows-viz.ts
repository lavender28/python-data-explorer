import type { FigureAxis, Workflow } from './types'

/* Matplotlib：基础画布 + 常见图型（图表画布，10 步） */

const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const SALES = [286400, 268900, 301200, 318700, 356180, 331900, 342600, 325500, 310800, 348200, 339600, 352480]
const CITIES = [
  { name: '南京', value: 214860 },
  { name: '武汉', value: 286420 },
  { name: '西安', value: 312400 },
  { name: '广州', value: 338900 },
  { name: '成都', value: 492360 },
  { name: '上海', value: 986420 },
]

const monthTicks = MONTHS.map((label, i) => ({ v: i, label }))
const cityTicks = CITIES.map((c, i) => ({ v: i, label: c.name }))

const AX_SALES: FigureAxis = {
  xlim: [0, 11],
  ylim: [0, 400000],
  xticks: monthTicks,
  yticks: [
    { v: 0, label: '0' },
    { v: 100000, label: '10万' },
    { v: 200000, label: '20万' },
    { v: 300000, label: '30万' },
  ],
  title: '月度销售额',
  ylabel: '销售额（元）',
}

const AX_CITY: FigureAxis = {
  xlim: [0, 1000000],
  ylim: [-0.6, 5.6],
  xticks: [
    { v: 0, label: '0' },
    { v: 500000, label: '50万' },
    { v: 1000000, label: '100万' },
  ],
  yticks: cityTicks,
  title: '城市排名',
  xlabel: '全年销售额（元）',
}

const LINE_MARK = {
  kind: 'line' as const,
  points: SALES.map((y, i) => ({ x: i, y })),
  color: 'var(--accent)',
  width: 2,
}

const CITY_BARS = {
  kind: 'bar' as const,
  horizontal: true,
  width: 0.56,
  bars: CITIES.map((c, i) => ({ x: c.value, y: i })),
  color: 'var(--accent)',
}

const GDP = [
  { name: '北京', value: 47218.7 },
  { name: '上海', value: 43760.7 },
  { name: '天津', value: 30145.8 },
  { name: '重庆', value: 16737.3 },
]
const PRICE = [
  { name: '亚马逊', value: 39.5 },
  { name: '当当网', value: 39.9 },
  { name: '中国图书网', value: 45.4 },
  { name: '京东', value: 38.9 },
  { name: '天猫', value: 33.34 },
]
const Y2016 = [15600, 12700, 11300, 4270, 3620]
const Y2017 = [17400, 14800, 12000, 5200, 4020]
const TOP_CITIES = ['北京', '上海', '香港', '深圳', '广州']
const EDU = [
  { label: '中专', value: 0.2515, color: 'var(--accent)' },
  { label: '大专', value: 0.3724, color: 'var(--warn)', explode: true },
  { label: '本科', value: 0.3336, color: 'var(--ok)' },
  { label: '硕士', value: 0.0368, color: 'var(--danger)' },
  { label: '其他', value: 0.0057, color: 'var(--faint)' },
]

export const matplotlibWorkflow: Workflow = {
  id: 'matplotlib',
  name: 'Matplotlib 图表',
  en: 'MATPLOTLIB',
  subtitle: '从空白画布到十种图型，再到导出一张成品图',
  category: 'viz',
  description:
    'Figure 是整张画布，Axes 才是真正画图的那块坐标系。这一章先把这两个概念立住，用一份 12 个月销售数据把折线与条形画进同一张图，再横向铺开柱状、条形、分组柱、饼图、箱线五种图型，最后回到总图做标注与导出。',
  imports: 'import matplotlib.pyplot as plt',
  attrs: [
    { label: '阶段', value: '从画布到成品图' },
    { label: '核心库', value: 'matplotlib 3.11' },
    { label: '核心对象', value: 'Figure · Axes' },
    { label: '输出', value: 'PNG / SVG' },
    { label: '关键方法', value: 'subplots · plot · bar · savefig' },
    { label: '参考', value: 'matplotlib.org/stable/gallery' },
  ],
  steps: [
    {
      title: '画布与双坐标系',
      en: 'FIGURE & AXES',
      subtitle: 'fig 是纸，ax 是纸上的格子',
      stage: 'frame',
      body: [
        '`plt.subplots(1, 2, figsize=(9, 4.5))` 一次拿到一个 Figure 和两个 Axes。Figure 是整张纸，Axes 是纸上真正画图的那块坐标系——标题、刻度、图例全都挂在 Axes 上。',
        '`figsize` 的单位是英寸，配合 `dpi` 决定最终像素：9 × 4.5 英寸、140 dpi 就是 1260 × 630 像素。先定尺寸再画，比画完再拉伸靠谱得多。',
      ],
      code: `import matplotlib.pyplot as plt

months = list(range(1, 13))
sales = [286400, 268900, 301200, 318700, 356180, 331900,
         342600, 325500, 310800, 348200, 339600, 352480]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))
print(fig.get_size_inches().tolist())
print(len(fig.axes))`,
      output: { kind: 'text', lines: ['[9.0, 4.5]', '2'] },
      figure: {
        panels: [AX_SALES, AX_CITY],
        layout: 'double',
        caption: 'FIG. 01 — FIGURE / 双坐标系',
        badge: 'REV. 2024.11',
        call: 'fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))',
      },
      trace: { object: 'subplots(1, 2)', action: '创建 Figure + 2 Axes', result: 'OK', rows: '—', ms: 41 },
      tip: '`plt.plot()` 也能画图，它会自动创建画布，但那是 pyplot 风格。要多图联动、要复用的脚本，一律用 OO 风格显式拿 ax。',
    },
    {
      title: '折线：月度趋势',
      en: 'PLOT',
      subtitle: '一条线看走势，先不加任何装饰',
      stage: 'plot',
      body: [
        '`ax1.plot(x, y)` 把 12 个点连成线。此刻图上只有数据，没有标题、没有单位，读者不知道这条线在说什么——这在真实工作里是常见的半成品。',
        '先把数据画对，再回头加标题和刻度。`lw` 控线宽、`ls` 控虚实、`color` 控颜色，三个参数能解决八成样式需求。',
      ],
      code: `import matplotlib.pyplot as plt

months = list(range(1, 13))
sales = [286400, 268900, 301200, 318700, 356180, 331900,
         342600, 325500, 310800, 348200, 339600, 352480]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))
ax1.plot(months, sales, color="#1a4cd6", lw=2)
print(sum(sales))
print(max(sales), sales.index(max(sales)) + 1)`,
      output: { kind: 'text', lines: ['3882460', '356180 5'] },
      figure: {
        panels: [{ ...AX_SALES, marks: [LINE_MARK] }, AX_CITY],
        layout: 'double',
        caption: 'FIG. 02 — 折线：月度趋势',
        badge: 'REV. 2024.11',
        call: 'ax1.plot(months, sales, color="#1a4cd6", lw=2)',
      },
      trace: { object: 'ax1.plot', action: '绑定 12 个数据点', result: '1 Line2D', rows: '—', ms: 6 },
    },
    {
      title: '条形：城市排名',
      en: 'BARH',
      subtitle: '类别多、名字长，就横过来画',
      stage: 'plot',
      body: [
        '城市名横排会挤在一起，所以用 `barh` 横向画：类别在 y 轴、数值在 x 轴。为了让最大的排在最上面，数据要按升序给出——y 轴默认是数值递增向上的。',
        '同一张 Figure 里两个 Axes 完全独立：各自的坐标范围、刻度、标题互不影响。这就是一张图能讲两个故事的原因。',
      ],
      code: `import matplotlib.pyplot as plt

cities = ["南京", "武汉", "西安", "广州", "成都", "上海"]
values = [214860, 286420, 312400, 338900, 492360, 986420]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))
ax2.barh(cities, values, color="#1a4cd6", alpha=0.8)
print(values[0], values[-1])
print(round(values[-1] / values[0], 2))`,
      output: { kind: 'text', lines: ['214860 986420', '4.59'] },
      figure: {
        panels: [{ ...AX_SALES, marks: [LINE_MARK] }, { ...AX_CITY, marks: [CITY_BARS] }],
        layout: 'double',
        caption: 'FIG. 03 — 条形：城市排名',
        badge: 'REV. 2024.11',
        call: 'ax2.barh(cities, values, color="#1a4cd6", alpha=0.8)',
      },
      trace: { object: 'ax2.barh', action: '绑定 6 个类别', result: '6 Rectangle', rows: '—', ms: 4 },
    },
    {
      title: '柱状图与数值标签',
      en: 'BAR + LABEL',
      subtitle: '柱子高矮之外，把数字直接写上去',
      stage: 'plot',
      body: [
        '柱状图适合「少数类别比大小」。`ax.bar(range(4), gdp)` 的 x 是位置、y 是高度；类别名用 `set_xticks(range(4), labels)` 一次性换掉。',
        '数值标签要循环加：`ax.text(x, y + 偏移, 文本, ha="center")`。偏移量按数据量级给（这里 y 轴跨度 4 万，偏 500 刚好），给太小会压住柱子。',
      ],
      code: `import matplotlib.pyplot as plt

gdp = [47218.7, 43760.7, 30145.8, 16737.3]
labels = ["北京市", "上海市", "天津市", "重庆市"]

fig, ax = plt.subplots(figsize=(6, 4))
bars = ax.bar(range(4), gdp, color="steelblue", alpha=0.8)
for x, y in enumerate(gdp):
    ax.text(x, y + 500, str(round(y, 1)), ha="center", fontsize=8)
print(len(bars))
print(labels[0], round(sum(gdp), 1))`,
      output: { kind: 'text', lines: ['4', '北京市 137862.5'] },
      figure: {
        panels: [
          {
            xlim: [-0.6, 3.6],
            ylim: [10000, 52000],
            xticks: GDP.map((g, i) => ({ v: i, label: g.name })),
            yticks: [
              { v: 10000, label: '1万' },
              { v: 20000, label: '2万' },
              { v: 30000, label: '3万' },
              { v: 40000, label: '4万' },
              { v: 50000, label: '5万' },
            ],
            title: '四个直辖市 GDP 大比拼',
            ylabel: 'GDP（亿元）',
            marks: [
              {
                kind: 'bar',
                width: 0.56,
                color: 'var(--accent)',
                bars: GDP.map((g, i) => ({ x: i, y: g.value, label: String(g.value) })),
              },
            ],
          },
        ],
        layout: 'single',
        caption: 'FIG. 04 — 柱状图 + 数值标签',
        badge: '2023 GDP',
        call: 'ax.bar(range(4), gdp, color="steelblue", alpha=0.8)',
      },
      trace: { object: 'ax.bar', action: '4 根柱子 + 4 个 text', result: 'OK', rows: '—', ms: 5 },
    },
    {
      title: '横向条形：标签不打架',
      en: 'BARH RANK',
      subtitle: '平台名是中文长词，必须横着放',
      stage: 'plot',
      body: [
        '当类别名是「中国图书网」这种 5 个字的词，竖直柱状图的 x 轴标签必然重叠。横过来画（`barh`）标签就有完整的一行位置。',
        '横向图的 x 轴从 0 开始会显得所有条一样长——价格都集中在 33~46 之间。把 `xlim` 收窄到 `[32, 47]`，差异才看得出来，但要在标题里说明轴被截断了。',
      ],
      code: `import matplotlib.pyplot as plt

price = [39.5, 39.9, 45.4, 38.9, 33.34]
shops = ["亚马逊", "当当网", "中国图书网", "京东", "天猫"]

fig, ax = plt.subplots(figsize=(6, 4))
ax.barh(range(5), price, color="steelblue", alpha=0.8)
for y, v in enumerate(price):
    ax.text(v + 0.1, y, str(v), va="center", fontsize=8)
print(round(min(price), 2), round(max(price), 2))
print(shops[price.index(min(price))])`,
      output: { kind: 'text', lines: ['33.34 45.4', '天猫'] },
      figure: {
        panels: [
          {
            xlim: [32, 47],
            ylim: [-0.6, 4.6],
            yticks: PRICE.map((p, i) => ({ v: i, label: p.name })),
            xticks: [
              { v: 32, label: '32' },
              { v: 35, label: '35' },
              { v: 38, label: '38' },
              { v: 41, label: '41' },
              { v: 44, label: '44' },
              { v: 47, label: '47' },
            ],
            title: '不同平台书的最低价比较',
            xlabel: '价格（元）',
            marks: [
              {
                kind: 'bar',
                horizontal: true,
                width: 0.56,
                color: 'var(--accent)',
                bars: PRICE.map((p, i) => ({ x: p.value, y: i, label: String(p.value) })),
              },
            ],
          },
        ],
        layout: 'single',
        caption: 'FIG. 05 — 横向条形：比价',
        badge: 'SAME BOOK',
        call: 'ax.barh(range(5), price, color="steelblue", alpha=0.8)',
      },
      trace: { object: 'ax.barh', action: '5 根横条 + 数值标签', result: 'OK', rows: '—', ms: 4 },
    },
    {
      title: '分组柱：两年并排比',
      en: 'GROUPED BAR',
      subtitle: '同一类别位置偏移半个柱宽',
      stage: 'plot',
      body: [
        '两根柱子并排的关键是 x 坐标错开：`ax.bar(x - 0.2, y2016, width=0.38)` 与 `ax.bar(x + 0.2, y2017, ...)`。柱宽必须小于偏移量的一半，否则会叠在一起。',
        '刻度和标签要放在两组柱子的中间：`set_xticks(x, labels)`——x 本身就是类别位置，偏移只作用在柱子上，不作用在刻度上。',
      ],
      code: `import numpy as np
import matplotlib.pyplot as plt

y2016 = [15600, 12700, 11300, 4270, 3620]
y2017 = [17400, 14800, 12000, 5200, 4020]
labels = ["北京", "上海", "香港", "深圳", "广州"]
x = np.arange(5)

fig, ax = plt.subplots(figsize=(6, 4))
ax.bar(x - 0.2, y2016, width=0.38, label="2016", color="steelblue", alpha=0.85)
ax.bar(x + 0.2, y2017, width=0.38, label="2017", color="indianred", alpha=0.85)
ax.set_xticks(x, labels)
print(round(sum(y2017) / sum(y2016) - 1, 3))`,
      output: { kind: 'text', lines: ['0.125'] },
      figure: {
        panels: [
          {
            xlim: [-0.6, 4.6],
            ylim: [0, 20000],
            xticks: TOP_CITIES.map((c, i) => ({ v: i, label: c })),
            yticks: [
              { v: 0, label: '0' },
              { v: 5000, label: '5k' },
              { v: 10000, label: '10k' },
              { v: 15000, label: '15k' },
              { v: 20000, label: '20k' },
            ],
            title: '亿万财富家庭数 Top5 城市',
            ylabel: '家庭数量',
            marks: [
              {
                kind: 'bar',
                width: 0.34,
                color: 'var(--accent)',
                bars: Y2016.map((v, i) => ({ x: i - 0.19, y: v })),
              },
              {
                kind: 'bar',
                width: 0.34,
                color: 'var(--warn)',
                bars: Y2017.map((v, i) => ({ x: i + 0.19, y: v })),
              },
            ],
          },
        ],
        layout: 'single',
        caption: 'FIG. 06 — 分组柱：2016 vs 2017',
        badge: 'YOY +12.5%',
        call: 'ax.bar(x - 0.2, y2016, width=0.38) / ax.bar(x + 0.2, y2017, ...)',
      },
      trace: { object: 'ax.bar × 2', action: '两组柱子错位排列', result: 'OK', rows: '—', ms: 5 },
      tip: '分组柱超过 3 组就会看不清。真要放 4 组以上，改用折线或小多图（small multiples）。',
    },
    {
      title: '饼图：构成占比',
      en: 'PIE',
      subtitle: '只有占比才有意义，且不宜超过 6 块',
      stage: 'plot',
      body: [
        '`ax.pie(x, labels, autopct="%.1f%%", explode=[...])`：`explode` 让某一块离开圆心，用来强调。饼图只回答「占多少」，不回答「有多少」。',
        '画完记得 `ax.set_xticks(())` 和 `ax.set_yticks(())` 把坐标刻度去掉——饼图下面的刻度线完全没有意义，只会干扰。',
      ],
      code: `import matplotlib.pyplot as plt

edu = [0.2515, 0.3724, 0.3336, 0.0368, 0.0057]
labels = ["中专", "大专", "本科", "硕士", "其他"]

fig, ax = plt.subplots(figsize=(6, 4))
ax.pie(x=edu, labels=labels, explode=[0, 0.1, 0, 0, 0],
       autopct="%.1f%%", textprops={"fontsize": 9})
ax.set_xticks(())
ax.set_yticks(())
print(round(sum(edu), 4))
print([round(v * 100, 1) for v in edu])`,
      output: { kind: 'text', lines: ['1.0', '[25.1, 37.2, 33.4, 3.7, 0.6]'] },
      figure: {
        panels: [{ type: 'pie', slices: EDU, title: '失信用户教育水平分布' }],
        layout: 'single',
        caption: 'FIG. 07 — 饼图：构成',
        badge: 'N ≈ 300万',
        call: 'ax.pie(x=edu, labels=labels, autopct="%.1f%%")',
      },
      trace: { object: 'ax.pie', action: '5 个扇区 + 百分比', result: 'OK', rows: '—', ms: 5 },
    },
    {
      title: '箱线图：分布与离群点',
      en: 'BOXPLOT',
      subtitle: '五个数概括一列数据的形状',
      stage: 'plot',
      body: [
        '箱线图用五个数概括分布：下须（min）、Q1、中位数、Q3、上须（max），超出须线的点单独画成离群点。它比均值更能反映「典型的乘客几岁」。',
        '`patch_artist=True` 才允许填充箱体颜色，`showmeans=True` 加一个均值点。中位数线和均值点分开放，就是为了让你看到偏斜——两者差得越远，分布越偏。',
      ],
      code: `import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
ages = rng.normal(29, 12, 600).clip(1, 80).round(0)

fig, ax = plt.subplots(figsize=(6, 4))
ax.boxplot(x=ages, patch_artist=True, showmeans=True,
           boxprops={"facecolor": "#dce7fb", "color": "#1a4cd6"},
           medianprops={"linestyle": "--", "color": "orange"},
           flierprops={"marker": "o", "markerfacecolor": "red",
                       "markeredgecolor": "red", "markersize": 3})
print(len(ages))
print(round(float(np.median(ages)), 1), round(float(np.percentile(ages, 25)), 1),
      round(float(np.percentile(ages, 75)), 1))`,
      output: { kind: 'text', lines: ['600', '28.0 20.0 35.0'] },
      figure: {
        panels: [
          {
            type: 'box',
            box: { min: 1, q1: 20, median: 28, q3: 35, max: 56, mean: 29.7, outliers: [62, 66, 71, 78] },
            boxScale: [0, 85],
            yticks: [
              { v: 0, label: '0' },
              { v: 20, label: '20' },
              { v: 40, label: '40' },
              { v: 60, label: '60' },
              { v: 80, label: '80' },
            ],
            title: '乘客年龄分布',
            xlabel: 'Age',
          },
        ],
        layout: 'single',
        caption: 'FIG. 08 — 箱线图：分布形状',
        badge: 'TITANIC',
        call: 'ax.boxplot(x=ages, patch_artist=True, showmeans=True)',
      },
      trace: { object: 'ax.boxplot', action: '600 个样本 → 五数概括', result: 'OK', rows: '—', ms: 7 },
      tip: '箱线图的中位数线用虚线、均值点用菱形，一眼就能看出偏斜方向和离群点数量。',
    },
    {
      title: '回到总图：去边框、标峰值',
      en: 'SPINES & ANNOTATE',
      subtitle: '上边框和右边框几乎从不必要',
      stage: 'insight',
      body: [
        '`ax.spines["top"].set_visible(False)` 去掉上、右两条边框，图立刻清爽——数据不需要被框住。这已经成了现代图表的事实标准。',
        '`ax.annotate(text, xy=要指的点, xytext=文字位置, arrowprops=箭头样式)` 是带箭头的标注。峰值这种「一句话结论」，写在图上比写在正文里有用得多。',
      ],
      code: `import matplotlib.pyplot as plt

months = list(range(1, 13))
sales = [286400, 268900, 301200, 318700, 356180, 331900,
         342600, 325500, 310800, 348200, 339600, 352480]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))
ax1.plot(months, sales, color="#1a4cd6", lw=2)
peak = max(sales)
i = sales.index(peak)
ax1.annotate(f"峰值 {peak:,}", xy=(i + 1, peak), xytext=(i - 2, peak + 18000),
             arrowprops={"arrowstyle": "->", "color": "#1a4cd6"})
for side in ("top", "right"):
    ax1.spines[side].set_visible(False)
    ax2.spines[side].set_visible(False)
print(i + 1, peak)
print([s.get_visible() for s in ax1.spines.values()])`,
      output: { kind: 'text', lines: ['5 356180', '[True, False, True, False]'] },
      figure: {
        panels: [
          {
            ...AX_SALES,
            frame: false,
            marks: [
              LINE_MARK,
              { kind: 'vline', x: 4, color: 'var(--accent)', dash: true },
              { kind: 'text', x: 1.6, y: 378000, text: '峰值 356,180', color: 'var(--accent)' },
            ],
          },
          { ...AX_CITY, marks: [CITY_BARS], frame: false },
        ],
        layout: 'double',
        caption: 'FIG. 09 — 去边框 + 峰值标注',
        badge: 'POLISH',
        call: 'ax.spines["top"].set_visible(False) / ax.annotate(...)',
      },
      trace: { object: 'spines / annotate', action: '去边框 + 峰值箭头', result: 'OK', rows: '—', ms: 8 },
    },
    {
      title: '导出成图',
      en: 'SAVEFIG',
      subtitle: 'dpi 与 bbox_inches 决定交付质量',
      stage: 'insight',
      body: [
        '`fig.savefig("sales.png", dpi=140, bbox_inches="tight")`：`dpi` 决定清晰度，`bbox_inches="tight"` 自动裁掉四周多余白边。给文档用 150~200 dpi，给印刷用 300 dpi。',
        '注意保存必须写在 `plt.show()` 之前——很多后端调用 show 之后会清空画布，再存就是一张白图。矢量图存 `.svg` 或 `.pdf` 可以无损缩放。',
      ],
      code: `import matplotlib.pyplot as plt

months = list(range(1, 13))
sales = [286400, 268900, 301200, 318700, 356180, 331900,
         342600, 325500, 310800, 348200, 339600, 352480]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(9, 4.5))
ax1.plot(months, sales, color="#1a4cd6", lw=2)
w, h = fig.get_size_inches()
dpi = 140
print(f"{w} x {h} in")
print(f"{int(w * dpi)} x {int(h * dpi)} px")`,
      output: { kind: 'text', lines: ['9.0 x 4.5 in', '1260 x 630 px'] },
      figure: {
        panels: [
          { ...AX_SALES, marks: [LINE_MARK], frame: false },
          { ...AX_CITY, marks: [CITY_BARS], frame: false },
        ],
        layout: 'double',
        caption: 'FIG. 10 — EXPORT · 交付版',
        badge: '1260 × 630',
        exportFrame: true,
        call: 'fig.savefig("sales.png", dpi=140, bbox_inches="tight")',
      },
      trace: { object: 'fig.savefig', action: '写出 PNG', result: 'sales.png', rows: '—', ms: 62 },
    },
  ],
}
