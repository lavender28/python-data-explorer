import type { Workflow } from './types'

/* 基础语法 · 第一组：起步 / 变量 / 数字与字符串 */

export const basicEnvWorkflow: Workflow = {
  id: 'py-env',
  name: '起步：环境与第一个程序',
  en: 'ENVIRONMENT & FIRST RUN',
  subtitle: '从装解释器到跑通第一行代码',
  category: 'basics',
  description:
    '先把「写代码的地方」和「跑代码的地方」分清楚：解释器负责执行，编辑器负责书写，终端负责启动。这一章走完，你能在自己的机器上运行任意 .py 文件，并且看得懂第一屏报错。',
  canvasKind: 'runtime',
  stages: [
    { key: 'install', zh: '安装', en: 'INSTALL' },
    { key: 'run', zh: '运行', en: 'RUN' },
    { key: 'debug', zh: '调错', en: 'DEBUG' },
  ],
  imports: '# 本章只用到标准库',
  attrs: [
    { label: '阶段', value: '从零到能跑' },
    { label: '核心', value: '解释器 · 编辑器 · 终端' },
    { label: '产出', value: '一个可运行的 .py 文件' },
    { label: '检查点', value: 'python --version 有输出' },
    { label: '参考', value: 'docs.python.org/3/using' },
  ],
  steps: [
    {
      title: '解释器：代码到底被谁执行',
      en: 'INTERPRETER',
      subtitle: '装好 Python，确认版本与路径',
      stage: 'install',
      verify: false,
      body: [
        'Python 是解释型语言：你写的是 .py 文本，真正干活的是解释器。所以「装 Python」装的是解释器，不是编辑器。Windows 安装时务必勾选 Add python.exe to PATH，否则终端里敲 python 会提示找不到命令。',
        '装完先用两条命令自检：python --version 看版本，where python（macOS / Linux 用 which python3）看解释器路径。如果一台机器上装了多个 Python，路径决定了你实际在用哪一个。',
      ],
      code: `import sys
import platform

print(sys.version_info.major, sys.version_info.minor)
print(platform.system())
print(sys.maxsize.bit_length() + 1)`,
      output: {
        kind: 'text',
        caption: 'python first.py 的输出（版本号随你的安装而不同）',
        lines: ['3 12', 'Darwin', '64'],
      },
      memory: [
        { name: 'sys', value: '<module sys>', type: 'module' },
        { name: 'platform', value: '<module platform>', type: 'module' },
      ],
      tip: '一段代码在 A 电脑能跑、B 电脑报错，八成是版本或依赖不同。养成先报版本的习惯：python --version + pip list。',
    },
    {
      title: '包管理与虚拟环境',
      en: 'PACKAGES & VENV',
      subtitle: 'Anaconda、pip 与项目隔离',
      stage: 'install',
      verify: false,
      body: [
        '标准库之外的能力来自第三方包，统一由 pip 安装：pip install pandas。Anaconda 只是把 Python、常用科学计算包和 Jupyter 打包在一起，省掉逐个安装的麻烦，并不是另一门语言。',
        '不同项目常常需要不同版本的包，所以每个项目配一个虚拟环境：python -m venv .venv 创建，激活后再 pip install，依赖就只装在这个项目里，不会互相污染。',
      ],
      code: `import sys

print(sys.prefix)          # 当前环境所在目录
print(sys.path[-1])        # 第三方包的安装位置

# 创建并激活虚拟环境（在终端执行，不是 Python 代码）：
#   python -m venv .venv
#   source .venv/bin/activate      Windows: .venv\\Scripts\\activate
#   pip install pandas`,
      output: {
        kind: 'text',
        caption: '输出的是路径，你的机器上会不一样',
        lines: ['/Users/you/projects/demo/.venv', '/Users/you/projects/demo/.venv/lib/python3.12/site-packages'],
      },
      memory: [
        { name: 'sys.prefix', value: '/…/.venv', type: 'str' },
      ],
      tip: 'Jupyter 里用 !pip install 安装的包属于当前内核，不一定是你在终端里激活的那个环境。装完 import 不到，先用 sys.executable 确认内核用的是哪个解释器。',
    },
    {
      title: '第一个程序：print 与三种运行方式',
      en: 'HELLO WORLD',
      subtitle: '交互模式、脚本、编辑器',
      stage: 'run',
      body: [
        'print() 把值输出到屏幕。它接受多个参数，默认用空格分隔、结尾换行，这两个行为都能改：print(a, b, sep="|", end="")。',
        '同一段代码有三种跑法：终端输入 python 进入交互模式（>>> 提示符，适合试一句）；写进 .py 文件用 python 文件名 运行（适合完整程序）；在 PyCharm / VS Code 里点运行（适合调试）。初学阶段建议直接用编辑器跑文件，报错信息最完整。',
      ],
      code: `print("hello world")
print("订单", 128, "笔", sep=" · ")
print("不换行", end=" ")
print("接在后面")`,
      output: {
        kind: 'text',
        lines: ['hello world', '订单 · 128 · 笔', '不换行 接在后面'],
      },
      memory: [],
      tip: '文件名不要用中文、空格，也不要叫 random.py、json.py 这类和标准库重名的名字，否则 import 会导到自己身上。',
    },
    {
      title: '读懂第一屏报错',
      en: 'READ THE TRACEBACK',
      subtitle: '从下往上读，先看最后一行',
      stage: 'debug',
      body: [
        '报错不可怕，它其实在告诉你三件事：哪个文件、第几行、什么类型的错误。读的顺序是从下往上：最后一行是错误类型和原因，往上找到 File "xxx.py", line N，那一行就是案发地点。',
        '最高频的三种：SyntaxError（语法写错，比如漏冒号）、IndentationError（缩进不一致）、NameError（名字没定义或拼错）。这三类都属于「代码还没跑起来就挂了」，和你写的逻辑无关。',
      ],
      code: `def calc_total(price, count):
    return price * count

print(calc_total(29.9, 4))

try:
    print(calc_total(29.9))
except TypeError as e:
    print("TypeError:", e)

try:
    print(unknown_var)
except NameError as e:
    print("NameError:", e)`,
      output: {
        kind: 'text',
        lines: [
          '119.6',
          "TypeError: calc_total() missing 1 required positional argument: 'count'",
          "NameError: name 'unknown_var' is not defined",
        ],
      },
      memory: [
        { name: 'calc_total', value: '<function calc_total>', type: 'function' },
      ],
      tip: 'PyCharm 里在行号左侧点一下打断点，再用 Debug 运行，程序会停在那一行并列出当时所有变量的值 —— 比到处加 print 高效得多。',
    },
  ],
}

