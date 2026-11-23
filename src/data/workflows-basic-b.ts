import type { Workflow } from './types'

/* 基础语法 · 第二组：列表 / 元组与集合 / 字典 / 条件分支 */

export const basicListWorkflow: Workflow = {
  id: 'py-list',
  name: '列表',
  en: 'LIST',
  subtitle: '有序、可变，最像数据表的一维结构',
  category: 'container',
  description:
    '列表是 Python 里使用频率最高的容器：有序、可变、什么都能装。数据分析里一列数据、一批订单号、一组标签，底层都是列表。这一章把索引切片、增删改和推导式一次讲清。',
  canvasKind: 'runtime',
  stages: [
    { key: 'build', zh: '创建', en: 'BUILD' },
    { key: 'edit', zh: '操作', en: 'EDIT' },
    { key: 'map', zh: '推导', en: 'MAP' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '一维容器' },
    { label: '核心', value: '有序 · 可变 · 可重复' },
    { label: '复杂度', value: '尾部追加 O(1)，头部插入 O(n)' },
    { label: '关键方法', value: 'append · extend · sort · pop' },
    { label: '参考', value: 'docs.python.org/3/tutorial/datastructures' },
  ],
  steps: [
    {
      title: '创建、索引与切片',
      en: 'CREATE & SLICE',
      subtitle: '规则和字符串完全一致',
      stage: 'build',
      body: [
        '列表用方括号定义，元素之间用逗号分隔，类型可以混装，甚至能嵌套另一个列表。空列表写作 []，也可以用 list() 把字符串、元组、range 转过来。',
        '索引和切片规则跟字符串一模一样：下标从 0 开始，负数从右往左数，切片左闭右开。嵌套列表要用多级下标访问：matrix[1][0]。',
      ],
      code: `temps = [22.5, 24.0, 18.5, 30.1, 27.3]

print(temps[0], temps[-1])
print(temps[0:3])
print(temps[::-1])
print(len(temps), max(temps), min(temps))

matrix = [[1, 2], [3, 4]]
print(matrix[1][0])`,
      output: {
        kind: 'text',
        lines: [
          '22.5 27.3',
          '[22.5, 24.0, 18.5]',
          '[27.3, 30.1, 18.5, 24.0, 22.5]',
          '5 30.1 18.5',
          '3',
        ],
      },
      memory: [
        { name: 'temps', value: '[22.5, 24.0, 18.5, 30.1, 27.3]', type: 'list' },
        { name: 'matrix', value: '[[1, 2], [3, 4]]', type: 'list' },
      ],
      tip: '切片返回的是新列表，改它不会影响原列表。但 list2 = list1 是同一个对象，改一个另一个也变 —— 这是新手最常踩的坑。',
    },
    {
      title: '增删改：append 与它的朋友们',
      en: 'ADD & REMOVE',
      subtitle: '尾部追加、按值删除、按下标弹出',
      stage: 'edit',
      body: [
        'append 在末尾加一个元素，extend 把一个可迭代对象拆开逐个加入，insert 在指定位置插入。三者的区别在「加一个」还是「加一批」。',
        '删除有三套：remove(值) 删第一个匹配项，值不存在会报错；pop(下标) 删除并返回该元素；del 直接按位置删。改元素直接赋值即可：orders[0] = "ORD-9"。',
      ],
      code: `orders = ["ORD-1", "ORD-2"]
orders.append("ORD-3")
orders.insert(0, "ORD-0")
orders.extend(["ORD-4", "ORD-5"])
print(orders)

orders.remove("ORD-2")
last = orders.pop()
print(orders, last)

del orders[0]
orders[1] = "ORD-99"
print(orders)`,
      output: {
        kind: 'text',
        lines: [
          "['ORD-0', 'ORD-1', 'ORD-2', 'ORD-3', 'ORD-4', 'ORD-5']",
          "['ORD-0', 'ORD-1', 'ORD-3', 'ORD-4'] ORD-5",
          "['ORD-1', 'ORD-99', 'ORD-4']",
        ],
      },
      memory: [
        { name: 'orders', value: "['ORD-1', 'ORD-99', 'ORD-4']", type: 'list', highlight: true },
        { name: 'last', value: '"ORD-5"', type: 'str' },
      ],
      tip: 'append 加列表会变成嵌套：a.append([1,2]) 得到 [[1,2]]；想合并用 a.extend([1,2])。',
    },
    {
      title: '排序、统计与查找',
      en: 'SORT & STATS',
      subtitle: 'sort 改自己，sorted 给新的',
      stage: 'edit',
      body: [
        'sort() 原地排序、返回 None，sorted() 返回新列表、原列表不动。两者都支持 reverse=True 和 key=函数，后者是处理字典列表时的关键。',
        '统计类内置函数直接可用：len、sum、max、min。列表自己的 count(值) 数出现次数，index(值) 找首次下标，in 判断是否存在 —— in 的时间复杂度是 O(n)，大数据量要慎用。',
      ],
      code: `sales = [128, 96, 210, 154]

print(sorted(sales))
print(sorted(sales, reverse=True))
print(sum(sales), sum(sales) / len(sales))
print(sales.count(128), sales.index(210))

sales.sort()
print(sales)

rows = [{"city": "杭州", "n": 128}, {"city": "上海", "n": 96}]
rows.sort(key=lambda r: r["n"], reverse=True)
print(rows[0]["city"])`,
      output: {
        kind: 'text',
        lines: [
          '[96, 128, 154, 210]',
          '[210, 154, 128, 96]',
          '588 147.0',
          '1 2',
          '[96, 128, 154, 210]',
          '杭州',
        ],
      },
      memory: [
        { name: 'sales', value: '[96, 128, 154, 210]', type: 'list', highlight: true },
        { name: 'rows', value: '2 条字典', type: 'list' },
      ],
      tip: 'sorted 返回 None 的写法很常见：x = sales.sort() 之后 x 是 None，不是排序结果。',
    },
    {
      title: '列表推导式',
      en: 'COMPREHENSION',
      subtitle: '一行完成筛选与映射',
      stage: 'map',
      body: [
        '推导式的结构是 [表达式 for 变量 in 可迭代对象 if 条件]，读作「对每个元素做点什么，符合条件的才保留」。它比 for 循环加 append 更短，也更快。',
        '数据分析里的列变换几乎都能用它表达：单位换算、取对数、按阈值过滤。但超过两层嵌套就该换回普通循环，可读性比短更重要。',
      ],
      code: `sales = [128, 96, 210, 154]

doubled = [x * 2 for x in sales]
big = [x for x in sales if x > 150]
labels = [f"#{i + 1}:{v}" for i, v in enumerate(sales)]

print(doubled)
print(big)
print(labels)
print(sum(big) / len(big))`,
      output: {
        kind: 'text',
        lines: [
          '[256, 192, 420, 308]',
          '[210, 154]',
          "['#1:128', '#2:96', '#3:210', '#4:154']",
          '182.0',
        ],
      },
      memory: [
        { name: 'sales', value: '[128, 96, 210, 154]', type: 'list' },
        { name: 'doubled', value: '[256, 192, 420, 308]', type: 'list' },
        { name: 'big', value: '[210, 154]', type: 'list', highlight: true },
        { name: 'labels', value: '4 个字符串', type: 'list' },
      ],
      tip: '推导式里的 if 是筛选（元素留不留），写在 for 前面的是表达式，写在 for 后面的是条件，顺序写反会直接语法错误。',
    },
  ],
}

