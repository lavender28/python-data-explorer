import type { Workflow } from './types'

/* 网络爬虫：requests 与合规、解析与入库（运行时画布 + 采集中间态） */

const HTML_DOC = `HTML = """<html><body>
<div class="book" id="book-1">
  <h3 class="title">Python编程：从入门到实践</h3>
  <span class="price">89.00</span>
  <em class="rating">9.1</em>
  <a href="/book/1">详情</a>
</div>
<div class="book" id="book-2">
  <h3 class="title">算法导论</h3>
  <span class="price">128.00</span>
  <em class="rating">9.4</em>
  <a href="/book/2">详情</a>
</div>
<div class="book" id="book-3">
  <h3 class="title">机器学习实战</h3>
  <span class="price">69.00</span>
  <em class="rating">8.2</em>
  <a href="/book/3">详情</a>
</div>
</body></html>"""`

const ECHO_SERVER = `import json
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler


class Echo(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"path": self.path,
                           "ua": self.headers.get("User-Agent")}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


_srv = HTTPServer(("127.0.0.1", 8765), Echo)
threading.Thread(target=_srv.serve_forever, daemon=True).start()
BASE = "http://127.0.0.1:8765"`

export const crawlHttpWorkflow: Workflow = {
  id: 'crawl-http',
  name: 'requests 与合规',
  en: 'HTTP & REQUESTS',
  subtitle: '先把请求发对，再谈抓多少',
  category: 'crawl',
  description:
    '爬虫的第一步永远是「这个站允许我怎么拿」。确认 robots 协议之后，剩下的技术问题只有四个：怎么发 GET、怎么伪装请求头、怎么传查询参数、失败了怎么退。这一章的请求都打向一个本地回环服务，不联网也能跑通。',
  canvasKind: 'runtime',
  stages: [
    { key: 'legal', zh: '合规', en: 'LEGAL' },
    { key: 'request', zh: '请求', en: 'REQUEST' },
    { key: 'robust', zh: '健壮', en: 'ROBUST' },
  ],
  imports: 'import requests',
  setup: ECHO_SERVER,
  attrs: [
    { label: '阶段', value: '从合规到稳定抓取' },
    { label: '核心库', value: 'requests' },
    { label: '输入', value: 'URL · headers · params' },
    { label: '输出', value: 'Response 对象' },
    { label: '关键参数', value: 'headers · params · timeout' },
    { label: '参考', value: 'requests.readthedocs.io' },
  ],
  steps: [
    {
      title: '先读 robots 协议',
      en: 'ROBOTS',
      subtitle: '哪些路径允许抓，文件里写得很清楚',
      stage: 'legal',
      body: [
        '`robots.txt` 放在站点根目录，用 `User-agent` + `Allow` / `Disallow` 声明哪些路径可以抓。它没有法律强制力，但无视它是被封 IP 最快的方式，也可能违反站点服务条款。',
        '标准库的 `urllib.robotparser` 直接解析这份文本，`can_fetch` 判断某个 URL 是否允许。上线前把要抓的路径都过一遍，是最低成本的自保。',
      ],
      code: `from urllib.robotparser import RobotFileParser

ROBOTS = """User-agent: *
Disallow: /search
Disallow: /login
Allow: /
"""
rp = RobotFileParser()
rp.parse(ROBOTS.splitlines())
print(rp.can_fetch("*", "https://example.com/books"))
print(rp.can_fetch("*", "https://example.com/login"))`,
      output: { kind: 'text', lines: ['True', 'False'] },
      memory: [
        { name: 'rp', value: 'RobotFileParser', type: 'object' },
        { name: '/books', value: 'True', type: 'bool', highlight: true, note: '允许抓取' },
        { name: '/login', value: 'False', type: 'bool', note: '被 Disallow 拦下' },
      ],
      tip: '除了 robots，还要看服务条款与数据版权。抓别人的评论、图库、付费内容并二次分发，风险不在技术上。',
    },
    {
      title: '发一个 GET 请求',
      en: 'GET',
      subtitle: 'status_code / headers / text / json',
      stage: 'request',
      body: [
        '`requests.get(url)` 返回一个 Response 对象。最常看四个属性：`status_code`（200 才算成功）、`headers`（响应头）、`text`（解码后的文本）、`json()`（把响应体当 JSON 解析）。',
        '这里的 `BASE` 指向本章本地起的回环服务（127.0.0.1:8765），它会把收到的路径原样返回，所以不联网也能看到真实响应。真实项目里把 `BASE` 换成目标网址即可。',
      ],
      code: `import requests

BASE = "http://127.0.0.1:8765"          # 本章的本地回环服务
r = requests.get(f"{BASE}/books", timeout=3)
print(r.status_code, r.json()["path"])
print(r.headers["Content-Type"])
print(r.url.startswith("http://127.0.0.1"))`,
      output: { kind: 'text', lines: ['200 /books', 'application/json', 'True'] },
      memory: [
        { name: 'r', value: 'Response [200]', type: 'Response', highlight: true },
        { name: 'BASE', value: 'http://127.0.0.1:{port}', type: 'str', note: '本地服务' },
      ],
    },
    {
      title: '带上请求头',
      en: 'HEADERS',
      subtitle: '默认 UA 是 python-requests，等于自报家门',
      stage: 'request',
      body: [
        'requests 默认的 `User-Agent` 是 `python-requests/2.x`，很多站点看到这个字符串直接返回 403。补一个正常的浏览器 UA 是最常见的解法。',
        '除了 UA，`Referer`、`Accept-Language`、`Cookie` 也常被检查。注意别把登录态的 Cookie 写死在代码里，那既是安全问题也是封号风险。',
      ],
      code: `import requests

BASE = "http://127.0.0.1:8765"
r = requests.get(f"{BASE}/books", timeout=3)
print(r.json()["ua"])

r2 = requests.get(f"{BASE}/books",
                  headers={"User-Agent": "Mozilla/5.0 bookbot"}, timeout=3)
print(r2.json()["ua"])`,
      output: { kind: 'text', lines: ['python-requests/2.34.2', 'Mozilla/5.0 bookbot'] },
      memory: [
        { name: '默认 UA', value: 'python-requests/2.34.2', type: 'str', note: '直接暴露爬虫身份' },
        { name: '自定义 UA', value: 'Mozilla/5.0 bookbot', type: 'str', highlight: true },
      ],
    },
    {
      title: '查询参数交给 params',
      en: 'PARAMS',
      subtitle: '别手工拼 URL，编码会出问题',
      stage: 'request',
      body: [
        '手写 `?keyword=xxx&page=1` 的麻烦在于中文和特殊字符要自己编码，漏一个 `&` 整个参数就错位。`params` 字典会替你完成 URL 编码。',
        '注意 `r.url` 是最终请求的地址，和原始 URL 可能不同——调试时打印它，就能确认参数有没有被正确拼上。',
      ],
      code: `import requests

BASE = "http://127.0.0.1:8765"
r = requests.get(f"{BASE}/search",
                 params={"keyword": "Python", "page": 2}, timeout=3)
print(r.json()["path"])
print(r.url.split("/search")[1])`,
      output: { kind: 'text', lines: ['/search?keyword=Python&page=2', '?keyword=Python&page=2'] },
      memory: [
        { name: 'params', value: "{'keyword': 'Python', 'page': 2}", type: 'dict' },
        { name: 'r.url', value: '.../search?keyword=Python&page=2', type: 'str', highlight: true },
      ],
      tip: '分页抓取时把 `page` 做成循环变量，比一页页改 URL 安全得多；记得加间隔，别把对方服务器打满。',
    },
    {
      title: '超时与失败',
      en: 'TIMEOUT',
      subtitle: '不设 timeout 的请求可能永远不返回',
      stage: 'robust',
      body: [
        '`timeout=3` 表示连接和读取各最多等 3 秒。不设的话，requests 会一直等下去，整条抓取流水线卡死在一个坏链接上。',
        '抓取循环里必须区分两类异常：`ConnectionError`（连不上，可以重试）、`Timeout`（太慢，重试要加长间隔）、`HTTPError`（4xx/5xx，重试通常没用，该检查 URL 或频率）。',
      ],
      code: `import requests

BASE = "http://127.0.0.1:8765"
try:
    requests.get("http://127.0.0.1:1/", timeout=0.5)
except requests.exceptions.ConnectionError:
    print("ConnectionError")

r = requests.get(f"{BASE}/books", timeout=3)
r.raise_for_status()
print(r.status_code)`,
      output: { kind: 'text', lines: ['ConnectionError', '200'] },
      memory: [
        { name: 'timeout', value: '0.5', type: 'float', note: '秒' },
        { name: 'ConnectionError', value: '端口 1 无人监听', type: 'Exception', highlight: true },
      ],
    },
  ],
}

