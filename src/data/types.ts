export type Category =
  | 'basics'
  | 'container'
  | 'flow'
  | 'func'
  | 'io'
  | 'numpy'
  | 'core'
  | 'clean'
  | 'group'
  | 'stats'
  | 'viz'
  | 'ml'
  | 'crawl'

export type Stage = string
export type Tab = 'trace' | 'snapshot'
/** chart 图表 / runtime 运行时 / table 表格 / model 模型 / scene 3D 场景 */
export type CanvasKind = 'chart' | 'runtime' | 'table' | 'model' | 'scene'

export interface StageDef {
  key: Stage
  zh: string
  en: string
}

export interface Column {
  key: string
  label: string
  align?: 'left' | 'right'
}

export type Snapshot =
  | {
      kind: 'table'
      caption?: string
      columns: Column[]
      rows: Record<string, string | number | null>[]
    }
  | { kind: 'text'; caption?: string; lines: string[] }
  | {
      kind: 'metrics'
      caption?: string
      items: { label: string; value: string; note?: string }[]
    }

/** 运行时画布里的一个变量：名字、当前值的字面量、类型标签 */
export interface MemoryVar {
  name: string
  value: string
  type: string
  highlight?: boolean
  note?: string
}

/** 控制流主题的执行梯子：一行代表一个判断或一次循环体 */
export interface FlowRow {
  label: string
  kind?: 'cond' | 'body' | 'exit'
  note?: string
}

export interface StackFrame {
  name: string
  args: string
  at: number
}

export type StepVisual =
  | { kind: 'flow'; rows: FlowRow[]; at: number; caption?: string }
  | { kind: 'stack'; frames: StackFrame[]; caption?: string }
  | { kind: 'file'; name: string; lines: string[]; hl?: number[]; caption?: string }

/* ---------------- 表格画布 ---------------- */

export type CellTone = 'na' | 'hit' | 'drop' | 'new' | 'key' | 'muted'

export interface FrameCell {
  v: string | number | null
  tone?: CellTone
}

export interface FrameColumn {
  label: string
  align?: 'left' | 'right'
  tone?: 'key' | 'num' | 'text' | 'date'
}

export interface TableSpec {
  name: string
  shape: [number, number]
  indexName?: string
  index?: string[]
  columns: FrameColumn[]
  rows: FrameCell[][]
  hlCols?: number[]
  hlRows?: number[]
  /** 这一步施加的操作，显示在画布右上角 */
  op?: string
  /** 形状变化，如 "12,480 × 10 → 8 × 2" */
  delta?: string
  caption?: string
  footnote?: string
}

/* ---------------- 模型画布 ---------------- */

export interface Vec2 {
  x: number
  y: number
}

export type ModelSpec =
  | {
      kind: 'split'
      parts: { label: string; count: number; tone: 'train' | 'test' | 'valid' }[]
      caption?: string
      note?: string
    }
  | {
      kind: 'scatter'
      groups: { label: string; points: Vec2[] }[]
      centers?: Vec2[]
      line?: { a: number; b: number }
      axes?: [number, number, number, number]
      xLabel?: string
      yLabel?: string
      caption?: string
    }
  | {
      kind: 'tree'
      nodes: { id: string; label: string; sub?: string; depth: number; x: number; leaf?: boolean }[]
      edges: [string, string][]
      caption?: string
    }
  | { kind: 'bars'; items: { label: string; value: number; tone?: 'up' | 'down' }[]; caption?: string; max?: number }
  | { kind: 'metrics'; items: { label: string; value: string; hint?: string; tone?: 'good' | 'warn' }[]; caption?: string }

/* ---------------- 3D 场景画布 ---------------- */

export type SceneSpec =
  | {
      kind: 'numpy'
      shape: number[]
      label: string
      highlight?: number[]
      /** 广播时被拉伸的那一维长度 */
      broadcast?: number
      caption?: string
    }
  | { kind: 'pivot'; rows: string[]; cols: string[]; values: number[][]; caption?: string }
  | { kind: 'pipeline'; nodes: { label: string; sub: string }[]; at: number; caption?: string }

/* ---------------- 图表画布 ---------------- */

export type FigureMark =
  | { kind: 'line'; points: Vec2[]; color?: string; dash?: boolean; width?: number }
  | { kind: 'bar'; bars: { x: number; y: number; label?: string }[]; color?: string; width?: number; horizontal?: boolean }
  | { kind: 'scatter'; points: Vec2[]; color?: string; r?: number }
  | { kind: 'text'; x: number; y: number; text: string; color?: string; anchor?: 'start' | 'middle' | 'end' }
  | { kind: 'hline'; y: number; color?: string; dash?: boolean }
  | { kind: 'vline'; x: number; color?: string; dash?: boolean }