export const basicTupleSetWorkflow: Workflow = {
  id: 'py-tuple-set',
  name: '元组与集合',
  en: 'TUPLE & SET',
  subtitle: '不可变序列，与天然去重的容器',
  category: 'container',
  description:
    '元组是「写完就不许动」的列表，适合放坐标、配置、函数返回值；集合是「没有顺序、绝不重复」的容器，最适合去重和做交并差。两者都比列表更省内存。',
  canvasKind: 'runtime',
  stages: [
    { key: 'lock', zh: '不可变', en: 'LOCK' },
    { key: 'unique', zh: '去重', en: 'UNIQUE' },
    { key: 'setop', zh: '集合运算', en: 'SETOP' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '容器进阶' },
    { label: '核心', value: '不可变 · 唯一 · 无序' },
    { label: '典型用途', value: '坐标 / 返回值 / 标签去重' },
    { label: '关键方法', value: 'count · index · add · union' },
    { label: '参考', value: 'docs.python.org/3/tutorial/datastructures#sets' },
  ],
  steps: [
    {
      title: '元组：不可变的序列',
      en: 'IMMUTABLE',
      subtitle: '创建、访问、解包',
      stage: 'lock',
      body: [
        '元组用圆括号定义，元素不能增删改。单元素元组必须带逗号：(1,)，否则 (1) 只是一个加了括号的整数。不可变带来两个好处：可以当字典的键，传递时不用担心被别人改坏。',
        '解包是元组最好用的地方：city, code = ("杭州", 310000) 一次赋两个变量。函数返回多个值，本质也是返回一个元组。',
      ],
      code: `point = (120.15, 30.28)
city, code = ("杭州", 310000)

print(point[1])
print(city, code)

try:
    point[0] = 0
except TypeError as e:
    print("TypeError:", e)

single = (1,)
print(type(single), single)`,
      output: {
        kind: 'text',
        lines: [
          '30.28',
          '杭州 310000',
          "TypeError: 'tuple' object does not support item assignment",
          "<class 'tuple'> (1,)",
        ],
      },
      memory: [
        { name: 'point', value: '(120.15, 30.28)', type: 'tuple' },
        { name: 'city', value: '"杭州"', type: 'str' },
        { name: 'code', value: '310000', type: 'int' },
        { name: 'single', value: '(1,)', type: 'tuple', highlight: true },
      ],
      tip: '元组里如果装了列表，列表本身还是能改的：t = (1, [2]) 之后 t[1].append(3) 合法。所谓不可变只到第一层。',
    },
    {
      title: '集合：天然去重',
      en: 'DEDUPE',
      subtitle: 'set() 与增删',
      stage: 'unique',
      body: [
        '把列表丢进 set() 就完成了去重，因为集合只保留唯一值。代价是顺序会丢：集合不记录插入顺序，想稳定输出要先 sorted()。',
        '增删用 add(单个)、update(多个)、discard(不存在不报错)、remove(不存在会报错)。创建空集合必须用 set()，因为 {} 是空字典。',
      ],
      code: `raw_tags = ["Python", "编程", "数据分析", "Python", "机器学习", "编程"]
tags = set(raw_tags)

print(len(raw_tags), len(tags))
print(sorted(tags))

tags.add("人工智能")
tags.discard("编程")
print(len(tags), sorted(tags))`,
      output: {
        kind: 'text',
        lines: [
          '6 4',
          "['Python', '数据分析', '机器学习', '编程']",
          "4 ['Python', '人工智能', '数据分析', '机器学习']",
        ],
      },
      memory: [
        { name: 'raw_tags', value: '6 个字符串', type: 'list' },
        { name: 'tags', value: '{Python, 人工智能, 数据分析, 机器学习}', type: 'set', highlight: true },
      ],
      tip: '集合元素必须可哈希，列表和字典不能放进去。要去重一组列表，得先转成元组。',
    },
    {
      title: '交集、并集、差集',
      en: 'SET ALGEBRA',
      subtitle: '用运算符表达集合关系',
      stage: 'setop',
      body: [
        '& 取交集（两边都有），| 取并集（合并去重），- 取差集（在 A 不在 B），^ 取对称差（只在一方出现）。这些运算在比较两批用户、两期标签、两份名单时非常顺手。',
        '对应的方法名是 intersection / union / difference / symmetric_difference。运算符写法更短，方法写法能接受任意可迭代对象，按场景选。',
      ],
      code: `user_a = {"音乐", "电影", "编程"}
user_b = {"编程", "旅行", "美食"}

print(sorted(user_a & user_b))
print(len(user_a | user_b))
print(sorted(user_a - user_b))
print(sorted(user_a ^ user_b))
print(user_a.issubset({"音乐", "电影", "编程", "阅读"}))`,
      output: {
        kind: 'text',
        lines: [
          "['编程']",
          '5',
          "['电影', '音乐']",
          "['旅行', '电影', '美食', '音乐']",
          'True',
        ],
      },
      memory: [
        { name: 'user_a', value: '{音乐, 电影, 编程}', type: 'set' },
        { name: 'user_b', value: '{编程, 旅行, 美食}', type: 'set' },
        { name: 'user_a & user_b', value: '{编程}', type: 'set', highlight: true },
      ],
      tip: '用集合做成员判断比列表快得多：x in big_set 平均是 O(1)，x in big_list 是 O(n)。数据量大时把候选集转成 set 能快几个数量级。',
    },
  ],
}