export const basicVarsWorkflow: Workflow = {
  id: 'py-vars',
  name: '变量与输入输出',
  en: 'VARIABLES & I/O',
  subtitle: '名字、类型与格式化输出',
  category: 'basics',
  description:
    '变量是贴在对象上的名字，不是装东西的盒子。理解这一点，才能解释清楚「改了 b 为什么 a 也变了」。这一章还会把 input 和 print 这对出入口彻底讲透。',
  canvasKind: 'runtime',
  stages: [
    { key: 'define', zh: '定义', en: 'DEFINE' },
    { key: 'input', zh: '输入', en: 'INPUT' },
    { key: 'output', zh: '输出', en: 'OUTPUT' },
  ],
  imports: '# 本章只用到内置函数',
  attrs: [
    { label: '阶段', value: '赋值与展示' },
    { label: '核心', value: '引用 · 类型 · 格式化' },
    { label: '输入', value: 'input() 永远是字符串' },
    { label: '输出', value: 'print / f-string' },
    { label: '关键 API', value: 'type · id · int · float · format' },
    { label: '参考', value: 'docs.python.org/3/library/functions' },
  ],
  steps: [
    {
      title: '变量是名字，不是盒子',
      en: 'NAME BINDING',
      subtitle: '赋值不复制对象',
      stage: 'define',
      body: [
        'price = 29.9 的含义是：在内存里造一个浮点对象 29.9，然后把 price 这个名字挂到它身上。之后再给 price 赋一个新值，只是把名字撕下来贴到新对象上，旧对象没人引用就会被回收。',
        '所以 b = a 不会复制列表，它只是给同一个列表多贴了一个名字。想让两个列表互不影响，得显式复制：b = a.copy() 或 b = list(a)。',
      ],
      code: `price = 29.9
print(price, type(price))

price = "29.9"            # 名字没变，指向了新对象
print(price, type(price))

a = [1, 2, 3]
b = a                     # 同一个列表，两个名字
b.append(4)
print(a, a is b)

c = a.copy()              # 真正的副本
c.append(5)
print(a, c)`,
      output: {
        kind: 'text',
        lines: [
          "29.9 <class 'float'>",
          "29.9 <class 'str'>",
          '[1, 2, 3, 4] True',
          '[1, 2, 3, 4] [1, 2, 3, 4, 5]',
        ],
      },
      memory: [
        { name: 'price', value: '"29.9"', type: 'str', highlight: true },
        { name: 'a', value: '[1, 2, 3, 4]', type: 'list' },
        { name: 'b', value: '→ a', type: 'list', note: '同一个对象' },
        { name: 'c', value: '[1, 2, 3, 4, 5]', type: 'list', highlight: true },
      ],
      tip: '判断两个名字是不是同一个对象用 is，判断值是否相等用 ==。列表的 == 会逐项比较，结果常常是 True，但 is 是 False。',
    },
    {
      title: '命名规则与可读性',
      en: 'NAMING',
      subtitle: '合法只是底线，可读才是目的',
      stage: 'define',
      body: [
        '硬规则只有三条：只能用字母、数字、下划线；不能以数字开头；不能是关键字（class、for、None 这些）。大小写敏感，user 和 User 是两个名字。',
        '软规则更影响协作：变量和函数用蛇形 user_name，类用大驼峰 UserProfile，常量全大写 MAX_RETRY。名字要能说出「装的是什么」，total_price 永远好过 tp。',
      ],
      code: `user_name = "张三"
order2 = 2
_total = 0
MAX_RETRY = 3

print(user_name, order2, _total, MAX_RETRY)

# 下面三行都会报错，去掉注释可以自己试：
# 2order = 1          # 不能以数字开头
# user-name = "张三"   # 减号不是合法字符
# class = "一班"       # class 是关键字`,
      output: {
        kind: 'text',
        lines: ['张三 2 0 3'],
      },
      memory: [
        { name: 'user_name', value: '"张三"', type: 'str' },
        { name: 'order2', value: '2', type: 'int' },
        { name: '_total', value: '0', type: 'int' },
        { name: 'MAX_RETRY', value: '3', type: 'int' },
      ],
      tip: '以单下划线开头的名字（_total）是给读代码的人看的约定：这是内部变量，别在外面直接用。Python 不会真的阻止你访问。',
    },
    {
      title: 'input 拿到的永远是字符串',
      en: 'INPUT & CASTING',
      subtitle: '转换、校验，再计算',
      stage: 'input',
      body: [
        'input("提示语") 会暂停程序，把用户敲的一整行原样返回，类型固定是 str。所以拿来做算术之前必须先转换：int() 转整数，float() 转小数。',
        '转换失败会抛 ValueError，所以真实程序里要配合 try 或先做校验。这一步先记住结论：input → 转换 → 再计算，中间少一步就会得到 "1281" 这种字符串拼接的结果。',
      ],
      code: `raw = "128"                 # 相当于 input("订单数：") 的返回值
count = int(raw)            # 字符串 → 整数
price = float("29.9")       # 字符串 → 小数

print(count + 1)
print(price * 2)
print(type(raw), type(count))
print(raw + "1")            # 不转换就是拼接`,
      output: {
        kind: 'text',
        lines: ['129', '59.8', "<class 'str'> <class 'int'>", '1281'],
      },
      memory: [
        { name: 'raw', value: '"128"', type: 'str' },
        { name: 'count', value: '128', type: 'int', highlight: true },
        { name: 'price', value: '29.9', type: 'float' },
      ],
      tip: 'input 里写提示语，不要在 print 之后再 input，否则提示和输入会分成两行，用起来很别扭。',
    },
    {
      title: 'print 与 f-string 格式化',
      en: 'FORMATTING',
      subtitle: '千分位、百分比、对齐',
      stage: 'output',
      body: [
        'f-string 是现在最推荐的拼接方式：在字符串前面加 f，把变量写进花括号里，还能在冒号后面加格式说明符。',
        '常用的三个：{amount:,.2f} 千分位加两位小数，{ratio:.1%} 转百分比，{name:>8} 右对齐占 8 格。做报表时这三个就够用了。',
      ],
      code: `name = "杭州"
orders = 128
amount = 3728.5

print(name, orders, amount)
print(f"{name}：{orders} 单，金额 {amount:,.2f} 元")
print(f"占比 {orders / 1000:.1%}")
print(f"{name:>6}|{orders:<6}|")
print(f"{amount:,.2f}".rjust(20, "."))`,
      output: {
        kind: 'text',
        lines: [
          '杭州 128 3728.5',
          '杭州：128 单，金额 3,728.50 元',
          '占比 12.8%',
          '    杭州|128   |',
          '............3,728.50',
        ],
      },
      memory: [
        { name: 'name', value: '"杭州"', type: 'str' },
        { name: 'orders', value: '128', type: 'int' },
        { name: 'amount', value: '3728.5', type: 'float' },
      ],
      tip: '不要用 + 拼数字和字符串："共 " + 128 会直接报 TypeError。要么两侧都转 str，要么直接用 f-string。',
    },
  ],
}