export interface FigureAxis {
  type?: 'cartesian' | 'pie' | 'box'
  xlim?: [number, number]
  ylim?: [number, number]
  xticks?: { v: number; label: string }[]
  yticks?: { v: number; label: string }[]
  xlabel?: string
  ylabel?: string
  title?: string
  grid?: boolean
  /** 是否画左/下轴线框，去掉边框的步骤设为 false */
  frame?: boolean
  marks?: FigureMark[]
  slices?: { label: string; value: number; color?: string; explode?: boolean }[]
  box?: { min: number; q1: number; median: number; q3: number; max: number; outliers: number[]; mean?: number }
  boxScale?: [number, number]
}

export interface FigureSpec {
  panels: FigureAxis[]
  layout?: 'single' | 'double'
  caption?: string
  call?: string
  footnote?: string
  exportFrame?: boolean
  badge?: string
}

export interface TraceRow {
  object: string
  action: string
  result: string
  rows: string
  ms: number
}

export interface Step {
  title: string
  en: string
  subtitle: string
  stage: Stage
  body: string[]
  code: string
  output?: Snapshot
  trace?: TraceRow
  tip?: string
  /** 运行时画布中间栏的变量快照 */
  memory?: MemoryVar[]
  /** 覆盖中间栏：流程图 / 调用栈 / 文件预览 */
  visual?: StepVisual
  /** 图表画布：这一帧要画的 Figure */
  figure?: FigureSpec
  /** 表格画布：这一帧的 DataFrame 视图 */
  table?: TableSpec
  /** 模型画布：切分 / 散点 / 树 / 重要性 / 指标 */
  model?: ModelSpec
  /** 3D 场景画布 */
  scene?: SceneSpec
  /** 单步覆盖画布类型，用于在一章里插一张特殊视图 */
  canvas?: CanvasKind
  /**
   * 设为 false 表示这一步不能在单机上独立跑出声明的输出，
   * 校验脚本会跳过它。三种情况：代码不是 Python（SQL）、
   * 依赖本机没有的外部服务（MySQL），或输出随机器变化（版本号 / 绝对路径）。
   */
  verify?: boolean
}

export interface Workflow {
  id: string
  name: string
  en: string
  subtitle: string
  category: Category
  description: string
  attrs: { label: string; value: string }[]
  /** 画布形态：默认 matplotlib 图表画布，基础语法用运行时画布 */
  canvasKind?: CanvasKind
  /** 每个主题自带的三阶段语义，缺省回落到 STAGES */
  stages?: StageDef[]
  canvas?: {
    source: [string, string]
    frame: [string, string]
    transform: [string, string]
    insight: [string, string]
  }
  imports: string
  setup?: string
  steps: Step[]
}

export const CATEGORY_META: Record<
  Category,
  { label: string; zh: string; tone: string }
> = {
  basics: { label: 'BASICS', zh: '基础', tone: 'blue' },
  container: { label: 'CONTAINER', zh: '容器', tone: 'teal' },
  flow: { label: 'FLOW', zh: '流程', tone: 'amber' },
  func: { label: 'FUNCTION', zh: '函数', tone: 'violet' },
  io: { label: 'IO', zh: '文件', tone: 'blue' },
  numpy: { label: 'NUMPY', zh: '数值', tone: 'teal' },
  core: { label: 'DATAFRAME', zh: '数据框', tone: 'blue' },
  clean: { label: 'PREP', zh: '预处理', tone: 'teal' },
  group: { label: 'GROUPBY', zh: '分组', tone: 'amber' },
  stats: { label: 'STATS', zh: '统计', tone: 'amber' },
  viz: { label: 'VIZ', zh: '可视化', tone: 'violet' },
  ml: { label: 'MODEL', zh: '建模', tone: 'violet' },
  crawl: { label: 'CRAWL', zh: '采集', tone: 'teal' },
}

/** 缺省阶段：数据可视化主题用，其余主题在数据里自带 */
export const STAGES: StageDef[] = [
  { key: 'frame', zh: '画布', en: 'FIGURE' },
  { key: 'transform', zh: '绘制', en: 'PLOT' },
  { key: 'insight', zh: '成图', en: 'EXPORT' },
]

export function stagesOf(workflow: Workflow): StageDef[] {
  return workflow.stages && workflow.stages.length > 0 ? workflow.stages : STAGES
}

export function stageIndex(workflow: Workflow, stage: Stage): number {
  const stages = stagesOf(workflow)
  const i = stages.findIndex((s) => s.key === stage)
  return i < 0 ? 0 : i
}