export const basicDictWorkflow: Workflow = {
  id: 'py-dict',
  name: '字典',
  en: 'DICT',
  subtitle: '按键取值，最接近一条记录的结构',
  category: 'container',
  description:
    '字典存的是键值对，用名字而不是序号找东西。一行 Excel 记录、一条 JSON、一个接口返回，进到 Python 里几乎都是字典。这一章讲清取值、增删、遍历和嵌套访问。',
  canvasKind: 'runtime',
  stages: [
    { key: 'build', zh: '建表', en: 'BUILD' },
    { key: 'get', zh: '取值', en: 'GET' },
    { key: 'loop', zh: '遍历', en: 'LOOP' },
  ],
  imports: 'import json',
  attrs: [
    { label: '阶段', value: '键值容器' },
    { label: '核心', value: '键唯一 · 3.7+ 保持插入顺序' },
    { label: '典型用途', value: '一条记录 / JSON / 配置' },
    { label: '关键方法', value: 'get · items · update · pop' },
    { label: '参考', value: 'docs.python.org/3/library/stdtypes#mapping-types' },
  ],
  steps: [
    {
      title: '键值对与取值',
      en: 'KEY VALUE',
      subtitle: '[] 与 get 的区别',
      stage: 'build',
      body: [
        '字典用花括号定义，每项是 键: 值。键必须唯一且可哈希，通常是字符串或数字；值可以是任何对象，包括另一个字典。',
        '取值有两种：d["key"] 直接取，键不存在会抛 KeyError；d.get("key", 默认值) 取不到时返回默认值，不会中断程序。处理外部数据时优先用 get。',
      ],
      code: `student = {
    "id": "S001",
    "name": "张三",
    "scores": {"数学": 90, "英语": 85},
}

print(student["name"])
print(student["scores"]["数学"])
print(student.get("age", "字段不存在"))
print(len(student))`,
      output: {
        kind: 'text',
        lines: ['张三', '90', '字段不存在', '3'],
      },
      memory: [
        { name: 'student', value: '{id, name, scores}', type: 'dict', highlight: true },
        { name: 'student["scores"]', value: "{数学: 90, 英语: 85}", type: 'dict' },
      ],
      tip: '用 get 时注意默认值不要写成 None 再参与运算，否则后面会变成 TypeError：None + 1。',
    },
    {
      title: '增、改、删',
      en: 'UPDATE & DELETE',
      subtitle: '赋值即新增，update 批量合并',
      stage: 'build',
      body: [
        '给一个不存在的键赋值就是新增，给已存在的键赋值就是修改 —— 两种操作写法完全一样，这是字典设计上最简洁的地方。',
        'update() 可以一次合并多个键值对，也可以合并另一个字典；pop(key) 删除并返回对应的值；del 直接删；clear 清空。Python 3.9+ 还能用 a | b 合并出新的字典。',
      ],
      code: `student = {"id": "S001", "name": "张三"}
student["class"] = "一班"
student["name"] = "李四"
print(student)

student.update({"teacher": "王老师", "class": "二班"})
print(student)

removed = student.pop("teacher")
print(removed, student)

merged = student | {"grade": 2024}
print(merged)`,
      output: {
        kind: 'text',
        lines: [
          "{'id': 'S001', 'name': '李四', 'class': '一班'}",
          "{'id': 'S001', 'name': '李四', 'class': '二班', 'teacher': '王老师'}",
          "王老师 {'id': 'S001', 'name': '李四', 'class': '二班'}",
          "{'id': 'S001', 'name': '李四', 'class': '二班', 'grade': 2024}",
        ],
      },
      memory: [
        { name: 'student', value: '{id, name, class}', type: 'dict', highlight: true },
        { name: 'removed', value: '"王老师"', type: 'str' },
        { name: 'merged', value: '{id, name, class, grade}', type: 'dict' },
      ],
      tip: '遍历字典的同时增删键会抛 RuntimeError。先 list(d.keys()) 复制一份键列表，再在循环里改。',
    },
    {
      title: '遍历：keys、values、items',
      en: 'ITERATE',
      subtitle: '最常见的是 items',
      stage: 'loop',
      body: [
        '直接 for k in d 拿到的是键；d.values() 给值；d.items() 一次给 (键, 值) 二元组，配合解包写起来最舒服。三个方法返回的都是视图对象，会实时反映字典的变化。',
        '做统计时还有一种常用写法：先 get(key, 0) + 1 累加计数，这正是 collections.Counter 的手写版。',
      ],
      code: `scores = {"数学": 90, "英语": 85, "语文": 78}

for subject in scores:
    print(subject, scores[subject])

for subject, score in scores.items():
    print(f"{subject}: {score}")

print(round(sum(scores.values()) / len(scores), 2))

counter = {}
for word in ["a", "b", "a", "c", "a"]:
    counter[word] = counter.get(word, 0) + 1
print(counter)`,
      output: {
        kind: 'text',
        lines: [
          '数学 90',
          '英语 85',
          '语文 78',
          '数学: 90',
          '英语: 85',
          '语文: 78',
          '84.33',
          "{'a': 3, 'b': 1, 'c': 1}",
        ],
      },
      memory: [
        { name: 'scores', value: '{数学: 90, 英语: 85, 语文: 78}', type: 'dict' },
        { name: 'counter', value: "{'a': 3, 'b': 1, 'c': 1}", type: 'dict', highlight: true },
      ],
      tip: '遍历顺序就是插入顺序（3.7+ 的保证）。如果业务依赖固定顺序，别依赖插入顺序，老老实实 sorted(d.items())。',
    },
    {
      title: '嵌套与字典推导式',
      en: 'NESTED & COMPREHENSION',
      subtitle: '两层字典怎么取值，怎么批量造',
      stage: 'loop',
      body: [
        '嵌套字典就是「字典的值又是一个字典」，取值连着写两对方括号即可。层级深了可读性会迅速下降，超过三层建议拆成变量或用 dataclass。',
        '字典推导式 {k: v for ...} 用来批量造字典，从两个列表配对、从一组记录取字段都很方便。',
      ],
      code: `rows = [("杭州", 128), ("上海", 96), ("成都", 154)]

by_city = {city: count for city, count in rows}
print(by_city)
print(max(by_city, key=by_city.get))

report = {
    "华东": {"杭州": 128, "上海": 96},
    "西南": {"成都": 154},
}
print(report["华东"]["上海"])
print(list(report.keys()))
print(sum(report["华东"].values()))`,
      output: {
        kind: 'text',
        lines: [
          "{'杭州': 128, '上海': 96, '成都': 154}",
          '成都',
          '96',
          "['华东', '西南']",
          '224',
        ],
      },
      memory: [
        { name: 'by_city', value: '{杭州: 128, 上海: 96, 成都: 154}', type: 'dict' },
        { name: 'report', value: '{华东: {…}, 西南: {…}}', type: 'dict', highlight: true },
      ],
      tip: 'max(d, key=d.get) 是按值取最大键的惯用法；等价写法是 max(d.items(), key=lambda kv: kv[1])[0]。',
    },
  ],
}

