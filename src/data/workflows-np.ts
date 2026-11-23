import type { Workflow } from './types'

/* NumPy 数值计算：数组与索引（3D 场景画布）、运算与统计（运行时画布） */

export const npArrayWorkflow: Workflow = {
  id: 'np-array',
  name: 'NumPy 数组与索引',
  en: 'NDARRAY & INDEXING',
  subtitle: '一块连续内存，一套下标语言',
  category: 'numpy',
  description:
    'NumPy 把一列数字压进一块连续内存，并给你一套统一的下标语言去读写它。这一章先把「数组长什么样」建立起来：怎么造、怎么变形、切片为什么是视图而不是副本、布尔条件怎么一次筛掉半个数组。',
  canvasKind: 'scene',
  stages: [
    { key: 'create', zh: '创建', en: 'CREATE' },
    { key: 'shape', zh: '变形', en: 'RESHAPE' },
    { key: 'index', zh: '取值', en: 'INDEX' },
  ],
  imports: 'import numpy as np',
  attrs: [
    { label: '阶段', value: '从列表到数组' },
    { label: '核心对象', value: 'ndarray' },
    { label: '输入', value: 'Python 序列 / 区间' },
    { label: '输出', value: '同类型元素的内存块' },
    { label: '关键函数', value: 'array · arange · reshape · []' },
    { label: '参考', value: 'numpy.org/doc/stable' },
  ],
  steps: [
    {
      title: '为什么不用 list',
      en: 'WHY NDARRAY',
      subtitle: '一次算术算完整块，而不是逐个循环',
      stage: 'create',
      body: [
        'Python 列表存的是一串指针，每个元素都是独立的对象，循环相加就是逐个取对象、拆箱、再装箱。NumPy 数组存的是一段连续内存，元素类型相同、大小固定，因此「整块相加」可以交给编译好的循环一次跑完。',
        '代价是数组一旦建好，长度和元素类型就固定了。这不是限制，而是它能快一个数量级的原因。',
      ],
      code: `import numpy as np

a = np.arange(6) ** 2      # 0² 1² 2² …
b = np.arange(6) ** 3      # 0³ 1³ 2³ …
print((a + b).tolist())
print(a.dtype, a.shape)`,
      output: { kind: 'text', lines: ['[0, 2, 12, 36, 80, 150]', 'int64 (6,)'] },
      scene: { kind: 'numpy', shape: [6], label: 'shape (6,) · int64', caption: '一维数组：6 个 int64 排成一段连续内存' },
      tip: '判断要不要用 NumPy 的标准很简单：这段计算是不是要重复几十万次？是就用数组，不是就用列表。',
    },
    {
      title: '把序列变成数组',
      en: 'CONSTRUCTORS',
      subtitle: 'array 建形状，arange / linspace 造刻度',
      stage: 'create',
      body: [
        '`np.array()` 接收列表、元组、生成器，按嵌套层级推断维度：一层列表是一维，嵌套一层就是二维。`shape` 就是每一维的长度。',
        '`arange` 按步长数数（左闭右开），`linspace` 按个数等分（默认含终点）。画坐标轴刻度用 `linspace` 更稳，因为你能确定拿到几个点。',
      ],
      code: `import numpy as np

m = np.array([[1, 2, 3], [4, 5, 6]])
print(m.shape, m.ndim, m.size)
print(np.arange(2, 11, 2).tolist())
print(np.linspace(0, 1, 5).tolist())
print(np.zeros((2, 3), dtype=int).tolist())`,
      output: {
        kind: 'text',
        lines: ['(2, 3) 2 6', '[2, 4, 6, 8, 10]', '[0.0, 0.25, 0.5, 0.75, 1.0]', '[[0, 0, 0], [0, 0, 0]]'],
      },
      scene: { kind: 'numpy', shape: [2, 3], label: 'shape (2, 3) · 6 个元素', caption: '二维数组：行 × 列，按行优先铺在内存里' },
    },
    {
      title: '变形与转置',
      en: 'RESHAPE & T',
      subtitle: '元素个数不变，只是换一种下标解释',
      stage: 'shape',
      body: [
        '`reshape` 不搬数据，只改 shape 这个「读数方式」：6 个元素可以读成 2×3，也可以读成 3×2。所以它几乎不花时间。',
        '转置 `.T` 把行和列对调，走的是换轴而不是复制。注意 `itemsize` 是单个元素占的字节数，它决定了这块内存到底多大。',
      ],
      code: `import numpy as np

data = np.arange(1, 7)
m = data.reshape(2, 3)
print(m.tolist())
print(m.T.tolist())
print(m.T.shape, m.size, m.itemsize)`,
      output: {
        kind: 'text',
        lines: ['[[1, 2, 3], [4, 5, 6]]', '[[1, 4], [2, 5], [3, 6]]', '(3, 2) 6 8'],
      },
      scene: { kind: 'numpy', shape: [2, 3], label: 'reshape(2, 3) → T(3, 2)', highlight: [0, 1, 2], caption: '高亮的是第一行，转置后它会变成第一列' },
    },
    {
      title: '切片是视图，不是副本',
      en: 'VIEW VS COPY',
      subtitle: '改子数组会改到原数组，这是最常见的坑',
      stage: 'index',
      body: [
        '基础切片 `a[:3]` 返回的是原数组的一段视图，共享同一块内存。改视图里的元素，原数组立刻跟着变——不是 bug，是为了避免拷贝的设计。',
        '要真正独立就显式复制：`a[:3].copy()`，或者 `np.array(a[:3])`。显式复制花一次内存和一次拷贝时间，换来互不影响。',
      ],
      code: `import numpy as np

a = np.arange(6)
v = a[:3]          # 视图，共享内存
v[0] = 99
print(a.tolist())

c = a[:3].copy()   # 副本，各改各的
c[0] = 0
print(a.tolist(), c.tolist())`,
      output: { kind: 'text', lines: ['[99, 1, 2, 3, 4, 5]', '[99, 1, 2, 3, 4, 5] [0, 1, 2]'] },
      scene: { kind: 'numpy', shape: [6], label: 'a[:3] 视图', highlight: [0, 1, 2], caption: '前三格被视图改成了 99，原数组同步变化' },
      tip: '判断是不是视图：`v.base is a` 为 True 就是视图。要改数据又不想影响原数组，先 `.copy()`。',
    },
    {
      title: '布尔索引',
      en: 'BOOLEAN MASK',
      subtitle: '拿一个同形状的 True/False 数组当筛子',
      stage: 'index',
      body: [
        '`x % 2 == 1` 得到的是同形状的布尔数组，把这个布尔数组塞进方括号，就只取出 True 位置上的元素，结果被压成一维。',
        '布尔索引还能直接赋值：`x[x > 7] = -1` 会把满足条件的位置一次性改掉，不用写循环。条件筛选 + 就地修改，是清洗数据最常用的两招。',
      ],
      code: `import numpy as np

x = np.arange(9).reshape(3, 3)
print(x[x % 2 == 1].tolist())
x[x > 7] = -1
print(x.tolist())`,
      output: { kind: 'text', lines: ['[1, 3, 5, 7]', '[[0, 1, 2], [3, 4, 5], [6, 7, -1]]'] },
      scene: { kind: 'numpy', shape: [3, 3], label: '布尔掩码命中的 4 格', highlight: [1, 3, 5, 7], caption: '奇数的四格被选中；再把 8 改成 -1，就得到最后的结果' },
    },
  ],
}

