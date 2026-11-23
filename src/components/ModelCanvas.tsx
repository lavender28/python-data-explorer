import type { ModelSpec } from '../data/types'
import { CanvasTimeline, CanvasToolbar, type CanvasProps } from './CanvasChrome'

const GROUP_COLORS = ['var(--viz-1)', 'var(--viz-2)', 'var(--viz-3)']

/** 刻度落在 1 / 2 / 2.5 / 5 的整数倍上，读起来才不像随机数 */
function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min || 1
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let v = start; v <= max + step * 1e-6; v += step) ticks.push(Math.round(v / step) * step)
  return ticks
}

function tickLabel(v: number, step: number): string {
  const decimals = step >= 1 ? 0 : step >= 0.1 ? 1 : 2
  return v.toFixed(decimals)
}

function Scatter({ spec }: { spec: Extract<ModelSpec, { kind: 'scatter' }> }) {
  const all = spec.groups.flatMap((g) => g.points)
  const box = spec.axes ?? [
    Math.min(...all.map((p) => p.x)),
    Math.max(...all.map((p) => p.x)),
    Math.min(...all.map((p) => p.y)),
    Math.max(...all.map((p) => p.y)),
  ]
  const [x0, x1, y0, y1] = box
  const W = 680
  const H = 300
  const padL = 46
  const padR = 18
  const padT = 16
  const padB = 38
  const sx = (v: number) => padL + ((v - x0) / (x1 - x0 || 1)) * (W - padL - padR)
  const sy = (v: number) => H - padB - ((v - y0) / (y1 - y0 || 1)) * (H - padT - padB)

  const xt = niceTicks(x0, x1, 5)
  const yt = niceTicks(y0, y1, 4)
  const xStep = xt.length > 1 ? xt[1] - xt[0] : 1
  const yStep = yt.length > 1 ? yt[1] - yt[0] : 1

  return (
    <svg className="md-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.caption ?? '散点图'}>
      {yt.map((t) => (
        <g key={`y${t}`}>
          <line x1={padL} y1={sy(t)} x2={W - padR} y2={sy(t)} stroke="var(--grid-line)" strokeWidth="1" />
          <text x={padL - 8} y={sy(t)} textAnchor="end" dominantBaseline="central" fill="var(--faint)" fontSize="10">
            {tickLabel(t, yStep)}
          </text>
        </g>
      ))}
      {xt.map((t) => (
        <text key={`x${t}`} x={sx(t)} y={H - padB + 16} textAnchor="middle" fill="var(--faint)" fontSize="10">
          {tickLabel(t, xStep)}
        </text>
      ))}
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--line-strong)" strokeWidth="1" />
      <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="var(--line-strong)" strokeWidth="1" />

      {spec.line && (
        <line
          x1={sx(x0)}
          y1={sy(spec.line.a + spec.line.b * x0)}
          x2={sx(x1)}
          y2={sy(spec.line.a + spec.line.b * x1)}
          stroke="var(--warn)"
          strokeWidth="1.6"
          strokeDasharray="5 4"
        />
      )}

      {spec.groups.map((g, gi) => (
        <g key={g.label} fill={GROUP_COLORS[gi % GROUP_COLORS.length]}>
          {g.points.map((p, i) => (
            <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="3.2" opacity="0.78" />
          ))}
        </g>
      ))}

      {spec.centers?.map((c, i) => (
        <g key={`c${i}`} stroke="var(--ink)" fill="none" strokeWidth="1.6">
          <path d={`M${sx(c.x) - 5} ${sy(c.y)}h10M${sx(c.x)} ${sy(c.y) - 5}v10`} />
          <circle cx={sx(c.x)} cy={sy(c.y)} r="8" strokeDasharray="2 3" />
        </g>
      ))}

      {spec.xLabel && (
        <text x={W - padR} y={H - 8} textAnchor="end" fill="var(--muted)" fontSize="10">
          {spec.xLabel}
        </text>
      )}
      {spec.yLabel && (
        <text x={padL - 34} y={padT + 4} fill="var(--muted)" fontSize="10">
          {spec.yLabel}
        </text>
      )}
    </svg>
  )
}

function Split({ spec }: { spec: Extract<ModelSpec, { kind: 'split' }> }) {
  const total = spec.parts.reduce((n, p) => n + p.count, 0)
  let acc = 0
  return (
    <div className="md-split">
      <div className="md-split-bar">
        {spec.parts.map((p) => {
          const w = (p.count / total) * 100
          const left = acc
          acc += w
          return (
            <div
              key={p.label}
              className={`md-split-seg t-${p.tone}`}
              style={{ width: `${w}%`, left: `${left}%` }}
            >
              <span className="md-split-pct">{Math.round(w)}%</span>
            </div>
          )
        })}
      </div>
      <div className="md-split-legend">
        {spec.parts.map((p) => (
          <div className="md-split-item" key={p.label}>
            <span className={`md-dot t-${p.tone}`} />
            <span className="md-split-label">{p.label}</span>
            <span className="md-split-count">{p.count.toLocaleString('en-US')} 条</span>
          </div>
        ))}
      </div>
      {spec.note && <div className="md-note">{spec.note}</div>}
    </div>
  )
}

