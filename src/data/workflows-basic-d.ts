import type { Workflow } from './types'

/* 基础语法 · 第四组：类与对象 / 文件读写 / SQL 与 MySQL */

export const basicOopWorkflow: Workflow = {
  id: 'py-oop',
  name: '类与对象',
  en: 'CLASS & OBJECT',
  subtitle: '把数据和操作打包在一起',
  category: 'func',
  description:
    '类描述「一类东西有什么属性、能做什么」，对象是其中的一个具体实例。数据分析里用得最多的是「一条记录变成一个对象」，以及 pandas、sklearn 里到处存在的「先实例化再调用」模式。',
  canvasKind: 'runtime',
  stages: [
    { key: 'class', zh: '类', en: 'CLASS' },
    { key: 'instance', zh: '实例', en: 'INSTANCE' },
    { key: 'extend', zh: '继承', en: 'EXTEND' },
  ],
  imports: '# 无需导入',
  attrs: [
    { label: '阶段', value: '面向对象' },
    { label: '核心', value: 'class · __init__ · self' },
    { label: '易错点', value: '类属性与实例属性混淆' },
    { label: '关键语法', value: 'super · @property · 名称改写' },
    { label: '参考', value: 'docs.python.org/3/tutorial/classes' },
  ],
  steps: [
    {
      title: '类与实例',
      en: 'CLASS & INSTANCE',
      subtitle: '__init__ 负责初始化',
      stage: 'class',
      body: [
        'class 定义一类对象的模板：有哪些属性（数据）、有哪些方法（行为）。Student("张三", 88) 会创建一个实例，并自动调用 __init__ 完成初始化。',
        '类属性写在类里、方法外，所有实例共享一份；实例属性写在 __init__ 里、挂在 self 上，每个实例各有一份。改类属性会影响所有实例，这是新手容易踩的坑。',
      ],
      code: `class Student:
    school = "温州商学院"          # 类属性，所有实例共享

    def __init__(self, name, score):
        self.name = name           # 实例属性
        self.score = score

    def is_pass(self):
        return self.score >= 60

s1 = Student("张三", 88)
s2 = Student("李四", 52)

print(s1.name, s1.score, s1.school)
print(s1.is_pass(), s2.is_pass())
print(Student.school, s1.school is s2.school)`,
      output: {
        kind: 'text',
        lines: ['张三 88 温州商学院', 'True False', '温州商学院 True'],
      },
      memory: [
        { name: 's1', value: 'Student(张三, 88)', type: 'instance', highlight: true },
        { name: 's2', value: 'Student(李四, 52)', type: 'instance' },
        { name: 'Student.school', value: '"温州商学院"', type: 'str', note: '类属性' },
      ],
      tip: '方法第一个参数 self 不是关键字，只是约定俗成的名字。它代表「当前这个实例」，调用时由 Python 自动传入，不用自己写。',
    },
    {
      title: '方法、self 与链式调用',
      en: 'METHODS',
      subtitle: 'return self 让调用串起来',
      stage: 'instance',
      body: [
        '定义在类里的函数叫方法，第一个参数固定是 self。通过实例调用时 s1.is_pass() 等价于 Student.is_pass(s1)，Python 自动把实例传进去。',
        '方法返回 self，就能把多个操作串成一行：c.add().add(3).report()。很多库（包括 pandas）都靠这个风格让代码更紧凑。',
      ],
      code: `class Counter:
    def __init__(self):
        self.count = 0

    def add(self, n=1):
        self.count += n
        return self

    def report(self):
        return f"count={self.count}"

c = Counter()
print(c.add().add(3).report())
print(c.count)
print(Counter.add.__name__, type(c.add).__name__)`,
      output: {
        kind: 'text',
        lines: ['count=4', '4', 'add method'],
      },
      memory: [
        { name: 'c', value: 'Counter(count=4)', type: 'instance', highlight: true },
        { name: 'c.count', value: '4', type: 'int' },
      ],
      tip: 'Counter.add 是普通函数，c.add 是绑定方法：前者能通过类访问，需要手动传 self；后者已经记住了实例。',
    },
    {
      title: '封装与私有属性',
      en: 'ENCAPSULATION',
      subtitle: '双下划线 + @property',
      stage: 'instance',
      body: [
        '属性名前加两个下划线（__balance），Python 会做名称改写，存成 _Account__balance，外部直接 acc.__balance 就取不到了。这只是一种「别乱碰」的约定，不是真正的访问控制。',
        '更实用的做法是用 @property 暴露只读属性，把校验逻辑放进 setter。这样调用方写 acc.balance 就够了，内部怎么存、要不要检查由类自己决定。',
      ],
      code: `class Account:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.__balance = balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("金额必须为正")
        self.__balance += amount
        return self.__balance

    @property
    def balance(self):
        return self.__balance

acc = Account("张三", 100)
print(acc.deposit(50))
print(acc.balance)

try:
    acc.__balance
except AttributeError:
    print("外部无法直接访问 __balance")

print(acc._Account__balance)`,
      output: {
        kind: 'text',
        lines: ['150', '150', '外部无法直接访问 __balance', '150'],
      },
      memory: [
        { name: 'acc', value: 'Account(张三)', type: 'instance' },
        { name: 'acc.__balance', value: '不可见', type: '私有' },
        { name: 'acc._Account__balance', value: '150', type: 'int', highlight: true },
      ],
      tip: '单下划线 _x 是「内部使用」的君子协定；双下划线 __x 会触发名称改写。团队协作里前者更常见，后者留给真正不想被覆盖的名字。',
    },
    {
      title: '继承与多态',
      en: 'INHERITANCE',
      subtitle: 'super() 复用父类，重写改变行为',
      stage: 'extend',
      body: [
        '子类写 class Student(Person) 就继承了父类的全部 属性与方法，再用 super().__init__() 调用父类构造，避免重复代码。',
        '子类可以重写同名方法。把不同子类放进同一个列表，循环调用同一个方法，各自执行各自的版本 —— 这就是多态，也是 pandas、sklearn 里「同一套接口、不同实现」的基础。',
      ],
      code: `class Person:
    def __init__(self, name):
        self.name = name

    def intro(self):
        return f"我是 {self.name}"

class Student(Person):
    def __init__(self, name, grade):
        super().__init__(name)
        self.grade = grade

    def intro(self):
        return f"{super().intro()}，{self.grade} 年级"

people = [Person("张三"), Student("李四", 3)]

for p in people:
    print(p.intro())

print(isinstance(people[1], Person))`,
      output: {
        kind: 'text',
        lines: ['我是 张三', '我是 李四，3 年级', 'True'],
      },
      memory: [
        { name: 'people', value: '[Person, Student]', type: 'list', highlight: true },
        { name: 'people[1].grade', value: '3', type: 'int' },
      ],
      tip: '子类不写 __init__ 时会直接继承父类的；一旦写了，就必须自己调用 super().__init__()，否则父类那部分属性不会初始化。',
    },
  ],
}

