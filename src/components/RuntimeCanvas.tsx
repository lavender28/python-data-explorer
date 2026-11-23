import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { MemoryVar, Snapshot, Step, Workflow } from '../data/types'
import { highlightLine } from '../lib/highlight'

interface Props {
  workflow: Workflow
  stepIndex: number
  playing: boolean
  speed: number
  onTogglePlay: () => void
  onSpeed: (s: number) => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
  onSelectStep: (i: number) => void
}

/** 把 ['a', 'b', 'c'] 这样的字面量拆成元素，能正确处理引号里的逗号 */
function splitLiteral(raw: string): string[] | null {
  const text = raw.trim()
  const open = text[0]
  const close = text[text.length - 1]
  if (!((open === '[' && close === ']') || (open === '(' && close === ')') || (open === '{' && close === '}'))) {
    return null
  }
  const body = text.slice(1, -1)
  const out: string[] = []
  let cur = ''
  let quote: string | null = null
  let depth = 0
  for (const ch of body) {
    if (quote) {
      cur += ch
      if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"') {
      quote = ch
      cur += ch
      continue
    }
    if (ch === '[' || ch === '{' || ch === '(') depth += 1
    if (ch === ']' || ch === '}' || ch === ')') depth -= 1
    if (ch === ',' && depth === 0) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

function activeCodeLine(code: string): number {
  const lines = code.split('\n')
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const t = lines[i].trim()
    if (t && !t.startsWith('#')) return i
  }
  return 0
}

function VarCard({ v }: { v: MemoryVar }) {
  const parts = splitLiteral(v.value)
  const isDict = v.type === 'dict' && parts && parts.some((p) => p.includes(':'))
  const chips = parts && !isDict ? parts.slice(0, 6) : null
  const rest = parts && parts.length > 6 ? parts.length - 6 : 0

  return (
    <div className={`rt-var ${v.highlight ? 'is-hot' : ''}`}>
      <div className="rt-var-head">
        <span className="rt-var-name">{v.name}</span>
        <span className={`rt-var-type t-${v.type}`}>{v.type}</span>
      </div>
      {chips && chips.length > 0 ? (
        <div className="rt-cells">
          {chips.map((c, i) => (
            <span className="rt-cell" key={i}>
              {c.replace(/^['"]|['"]$/g, '')}
            </span>
          ))}
          {rest > 0 && <span className="rt-cell rt-cell-more">+{rest}</span>}
        </div>
      ) : (
        <div className="rt-var-value">{v.value}</div>
      )}
      {v.note && <div className="rt-var-note">{v.note}</div>}
    </div>
  )
}

function Console({ out }: { out?: Snapshot }) {
  if (!out) {
    return <div className="rt-empty">这一步没有输出，变化体现在中间的变量里。</div>
  }
  if (out.kind === 'text') {
    return (
      <div className="rt-out">
        {out.lines.map((line, i) => (
          <div className="rt-out-line" key={i}>
            <span className="rt-out-mark">›</span>
            <span>{line || ' '}</span>
          </div>
        ))}
      </div>
    )
  }
  if (out.kind === 'table') {
    return (
      <div className="rt-table-wrap">
        <table className="rt-table">
          <thead>
            <tr>
              {out.columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'is-right' : ''}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {out.rows.map((row, i) => (
              <tr key={i}>
                {out.columns.map((c) => (
                  <td key={c.key} className={c.align === 'right' ? 'is-right' : ''}>
                    {row[c.key] ?? ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <div className="rt-out">
      {out.items.map((m) => (
        <div className="rt-out-line" key={m.label}>
          <span className="rt-out-mark">›</span>
          <span>
            {m.label}: {m.value}
          </span>
        </div>
      ))}
    </div>
  )
}

function Inspect({ step }: { step: Step }) {
  const visual = step.visual

  if (visual?.kind === 'flow') {
    return (
      <div className="rt-flow">
        {visual.rows.map((row, i) => (
          <div
            key={i}
            className={`rt-flow-row k-${row.kind ?? 'body'} ${i === visual.at ? 'is-at' : ''} ${
              i < visual.at ? 'is-past' : ''
            }`}
          >
            <span className="rt-flow-bullet">{row.kind === 'cond' ? '?' : row.kind === 'exit' ? '▸' : '·'}</span>
            <span className="rt-flow-label">{row.label}</span>
            {row.note && <span className="rt-flow-note">{row.note}</span>}
          </div>
        ))}
      </div>
    )
  }

  if (visual?.kind === 'stack') {
    return (
      <div className="rt-stack">
        {visual.frames.map((f, i) => (
          <div className={`rt-frame ${i === 0 ? 'is-top' : ''}`} key={i}>
            <span className="rt-frame-name">{f.name}()</span>
            <span className="rt-frame-args">{f.args}</span>
            <span className="rt-frame-line">L{f.at}</span>
          </div>
        ))}
        <div className="rt-stack-foot">调用栈自下而上增长</div>
      </div>
    )
  }

  if (visual?.kind === 'file') {
    return (
      <div className="rt-file">
        <div className="rt-file-name">{visual.name}</div>
        <div className="rt-file-body">
          {visual.lines.map((line, i) => (
            <div className={`rt-file-line ${visual.hl?.includes(i) ? 'is-hl' : ''}`} key={i}>
              <span className="rt-file-ln">{i + 1}</span>
              <span>{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const vars = step.memory ?? []

  if (vars.length === 0) {
    return <div className="rt-empty">这一步没有产生变量，结果直接打到了控制台。</div>
  }

  return (
    <div className="rt-vars">
      {vars.map((v) => (
        <VarCard v={v} key={v.name} />
      ))}
    </div>
  )
}

export default function RuntimeCanvas({
  workflow,
  stepIndex,
  playing,
  speed,
  onTogglePlay,
  onSpeed,
  onPrev,
  onNext,
  onReset,
  onSelectStep,
}: Props) {
  const step = workflow.steps[stepIndex]
  const lines = step.code.split('\n')
  const hot = activeCodeLine(step.code)
  const inspectLabel =
    step.visual?.kind === 'flow'
      ? 'FLOW · 执行路径'
      : step.visual?.kind === 'stack'
        ? 'STACK · 调用栈'
        : step.visual?.kind === 'file'
          ? 'FILE · 文件内容'
          : 'MEMORY · 变量'

  return (
    <section className="canvas-card runtime-card" aria-label="运行时画布">
      <div className="canvas-toolbar">
        <div className="canvas-title">
          <span className="panel-title">运行时画布</span>
          <span className="live-chip">
            <span className="live-dot" /> RUN
          </span>
        </div>

        <span className="canvas-call">{step.en}</span>

        <div className="canvas-hint">每切一步，代码执行状态与变量就往前走一格</div>

        <div className="playback">
          <button className="mini-btn" onClick={onReset} title="重置到第一步" aria-label="重置">
            <RotateCcw size={14} />
          </button>
          <button className="mini-btn" onClick={onPrev} title="上一步" aria-label="上一步">
            <ChevronLeft size={15} />
          </button>
          <button
            className={`play-btn ${playing ? 'is-playing' : ''}`}
            onClick={onTogglePlay}
            title={playing ? '暂停' : '自动播放'}
            aria-label={playing ? '暂停' : '自动播放'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button className="mini-btn" onClick={onNext} title="下一步" aria-label="下一步">
            <ChevronRight size={15} />
          </button>
          <label className="speed">
            <span className="sr-only">播放速度</span>
            <select
              value={speed}
              onChange={(e) => onSpeed(Number(e.target.value))}
              aria-label="播放速度"
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
              <option value={2}>2×</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rt-body">
        <div className="rt-code-col">
          <div className="rt-col-head">
            <span>CODE</span>
            <span className="rt-col-meta">{workflow.id}.py</span>
          </div>
          <ol className="rt-code">
            {lines.map((line, i) => (
              <li key={i} className={i === hot ? 'is-active' : ''}>
                <span className="rt-ln">{String(i + 1).padStart(2, '0')}</span>
                <code>{line ? highlightLine(line, `c${i}`) : ' '}</code>
              </li>
            ))}
          </ol>
          <div className="rt-eof">EOF · {lines.length} 行 · 全部可运行</div>
        </div>

        <div className="rt-side">
          <div className="rt-col-head">
            <span>{inspectLabel}</span>
            <span className="rt-col-meta">{step.stage.toUpperCase()}</span>
          </div>
          <div className="rt-inspect">
            <Inspect step={step} />
          </div>

          <div className="rt-col-head rt-console-head">
            <span>CONSOLE</span>
            <span className="rt-col-meta">STDOUT</span>
          </div>
          <div className="rt-console">
            <Console out={step.output} />
          </div>
        </div>
      </div>

      <div className="canvas-timeline" role="tablist" aria-label="步骤时间线">
        <span className="tl-label">SEQ</span>
        <div className="tl-segments">
          {workflow.steps.map((s, i) => (
            <button
              key={s.title}
              role="tab"
              aria-selected={i === stepIndex}
              className={`tl-seg ${i === stepIndex ? 'is-active' : ''} ${i < stepIndex ? 'is-past' : ''}`}
              onClick={() => onSelectStep(i)}
              title={s.title}
            >
              <span className="tl-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="tl-name">{s.title}</span>
            </button>
          ))}
        </div>
        <span className="tl-counter">
          {String(stepIndex + 1).padStart(2, '0')} / {String(workflow.steps.length).padStart(2, '0')}
        </span>
      </div>
    </section>
  )
}
