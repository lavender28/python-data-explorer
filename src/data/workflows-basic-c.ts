import type { Workflow } from './types'

/* 基础语法 · 第三组：循环 / 异常 / 函数 / 高阶函数 */

export const basicLoopWorkflow: Workflow = {
  id: 'py-loop',
  name: '循环',
  en: 'FOR / WHILE',
  subtitle: '重复执行，直到该停',
  category: 'flow',
  description:
    '循环解决「同一件事做很多遍」。次数确定用 for，条件驱动用 while。这一章会讲清遍历、range 的边界、break 与 continue 的区别，以及双层循环怎么改写成推导式。',
  canvasKind: 'runtime',
  stages: [
    { key: 'init', zh: '初始化', en: 'INIT' },
    { key: 'iter', zh: '迭代', en: 'ITER' },
    { key: 'exit', zh: '收敛', en: 'EXIT' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '控制流' },
    { label: '核心', value: 'for · while · range' },
    { label: '易错点', value: 'range 右开 · 忘写终止条件' },
    { label: '关键语法', value: 'break · continue · for-else' },
    { label: '参考', value: 'docs.python.org/3/tutorial/controlflow#for-statements' },
  ],
  steps: [
    {
      title: 'for 与 range',
      en: 'FOR LOOP',
      subtitle: '遍历容器，或遍历一串数字',
      stage: 'init',
      body: [
        'for 变量 in 可迭代对象 会把对象里的元素一个个取出来，取完自动结束。列表、字符串、字典、文件对象都能直接遍历，不需要事先知道长度。',
        'range(start, stop, step) 生成一段整数序列，同样是左闭右开：range(3) 是 0、1、2，不包含 3。这是新手最容易多执行一次的地方。',
      ],
      code: `fruits = ["苹果", "香蕉", "橙子"]
for fruit in fruits:
    print(f"我吃了一个{fruit}")

print(" ".join(str(i) for i in range(3)))
print(" ".join(str(i) for i in range(1, 10, 3)))

for i, fruit in enumerate(fruits, start=1):
    print(i, fruit)`,
      output: {
        kind: 'text',
        lines: [
          '我吃了一个苹果',
          '我吃了一个香蕉',
          '我吃了一个橙子',
          '0 1 2',
          '1 4 7',
          '1 苹果',
          '2 香蕉',
          '3 橙子',
        ],
      },
      memory: [
        { name: 'fruits', value: '3 个字符串', type: 'list' },
        { name: 'fruit', value: '"橙子"', type: 'str', highlight: true },
        { name: 'i', value: '3', type: 'int' },
      ],
      tip: '不要在遍历列表的同时删除元素，会漏掉元素。要筛选就生成新列表：[x for x in fruits if x != "香蕉"]。',
    },
    {
      title: 'while 与终止条件',
      en: 'WHILE LOOP',
      subtitle: '条件为真就一直转',
      stage: 'iter',
      body: [
        'while 每轮开始前检查条件，为真就执行循环体。它适合「不知道要转多少次，只知道什么时候该停」的场景，比如累加到某个阈值、等待用户输入正确。',
        '写 while 必须保证循环体里有东西能让条件最终变假，否则就是死循环。调试时如果程序卡住不返回，先怀疑这一点。',
      ],
      code: `count = 0
while count < 3:
    print("当前计数：", count)
    count += 1

total = 0
n = 1
while n <= 100:
    total += n
    n += 1

print("1~100 求和：", total)
print("循环结束时 n =", n)`,
      output: {
        kind: 'text',
        lines: ['当前计数： 0', '当前计数： 1', '当前计数： 2', '1~100 求和： 5050', '循环结束时 n = 101'],
      },
      memory: [
        { name: 'count', value: '3', type: 'int' },
        { name: 'total', value: '5050', type: 'int', highlight: true },
        { name: 'n', value: '101', type: 'int' },
      ],
      tip: 'while True: 是有意的死循环，靠 break 退出。这不算错误，反而是「至少执行一次」的标准写法。',
    },
    {
      title: 'break、continue 与 for-else',
      en: 'BREAK & CONTINUE',
      subtitle: '提前退出，还是跳过这一轮',
      stage: 'exit',
      body: [
        'continue 跳过本轮剩下的代码，直接进入下一轮；break 直接结束整个循环。两者都只影响最近的一层循环。',
        'for/while 可以带一个 else：循环「正常跑完」时执行，被 break 打断时不执行。用来判断「找没找到」很简洁，但可读性有争议，团队里用之前先确认大家熟悉。',
      ],
      code: `nums = [12, 7, 30, 5, 18]

for n in nums:
    if n < 10:
        continue
    print("处理", n)

for n in nums:
    if n == 30:
        print("遇到 30，提前结束")
        break
else:
    print("循环正常结束")

print("存在 7：", 7 in nums)`,
      output: {
        kind: 'text',
        lines: ['处理 12', '处理 30', '处理 18', '遇到 30，提前结束', '存在 7： True'],
      },
      memory: [
        { name: 'nums', value: '[12, 7, 30, 5, 18]', type: 'list', highlight: true },
        { name: 'n', value: '30', type: 'int' },
      ],
      tip: 'break 只能跳出一层。双层循环想一次退出，要么用标志变量，要么把内层抽成函数用 return。',
    },
    {
      title: '嵌套循环与推导式改写',
      en: 'NESTED LOOPS',
      subtitle: '笛卡尔积，以及更快的一行',
      stage: 'exit',
      body: [
        '外层转一圈，内层转一整圈，总共执行 m × n 次 —— 这就是笛卡尔积，生成组合、做交叉汇总时很常见。',
        '绝大多数双层循环都能改写成推导式：[表达式 for a in A for b in B]，读法是从左到右。嵌套三层以上建议拆函数，可读性会更好。',
      ],
      code: `cities = ["杭州", "上海"]
channels = ["线上", "门店"]

for c in cities:
    for ch in channels:
        print(f"{c}-{ch}")

pairs = [(c, ch) for c in cities for ch in channels]
print(len(pairs))

matrix = [[1, 2, 3], [4, 5, 6]]
print([x for row in matrix for x in row])`,
      output: {
        kind: 'text',
        lines: ['杭州-线上', '杭州-门店', '上海-线上', '上海-门店', '4', '[1, 2, 3, 4, 5, 6]'],
      },
      memory: [
        { name: 'cities', value: '2 个字符串', type: 'list' },
        { name: 'pairs', value: "4 个元组", type: 'list', highlight: true },
        { name: 'matrix', value: '[[1, 2, 3], [4, 5, 6]]', type: 'list' },
      ],
      tip: '看着像 O(n) 的双层循环其实是 O(n²)。数据量上千之后，先想能不能用字典把内层查找换成 O(1)。',
    },
  ],
}