export const basicFileWorkflow: Workflow = {
  id: 'py-file',
  name: '文件读写',
  en: 'FILE I/O',
  subtitle: '把数据存下来，再读回去',
  category: 'io',
  description:
    '程序跑完数据就没了，文件是持久化的第一步。这一章讲清 open 的模式与编码、with 为什么必须用，以及 txt / csv / json 三种格式怎么读写 —— 后者正是 pandas.read_csv 的底层。',
  canvasKind: 'runtime',
  stages: [
    { key: 'open', zh: '打开', en: 'OPEN' },
    { key: 'rw', zh: '读写', en: 'READ/WRITE' },
    { key: 'save', zh: '落盘', en: 'SAVE' },
  ],
  imports: 'import csv\nimport json',
  attrs: [
    { label: '阶段', value: '数据持久化' },
    { label: '核心', value: 'open · with · encoding' },
    { label: '易错点', value: '忘记 close · 不写 encoding' },
    { label: '三种格式', value: 'txt · csv · json' },
    { label: '参考', value: 'docs.python.org/3/tutorial/inputoutput#reading-and-writing-files' },
  ],
  steps: [
    {
      title: 'open 与 with',
      en: 'OPEN & WITH',
      subtitle: '模式、编码、自动关闭',
      stage: 'open',
      body: [
        'open(路径, 模式, encoding) 打开文件。模式有 r 读、w 写（清空原内容）、a 追加、x 新建，加 b 表示二进制。不写模式默认是 r，文件不存在会抛 FileNotFoundError。',
        'with 语句会在代码块结束时自动关闭文件，哪怕中途抛了异常。手写 f = open(...) 再 f.close() 一旦忘记，文件句柄就会泄漏。处理文本一定要显式写 encoding="utf-8"，否则在 Windows 上默认 GBK，中文直接乱码。',
      ],
      code: `with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("第一行\\n第二行\\n")

with open("notes.txt", "r", encoding="utf-8") as f:
    text = f.read()

print(repr(text))
print(len(text.splitlines()))
print(f.closed)`,
      output: {
        kind: "text",
        lines: ["'第一行\\n第二行\\n'", '2', 'True'],
      },
      visual: {
        kind: 'file',
        name: 'notes.txt',
        caption: 'with 结束后文件自动关闭',
        lines: ['第一行', '第二行'],
        hl: [0, 1],
      },
      memory: [
        { name: 'text', value: "'第一行\\n第二行\\n'", type: 'str', highlight: true },
        { name: 'f', value: '已关闭', type: 'file' },
      ],
      tip: '用 w 模式打开一个已存在的文件会立刻清空它（还没写就已经空了）。只想追加请用 a 模式。',
    },
    {
      title: '写 txt、csv 与 json',
      en: 'WRITE',
      subtitle: '三种格式，三种写法',
      stage: 'rw',
      body: [
        'txt 直接用 write() 写字符串；csv 用 csv.writer 逐行写列表，newline="" 是为了避免 Windows 下多出空行；json 用 json.dump，ensure_ascii=False 才能保留中文，indent=2 让文件可读。',
        '结构化数据优先选 csv 或 json：csv 适合二维表格，能被 Excel 和 pandas 直接打开；json 适合带层级的数据（接口返回、配置文件）。',
      ],
      code: `import csv
import json

rows = [["城市", "订单"], ["杭州", 128], ["上海", 96]]

with open("sales.csv", "w", newline="", encoding="utf-8") as f:
    csv.writer(f).writerows(rows)

data = {"month": "2024-11", "total": 3728.5}
with open("summary.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(open("sales.csv", encoding="utf-8").read().strip())
print(open("summary.json", encoding="utf-8").read())`,
      output: {
        kind: 'text',
        lines: [
          '城市,订单',
          '杭州,128',
          '上海,96',
          '{',
          '  "month": "2024-11",',
          '  "total": 3728.5',
          '}',
        ],
      },
      visual: {
        kind: 'file',
        name: 'sales.csv',
        caption: '写入后的 CSV 长这样',
        lines: ['城市,订单', '杭州,128', '上海,96'],
        hl: [1, 2],
      },
      memory: [
        { name: 'rows', value: '3 行 × 2 列', type: 'list' },
        { name: 'data', value: '{month, total}', type: 'dict' },
      ],
      tip: 'json.dump 不加 ensure_ascii=False 会把中文写成 \\uXXXX 转义，文件能读但没法看。',
    },
    {
      title: '读：read、readlines、readline',
      en: 'READ',
      subtitle: '整篇读，还是逐行读',
      stage: 'rw',
      body: [
        'read() 一次读完整个文件，返回一个字符串，适合小文件；readlines() 返回按行切好的列表，每行末尾保留换行符；readline() 每次读一行，适合大文件边读边处理。',
        '更 Python 的写法是直接 for line in f：文件对象本身可迭代，逐行读且不会一次性载入内存。处理几十万行的日志时，这个区别很关键。',
      ],
      code: `with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("Fuzhou University\\nXiamen University\\n")

with open("notes.txt", encoding="utf-8") as f:
    print(f.read().splitlines())

with open("notes.txt", encoding="utf-8") as f:
    lines = f.readlines()
print(len(lines), repr(lines[0]))

with open("notes.txt", encoding="utf-8") as f:
    for line in f:
        print(line.strip())`,
      output: {
        kind: 'text',
        lines: [
          "['Fuzhou University', 'Xiamen University']",
          "2 'Fuzhou University\\n'",
          'Fuzhou University',
          'Xiamen University',
        ],
      },
      visual: {
        kind: 'file',
        name: 'notes.txt',
        caption: '两行文本，每行以换行符结束',
        lines: ['Fuzhou University', 'Xiamen University'],
        hl: [0],
      },
      memory: [
        { name: 'lines', value: '2 个字符串', type: 'list' },
        { name: 'line', value: '"Xiamen University\\n"', type: 'str', highlight: true },
      ],
      tip: 'readlines 得到的每行都带 \\n，拿去比较或当键之前记得 .strip()，否则 "杭州\\n" != "杭州"。',
    },
    {
      title: '综合实战：成绩文件',
      en: 'END TO END',
      subtitle: '写进去、读回来、算完再存',
      stage: 'save',
      body: [
        '真实的数据处理就是这条流水线：从文件读入 → 转换成可计算的结构 → 计算 → 结果写回文件。这段代码用 csv.DictReader 把每行变成字典，取字段名而不是下标，比纯列表稳。',
        '注意从 CSV 读回来的值都是字符串，做算术前必须 int() 或 float() 转换 —— 这就是 pandas 帮你自动推断 dtype 的价值所在。',
      ],
      code: `import csv
import json

rows = [
    {"name": "张三", "score": 88},
    {"name": "李四", "score": 92},
    {"name": "王五", "score": 75},
]

with open("scores.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "score"])
    writer.writeheader()
    writer.writerows(rows)

with open("scores.csv", encoding="utf-8") as f:
    data = list(csv.DictReader(f))

avg = sum(int(r["score"]) for r in data) / len(data)
with open("result.json", "w", encoding="utf-8") as f:
    json.dump({"count": len(data), "avg": round(avg, 1)}, f, ensure_ascii=False)

print(open("result.json", encoding="utf-8").read())`,
      output: {
        kind: 'text',
        lines: ['{"count": 3, "avg": 85.0}'],
      },
      visual: {
        kind: 'file',
        name: 'scores.csv → result.json',
        caption: '读入 → 计算 → 落盘',
        lines: ['name,score', '张三,88', '李四,92', '王五,75'],
        hl: [1, 2, 3],
      },
      memory: [
        { name: 'data', value: '3 条字典', type: 'list' },
        { name: 'avg', value: '85.0', type: 'float', highlight: true },
      ],
      tip: 'CSV 里所有值都是字符串，带千分位或空值时要先清洗再转换。真实项目里这一步交给 pandas.read_csv + astype，省事得多。',
    },
  ],
}