export const basicBranchWorkflow: Workflow = {
  id: 'py-branch',
  name: '条件分支',
  en: 'IF / ELIF / ELSE',
  subtitle: '让程序学会分岔',
  category: 'flow',
  description:
    '条件语句决定「走哪条路」。这一章从最基本的 if 讲起，重点放在三件事：条件的书写顺序、and/or 的短路行为、以及嵌套过深时怎么用卫语句展平。',
  canvasKind: 'runtime',
  stages: [
    { key: 'test', zh: '判断', en: 'TEST' },
    { key: 'path', zh: '分支', en: 'PATH' },
    { key: 'result', zh: '结果', en: 'RESULT' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '控制流' },
    { label: '核心', value: 'if / elif / else' },
    { label: '易错点', value: '缩进 · 条件顺序 · 短路求值' },
    { label: '关键语法', value: 'and · or · not · 链式比较' },
    { label: '参考', value: 'docs.python.org/3/tutorial/controlflow#if-statements' },
  ],
  steps: [
    {
      title: 'if / elif / else 与缩进',
      en: 'BRANCH',
      subtitle: '冒号加缩进，就是 Python 的代码块',
      stage: 'test',
      body: [
        'if 后面跟条件，冒号表示「那么」，紧接着缩进的四格就是属于这个分支的代码块。elif 可以有很多个，else 最多一个。判断自上而下，命中第一个为真的分支后，剩下的全部跳过。',
        '所以顺序很重要：成绩等级必须从高到低写。如果先写 score >= 60，那 95 分也会被归到「及格」里，后面的 elif 永远不会执行。',
      ],
      code: `score = 88

if score >= 90:
    level = "A"
elif score >= 80:
    level = "B"
elif score >= 60:
    level = "C"
else:
    level = "D"

print(f"{score} 分 → {level} 等级")`,
      output: {
        kind: 'text',
        lines: ['88 分 → B 等级'],
      },
      visual: {
        kind: 'flow',
        caption: '自下而上命中第一个为真的分支',
        rows: [
          { label: 'score = 88', kind: 'body' },
          { label: 'score >= 90 ?', kind: 'cond', note: 'False' },
          { label: 'score >= 80 ?', kind: 'cond', note: 'True，命中' },
          { label: 'level = "B"', kind: 'body', note: '执行' },
          { label: 'print(...)', kind: 'exit', note: '输出' },
        ],
        at: 2,
      },
      memory: [
        { name: 'score', value: '88', type: 'int' },
        { name: 'level', value: '"B"', type: 'str', highlight: true },
      ],
      tip: '缩进用 4 个空格，不要混用 Tab。混用会抛 TabError，而且不同编辑器显示宽度不同，看起来对齐了其实没对齐。',
    },
    {
      title: '组合条件与短路求值',
      en: 'BOOLEAN LOGIC',
      subtitle: 'and / or / not 的执行顺序',
      stage: 'path',
      body: [
        'and 要求两边都真，or 只要一边真，not 取反。and/or 是短路的：and 左边为假时右边根本不执行，or 左边为真时右边也不执行。利用这一点可以把「先判空、再取值」写成一行。',
        '优先级是 not > and > or，记不住就加括号。链式比较 18 <= age <= 60 比 age >= 18 and age <= 60 更清楚。',
      ],
      code: `age = 24
has_card = True

if age >= 18 and has_card:
    print("可以办理")
else:
    print("条件不满足")

print(not has_card, 18 <= age <= 60)

# 短路：左边为假，右边不会执行
print(False and 1 / 0)
print(True or 1 / 0)`,
      output: {
        kind: 'text',
        lines: ['可以办理', 'False True', 'False', 'True'],
      },
      visual: {
        kind: 'flow',
        caption: '两个条件同时成立才进入分支',
        rows: [
          { label: 'age >= 18', kind: 'cond', note: 'True' },
          { label: 'has_card', kind: 'cond', note: 'True' },
          { label: 'print("可以办理")', kind: 'body', note: '执行' },
          { label: 'print("条件不满足")', kind: 'exit', note: '跳过' },
        ],
        at: 1,
      },
      memory: [
        { name: 'age', value: '24', type: 'int' },
        { name: 'has_card', value: 'True', type: 'bool' },
      ],
      tip: 'x and y 返回的不一定是布尔值：左边为假时直接返回左边的值。所以 a and b or c 这种写法在 a 为空字符串时会得到 c，容易出 bug。',
    },
    {
      title: '嵌套与卫语句',
      en: 'FLATTEN',
      subtitle: '把深层缩进拆成提前返回',
      stage: 'result',
      body: [
        '判断里再套判断，缩进会越来越深，读起来要一直记住「我还满足哪些条件」。常见做法是把异常情况先处理掉（卫语句），让主流程留在最外层。',
        '函数里用 return 提前退出最自然：先 return 非法情况，再 return 正常结果，后面就不需要 else 了。这段代码等第 10 章学过函数之后，可以改写成三层 if + return，会更容易读。',
      ],
      code: `score = 72

if score < 0 or score > 100:
    print("非法成绩")
else:
    if score >= 90:
        level = "A"
    else:
        if score >= 60:
            level = "B"
        else:
            level = "C"
    print(f"{score} → {level}")`,
      output: {
        kind: 'text',
        lines: ['72 → B'],
      },
      visual: {
        kind: 'flow',
        caption: '嵌套判断：先排除非法值，再逐层细分',
        rows: [
          { label: 'score < 0 or > 100 ?', kind: 'cond', note: 'False' },
          { label: 'score >= 90 ?', kind: 'cond', note: 'False' },
          { label: 'score >= 60 ?', kind: 'cond', note: 'True' },
          { label: 'level = "B"', kind: 'body', note: '执行' },
          { label: 'print(...)', kind: 'exit', note: '输出' },
        ],
        at: 2,
      },
      memory: [
        { name: 'score', value: '72', type: 'int' },
        { name: 'level', value: '"B"', type: 'str', highlight: true },
      ],
      tip: '条件写反是高频 bug：if score < 0 or score > 100 判断的是「非法」，别顺手写成 and —— 一个数不可能同时小于 0 又大于 100。',
    },
  ],
}
