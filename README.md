# Data Explorer · 用 Python 读懂数据

[![Deploy to GitHub Pages](https://github.com/lavender28/python-data-explorer/actions/workflows/deploy.yml/badge.svg)](https://github.com/lavender28/python-data-explorer/actions/workflows/deploy.yml)

**在线预览：<https://lavender28.github.io/python-data-explorer/>**

一个交互式的 Python 数据分析学习图谱。把数据分析拆成 29 条真实工作流、125 个可执行步骤，每一步同时展示 **代码 / 数据快照 / 操作轨迹**，并且每一步的代码输出都与真实 `python3` 运行结果逐行核对过。

> 设计语言：书页式版心（三栏、天头小地脚大、旁注栏、点线目录）+ 撞色结构色（粗描边、硬投影、分类撞色）。

## 它能做什么

- **29 个主题，12 个分类**：从基础语法一路走到 NumPy / Pandas / 可视化 / scikit-learn / 爬虫。
- **5 种画布**，随内容自动切换：
  - `chart` 图表画布 —— Matplotlib 图谱（折线、条形、柱状、饼图、箱线图），按 FigureSpec 数据驱动绘制
  - `runtime` 运行时画布 —— 代码 + 变量内存 + 控制台输出
  - `table` 表格画布 —— DataFrame 快照，带粘性表头/索引列与 NaN、命中、删除、合计等单元格色调
  - `model` 模型画布 —— 散点、训练/测试划分、决策树、系数柱条、指标卡
  - `scene` 3D 场景画布 —— three.js 渲染的 NumPy 内存块与广播、透视表 3D 柱、爬虫采集管线（懒加载，不进 3D 步骤不下载）
- **进度持久化**：学习进度与深浅色主题存 localStorage。
- **⌘K 快速搜索**：按主题名、步骤标题、正文与代码检索。
- **一键导出**：把一章的全部步骤拼成可直接运行的 Python 脚本，并自动推断 `pip install` 依赖。

## 技术栈

| 层 | 选型 |
|---|---|
| 构建 | Vite 5 + TypeScript（`tsc -b` 严格检查） |
| 视图 | React 18，无 UI 框架，纯 CSS 设计系统（CSS 变量 + `data-theme` 主题） |
| 图标 | lucide-react |
| 字体 | IBM Plex Mono（`@fontsource`，本地打包，无外部请求） |
| 3D | three.js（`import('three')` 动态导入，独立 chunk） |

## 上手

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物（:4173）
```

## 校验步骤代码的真实性

`npm run verify` 会把 `src/data` 下的数据打包，逐个步骤把代码写进临时文件、用本机 `python3` 执行，把真实 stdout 与页面里声明的 `output.lines` 逐行比对。

```bash
npm run verify
# checked=119 skipped=6 failed=0
```

- 需要本机有 `python3` 以及 `numpy / pandas / matplotlib / scikit-learn / requests / beautifulsoup4 / lxml`。
- 6 个 `verify: false` 的步骤是显式跳过的：环境信息类（版本号、绝对路径随机器变化）与 SQL/MySQL 依赖类。
- 需要外部服务的章节（爬虫）在 `workflow.setup` 里起一个本地回环 HTTP 服务，因此离线也能校验。

## 目录结构

```
src/
├── App.tsx               # 三栏工作区编排、画布路由、进度状态
├── styles.css            # 设计系统（token / 布局 / 五类画布样式）
├── components/
│   ├── Sidebar.tsx       # 主题目录、分类分组、进度
│   ├── CanvasChrome.tsx  # 五类画布共用的工具栏与步骤时间线
│   ├── ChartCanvas.tsx   # 图表画布（FigureSpec → SVG）
│   ├── RuntimeCanvas.tsx # 运行时画布
│   ├── TableCanvas.tsx   # 表格画布（DataFrame 快照）
│   ├── ModelCanvas.tsx   # 模型画布（散点/划分/树/柱条/指标卡）
│   ├── SceneCanvas.tsx   # 3D 场景画布（three.js）
│   ├── StepPanel.tsx     # 本步讲解与代码
│   ├── OverviewPanel.tsx # 右侧主题概览、检查点、进度
│   └── ScriptDrawer.tsx  # 导出完整脚本
├── data/
│   ├── types.ts          # Workflow / Step / FigureSpec / TableSpec / ModelSpec / SceneSpec
│   ├── index.ts          # 主题聚合与分类排序
│   └── workflows-*.ts    # 各章内容（基础 / numpy / pandas / viz / ml / crawl）
└── lib/
    ├── script.ts         # 导出脚本拼接与依赖推断
    └── progress.ts       # localStorage 持久化
scripts/verify-steps.mjs  # 步骤代码真实性校验
design-demos/             # 视觉改版探索：三个方向 + 混合版初稿
```

## 内容大纲

| 分类 | 主题 | 步数 |
|---|---|---|
| 基础 `basics` | 环境与工具、变量与类型、字符串 | 3 |
| 容器 `container` | 列表与元组、字典与集合、推导式 | 3 |
| 流程 `flow` | 条件分支、循环、异常处理 | 3 |
| 函数 `func` | 函数定义、参数与作用域、lambda 与高阶 | 3 |
| 输入输出 `io` | 文件读写、JSON 与 CSV | 2 |
| NumPy `numpy` | 数组与索引、向量化运算 | 2 |
| DataFrame `core` | 数据结构、选取与筛选 | 2 |
| 预处理 `clean` | 合并与连接、缺失值与重复值 | 2 |
| 分组 `group` | groupby 四件套、透视表 | 2 |
| 可视化 `viz` | Matplotlib 全程（画布 → 折线 → 柱状 → 饼图 → 箱线 → 导出） | 1 |
| 建模 `ml` | 从数据到模型、聚类与评估、线性回归、决策树 | 4 |
| 采集 `crawl` | requests 与合规、解析与入库 | 2 |

合计 **29 主题 / 125 步**。示例数据为虚构零售订单，字段说明见站点页脚。

## 说明

- 所有代码片段与输出都经过真实运行核对，页面上标注的数字不是手写的。
- 3D 画布只用在「空间结构本身有信息」的地方（内存布局、广播、二维透视），其余保持 2D。
- `design-demos/` 是视觉方向的探索记录，不参与构建。