export const basicExceptionWorkflow: Workflow = {
  id: 'py-exception',
  name: '异常处理',
  en: 'TRY / EXCEPT',
  subtitle: '程序出错时，别直接崩',
  category: 'flow',
  description:
    '读文件、转类型、连数据库，每一步都可能出错。异常处理让程序在出错时还能给出有用的反馈，而不是丢一屏堆栈。这一章讲结构、讲该捕获什么，也讲什么时候不该捕获。',
  canvasKind: 'runtime',
  stages: [
    { key: 'try', zh: '尝试', en: 'TRY' },
    { key: 'catch', zh: '捕获', en: 'CATCH' },
    { key: 'raise', zh: '抛出', en: 'RAISE' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '健壮性' },
    { label: '核心', value: 'try / except / else / finally' },
    { label: '常见异常', value: 'ValueError · KeyError · FileNotFoundError' },
    { label: '反模式', value: '裸露的 except: pass' },
    { label: '参考', value: 'docs.python.org/3/tutorial/errors' },
  ],
  steps: [
    {
      title: 'try / except 基本结构',
      en: 'BASIC TRY',
      subtitle: '按异常类型分别处理',
      stage: 'try',
      body: [
        '把可能出错的代码放进 try，出错时跳到匹配的 except 分支。except 可以写多个，按类型匹配，命中一个就不再往下走。',
        '关键原则是捕获具体的异常类型，而不是一个裸 except。裸 except 会把 Ctrl+C、拼写错误也一起吞掉，出问题时根本查不到原因。',
      ],
      code: `raw = "12a"

try:
    number = int(raw)
    print(10 / number)
except ValueError:
    print("不是合法数字")
except ZeroDivisionError:
    print("除数不能为零")

raw = "0"
try:
    print(10 / int(raw))
except ZeroDivisionError:
    print("除数不能为零")

print("程序继续往下走")`,
      output: {
        kind: 'text',
        lines: ['不是合法数字', '除数不能为零', '程序继续往下走'],
      },
      memory: [
        { name: 'raw', value: '"0"', type: 'str' },
        { name: 'number', value: '—', type: '未赋值', note: 'int("12a") 失败' },
      ],
      tip: 'except 的顺序要从具体到宽泛：先 ValueError 再 Exception。反过来写，后面的分支永远不会执行。',
    },
    {
      title: 'else 与 finally',
      en: 'ELSE & FINALLY',
      subtitle: '成功之后做什么，无论如何做什么',
      stage: 'catch',
      body: [
        'else 在 try 没有出错时执行，把「成功后的逻辑」和「可能出错的逻辑」分开，try 块就能保持很短。finally 无论成功失败都会执行，用来释放资源。',
        '不过关文件、连数据库更推荐 with 语句，它会自动调用清理逻辑，比手写 finally 更不容易漏。finally 更适合「一定要写日志」「一定要解锁」这类场景。',
      ],
      code: `try:
    f = open("not-exist.txt", "r", encoding="utf-8")
except FileNotFoundError:
    print("找不到文件")
else:
    print("成功打开")
    f.close()
finally:
    print("处理结束，清理资源")

try:
    d = {"a": 1}
    print(d["b"])
except KeyError as e:
    print("KeyError:", e)

print(d.get("b", "用 get 就不会抛"))`,
      output: {
        kind: 'text',
        lines: ['找不到文件', '处理结束，清理资源', "KeyError: 'b'", '用 get 就不会抛'],
      },
      memory: [
        { name: 'd', value: "{'a': 1}", type: 'dict' },
        { name: 'e', value: "'b'", type: 'KeyError' },
      ],
      tip: 'except X as e 里的 e 出了 except 块就会被回收（3.x 的行为），需要留存错误信息就先赋给另一个变量。',
    },
    {
      title: 'raise 与自定义异常',
      en: 'RAISE',
      subtitle: '主动喊停，并且喊得清楚',
      stage: 'raise',
      body: [
        '当检测到不合法的输入，与其让它继续算下去产生错误结果，不如主动 raise 抛错。抛错的位置越靠近问题源头，排查成本越低。',
        '内置异常不够精确时，继承 Exception（或它的子类）定义自己的异常类型。这样调用方可以用 except OutOfRangeError 精确捕获，而不是把所有 ValueError 一网打尽。',
      ],
      code: `class OutOfRangeError(ValueError):
    pass

def check(score):
    if not 0 <= score <= 100:
        raise OutOfRangeError(f"成绩必须在 0~100，收到 {score}")
    return score

for s in (88, 120):
    try:
        print("有效：", check(s))
    except OutOfRangeError as e:
        print("拦截：", e)

print(issubclass(OutOfRangeError, ValueError))`,
      output: {
        kind: 'text',
        lines: ['有效： 88', '拦截： 成绩必须在 0~100，收到 120', 'True'],
      },
      memory: [
        { name: 'OutOfRangeError', value: '<class OutOfRangeError>', type: 'class' },
        { name: 'check', value: '<function check>', type: 'function' },
      ],
      tip: '自定义异常继承 ValueError，意味着别人写 except ValueError 也能兜住它 —— 这通常是想要的效果，除非你希望它必须被单独处理。',
    },
  ],
}