function Tree({ spec }: { spec: Extract<ModelSpec, { kind: 'tree' }> }) {
  const W = 680
  const rowH = 76
  const maxDepth = Math.max(...spec.nodes.map((n) => n.depth))
  const H = (maxDepth + 1) * rowH + 24
  const nx = (x: number) => 60 + x * (W - 120)
  const ny = (d: number) => 34 + d * rowH

  return (
    <svg className="md-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={spec.caption ?? '决策树'}>
      {spec.edges.map(([a, b]) => {
        const na = spec.nodes.find((n) => n.id === a)
        const nb = spec.nodes.find((n) => n.id === b)
        if (!na || !nb) return null
        const x1 = nx(na.x)
        const y1 = ny(na.depth) + 16
        const x2 = nx(nb.x)
        const y2 = ny(nb.depth) - 16
        const mid = (y1 + y2) / 2
        return (
          <path
            key={`${a}-${b}`}
            d={`M${x1} ${y1}V${mid}H${x2}V${y2}`}
            fill="none"
            stroke="var(--flow-line)"
            strokeWidth="1.2"
          />
        )
      })}
      {spec.nodes.map((n) => {
        const x = nx(n.x)
        const y = ny(n.depth)
        const w = n.leaf ? 96 : 130
        return (
          <g key={n.id}>
            <rect
              x={x - w / 2}
              y={y - 16}
              width={w}
              height={32}
              rx="4"
              fill={n.leaf ? 'var(--accent-soft)' : 'var(--panel)'}
              stroke={n.leaf ? 'var(--accent)' : 'var(--line-strong)'}
              strokeWidth="1"
            />
            <text
              x={x}
              y={n.sub ? y - 3 : y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="10.5"
              fill="var(--ink)"
            >
              {n.label}
            </text>
            {n.sub && (
              <text x={x} y={y + 9} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="var(--faint)">
                {n.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function Bars({ spec }: { spec: Extract<ModelSpec, { kind: 'bars' }> }) {
  const max = spec.max ?? Math.max(...spec.items.map((i) => i.value))
  return (
    <div className="md-bars">
      {spec.items.map((it) => (
        <div className="md-bar-row" key={it.label}>
          <span className="md-bar-label">{it.label}</span>
          <span className="md-bar-track">
            <span
              className={`md-bar-fill ${it.tone ? `t-${it.tone}` : ''}`}
              style={{ width: `${Math.max(2, (it.value / max) * 100)}%` }}
            />
          </span>
          <span className="md-bar-value">{it.value.toFixed(it.value < 1 ? 3 : 1)}</span>
        </div>
      ))}
    </div>
  )
}

function Metrics({ spec }: { spec: Extract<ModelSpec, { kind: 'metrics' }> }) {
  return (
    <div className="md-metrics">
      {spec.items.map((m) => (
        <div className={`md-metric ${m.tone ? `t-${m.tone}` : ''}`} key={m.label}>
          <span className="md-metric-label">{m.label}</span>
          <span className="md-metric-value">{m.value}</span>
          {m.hint && <span className="md-metric-hint">{m.hint}</span>}
        </div>
      ))}
    </div>
  )
}

export default function ModelCanvas({
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
}: CanvasProps) {
  const step = workflow.steps[stepIndex]
  const spec = step.model

  return (
    <section className="canvas-card model-card" aria-label="模型画布">
      <CanvasToolbar
        title="模型画布"
        badge="FIT"
        call={step.en}
        hint="每切一步，训练数据、模型结构或评估指标就往前走一格"
        playing={playing}
        speed={speed}
        onTogglePlay={onTogglePlay}
        onSpeed={onSpeed}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
      />

      <div className="md-body">
        <div className="md-stage">
          {spec ? (
            spec.kind === 'scatter' ? (
              <Scatter spec={spec} />
            ) : spec.kind === 'split' ? (
              <Split spec={spec} />
            ) : spec.kind === 'tree' ? (
              <Tree spec={spec} />
            ) : spec.kind === 'bars' ? (
              <Bars spec={spec} />
            ) : (
              <Metrics spec={spec} />
            )
          ) : (
            <div className="md-empty">这一步没有视觉快照。</div>
          )}
        </div>
        <div className="md-foot">
          <span className="md-caption">{spec?.caption ?? ''}</span>
          <span className="md-kind">{spec?.kind.toUpperCase()}</span>
        </div>
      </div>

      <CanvasTimeline steps={workflow.steps} stepIndex={stepIndex} onSelectStep={onSelectStep} />
    </section>
  )
}