export const basicSqlWorkflow: Workflow = {
  id: 'py-sql',
  name: 'SQL 与 MySQL',
  en: 'SQL & MYSQL',
  subtitle: '数据存在库里，用 SQL 取',
  category: 'io',
  description:
    '数据量大到没法塞进内存时，它会待在数据库里。这一章从关系模型讲到建表、增删改查、聚合，最后用 PyMySQL 把查询结果取回 Python —— 也是 pandas.read_sql 的底层。',
  canvasKind: 'runtime',
  stages: [
    { key: 'schema', zh: '建模', en: 'SCHEMA' },
    { key: 'query', zh: '查询', en: 'QUERY' },
    { key: 'connect', zh: '连接', en: 'CONNECT' },
  ],
  imports: 'import pymysql',
  attrs: [
    { label: '阶段', value: '数据存储' },
    { label: '核心', value: '表 · 行 · 列 · 主键' },
    { label: '关键语句', value: 'CREATE · INSERT · SELECT · GROUP BY' },
    { label: '驱动', value: 'pymysql 1.1' },
    { label: '参考', value: 'dev.mysql.com/doc' },
  ],
  steps: [
    {
      title: '关系模型与建表',
      en: 'SCHEMA',
      subtitle: '一张表就是一个二维表',
      stage: 'schema',
      verify: false,
      body: [
        '关系数据库把数据放在表里：一行是一条记录，一列是一个字段，每列都要声明类型（INT、VARCHAR、DATE 等）。主键唯一标识一行，不允许重复和空值。',
        '建表时就要想清楚类型和长度：VARCHAR(10) 存不下 11 个字符的名称，CHAR 定长适合性别这种固定长度字段，日期用 DATE 而不是字符串，后面排序和比较才不会出问题。',
      ],
      code: `CREATE DATABASE school DEFAULT CHARSET utf8mb4;

USE school;

CREATE TABLE student (
    sno   CHAR(5) PRIMARY KEY,
    sname VARCHAR(10) NOT NULL,
    ssex  CHAR(2),
    sage  INT
);

DESC student;`,
      output: {
        kind: 'table',
        caption: 'DESC student 的结果',
        columns: [
          { key: 'field', label: 'Field' },
          { key: 'type', label: 'Type' },
          { key: 'null', label: 'Null' },
          { key: 'key', label: 'Key' },
        ],
        rows: [
          { field: 'sno', type: 'char(5)', null: 'NO', key: 'PRI' },
          { field: 'sname', type: 'varchar(10)', null: 'NO', key: '' },
          { field: 'ssex', type: 'char(2)', null: 'YES', key: '' },
          { field: 'sage', type: 'int', null: 'YES', key: '' },
        ],
      },
      memory: [
        { name: 'student', value: '4 列 × 0 行', type: 'table', highlight: true },
        { name: 'sno', value: 'CHAR(5) PRI', type: 'column' },
        { name: 'sname', value: 'VARCHAR(10)', type: 'column' },
      ],
      tip: '关键字大写、表名字段名小写，是 SQL 最通行的书写风格。虽然 MySQL 不区分大小写，但统一的风格能让语句一眼看懂。',
    },
    {
      title: '增、删、改、查',
      en: 'CRUD',
      subtitle: 'INSERT / UPDATE / DELETE / SELECT',
      stage: 'query',
      verify: false,
      body: [
        'INSERT 插入行，推荐写明列名，这样表结构变动时不会因为顺序错位而写错数据。UPDATE 和 DELETE 一定要带 WHERE，否则会作用于整张表 —— 这是生产环境最经典的事故。',
        'SELECT 是最常用的语句：SELECT 列 FROM 表 WHERE 条件 ORDER BY 排序 LIMIT 条数。执行顺序上先 WHERE 过滤、再排序、最后截断。',
      ],
      code: `INSERT INTO student (sno, sname, ssex, sage)
VALUES ('95001', '张三', '男', 21),
       ('95002', '李四', '女', 20),
       ('95003', '王五', '男', 22);

UPDATE student SET sage = 23 WHERE sno = '95001';

DELETE FROM student WHERE sno = '95003';

SELECT sno, sname, sage FROM student ORDER BY sage DESC;`,
      output: {
        kind: 'table',
        caption: '最后一条 SELECT 的结果',
        columns: [
          { key: 'sno', label: 'sno' },
          { key: 'sname', label: 'sname' },
          { key: 'sage', label: 'sage', align: 'right' },
        ],
        rows: [
          { sno: '95001', sname: '张三', sage: 23 },
          { sno: '95002', sname: '李四', sage: 20 },
        ],
      },
      memory: [
        { name: 'student', value: '2 行', type: 'table', highlight: true },
      ],
      tip: '执行 UPDATE / DELETE 之前，先用同样的 WHERE 写一条 SELECT 看看会命中哪些行。这个习惯能救你很多次。',
    },
    {
      title: '聚合与分组',
      en: 'GROUP BY',
      subtitle: '按维度汇总，再筛结果',
      stage: 'query',
      verify: false,
      body: [
        'COUNT、SUM、AVG、MAX、MIN 把多行压成一个值。配上 GROUP BY 列名，就变成「按这一列分组，每组算一个值」—— 对应 pandas 的 groupby。',
        'WHERE 在分组前过滤行，HAVING 在分组后过滤组，两者不能互换。想筛「平均分大于 80 的班级」，只能用 HAVING。',
      ],
      code: `SELECT ssex,
       COUNT(*)   AS 人数,
       AVG(sage)  AS 平均年龄,
       MAX(sage)  AS 最大年龄
FROM student
GROUP BY ssex
HAVING COUNT(*) >= 2
ORDER BY 人数 DESC;`,
      output: {
        kind: 'table',
        caption: '按性别分组统计',
        columns: [
          { key: 'ssex', label: 'ssex' },
          { key: 'cnt', label: '人数', align: 'right' },
          { key: 'avg', label: '平均年龄', align: 'right' },
          { key: 'max', label: '最大年龄', align: 'right' },
        ],
        rows: [
          { ssex: '男', cnt: 4, avg: 21.75, max: 24 },
          { ssex: '女', cnt: 2, avg: 20.5, max: 21 },
        ],
      },
      memory: [
        { name: 'GROUP BY ssex', value: '2 组', type: 'group' },
        { name: 'COUNT(*)', value: '4 / 2', type: 'agg' },
      ],
      tip: 'SELECT 里的非聚合列必须出现在 GROUP BY 里，否则 MySQL 5.7+ 的严格模式会直接报错，这也顺便帮你避免了不确定的结果。',
    },
    {
      title: 'PyMySQL 连接与查询',
      en: 'CONNECT',
      subtitle: '把结果取回 Python',
      stage: 'connect',
      verify: false,
      body: [
        'pymysql.connect 建立连接，cursor() 拿游标，execute 执行 SQL。查询结果用 fetchall() 拿全部、fetchone() 拿一条，返回的是元组或字典（取决于游标类型）。',
        '拼 SQL 千万不要用字符串拼接，否则就是 SQL 注入的入口：用 %s 占位，把参数作为第二个参数传给 execute，驱动会负责转义。',
      ],
      code: `import pymysql

conn = pymysql.connect(
    host="127.0.0.1",
    user="root",
    password="your-password",
    database="school",
    charset="utf8mb4",
)

try:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT sno, sname FROM student WHERE sage > %s ORDER BY sage",
            (20,),
        )
        for row in cur.fetchall():
            print(row)
finally:
    conn.close()`,
      output: {
        kind: 'text',
        caption: '取决于库里的实际数据',
        lines: ["('95001', '张三')", "('95004', '赵六')"],
      },
      memory: [
        { name: 'conn', value: 'Connection(school)', type: 'connection' },
        { name: 'cur', value: 'Cursor', type: 'cursor' },
        { name: 'row', value: "('95001', '张三')", type: 'tuple', highlight: true },
      ],
      tip: '改数据的语句（INSERT / UPDATE / DELETE）执行完要 conn.commit()，否则连接关闭时会被回滚。查询则不需要。',
    },
  ],
}