export const basicFunctionWorkflow: Workflow = {
  id: 'py-function',
  name: '函数',
  en: 'FUNCTION',
  subtitle: '把一段逻辑打包，起个名字',
  category: 'func',
  description:
    '函数是代码复用的最小单位：输入参数、内部处理、返回结果。这一章把定义、四类参数、返回值、作用域一次讲完，最后落到「怎么写出别人愿意调用的函数」。',
  canvasKind: 'runtime',
  stages: [
    { key: 'def', zh: '定义', en: 'DEFINE' },
    { key: 'call', zh: '调用', en: 'CALL' },
    { key: 'reuse', zh: '复用', en: 'REUSE' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '代码复用' },
    { label: '核心', value: 'def · 参数 · return' },
    { label: '易错点', value: '默认参数用可变对象' },
    { label: '关键语法', value: '*args · **kwargs · global' },
    { label: '参考', value: 'docs.python.org/3/tutorial/controlflow#defining-functions' },
  ],
  steps: [
    {
      title: '定义、调用与返回',
      en: 'DEFINE',
      subtitle: '没有 return 就返回 None',
      stage: 'def',
      body: [
        'def 定义函数，函数体缩进，调用时写函数名加括号。参数是入口，return 是出口。函数里可以有多条 return，执行到第一条就结束。',
        '如果函数体里没有 return，或者只写了 return，返回的都是 None。print 只是往屏幕输出，不等于返回值 —— 这是初学阶段最常见的混淆。',
      ],
      code: `def greet(name):
    return f"你好，{name}"

print(greet("张三"))
print(greet("李四"))

def show(name):
    print(f"你好，{name}")

result = show("王五")
print("返回值是：", result)`,
      output: {
        kind: 'text',
        lines: ['你好，张三', '你好，李四', '你好，王五', '返回值是： None'],
      },
      visual: {
        kind: 'stack',
        caption: '调用 greet("张三") 时的栈帧',
        frames: [
          { name: 'greet', args: 'name="张三"', at: 2 },
          { name: '<module>', args: '—', at: 5 },
        ],
      },
      memory: [
        { name: 'greet', value: '<function greet>', type: 'function' },
        { name: 'result', value: 'None', type: 'NoneType', highlight: true },
      ],
      tip: '函数名用小写加下划线，动词开头：calc_total、clean_city。看到名字就知道它做什么，比注释有用。',
    },
    {
      title: '四类参数',
      en: 'PARAMETERS',
      subtitle: '位置、关键字、默认、可变',
      stage: 'call',
      body: [
        '位置参数按顺序传；关键字参数写 名字=值，顺序随意；默认参数在定义时给初值，调用时可省略；*args 收集多余的位置参数成元组，**kwargs 收集多余的关键字参数成字典。',
        '定义顺序必须是：位置 → 默认 → *args → 仅关键字 → **kwargs。调试时 print 一下 args 和 kwargs 的类型，比猜更直接。',
      ],
      code: `def order(city, qty, price=29.9, *tags, **extra):
    total = qty * price
    return f"{city} {qty} 件 {total:.2f} 元 tags={tags} extra={extra}"

print(order("杭州", 3))
print(order("上海", 2, 19.9))
print(order("成都", 1, 9.9, "促销", "新品", 渠道="门店"))
print(order(qty=2, city="北京"))`,
      output: {
        kind: 'text',
        lines: [
          '杭州 3 件 89.70 元 tags=() extra={}',
          '上海 2 件 39.80 元 tags=() extra={}',
          "成都 1 件 9.90 元 tags=('促销', '新品') extra={'渠道': '门店'}",
          '北京 2 件 59.80 元 tags=() extra={}',
        ],
      },
      visual: {
        kind: 'stack',
        caption: '每次调用都会新建一帧，局部变量互不干扰',
        frames: [{ name: 'order', args: 'city="北京", qty=2', at: 2 }],
      },
      memory: [
        { name: 'city', value: '"北京"', type: 'str' },
        { name: 'qty', value: '2', type: 'int' },
        { name: 'price', value: '29.9', type: 'float' },
        { name: 'tags', value: '()', type: 'tuple' },
        { name: 'extra', value: '{}', type: 'dict' },
      ],
      tip: '默认参数不要用 [] 或 {}：def add(x, items=[]) 的默认列表只在定义时创建一次，多次调用会共享同一个。用 None 占位再在函数里新建。',
    },
    {
      title: '返回值与多值返回',
      en: 'RETURN VALUES',
      subtitle: '一次返回多个，其实是元组',
      stage: 'call',
      body: [
        'return a, b 看起来返回了两个值，本质是返回元组 (a, b)，调用方可以直接解包成两个变量。这让「统计结果一起返回」写起来很自然。',
        '还要区分「修改传入的列表」和「返回新列表」。函数改了可变参数，调用方是看得见的；如果不想产生副作用，就返回新对象。',
      ],
      code: `def stats(values):
    return min(values), max(values), sum(values) / len(values)

low, high, avg = stats([128, 96, 210])
print(low, high, round(avg, 1))

def bump(values):
    for i in range(len(values)):
        values[i] += 1
    return values

nums = [1, 2, 3]
bumped = bump(nums)
print(bumped, nums)
print(bumped is nums)`,
      output: {
        kind: 'text',
        lines: ['96 210 144.7', '[2, 3, 4] [2, 3, 4]', 'True'],
      },
      memory: [
        { name: 'nums', value: '[2, 3, 4]', type: 'list', highlight: true },
        { name: 'bumped', value: '→ nums', type: 'list', note: '同一个对象' },
        { name: 'avg', value: '144.666…', type: 'float' },
      ],
      tip: '返回多个值时，如果调用方只关心其中一个，用下划线占位：_, high, _ = stats(nums)。',
    },
    {
      title: '作用域：局部与全局',
      en: 'SCOPE',
      subtitle: '函数里的名字活不长',
      stage: 'def',
      body: [
        '函数内部赋值的变量都是局部变量，函数结束就消失，外面看不见。函数可以读全局变量，但一旦在函数里给它赋值，Python 就会认为这是一个新的局部变量。',
        '确实要改全局变量得声明 global，但这是强烈不推荐的做法：改起来方便，查起来痛苦。更好的方式是把它当参数传进去，把结果 return 出来。',
      ],
      code: `total = 0

def add(n):
    total = n          # 这是局部变量，不是外面的 total
    return total

print(add(5), total)

def add_global(n):
    global total
    total += n
    return total

print(add_global(5), total)

def outer():
    x = 10
    def inner():
        return x + 1   # 闭包：能读到外层变量
    return inner()

print(outer())`,
      output: {
        kind: 'text',
        lines: ['5 0', '5 5', '11'],
      },
      memory: [
        { name: 'total', value: '5', type: 'int', note: '模块级' },
        { name: 'x', value: '10', type: 'int', note: 'outer 的局部' },
      ],
      tip: 'UnboundLocalError 基本都出在这里：函数里用了 total += 1 却没声明 global，Python 认为你在读一个还没赋值的局部变量。',
    },
    {
      title: '文档字符串与函数设计',
      en: 'DOCSTRING',
      subtitle: '让别人敢调用你的函数',
      stage: 'reuse',
      body: [
        '函数体第一行的三引号字符串就是文档字符串，help() 和 IDE 的悬浮提示都读它。至少写清三件事：做什么、参数是什么、返回什么。',
        '设计上守住两条：一个函数只做一件事；输入输出类型稳定。返回类型忽而是列表忽而是 None，调用方每次都得判空，这种函数没人愿意用第二遍。',
      ],
      code: `def clean_city(name):
    """去掉两端空格，并统一为「市」结尾。

    参数:
        name: 原始城市名，可能带空格，也可能已经带「市」。
    返回:
        规范化后的城市名（str）。
    """
    name = name.strip()
    return name if name.endswith("市") else name + "市"

print(clean_city(" 杭州 "))
print(clean_city("上海市"))
print(clean_city.__doc__.splitlines()[0])`,
      output: {
        kind: 'text',
        lines: ['杭州市', '上海市', '去掉两端空格，并统一为「市」结尾。'],
      },
      memory: [
        { name: 'clean_city', value: '<function clean_city>', type: 'function' },
      ],
      tip: '写不出文档字符串，通常说明函数做了不止一件事。先把职责拆开，描述自然就出来了。',
    },
  ],
}

