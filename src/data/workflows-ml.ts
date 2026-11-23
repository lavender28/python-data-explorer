import type { Workflow } from './types'

/* 机器学习：建模流程、聚类、回归、决策树（模型画布） */

const IRIS_SETOSA = [
  { x: 1.4, y: 0.2 }, { x: 1.5, y: 0.3 }, { x: 1.6, y: 0.2 }, { x: 1.7, y: 0.4 },
  { x: 1.3, y: 0.2 }, { x: 1.5, y: 0.1 }, { x: 1.9, y: 0.4 }, { x: 1.6, y: 0.3 },
  { x: 1.4, y: 0.3 }, { x: 1.8, y: 0.2 },
]
const IRIS_VERSI = [
  { x: 4.2, y: 1.2 }, { x: 4.5, y: 1.5 }, { x: 4.0, y: 1.3 }, { x: 5.1, y: 1.6 },
  { x: 4.7, y: 1.4 }, { x: 4.4, y: 1.3 }, { x: 5.0, y: 1.5 }, { x: 4.9, y: 1.2 },
  { x: 4.3, y: 1.1 }, { x: 5.2, y: 1.6 },
]
const IRIS_VIRGI = [
  { x: 6.0, y: 2.0 }, { x: 6.3, y: 2.2 }, { x: 5.8, y: 1.9 }, { x: 6.7, y: 2.3 },
  { x: 6.4, y: 2.0 }, { x: 5.6, y: 1.8 }, { x: 6.9, y: 2.4 }, { x: 6.1, y: 2.1 },
  { x: 6.6, y: 2.2 }, { x: 5.9, y: 2.0 },
]

const BMI_LINE = [
  { x: -0.08, y: 68 }, { x: -0.07, y: 92 }, { x: -0.06, y: 78 }, { x: -0.05, y: 110 },
  { x: -0.04, y: 96 }, { x: -0.03, y: 128 }, { x: -0.02, y: 105 }, { x: -0.01, y: 149 },
  { x: 0.0, y: 138 }, { x: 0.01, y: 172 }, { x: 0.02, y: 158 }, { x: 0.03, y: 196 },
  { x: 0.04, y: 181 }, { x: 0.05, y: 214 }, { x: 0.06, y: 198 }, { x: 0.07, y: 232 },
  { x: 0.08, y: 246 },
]