export const npMathWorkflow: Workflow = {
  id: 'np-math',
  name: 'NumPy 运算与统计',
  en: 'VECTORIZED MATH',
  subtitle: '整块算、按轴塌缩、可复现',
  category: 'numpy',
  description:
    '有了数组，接下来是全站最常写的三种操作：整块运算（含广播）、沿某个轴做聚合、以及把结果存成文本。这三件事写顺了，后面 Pandas 的列运算基本不用重新学。',
  canvasKind: 'runtime',
  stages: [
    { key: 'op', zh: '运算', en: 'OP' },
    { key: 'reduce', zh: '聚合', en: 'REDUCE' },
    { key: 'io', zh: '存取', en: 'IO' },
  ],
  imports: 'import numpy as np',
  attrs: [
    { label: '阶段', value: '从数组到指标' },
    { label: '核心概念', value: '向量化 · 广播 · axis' },
    { label: '输入', value: 'ndarray' },
    { label: '输出', value: 'ndarray / 标量 / 文本' },
    { label: '关键函数', value: 'sum · mean · max · savetxt' },
    { label: '参考', value: 'numpy.org/doc/stable/user/basics.broadcasting' },
  ],
  steps: [
    {
      title: '向量化与广播',
      en: 'BROADCAST',
      subtitle: '形状不同也能算，NumPy 会自动对齐',
      stage: 'op',
      body: [
        '`a * 10` 是对每个元素乘 10，没有循环。`a + [10, 20, 30]` 形状是 2×3 加 3，NumPy 会把这一行「拉伸」成 2 行再逐元素相加，这就是广播。',
        '广播规则只有一条：从最后一维往前比，长度相等或其中一方为 1 就能对齐，否则报错。理解这条规则，很多「形状不匹配」的报错就不再神秘。',
      ],
      code: `import numpy as np

a = np.arange(1, 7).reshape(2, 3)
print((a * 10).tolist())
print((a + np.array([10, 20, 30])).tolist())
print((a + 1).shape)`,
      output: {
        kind: 'text',
        lines: ['[[10, 20, 30], [40, 50, 60]]', '[[11, 22, 33], [14, 25, 36]]', '(2, 3)'],
      },
      memory: [
        { name: 'a', value: '[[1, 2, 3], [4, 5, 6]]', type: 'ndarray' },
        { name: 'row', value: '[10, 20, 30]', type: 'ndarray', highlight: true, note: '被广播成 2 行' },
      ],
      tip: '广播不会真的复制数据，它只是把「同一个值」在计算时重复引用，所以几乎不额外占内存。',
    },
    {
      title: '聚合与 axis',
      en: 'AXIS',
      subtitle: 'axis 不是「方向」，是「被压掉的那一维」',
      stage: 'reduce',
      body: [
        '`a.max(axis=0)` 得到每列的最大值，`axis=1` 得到每行的最大值。记法：axis 指定哪一维，哪一维就在结果里消失，其余维度保留。',
        '所以 3×2 的数组按 axis=0 聚合，结果长度是 2（列数）；按 axis=1 聚合，结果长度是 3（行数）。记住这句，就不用每次试错。',
      ],
      code: `import numpy as np

a = np.array([[1, 5], [2, 3], [4, 6]])
print(a.sum(), a.mean().round(2))
print(a.max(axis=0).tolist())
print(a.max(axis=1).tolist())`,
      output: { kind: 'text', lines: ['21 3.5', '[4, 6]', '[5, 3, 6]'] },
      memory: [
        { name: 'a', value: '[[1, 5], [2, 3], [4, 6]]', type: 'ndarray' },
        { name: 'col_max', value: '[4, 6]', type: 'ndarray', highlight: true, note: 'axis=0，行被压掉' },
        { name: 'row_max', value: '[5, 3, 6]', type: 'ndarray', note: 'axis=1，列被压掉' },
      ],
    },
    {
      title: '随机数与可复现',
      en: 'GENERATOR',
      subtitle: '固定种子，别人才能复现你的结果',
      stage: 'op',
      body: [
        '新写法是 `np.random.default_rng(seed)`：拿到一个生成器对象，再由它派发各种分布。同一个种子必然得到同一串数，这是实验结果可复现的基础。',
        '不要用全局的 `np.random.rand()`——它的状态是全局共享的，任何一处调用都会影响别处。把生成器当成一个普通对象传下去，行为才是可控的。',
      ],
      code: `import numpy as np

rng = np.random.default_rng(42)
print(rng.integers(0, 10, 5).tolist())
print(rng.normal(0, 1, 3).round(3).tolist())
print(np.random.default_rng(42).integers(0, 10, 5).tolist())`,
      output: { kind: 'text', lines: ['[0, 7, 6, 4, 4]', '[0.941, -1.951, -1.302]', '[0, 7, 6, 4, 4]'] },
      memory: [
        { name: 'rng', value: 'Generator(PCG64)', type: 'Generator', highlight: true },
        { name: 'seed', value: '42', type: 'int', note: '同种子 → 同序列' },
      ],
    },
    {
      title: '把数组存成文本',
      en: 'SAVETXT',
      subtitle: 'savetxt 写、loadtxt 读，注意 dtype 与分隔符',
      stage: 'io',
      body: [
        '`savetxt` 按行写、按分隔符分列，`fmt` 决定数字格式；`loadtxt` 反过来读，默认 `dtype=float`，所以整数列读进来也是浮点。',
        '线上文件用文件路径即可，这里用 `io.StringIO` 模拟同一个文件对象，好处是不落地、跑完就干净。',
      ],
      code: `import io
import numpy as np

buf = io.StringIO()
np.savetxt(buf, np.array([[1.5, 2], [3, 4.5]]), delimiter=",", fmt="%.1f")
print(buf.getvalue().strip())
print(np.loadtxt(io.StringIO(buf.getvalue()), delimiter=",").tolist())`,
      output: { kind: 'text', lines: ['1.5,2.0', '3.0,4.5', '[[1.5, 2.0], [3.0, 4.5]]'] },
      memory: [
        { name: 'buf', value: 'StringIO("1.5,2.0\\n3.0,4.5\\n")', type: 'StringIO' },
        { name: 'arr', value: '[[1.5, 2.0], [3.0, 4.5]]', type: 'ndarray', highlight: true },
      ],
      tip: '读整数请显式写 `dtype=int`；有缺失值的文本不要用 loadtxt，直接上 Pandas 的 read_csv 更省事。',
    },
  ],
}