export const crawlParseWorkflow: Workflow = {
  id: 'crawl-parse',
  name: '解析与入库',
  en: 'XPATH & SOUP',
  subtitle: '从一坨 HTML 里稳定地取出字段',
  category: 'crawl',
  description:
    '拿到 HTML 只是原料，真正的活是从嵌套标签里取出「书名、价格、评分」。正则能凑合，但页面一改结构就废。这一章用同一份 HTML 对比 XPath 与 BeautifulSoup 两种写法，最后落成 CSV。',
  canvasKind: 'runtime',
  stages: [
    { key: 'why', zh: '痛点', en: 'WHY' },
    { key: 'parse', zh: '解析', en: 'PARSE' },
    { key: 'store', zh: '入库', en: 'STORE' },
  ],
  imports: 'from lxml import etree\nfrom bs4 import BeautifulSoup\nimport csv',
  attrs: [
    { label: '阶段', value: '从 HTML 到表格' },
    { label: '核心库', value: 'lxml · BeautifulSoup' },
    { label: '输入', value: 'HTML 字符串' },
    { label: '输出', value: 'list[dict] → CSV' },
    { label: '关键语法', value: '//div[@class] · select()' },
    { label: '参考', value: 'lxml.de/xpathxslt.html' },
  ],
  steps: [
    {
      title: '为什么不用正则',
      en: 'WHY NOT REGEX',
      subtitle: '能跑，但页面一改就碎',
      stage: 'why',
      body: [
        '正则抓 `(.*?)` 在结构规整时确实能出结果，但它不理解 HTML：多一个 class、换一层 div、属性顺序变了，匹配就失效。',
        '更麻烦的是嵌套标签。正则没法表达「这个 div 里的第一个 h3」，只能靠各种前后文约束去猜，越猜越脆。解析库把 HTML 变成树，从树上找节点就没有这个问题。',
      ],
      code: `import re

${HTML_DOC}

titles = re.findall(r'<h3 class="title">(.*?)</h3>', HTML)
print(titles)
print(len(re.findall(r"<div", HTML)))`,
      output: {
        kind: 'text',
        lines: ["['Python编程：从入门到实践', '算法导论', '机器学习实战']", '3'],
      },
      memory: [
        { name: 'titles', value: "['Python编程…', '算法导论', …]", type: 'list', highlight: true },
        { name: 'HTML', value: '3 个 div.book 节点', type: 'str' },
      ],
      tip: '判断标准很简单：这份解析代码下次页面改版还要用吗？要用就别用正则。',
    },
    {
      title: 'XPath：用路径描述位置',
      en: 'XPATH',
      subtitle: '// 任意层级，/ 直接子节点，@ 取属性',
      stage: 'parse',
      body: [
        '`//div[@class="book"]` 表示「任意层级下 class 等于 book 的 div」。`text()` 取文本节点，`@id` 取属性值，末尾加 `[1]` 取第一个。',
        '`//` 和 `/` 的区别最容易混：`//` 是后代选择（跨层级），`/` 是直接子节点。写提取表达式时，通常先用 `//` 定位块，再用 `./` 在块内取字段。',
      ],
      code: `from lxml import etree

${HTML_DOC}

tree = etree.HTML(HTML)
print(tree.xpath("//h3/text()"))
print(tree.xpath("//div[@class='book']/@id"))
print(tree.xpath("//span[@class='price']/text()"))`,
      output: {
        kind: 'text',
        lines: [
          "['Python编程：从入门到实践', '算法导论', '机器学习实战']",
          "['book-1', 'book-2', 'book-3']",
          "['89.00', '128.00', '69.00']",
        ],
      },
      memory: [
        { name: 'tree', value: '<Element html>', type: 'Element' },
        { name: '//h3', value: '3 个节点', type: 'list', highlight: true, note: '跨层级匹配' },
      ],
    },
    {
      title: '按块循环取字段',
      en: 'EXTRACT',
      subtitle: '先定位列表，再逐条取子字段',
      stage: 'parse',
      body: [
        '正确姿势是两级：先用 `//div[@class="book"]` 拿到每个「书块」，再对每个块用 `./` 取它自己的 h3、span、em。这样字段之间不会串行。',
        '直接写 `//h3/text()` 在真实页面上很危险——页头、侧栏、推荐位可能也有 h3，取出来的数量和顺序都对不上。',
      ],
      code: `from lxml import etree

${HTML_DOC}

tree = etree.HTML(HTML)
books = []
for node in tree.xpath("//div[@class='book']"):
    books.append({
        "title": node.xpath("./h3/text()")[0],
        "price": float(node.xpath("./span/text()")[0]),
        "rating": float(node.xpath("./em/text()")[0]),
    })
print(len(books))
print(books[0])`,
      output: {
        kind: 'text',
        lines: [
          '3',
          "{'title': 'Python编程：从入门到实践', 'price': 89.0, 'rating': 9.1}",
        ],
      },
      memory: [
        { name: 'books', value: '3 条记录', type: 'list', highlight: true },
        { name: 'books[0]', value: "{'title': …, 'price': 89.0}", type: 'dict' },
      ],
      tip: '文本里有空格换行时用 `normalize-space()`；数字字段记得 `float()`，否则 CSV 里全是字符串。',
    },
    {
      title: 'BeautifulSoup：CSS 选择器',
      en: 'SOUP',
      subtitle: '习惯前端写法时更顺手',
      stage: 'parse',
      body: [
        '`BeautifulSoup(html, "lxml")` 用 lxml 做解析器（也可以用 html.parser，但慢）。`select()` 收 CSS 选择器，返回列表；`select_one()` 只取第一个。',
        'CSS 选择器的表达力比 XPath 弱一些——按文本内容筛选、取父节点这两类需求 XPath 更好写。两种都会，就能按场景挑。',
      ],
      code: `from bs4 import BeautifulSoup

${HTML_DOC}

soup = BeautifulSoup(HTML, "lxml")
print([a.text for a in soup.select("h3.title")])
print([a["href"] for a in soup.select("a")])
print(soup.select_one("#book-2 .price").text)`,
      output: {
        kind: 'text',
        lines: [
          "['Python编程：从入门到实践', '算法导论', '机器学习实战']",
          "['/book/1', '/book/2', '/book/3']",
          '128.00',
        ],
      },
      memory: [
        { name: 'soup', value: '<html>…</html>', type: 'BeautifulSoup' },
        { name: 'select', value: 'CSS 选择器', type: 'method', highlight: true },
      ],
    },
    {
      title: '落库：list[dict] → CSV',
      en: 'TO CSV',
      subtitle: '字段名固定下来，下一步才能进 Pandas',
      stage: 'store',
      canvas: 'scene',
      body: [
        '抓取结果统一存成 `list[dict]`，每个 dict 就是一行、键就是列名。这个结构能直接喂给 `csv.DictWriter`，也能直接 `pd.DataFrame(books)`。',
        '用 `io.StringIO` 写进内存而不是直接落盘，是为了演示「先看看长什么样再决定存哪」。真实项目里换成 `open("books.csv", "w", newline="")` 即可。',
      ],
      code: `import csv
import io

books = [
    {"title": "Python编程：从入门到实践", "price": 89.0, "rating": 9.1},
    {"title": "算法导论", "price": 128.0, "rating": 9.4},
    {"title": "机器学习实战", "price": 69.0, "rating": 8.2},
]
out = io.StringIO()
writer = csv.DictWriter(out, fieldnames=["title", "price", "rating"])
writer.writeheader()
writer.writerows(books)
for line in out.getvalue().splitlines():
    print(line)`,
      output: {
        kind: 'text',
        lines: [
          'title,price,rating',
          'Python编程：从入门到实践,89.0,9.1',
          '算法导论,128.0,9.4',
          '机器学习实战,69.0,8.2',
        ],
      },
      scene: {
        kind: 'pipeline',
        nodes: [
          { label: 'URL', sub: '目标页面' },
          { label: 'HTTP', sub: 'requests' },
          { label: 'HTML', sub: '原始文本' },
          { label: '解析', sub: 'XPath / CSS' },
          { label: 'CSV', sub: 'list[dict]' },
        ],
        at: 4,
        caption: '一条完整的采集链路：请求 → 解析 → 结构化 → 落库，每一环都可能失败，都要能单独重跑',
      },
      memory: [
        { name: 'books', value: '3 条记录', type: 'list' },
        { name: 'out', value: 'StringIO(3 行 CSV)', type: 'StringIO', highlight: true },
      ],
    },
  ],
}