export const basicFunctionalWorkflow: Workflow = {
  id: 'py-functional',
  name: '高阶函数与 lambda',
  en: 'HIGHER-ORDER',
  subtitle: '把函数当参数传',
  category: 'func',
  description:
    '函数在 Python 里是普通对象：可以赋值、可以当参数、可以当返回值。理解这一点，map / filter / sorted(key=…) 这些写法就不再神秘，pandas 的 apply 也只是它的延伸。',
  canvasKind: 'runtime',
  stages: [
    { key: 'first', zh: '函数值', en: 'FIRST-CLASS' },
    { key: 'map', zh: '映射', en: 'MAP' },
    { key: 'compose', zh: '组合', en: 'COMPOSE' },
  ],
  imports: 'from functools import reduce',
  attrs: [
    { label: '阶段', value: '函数进阶' },
    { label: '核心', value: '函数是一等公民' },
    { label: '典型用途', value: '批量转换 · 排序 · 聚合' },
    { label: '关键 API', value: 'map · filter · reduce · sorted(key=)' },
    { label: '参考', value: 'docs.python.org/3/howto/functional' },
  ],
  steps: [
    {
      title: '函数是一等公民',
      en: 'FIRST-CLASS',
      subtitle: '能赋值、能传参、能返回',
      stage: 'first',
      body: [
        'def 只是在「把一段代码绑定到一个名字」上，和 x = 1 没有本质区别。所以函数可以赋给另一个变量，可以放进列表，可以作为参数传给另一个函数。',
        '接收函数作为参数、或返回函数的函数，就叫高阶函数。听起来抽象，其实就是「把动作本身也当成数据传进去」。',
      ],
      code: `def double(x):
    return x * 2

f = double
print(f(3))

def apply(func, values):
    return [func(v) for v in values]

print(apply(double, [4, 5]))
print(apply(str.upper, ["a", "b"]))
print(apply(len, ["杭州", "数据分析"]))`,
      output: {
        kind: 'text',
        lines: ['6', '[8, 10]', "['A', 'B']", '[2, 4]'],
      },
      memory: [
        { name: 'double', value: '<function double>', type: 'function' },
        { name: 'f', value: '→ double', type: 'function', note: '同一个函数' },
        { name: 'apply', value: '<function apply>', type: 'function' },
      ],
      tip: '不要把函数和调用结果搞混：apply(double) 传的是函数本身，apply(double()) 传的是 double 执行后的返回值。',
    },
    {
      title: 'map、filter 与 reduce',
      en: 'MAP FILTER REDUCE',
      subtitle: '对一批数据做同一件事',
      stage: 'map',
      body: [
        'map(函数, 序列) 把函数作用到每个元素上，返回迭代器；filter(函数, 序列) 只保留函数返回真的元素；reduce(函数, 序列, 初值) 把序列折叠成一个值。',
        '三者都返回迭代器或单值，要看结果记得 list()。日常写代码时，它们大多可以用推导式替代，而且推导式更快也更好读 —— 但读别人的代码必须认识它们。',
      ],
      code: `nums = [1, 2, 3, 4, 5, 6]

squares = list(map(lambda x: x ** 2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))

print(squares)
print(evens)

from functools import reduce
print(reduce(lambda a, b: a + b, nums))
print(reduce(lambda a, b: a * b, nums, 1))`,
      output: {
        kind: 'text',
        lines: ['[1, 4, 9, 16, 25, 36]', '[2, 4, 6]', '21', '720'],
      },
      memory: [
        { name: 'nums', value: '[1, 2, 3, 4, 5, 6]', type: 'list' },
        { name: 'squares', value: '[1, 4, 9, 16, 25, 36]', type: 'list' },
        { name: 'evens', value: '[2, 4, 6]', type: 'list', highlight: true },
      ],
      tip: 'reduce 在 Python 3 里被移到了 functools，需要显式导入。求和直接用 sum，乘积才需要它。',
    },
    {
      title: 'lambda 与 key 排序',
      en: 'SORT BY KEY',
      subtitle: '一次性小函数的最佳用途',
      stage: 'compose',
      body: [
        'lambda 参数: 表达式 用来临时定义一个匿名函数，只能写一个表达式，不能有语句。它最适合当 key= 或 sorted 的排序依据，用完就扔。',
        'sorted(rows, key=lambda r: r["n"]) 的含义是「按每条记录的 n 字段排序」。key 函数对每个元素调用一次，返回的值用来比较 —— 这就是 pandas sort_values 的底层逻辑。',
      ],
      code: `rows = [
    {"city": "杭州", "n": 128},
    {"city": "上海", "n": 96},
    {"city": "成都", "n": 154},
]

by_n = sorted(rows, key=lambda r: r["n"], reverse=True)
print([r["city"] for r in by_n])

names = ["Bob", "alice", "Cindy"]
print(sorted(names, key=str.lower))
print(sorted(names, key=len))`,
      output: {
        kind: 'text',
        lines: ["['成都', '杭州', '上海']", "['alice', 'Bob', 'Cindy']", "['Bob', 'alice', 'Cindy']"],
      },
      memory: [
        { name: 'rows', value: '3 条字典', type: 'list' },
        { name: 'by_n', value: '排序后的 3 条', type: 'list', highlight: true },
      ],
      tip: '需要多级排序就返回元组：key=lambda r: (r["city"], -r["n"])，先按城市升序、再按数量降序。',
    },
  ],
}