export const basicNumStrWorkflow: Workflow = {
  id: 'py-num-str',
  name: '数字与字符串',
  en: 'NUMBERS & STRINGS',
  subtitle: '两类最常用的标量类型',
  category: 'basics',
  description:
    '数据分析里 90% 的字段最终都会落到数字或字符串上。这一章从整数、浮点讲到运算符优先级，再把字符串的索引、切片和常用方法过一遍 —— 后面清洗数据时天天要用。',
  canvasKind: 'runtime',
  stages: [
    { key: 'number', zh: '数值', en: 'NUMBER' },
    { key: 'expr', zh: '运算', en: 'EXPR' },
    { key: 'text', zh: '文本', en: 'TEXT' },
  ],
  imports: '# 标准库 math / decimal 可选',
  attrs: [
    { label: '阶段', value: '标量基础' },
    { label: '核心', value: 'int · float · str' },
    { label: '坑点', value: '0.1 + 0.2 != 0.3' },
    { label: '关键方法', value: 'strip · split · join · replace' },
    { label: '参考', value: 'docs.python.org/3/library/stdtypes' },
  ],
  steps: [
    {
      title: 'int 与 float',
      en: 'NUMERIC TYPES',
      subtitle: '整数、浮点，以及 bool 的小秘密',
      stage: 'number',
      body: [
        '整数 int 没有大小上限，多大都能装；浮点 float 是 IEEE 754 双精度，大约 15 位有效数字，超出部分会丢精度。科学计数法 1.2e6 也是 float。',
        'bool 是 int 的子类，True 等于 1、False 等于 0，所以 True + True 的结果是 2。这个特性在求和统计里偶尔有用，但也容易写出看不懂的代码。',
      ],
      code: `count = 128
ratio = 0.325
total = 1.2e6
flag = True

print(type(count), type(ratio))
print(total)
print(isinstance(flag, int), True + True)
print(10 / 3)
print(10 // 3, 10 % 3, 2 ** 10)`,
      output: {
        kind: 'text',
        lines: [
          "<class 'int'> <class 'float'>",
          '1200000.0',
          'True 2',
          '3.3333333333333335',
          '3 1 1024',
        ],
      },
      memory: [
        { name: 'count', value: '128', type: 'int' },
        { name: 'ratio', value: '0.325', type: 'float' },
        { name: 'total', value: '1200000.0', type: 'float' },
        { name: 'flag', value: 'True', type: 'bool' },
      ],
      tip: '除法 / 的结果永远是 float，哪怕能整除：4 / 2 得到 2.0 而不是 2。要整数结果用 //。',
    },
    {
      title: '浮点数为什么算不准',
      en: 'FLOAT PRECISION',
      subtitle: '0.1 + 0.2 不等于 0.3',
      stage: 'number',
      body: [
        '0.1 和 0.2 在二进制里都是无限循环小数，只能存成近似值，相加后误差累积，于是得到 0.30000000000000004，和 0.3 比较自然是 False。',
        '三种处理方式：展示用 round(x, 2)；金额等高精度场景用 decimal.Decimal；判断两个浮点是否相等用 math.isclose(a, b)，不要用 ==。',
      ],
      code: `import math
from decimal import Decimal

print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)
print(round(0.1 + 0.2, 2))
print(Decimal("0.1") + Decimal("0.2"))
print(math.isclose(0.1 + 0.2, 0.3))`,
      output: {
        kind: 'text',
        lines: ['0.30000000000000004', 'False', '0.3', '0.3', 'True'],
      },
      memory: [
        { name: 'math', value: '<module math>', type: 'module' },
        { name: 'Decimal', value: '<class Decimal>', type: 'class' },
      ],
      tip: 'Decimal 要用字符串构造：Decimal("0.1") 精确，Decimal(0.1) 会先把误差带进去。',
    },
    {
      title: '比较与复合赋值',
      en: 'COMPARE & ASSIGN',
      subtitle: '链式比较和 += 家族',
      stage: 'expr',
      body: [
        '比较运算符返回 bool，可以链起来写：0 <= score < 100 等价于 score >= 0 and score < 100，但更短也更清楚。',
        '复合赋值 a += b 是 a = a + b 的简写，-=、*=、/=、//=、%=、**= 同理。做累加、计数时几乎天天用。',
      ],
      code: `a = 10
b = 5

print(a > b, a == b, a != b)
print(0 <= 88 < 100)

a += b
print(a)
a //= 3
print(a)
a **= 2
print(a)`,
      output: {
        kind: 'text',
        lines: ['True False True', 'True', '15', '5', '25'],
      },
      memory: [
        { name: 'a', value: '25', type: 'int', highlight: true },
        { name: 'b', value: '5', type: 'int' },
      ],
      tip: '= 是赋值，== 是比较。写成 if x = 1 会直接语法报错，这算是 Python 帮你挡掉的一类 bug。',
    },
    {
      title: '字符串的索引与切片',
      en: 'INDEX & SLICE',
      subtitle: '左闭右开，负数从右数',
      stage: 'text',
      body: [
        '字符串是一串字符，可以用下标取单个字符，也可以用切片取一段：s[start:stop:step]，包含 start、不包含 stop。省略 start 从头开始，省略 stop 取到末尾，step 为 -1 就是反转。',
        '这套规则对列表、元组完全通用，是 Python 里最值得先记牢的语法之一。处理日期时间字符串时，切片往往比正则更快：log[:10] 直接拿到日期部分。',
      ],
      code: `text = "Python"
print(text[0], text[-1])
print(text[0:3], text[2:])
print(text[::-1], len(text))

log = "2024-11-22 14:30:05"
print(log[:10])
print(log[11:16])
print(log.replace("-", "/"))`,
      output: {
        kind: 'text',
        lines: ['P n', 'Pyt thon', 'nohtyP 6', '2024-11-22', '14:30', '2024/11/22 14:30:05'],
      },
      memory: [
        { name: 'text', value: '"Python"', type: 'str' },
        { name: 'log', value: '"2024-11-22 14:30:05"', type: 'str' },
      ],
      tip: '切片越界不会报错，只会尽量返回：text[0:100] 等价于整个字符串。但用下标访问 text[100] 会抛 IndexError。',
    },
    {
      title: '字符串的清洗三板斧',
      en: 'CLEANING STRINGS',
      subtitle: 'strip、split、join',
      stage: 'text',
      body: [
        '真实数据里的字符串总是带脏东西：前后空格、全角逗号、多余换行。strip() 去首尾空白，split(sep) 按分隔符切成列表，join(iterable) 把列表拼回字符串 —— 这三个方法能解决大部分清洗问题。',
        '注意 split() 不传参数时按任意空白切分并自动丢弃空串，split(",") 则会保留空字段。选错参数是清洗 CSV 时最常见的坑。',
      ],
      code: `raw = "  杭州, 西湖区 ,310000  "
parts = raw.strip().split(",")
print(parts)

city = parts[0].strip()
code = parts[2].strip()
print(f"{city}-{code}")

title = "monthly sales report"
print(title.title())
print("-".join(["2024", "11", "22"]))
print(title.replace("monthly", "季度"))`,
      output: {
        kind: 'text',
        lines: [
          "['杭州', ' 西湖区 ', '310000']",
          '杭州-310000',
          'Monthly Sales Report',
          '2024-11-22',
          '季度 sales report',
        ],
      },
      memory: [
        { name: 'raw', value: '"  杭州, 西湖区 ,310000  "', type: 'str' },
        { name: 'parts', value: "['杭州', ' 西湖区 ', '310000']", type: 'list', highlight: true },
        { name: 'city', value: '"杭州"', type: 'str' },
      ],
      tip: 'strip() 只能去两端。中间的空格要用 replace(" ", "")，或者 split() 之后重新 join。',
    },
  ],
}