export const mlFlowWorkflow: Workflow = {
  id: 'ml-flow',
  name: '从数据到模型',
  en: 'MODELING PIPELINE',
  subtitle: '加载、划分、标准化、训练、评估',
  category: 'ml',
  description:
    'sklearn 的用法高度统一：所有模型都是「实例化 → fit → predict / score」，所有预处理器都是「fit → transform」。把这条流水线跑顺，换模型只是换一行 import。这一章用 iris 走完五步，并说明每一步为什么不能颠倒。',
  canvasKind: 'model',
  stages: [
    { key: 'data', zh: '数据', en: 'DATA' },
    { key: 'fit', zh: '训练', en: 'FIT' },
    { key: 'score', zh: '评估', en: 'SCORE' },
  ],
  imports: 'from sklearn.datasets import load_iris\nfrom sklearn.model_selection import train_test_split, cross_val_score\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.pipeline import make_pipeline',
  attrs: [
    { label: '阶段', value: '从原始数据到可用模型' },
    { label: '核心库', value: 'scikit-learn' },
    { label: '输入', value: 'Bunch 数据集 / 特征矩阵' },
    { label: '输出', value: '训练好的 estimator' },
    { label: '检查点', value: '测试集分数而非训练集' },
    { label: '参考', value: 'scikit-learn.org/stable/user_guide' },
  ],
  steps: [
    {
      title: '加载数据集',
      en: 'LOAD BUNCH',
      subtitle: 'data / target / feature_names 三件套',
      stage: 'data',
      body: [
        'sklearn 内置数据集加载后是一个 Bunch 对象，用起来像字典：`data` 是特征矩阵，`target` 是标签，`feature_names` 是每一列的名字，`DESCR` 是说明文档。',
        '`X` 的形状是 (样本数, 特征数)，`y` 的形状是 (样本数,)。分类任务的 y 是类别编号，配合 `target_names` 才知道每个编号代表什么。',
      ],
      code: `from sklearn.datasets import load_iris

iris = load_iris()
print(type(iris).__name__)
print(iris.data.shape, iris.target.shape)
print(iris.target_names.tolist())
print(iris.feature_names)`,
      output: {
        kind: 'text',
        lines: [
          'Bunch',
          '(150, 4) (150,)',
          "['setosa', 'versicolor', 'virginica']",
          "['sepal length (cm)', 'sepal width (cm)', 'petal length (cm)', 'petal width (cm)']",
        ],
      },
      model: {
        kind: 'metrics',
        items: [
          { label: '样本数', value: '150' },
          { label: '特征数', value: '4' },
          { label: '类别数', value: '3' },
          { label: '任务', value: '分类', hint: 'target 是离散类别' },
        ],
        caption: 'iris：150 朵花、4 个测量值、3 个品种',
      },
    },
    {
      title: '划分训练集与测试集',
      en: 'TRAIN TEST SPLIT',
      subtitle: '先留出考卷，再开始学习',
      stage: 'data',
      body: [
        '`train_test_split` 把数据随机切成两份，`test_size=0.2` 表示 20% 留作测试。`random_state` 固定随机种子，保证每次划分结果一致、结果可复现。',
        '顺序不要写错：先划分，再对训练集 fit，然后用同一个规则 transform 测试集。如果先对整个数据集做标准化再划分，测试集的信息就泄漏进训练过程了。',
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=123)
print(X_train.shape, X_test.shape)
print(y_train.shape, y_test.shape)`,
      output: { kind: 'text', lines: ['(120, 4) (30, 4)', '(120,) (30,)'] },
      model: {
        kind: 'split',
        parts: [
          { label: '训练集 train', count: 120, tone: 'train' },
          { label: '测试集 test', count: 30, tone: 'test' },
        ],
        note: 'test_size=0.2 · random_state=123 · 分层抽样默认开启',
        caption: '80 / 20 划分：120 条用来学，30 条用来考',
      },
    },
    {
      title: '标准化：只 fit 训练集',
      en: 'SCALE',
      subtitle: '规则来自训练集，再套到测试集上',
      stage: 'fit',
      body: [
        '`StandardScaler` 把每列变成均值 0、标准差 1。关键是 `fit` 只在训练集上做——它记下训练集的均值和方差，之后用这套参数去 `transform` 测试集。',
        '所以训练集标准化后均值正好是 0、标准差正好是 1，而测试集只是「按训练集的尺子量过」，均值和标准差会略有偏差。这个偏差正是模型在真实世界会遇到的情况。',
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=123)
scaler = StandardScaler().fit(X_train)
train_s = scaler.transform(X_train)
test_s = scaler.transform(X_test)
print(round(float(train_s.mean()), 3), round(float(train_s.std()), 3))
print(round(float(test_s.mean()), 2), round(float(test_s.std()), 2))`,
      output: { kind: 'text', lines: ['-0.0 1.0', '-0.08 1.07'] },
      model: {
        kind: 'metrics',
        items: [
          { label: '训练集 mean', value: '-0.000', tone: 'good' },
          { label: '训练集 std', value: '1.000', tone: 'good' },
          { label: '测试集 mean', value: '-0.08', hint: '略有偏移，正常' },
          { label: '测试集 std', value: '1.07', hint: '不是 1 才说明没泄漏' },
        ],
        caption: '标准化参数只来自训练集，测试集是被「同一把尺子」量的',
      },
      tip: '看到测试集标准化后均值标准差也正好是 0 和 1，八成是对全量数据 fit 了——那是数据泄漏。',
    },
    {
      title: '训练与评分',
      en: 'FIT & SCORE',
      subtitle: 'fit 学参数，score 给准确率',
      stage: 'fit',
      body: [
        '`fit(X_train, y_train)` 训练，`score(X_test, y_test)` 返回测试集准确率。同一个接口适用于几乎所有模型：换模型只换类名。',
        '训练集 0.983、测试集 1.0 看上去「测试比训练还好」，这在 30 条样本上很常见——样本太少，波动就大。所以小数据集更该看交叉验证而不是单次划分。',
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

iris = load_iris()
X_train, X_test, y_train, y_test = train_test_split(
    iris.data, iris.target, test_size=0.2, random_state=123)
clf = LogisticRegression(max_iter=1000).fit(X_train, y_train)
print(round(clf.score(X_train, y_train), 3))
print(round(clf.score(X_test, y_test), 3))`,
      output: { kind: 'text', lines: ['0.983', '1.0'] },
      model: {
        kind: 'metrics',
        items: [
          { label: '训练集准确率', value: '0.983', hint: '120 条里错 2 条' },
          { label: '测试集准确率', value: '1.000', tone: 'good', hint: '30 条全对' },
          { label: '最大迭代', value: '1000', hint: '默认 100 常不收敛' },
        ],
        caption: '逻辑回归在 iris 上几乎是送分题，重点是流程而不是分数',
      },
    },
    {
      title: '用 Pipeline 串起来',
      en: 'PIPELINE',
      subtitle: '把预处理和模型焊成一个对象',
      stage: 'score',
      body: [
        '`make_pipeline(StandardScaler(), LogisticRegression())` 把两步合成一个 estimator：调它的 fit 会自动先标准化再训练，调 predict 会自动先 transform。',
        '这样做最大的好处是交叉验证不会泄漏——每一折的标准化参数只从该折的训练部分算出来。手写 fit/transform 时一旦顺序错了，分数会虚高而你根本看不出来。',
      ],
      code: `from sklearn.datasets import load_iris
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

iris = load_iris()
pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
scores = cross_val_score(pipe, iris.data, iris.target, cv=5)
print(scores.round(3).tolist())
print(round(float(scores.mean()), 3))`,
      output: { kind: 'text', lines: ['[0.967, 1.0, 0.933, 0.9, 1.0]', '0.96'] },
      model: {
        kind: 'bars',
        items: [
          { label: 'fold 1', value: 0.967 },
          { label: 'fold 2', value: 1.0 },
          { label: 'fold 3', value: 0.933 },
          { label: 'fold 4', value: 0.9 },
          { label: 'fold 5', value: 1.0 },
        ],
        max: 1,
        caption: '5 折交叉验证：每折轮流当验证集，均值 0.96 比单次划分可信得多',
      },
    },
  ],
}

export const mlClusterWorkflow: Workflow = {
  id: 'ml-cluster',
  name: '聚类与评估',
  en: 'K-MEANS',
  subtitle: '没有标签时，怎么判断分几类合适',
  category: 'ml',
  description:
    '聚类是无监督学习：没有 y，只有 X，目标是把相似的样本放一起。K-Means 靠「随机撒点 → 分配 → 重算中心 → 再分配」迭代收敛。难点不在调用，而在「k 取几」和「怎么证明分得好」。',
  canvasKind: 'model',
  stages: [
    { key: 'fit', zh: '聚类', en: 'FIT' },
    { key: 'inspect', zh: '看点', en: 'INSPECT' },
    { key: 'eval', zh: '评估', en: 'EVAL' },
  ],
  imports: 'from sklearn.cluster import KMeans\nfrom sklearn.datasets import load_iris\nfrom sklearn.metrics import silhouette_score, calinski_harabasz_score',
  attrs: [
    { label: '阶段', value: '从无标签到分组' },
    { label: '核心算法', value: 'K-Means' },
    { label: '输入', value: 'X（无 y）' },
    { label: '输出', value: 'labels_ · cluster_centers_' },
    { label: '关键参数', value: 'n_clusters · n_init · random_state' },
    { label: '参考', value: 'scikit-learn.org/stable/modules/clustering' },
  ],
  steps: [
    {
      title: 'K-Means：先撒点，再挪点',
      en: 'K-MEANS',
      subtitle: '两步循环到中心不再动',
      stage: 'fit',
      body: [
        '算法只有两步：把每个样本分给最近的中心；把每个中心挪到本簇样本的平均位置。反复执行，直到中心不再移动或达到迭代上限。',
        '它要求你先给出 `n_clusters`，也就是 k。`n_init=10` 表示用 10 组不同的初始中心各跑一遍，取最好的那次——因为 K-Means 对初始点敏感，容易卡在局部最优。',
      ],
      code: `from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

iris = load_iris()
km = KMeans(n_clusters=3, n_init=10, random_state=123).fit(iris.data)
print(km.cluster_centers_.round(2).tolist()[0])
print(km.labels_[:12].tolist())`,
      output: { kind: 'text', lines: ['[6.85, 3.07, 5.74, 2.07]', '[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]'] },
      model: {
        kind: 'scatter',
        groups: [
          { label: 'cluster 0', points: IRIS_SETOSA },
          { label: 'cluster 1', points: IRIS_VERSI },
          { label: 'cluster 2', points: IRIS_VIRGI },
        ],
        centers: [
          { x: 1.46, y: 0.25 },
          { x: 4.26, y: 1.33 },
          { x: 5.55, y: 2.03 },
        ],
        axes: [1, 7.2, 0, 2.6],
        xLabel: 'petal length (cm)',
        yLabel: 'petal width',
        caption: '示意：花瓣长/宽两维上的三簇与十字中心（原始空间是 4 维）',
      },
    },
    {
      title: '三个可读的属性',
      en: 'INSPECT',
      subtitle: 'labels_ · inertia_ · n_iter_',
      stage: 'inspect',
      body: [
        '`labels_` 是每个样本的簇编号（从 0 开始，顺序无意义）；`cluster_centers_` 是簇中心坐标；`inertia_` 是所有点到各自中心的距离平方和，越小越紧凑。',
        '`n_iter_` 是实际迭代次数。如果它贴着上限（默认 300）不动，说明数据没收敛好，通常要提高 `max_iter` 或减少 k。',
      ],
      code: `from sklearn.cluster import KMeans
from sklearn.datasets import load_iris

iris = load_iris()
km = KMeans(n_clusters=3, n_init=10, random_state=123).fit(iris.data)
print(round(float(km.inertia_), 2))
print(km.n_iter_)
print(km.predict([[1.5, 1.5, 1.5, 1.5], [6.5, 3.0, 5.2, 2.0]]).tolist())`,
      output: { kind: 'text', lines: ['78.85', '3', '[1, 0]'] },
      model: {
        kind: 'metrics',
        items: [
          { label: 'inertia_', value: '78.85', hint: '簇内距离平方和' },
          { label: 'n_iter_', value: '3', tone: 'good', hint: '3 次就收敛' },
          { label: 'n_clusters', value: '3' },
          { label: 'n_init', value: '10', hint: '10 次重启取最优' },
        ],
        caption: 'inertia 只知道「紧不紧」，不知道「对不对」，所以还需要外部指标',
      },
    },
    {
      title: '轮廓系数：越接近 1 越好',
      en: 'SILHOUETTE',
      subtitle: '簇内够近，簇间够远',
      stage: 'eval',
      body: [
        '轮廓系数对每个样本算 `(b - a) / max(a, b)`：a 是到本簇其他点的平均距离，b 是到最近另一个簇的平均距离。取值 -1 到 1，越接近 1 越好。',
        '把所有样本的轮廓系数取平均，就是整体得分。它的好处是不需要真实标签，所以聚类任务几乎都会看它。',
      ],
      code: `from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
from sklearn.metrics import silhouette_score

iris = load_iris()
for k in range(2, 6):
    km = KMeans(n_clusters=k, n_init=10, random_state=123).fit(iris.data)
    score = silhouette_score(iris.data, km.labels_)
    print(k, round(float(score), 3))`,
      output: {
        kind: 'text',
        lines: ['2 0.681', '3 0.553', '4 0.498', '5 0.489'],
      },
      model: {
        kind: 'bars',
        items: [
          { label: 'k=2', value: 0.681, tone: 'up' },
          { label: 'k=3', value: 0.553 },
          { label: 'k=4', value: 0.498 },
          { label: 'k=5', value: 0.489 },
        ],
        max: 0.75,
        caption: '轮廓系数在 k=2 最高，但 iris 真实是 3 类——指标只是参考',
      },
      tip: '轮廓系数偏爱「分得开」的少簇，遇到细长簇或密度差异大时会低估。别只看一个指标下结论。',
    },
    {
      title: 'CH 指数：另一个视角',
      en: 'CALINSKI',
      subtitle: '簇间方差 ÷ 簇内方差，越大越好',
      stage: 'eval',
      body: [
        'Calinski-Harabasz 指数等于「簇间离散度 / 簇内离散度 × 系数」，越大表示簇越分开、簇内越紧凑。它和轮廓系数常常给出不同答案。',
        'iris 上轮廓系数说 k=2 最好，CH 指数却说 k=3 最好——而真实标签就是 3 类。这说明评估指标只能辅助，最终还是要结合业务与领域知识判断。',
      ],
      code: `from sklearn.cluster import KMeans
from sklearn.datasets import load_iris
from sklearn.metrics import calinski_harabasz_score

iris = load_iris()
for k in range(2, 6):
    km = KMeans(n_clusters=k, n_init=10, random_state=123).fit(iris.data)
    score = calinski_harabasz_score(iris.data, km.labels_)
    print(k, round(float(score), 1))`,
      output: { kind: 'text', lines: ['2 513.9', '3 561.6', '4 530.8', '5 495.5'] },
      model: {
        kind: 'bars',
        items: [
          { label: 'k=2', value: 513.9 },
          { label: 'k=3', value: 561.6, tone: 'up' },
          { label: 'k=4', value: 530.8 },
          { label: 'k=5', value: 495.5 },
        ],
        max: 600,
        caption: 'CH 指数在 k=3 最高，与真实类别数一致',
      },
    },
  ],
}

export const mlRegWorkflow: Workflow = {
  id: 'ml-reg',
  name: '线性回归',
  en: 'LINEAR REGRESSION',
  subtitle: '用一条直线概括趋势，再用误差检验它',
  category: 'ml',
  description:
    '线性回归是最小化残差平方和的那条线：`L = Σ(y - (wx+b))²`。这一章先看单特征拟合的直观，再换到多特征、读系数、最后用 RMSE / MAE / R² 三个指标判断它到底能不能用。',
  canvasKind: 'model',
  stages: [
    { key: 'fit', zh: '拟合', en: 'FIT' },
    { key: 'read', zh: '读数', en: 'READ' },
    { key: 'eval', zh: '评估', en: 'EVAL' },
  ],
  imports: 'from sklearn.datasets import load_diabetes\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error, mean_absolute_error',
  attrs: [
    { label: '阶段', value: '从散点到模型' },
    { label: '核心模型', value: 'LinearRegression' },
    { label: '目标', value: '最小化残差平方和' },
    { label: '输出', value: 'coef_ · intercept_' },
    { label: '评估', value: 'R² · RMSE · MAE' },
    { label: '参考', value: 'scikit-learn.org/stable/modules/linear_model' },
  ],
  steps: [
    {
      title: '一条线穿过散点',
      en: 'LEAST SQUARES',
      subtitle: '让所有点的垂直距离平方和最小',
      stage: 'fit',
      body: [
        '只有一个特征时，模型就是 `y = w·x + b`。最小二乘法通过求导并令导数为零，直接算出使残差平方和最小的 w 和 b，不需要迭代。',
        '这里只取 diabetes 数据集的 bmi 这一列做演示：斜率 958.96 表示 bmi 每上升 1 个标准化单位，目标值平均上升约 959。',
      ],
      code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

d = load_diabetes()
X = d.data[:, 2].reshape(-1, 1)          # 只取 bmi 这一列
X_train, X_test, y_train, y_test = train_test_split(
    X, d.target, test_size=0.3, random_state=123)
lr = LinearRegression().fit(X_train, y_train)
print(round(float(lr.coef_[0]), 2))
print(round(float(lr.intercept_), 2))
print(round(lr.score(X_test, y_test), 3))`,
      output: { kind: 'text', lines: ['958.96', '153.35', '0.308'] },
      model: {
        kind: 'scatter',
        groups: [{ label: '样本', points: BMI_LINE }],
        line: { a: 153.35, b: 958.96 },
        axes: [-0.1, 0.09, 40, 280],
        xLabel: 'bmi（标准化后）',
        yLabel: 'target',
        caption: '一条直线概括趋势：斜率 958.96，截距 153.35，单特征 R² 只有 0.308',
      },
    },
    {
      title: '换成十个特征',
      en: 'MULTI FEATURE',
      subtitle: 'coef_ 变成向量，逻辑不变',
      stage: 'fit',
      body: [
        '把全部 10 个特征喂进去，模型还是那个模型，只是 w 变成了长度 10 的向量。`fit` 内部解的是正规方程，一次算完。',
        '这时候 R² 从 0.308 升到 0.508——多给了 9 个特征，解释力才翻了一倍不到。这也说明 diabetes 这个数据集本身噪声很大，别指望线性模型做到 0.9。',
      ],
      code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

d = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(
    d.data, d.target, test_size=0.3, random_state=123)
lr = LinearRegression().fit(X_train, y_train)
print(round(lr.score(X_train, y_train), 3))
print(round(lr.score(X_test, y_test), 3))
print(len(lr.coef_))`,
      output: { kind: 'text', lines: ['0.517', '0.508', '10'] },
      model: {
        kind: 'metrics',
        items: [
          { label: '训练集 R²', value: '0.517' },
          { label: '测试集 R²', value: '0.508', tone: 'good', hint: '与训练几乎持平' },
          { label: '特征数', value: '10' },
          { label: '样本数', value: '442' },
        ],
        caption: '训练与测试 R² 几乎一样 → 没有过拟合，是模型容量不够',
      },
    },
    {
      title: '读系数：谁在推动结果',
      en: 'COEFFICIENTS',
      subtitle: '标准化之后，系数绝对值可比',
      stage: 'read',
      body: [
        '`coef_` 是每个特征的权重，正号表示正相关，负号表示负相关，绝对值越大影响越强。前提是特征已经标准化，否则量纲不同没法比。',
        '这里 s1 的系数是 -855.2，绝对值最大，说明它是最强的负向因素；bmi 是 +538.9，正向推动。但系数大不等于因果，只说明在这份数据里相关性强。',
        '排完序还会看到一条明显的分界：前 5 个特征的绝对值都在 300 以上，后 5 个掉到 300 以下。这就是「少数特征主导结果」的样子，也是后面做特征筛选的依据。',
      ],
      code: `from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

d = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(
    d.data, d.target, test_size=0.3, random_state=123)
lr = LinearRegression().fit(X_train, y_train)
for name, w in sorted(zip(d.feature_names, lr.coef_), key=lambda t: -abs(t[1])):
    print(name, round(float(w), 1))`,
      output: {
        kind: 'text',
        lines: [
          's1 -855.2',
          's5 684.1',
          'bmi 538.9',
          's2 472.2',
          's4 309.9',
          'bp 280.7',
          'sex -261.2',
          's3 166.5',
          's6 102.4',
          'age 10.5',
        ],
      },
      model: {
        kind: 'bars',
        items: [
          { label: 's1  −855.2', value: 855.2, tone: 'down' },
          { label: 's5  +684.1', value: 684.1, tone: 'up' },
          { label: 'bmi  +538.9', value: 538.9, tone: 'up' },
          { label: 's2  +472.2', value: 472.2, tone: 'up' },
          { label: 's4  +309.9', value: 309.9, tone: 'up' },
        ],
        max: 900,
        caption: '按系数绝对值排序，条长表示影响强度，符号看标签',
      },
    },
    {
      title: '三个误差指标',
      en: 'RMSE / MAE / R²',
      subtitle: '同一份预测，三种问法',
      stage: 'eval',
      body: [
        'RMSE 对误差平方后再开方，量纲和 y 一致，对大误差更敏感；MAE 是绝对误差平均，更抗离群点；R² 是「解释了多少方差」，1 最好、0 等于只猜均值。',
        '这三个数必须一起看：RMSE 54 对比 y 的量级（25~346）不算小，R² 0.508 也印证了「只解释了一半」。报告里只写 R² 是很不负责的做法。',
      ],
      code: `import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error

d = load_diabetes()
X_train, X_test, y_train, y_test = train_test_split(
    d.data, d.target, test_size=0.3, random_state=123)
lr = LinearRegression().fit(X_train, y_train)
pred = lr.predict(X_test)
print(round(float(np.sqrt(mean_squared_error(y_test, pred))), 2))
print(round(float(mean_absolute_error(y_test, pred)), 2))
print(round(float(lr.score(X_test, y_test)), 3))`,
      output: { kind: 'text', lines: ['54.1', '44.48', '0.508'] },
      model: {
        kind: 'metrics',
        items: [
          { label: 'RMSE', value: '54.10', hint: '与 y 同量纲，惩罚大误差' },
          { label: 'MAE', value: '44.48', hint: '抗离群点' },
          { label: 'R²', value: '0.508', tone: 'warn', hint: '只解释了一半方差' },
          { label: 'y 范围', value: '25 ~ 346' },
        ],
        caption: '三个指标互相印证：模型抓住了趋势，但个体预测误差仍然不小',
      },
    },
  ],
}

export const mlTreeWorkflow: Workflow = {
  id: 'ml-tree',
  name: '决策树',
  en: 'DECISION TREE',
  subtitle: '一串 if-else，靠信息熵挑分叉点',
  category: 'ml',
  description:
    '决策树把人做判断的过程写成了规则：每次挑一个特征、一个阈值，把数据分成两堆，让分完之后的「混乱程度」下降最多。这一章看熵怎么算、树怎么长、特征重要性怎么读，以及不加限制为什么会过拟合。',
  canvasKind: 'model',
  stages: [
    { key: 'split', zh: '分裂', en: 'SPLIT' },
    { key: 'read', zh: '解读', en: 'READ' },
    { key: 'prune', zh: '剪枝', en: 'PRUNE' },
  ],
  imports: 'from sklearn.datasets import load_wine\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.tree import DecisionTreeClassifier',
  attrs: [
    { label: '阶段', value: '从规则到树' },
    { label: '核心模型', value: 'DecisionTreeClassifier' },
    { label: '分裂准则', value: 'entropy / gini' },
    { label: '输出', value: '一棵 if-then 规则树' },
    { label: '关键参数', value: 'max_depth · min_samples_leaf' },
    { label: '参考', value: 'scikit-learn.org/stable/modules/tree' },
  ],
  steps: [
    {
      title: '熵：混乱程度的度量',
      en: 'ENTROPY',
      subtitle: '两类各一半最乱，全同类最干净',
      stage: 'split',
      body: [
        '熵 `H = -Σ p·log₂p`。两类各占一半时 H=1（最不确定），全是同一类时 H=0（完全确定），三类按 3:1 分布时 H≈0.811。',
        '决策树每次分裂，就是在所有「特征 + 阈值」的组合里找一个让子节点加权熵之和最小的方案，这个下降量叫信息增益。',
      ],
      code: `from math import log2
from collections import Counter


def entropy(labels):
    n = len(labels)
    return -sum((c / n) * log2(c / n) for c in Counter(labels).values())


print(round(entropy(["A", "A", "B", "B"]), 3))
print(round(entropy(["A", "A", "A", "A"]) + 0, 3))
print(round(entropy(["A", "A", "A", "B"]), 3))`,
      output: { kind: 'text', lines: ['1.0', '0.0', '0.811'] },
      model: {
        kind: 'bars',
        items: [
          { label: 'A:A / B:B  对半', value: 1.0, tone: 'down' },
          { label: '全为 A', value: 0.0 },
          { label: '3:1 混合', value: 0.811 },
        ],
        max: 1.1,
        caption: '熵越高越混乱：对半分最乱，纯一类为 0',
      },
      tip: '默认的 `criterion="gini"` 与 entropy 效果接近但不用算 log，速度更快；要看信息增益就显式设成 entropy。',
    },
    {
      title: '长成一棵可读的树',
      en: 'GROW TREE',
      subtitle: '每次分裂都问一个「是/否」问题',
      stage: 'split',
      body: [
        '在 wine 数据集上训练，树的每个内部节点都是一个阈值判断，叶节点给出预测类别。`get_depth()` 是层数，`tree_.node_count` 是节点总数。',
        '限死 `max_depth=2` 时，训练集准确率只有 0.927——限制深度让它在训练集上就已经不完美，这是欠拟合。把 max_depth 去掉再跑一次，训练集会立刻变成 1.0：每个叶子都纯净了，这就是过拟合的开始。',
      ],
      code: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(
    wine.data, wine.target, test_size=0.3, random_state=123)
clf = DecisionTreeClassifier(max_depth=2, criterion="entropy", random_state=123)
clf = clf.fit(X_train, y_train)
print(round(clf.score(X_train, y_train), 3))
print(round(clf.score(X_test, y_test), 3))
print(clf.get_depth(), clf.tree_.node_count)`,
      output: { kind: 'text', lines: ['0.927', '0.889', '2 7'] },
      model: {
        kind: 'tree',
        nodes: [
          { id: 'r', label: 'proline ≤ 755', sub: '信息增益最大', depth: 0, x: 0.5 },
          { id: 'l', label: 'od280 ≤ 2.0', depth: 1, x: 0.25 },
          { id: 'rr', label: 'flavanoids ≤ 2.2', depth: 1, x: 0.75 },
          { id: 'l1', label: 'class 2', depth: 2, x: 0.125, leaf: true },
          { id: 'l2', label: 'class 1', depth: 2, x: 0.375, leaf: true },
          { id: 'r1', label: 'class 2', depth: 2, x: 0.625, leaf: true },
          { id: 'r2', label: 'class 0', depth: 2, x: 0.875, leaf: true },
        ],
        edges: [
          ['r', 'l'],
          ['r', 'rr'],
          ['l', 'l1'],
          ['l', 'l2'],
          ['rr', 'r1'],
          ['rr', 'r2'],
        ],
        caption: 'max_depth=2 的树：7 个节点、3 层，每个分叉都是一个阈值问题',
      },
    },
    {
      title: '特征重要性',
      en: 'IMPORTANCE',
      subtitle: '看每个特征贡献了多少不纯度下降',
      stage: 'read',
      body: [
        '`feature_importances_` 是所有分裂中该特征带来的不纯度下降的加权和，归一化后加起来等于 1。它不是「相关性」，而是「这棵树用了它多少」。',
        'wine 数据上 proline（脯氨酸）贡献 0.413，od280 贡献 0.246，两个特征就占了大半。这类结论可以直接拿去做特征筛选。',
      ],
      code: `import numpy as np
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(
    wine.data, wine.target, test_size=0.3, random_state=123)
clf = DecisionTreeClassifier(criterion="entropy", random_state=123).fit(X_train, y_train)
imp = clf.feature_importances_
for i in np.argsort(imp)[::-1][:5]:
    print(wine.feature_names[i], round(float(imp[i]), 3))`,
      output: {
        kind: 'text',
        lines: [
          'proline 0.413',
          'od280/od315_of_diluted_wines 0.246',
          'flavanoids 0.145',
          'alcalinity_of_ash 0.07',
          'alcohol 0.043',
        ],
      },
      model: {
        kind: 'bars',
        items: [
          { label: 'proline', value: 0.413, tone: 'up' },
          { label: 'od280 / od315', value: 0.246 },
          { label: 'flavanoids', value: 0.145 },
          { label: 'alcalinity of ash', value: 0.07 },
          { label: 'alcohol', value: 0.043 },
        ],
        max: 0.45,
        caption: '前两个特征贡献了 0.66，后面的加起来才 0.34',
      },
      tip: '重要性偏向取值多的连续特征。两个特征高度相关时，重要性会被随机分给其中一个，解读时要谨慎。',
    },
    {
      title: '剪枝：用深度换泛化',
      en: 'PRUNE',
      subtitle: 'max_depth 是最有效的一根刹车',
      stage: 'prune',
      body: [
        '树越深，训练集越准、测试集越差。把 `max_depth` 从 1 试到 5，能看到训练准确率单调上升，测试准确率却在某一层之后开始走平甚至下降。',
        '这次数据上 depth=2 时测试 0.889，depth=5 是 0.926，再往上不涨——说明 5 层左右就够。更稳的做法是交叉验证 + `ccp_alpha` 后剪枝。',
      ],
      code: `from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

wine = load_wine()
X_train, X_test, y_train, y_test = train_test_split(
    wine.data, wine.target, test_size=0.3, random_state=123)
for d in (1, 2, 3, 5, None):
    m = DecisionTreeClassifier(max_depth=d, criterion="entropy",
                               random_state=123).fit(X_train, y_train)
    print(d, round(m.score(X_train, y_train), 3), round(m.score(X_test, y_test), 3))`,
      output: {
        kind: 'text',
        lines: ['1 0.75 0.574', '2 0.927 0.889', '3 0.976 0.87', '5 1.0 0.926', 'None 1.0 0.926'],
      },
      model: {
        kind: 'bars',
        items: [
          { label: 'depth=1  训练 0.750 / 测试 0.574', value: 0.75 },
          { label: 'depth=2  训练 0.927 / 测试 0.889', value: 0.927 },
          { label: 'depth=3  训练 0.976 / 测试 0.870', value: 0.976 },
          { label: 'depth=5  训练 1.000 / 测试 0.926', value: 1.0, tone: 'up' },
          { label: 'depth=None  训练 1.000 / 测试 0.926', value: 1.0, tone: 'up' },
        ],
        max: 1.05,
        caption: '训练准确率（条长）一路到 1.0，测试准确率在 5 层后不再提升',
      },
    },
  ],
}
