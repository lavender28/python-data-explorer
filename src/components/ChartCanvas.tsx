import type { FigureAxis, FigureMark, FigureSpec } from '../data/types'
import { CanvasTimeline, CanvasToolbar, type CanvasProps } from './CanvasChrome'

interface Box {
  x: number
  y: number
  w: number
  h: number
}

const FIGURE: Box = { x: 56, y: 52, w: 788, h: 322 }
const SINGLE: Box = { x: 146, y: 106, w: 600, h: 196 }
const DOUBLE: Box[] = [
  { x: 138, y: 106, w: 318, h: 196 },
  { x: 552, y: 106, w: 250, h: 196 },
]

function pointsOf(marks: FigureMark[]): { xs: number[]; ys: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  for (const m of marks) {
    if (m.kind === 'line' || m.kind === 'scatter') {
      for (const p of m.points) {
        xs.push(p.x)
        ys.push(p.y)
      }
    } else if (m.kind === 'bar') {
      for (const b of m.bars) {
        xs.push(b.x, 0)
        ys.push(b.y, 0)
      }
    } else if (m.kind === 'hline') {
      ys.push(m.y)
    } else if (m.kind === 'vline') {
      xs.push(m.x)
    }
  }
  return { xs, ys }
}

function scaleOf(axis: FigureAxis, box: Box) {
  const auto = pointsOf(axis.marks ?? [])
  const [x0, x1] = axis.xlim ?? [
    Math.min(...(auto.xs.length ? auto.xs : [0])),
    Math.max(...(auto.xs.length ? auto.xs : [1])),
  ]
  const [y0, y1] = axis.ylim ?? [
    Math.min(...(auto.ys.length ? auto.ys : [0])),
    Math.max(...(auto.ys.length ? auto.ys : [1])),
  ]
  const sx = (v: number) => box.x + ((v - x0) / (x1 - x0 || 1)) * box.w
  const sy = (v: number) => box.y + box.h - ((v - y0) / (y1 - y0 || 1)) * box.h
  return { sx, sy, x0, x1, y0, y1 }
}

function BarMark({ m, box }: { m: Extract<FigureMark, { kind: 'bar' }>; box: Box }) {
  const s = scaleOf({ marks: [m], xlim: undefined, ylim: undefined }, box)
  const unitX = box.w / (s.x1 - s.x0 || 1)
  const unitY = box.h / (s.y1 - s.y0 || 1)
  const baseX = s.x0 <= 0 && s.x1 >= 0 ? 0 : s.x0
  const baseY = s.y0 <= 0 && s.y1 >= 0 ? 0 : s.y0
  const color = m.color ?? 'var(--accent)'

  return (
    <g>
      {m.bars.map((b, i) => {
        if (m.horizontal) {
          const bw = Math.max(1, Math.abs(s.sx(b.x) - s.sx(baseX)))
          const bh = Math.max(3, (m.width ?? 0.62) * unitY)
          const x = Math.min(s.sx(b.x), s.sx(baseX))
          return (
            <g key={i}>
              <rect x={x} y={s.sy(b.y) - bh / 2} width={bw} height={bh} fill={color} opacity="0.82" />
              {b.label && (
                <text
                  x={x + bw + 6}
                  y={s.sy(b.y)}
                  dominantBaseline="central"
                  fontSize="10.5"
                  fill="var(--ink-soft)"
                >
                  {b.label}
                </text>
              )}
            </g>
          )
        }
        const bw = Math.max(3, (m.width ?? 0.62) * unitX)
        const yTop = Math.min(s.sy(b.y), s.sy(baseY))
        const bh = Math.max(1, Math.abs(s.sy(b.y) - s.sy(baseY)))
        return (
          <g key={i}>
            <rect x={s.sx(b.x) - bw / 2} y={yTop} width={bw} height={bh} fill={color} opacity="0.82" />
            {b.label && (
              <text x={s.sx(b.x)} y={yTop - 6} textAnchor="middle" fontSize="10" fill="var(--ink-soft)">
                {b.label}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function CartAxis({ axis, box, id }: { axis: FigureAxis; box: Box; id: string }) {
  const { sx, sy } = scaleOf(axis, box)
  const marks = axis.marks ?? []

  return (
    <g>
      {axis.title && (
        <text x={box.x} y={box.y - 14} fontSize="12.5" fontWeight="600" fill="var(--ink-soft)">
          {axis.title}
        </text>
      )}

      {(axis.frame ?? true) && (
        <g stroke="var(--line-strong)" strokeWidth="1">
          <line x1={box.x} y1={box.y + box.h} x2={box.x + box.w} y2={box.y + box.h} />
          <line x1={box.x} y1={box.y} x2={box.x} y2={box.y + box.h} />
        </g>
      )}

      {axis.grid &&
        (axis.yticks ?? []).map((t) => (
          <line
            key={`g${t.v}`}
            x1={box.x}
            y1={sy(t.v)}
            x2={box.x + box.w}
            y2={sy(t.v)}
            stroke="var(--grid-line)"
            strokeWidth="1"
          />
        ))}

      {(axis.yticks ?? []).map((t) => (
        <text key={`y${t.v}`} x={box.x - 8} y={sy(t.v)} textAnchor="end" dominantBaseline="central" fontSize="10" fill="var(--faint)">
          {t.label}
        </text>
      ))}
      {(axis.xticks ?? []).map((t) => (
        <text key={`x${t.v}`} x={sx(t.v)} y={box.y + box.h + 16} textAnchor="middle" fontSize="10" fill="var(--faint)">
          {t.label}
        </text>
      ))}

      <defs>
        <clipPath id={`clip-${id}`}>
          <rect x={box.x} y={box.y - 6} width={box.w} height={box.h + 6} />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${id})`}>
        {marks.map((m, i) => {
          if (m.kind === 'line') {
            const d = m.points.map((p, j) => `${j === 0 ? 'M' : 'L'}${sx(p.x)} ${sy(p.y)}`).join(' ')
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={m.color ?? 'var(--accent)'}
                strokeWidth={m.width ?? 1.6}
                strokeDasharray={m.dash ? '5 4' : undefined}
                strokeLinejoin="round"
              />
            )
          }
          if (m.kind === 'scatter') {
            return (
              <g key={i} fill={m.color ?? 'var(--accent)'}>
                {m.points.map((p, j) => (
                  <circle key={j} cx={sx(p.x)} cy={sy(p.y)} r={m.r ?? 3} opacity="0.85" />
                ))}
              </g>
            )
          }
          if (m.kind === 'bar') return <BarMark m={m} box={box} key={i} />
          if (m.kind === 'hline') {
            return (
              <line
                key={i}
                x1={box.x}
                y1={sy(m.y)}
                x2={box.x + box.w}
                y2={sy(m.y)}
                stroke={m.color ?? 'var(--faint)'}
                strokeWidth="1"
                strokeDasharray={m.dash ? '4 4' : undefined}
              />
            )
          }
          if (m.kind === 'vline') {
            return (
              <line
                key={i}
                x1={sx(m.x)}
                y1={box.y}
                x2={sx(m.x)}
                y2={box.y + box.h}
                stroke={m.color ?? 'var(--faint)'}
                strokeWidth="1"
                strokeDasharray={m.dash ? '4 4' : undefined}
              />
            )
          }
          return (
            <text
              key={i}
              x={sx(m.x)}
              y={sy(m.y)}
              textAnchor={m.anchor ?? 'start'}
              fontSize="11"
              fill={m.color ?? 'var(--ink-soft)'}
            >
              {m.text}
            </text>
          )
        })}
      </g>

      {axis.xlabel && (
        <text x={box.x + box.w / 2} y={box.y + box.h + 28} textAnchor="middle" fontSize="10.5" fill="var(--faint)">
          {axis.xlabel}
        </text>
      )}
      {axis.ylabel && (
        <text
          x={box.x - 36}
          y={box.y + box.h / 2}
          textAnchor="middle"
          fontSize="10.5"
          fill="var(--faint)"
          transform={`rotate(-90 ${box.x - 36} ${box.y + box.h / 2})`}
        >
          {axis.ylabel}
        </text>
      )}
    </g>
  )
}

function PieAxis({ axis, box }: { axis: FigureAxis; box: Box }) {
  const slices = axis.slices ?? []
  const total = slices.reduce((n, s) => n + s.value, 0) || 1
  const cx = box.x + box.w / 2
  const cy = box.y + box.h / 2
  const R = Math.min(box.w, box.h) / 2 - 6
  let angle = -Math.PI / 2

  return (
    <g>
      {axis.title && (
        <text x={cx} y={box.y - 14} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--ink-soft)">
          {axis.title}
        </text>
      )}
      {slices.map((s, i) => {
        const sweep = (s.value / total) * Math.PI * 2
        const off = s.explode ? 8 : 0
        const mid = angle + sweep / 2
        const ox = Math.cos(mid) * off
        const oy = Math.sin(mid) * off
        const x1 = cx + Math.cos(angle) * R + ox
        const y1 = cy + Math.sin(angle) * R + oy
        const x2 = cx + Math.cos(angle + sweep) * R + ox
        const y2 = cy + Math.sin(angle + sweep) * R + oy
        const large = sweep > Math.PI ? 1 : 0
        const d = `M${cx + ox} ${cy + oy}L${x1} ${y1}A${R} ${R} 0 ${large} 1 ${x2} ${y2}Z`
        const lx = cx + Math.cos(mid) * R * 0.62 + ox
        const ly = cy + Math.sin(mid) * R * 0.62 + oy
        const pct = ((s.value / total) * 100).toFixed(1)
        angle += sweep
        return (
          <g key={i}>
            <path d={d} fill={s.color ?? 'var(--accent)'} opacity="0.85" stroke="var(--panel)" strokeWidth="1" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#fff">
              {pct}%
            </text>
          </g>
        )
      })}
      {slices.map((s, i) => (
        <g key={`lg${i}`}>
          <rect x={box.x - 4} y={box.y + box.h + 6 + i * 15} width="7" height="7" fill={s.color ?? 'var(--accent)'} />
          <text x={box.x + 8} y={box.y + box.h + 12 + i * 15} fontSize="10" fill="var(--muted)">
            {s.label}
          </text>
        </g>
      ))}
    </g>
  )
}

function BoxAxis({ axis, box }: { axis: FigureAxis; box: Box }) {
  const b = axis.box
  if (!b) return null
  const [lo, hi] = axis.boxScale ?? [b.min - (b.max - b.min) * 0.1, b.max + (b.max - b.min) * 0.1]
  const cx = box.x + box.w / 2
  const bw = Math.min(120, box.w * 0.42)
  const sy = (v: number) => box.y + box.h - ((v - lo) / (hi - lo || 1)) * box.h

  return (
    <g>
      {axis.title && (
        <text x={box.x} y={box.y - 14} fontSize="12.5" fontWeight="600" fill="var(--ink-soft)">
          {axis.title}
        </text>
      )}
      <line x1={box.x} y1={box.y + box.h} x2={box.x + box.w} y2={box.y + box.h} stroke="var(--line-strong)" strokeWidth="1" />
      <line x1={box.x} y1={box.y} x2={box.x} y2={box.y + box.h} stroke="var(--line-strong)" strokeWidth="1" />

      {(axis.yticks ?? []).map((t) => (
        <text key={t.v} x={box.x - 8} y={sy(t.v)} textAnchor="end" dominantBaseline="central" fontSize="10" fill="var(--faint)">
          {t.label}
        </text>
      ))}

      <line x1={cx} y1={sy(b.max)} x2={cx} y2={sy(b.min)} stroke="var(--ink-soft)" strokeWidth="1" />
      <line x1={cx - bw / 3} y1={sy(b.max)} x2={cx + bw / 3} y2={sy(b.max)} stroke="var(--ink-soft)" strokeWidth="1" />
      <line x1={cx - bw / 3} y1={sy(b.min)} x2={cx + bw / 3} y2={sy(b.min)} stroke="var(--ink-soft)" strokeWidth="1" />
      <rect
        x={cx - bw / 2}
        y={sy(b.q3)}
        width={bw}
        height={Math.max(2, sy(b.q1) - sy(b.q3))}
        fill="var(--accent-soft)"
        stroke="var(--accent)"
        strokeWidth="1"
      />
      <line x1={cx - bw / 2} y1={sy(b.median)} x2={cx + bw / 2} y2={sy(b.median)} stroke="var(--warn)" strokeWidth="1.8" />
      {b.mean !== undefined && (
        <path
          d={`M${cx} ${sy(b.mean) - 4}L${cx + 4} ${sy(b.mean)}L${cx} ${sy(b.mean) + 4}L${cx - 4} ${sy(b.mean)}Z`}
          fill="var(--danger)"
        />
      )}
      {b.outliers.map((v, i) => (
        <circle key={i} cx={cx + (i % 2 === 0 ? 1 : -1) * (bw / 2 + 8 + (i % 3) * 5)} cy={sy(v)} r="2.6" fill="none" stroke="var(--danger)" strokeWidth="1.2" />
      ))}
      {axis.xlabel && (
        <text x={cx} y={box.y + box.h + 28} textAnchor="middle" fontSize="10.5" fill="var(--faint)">
          {axis.xlabel}
        </text>
      )}
    </g>
  )
}

function Axis({ axis, box, id }: { axis: FigureAxis; box: Box; id: string }) {
  if (axis.type === 'pie') return <PieAxis axis={axis} box={box} />
  if (axis.type === 'box') return <BoxAxis axis={axis} box={box} />
  return <CartAxis axis={axis} box={box} id={id} />
}

export default function ChartCanvas({
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
  const figure: FigureSpec = step.figure ?? { panels: [] }
  const boxes = figure.layout === 'double' ? DOUBLE : [SINGLE]

  return (
    <section className="canvas-card" aria-label="图表画布">
      <CanvasToolbar
        title="图表画布"
        badge={figure.exportFrame ? 'EXPORT' : 'LIVE'}
        call={step.en}
        hint="每切换一步，画布上就多一层元素"
        playing={playing}
        speed={speed}
        onTogglePlay={onTogglePlay}
        onSpeed={onSpeed}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
      />

      <div className="canvas-body">
        <svg
          className="pipeline-svg"
          viewBox="0 0 900 448"
          role="img"
          aria-label={`${workflow.name}：${figure.caption ?? '图表画布'}，第 ${stepIndex + 1} 步`}
        >
          <defs>
            <pattern id="bp-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M24 0H0V24" fill="none" stroke="var(--grid-line)" strokeWidth="0.7" />
            </pattern>
            <pattern id="bp-grid-lg" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M120 0H0V120" fill="none" stroke="var(--grid-line-strong)" strokeWidth="0.8" />
            </pattern>
          </defs>

          <rect width="900" height="430" fill="url(#bp-grid)" />
          <rect width="900" height="430" fill="url(#bp-grid-lg)" />

          <g fill="var(--muted)" fontSize="12" letterSpacing="1.6">
            <text x="24" y="18">{figure.caption ?? 'FIG. — 图表画布'}</text>
            <text x="24" y="32" fill="var(--faint)">
              MATPLOTLIB · {figure.layout === 'double' ? '1 FIGURE · 2 AXES' : '1 FIGURE · 1 AXIS'}
            </text>
            <text x="876" y="18" textAnchor="end">
              {figure.badge ?? 'REV. 2024.11'}
            </text>
            <text x="876" y="32" textAnchor="end" fill="var(--faint)">
              {figure.layout === 'double' ? '9 × 4.5 IN' : '6 × 4 IN'} · 140 DPI
            </text>
          </g>

          <rect
            x={FIGURE.x}
            y={FIGURE.y}
            width={FIGURE.w}
            height={FIGURE.h}
            fill="var(--node-face)"
            stroke="var(--line-strong)"
            strokeWidth="1"
          />

          {figure.exportFrame && (
            <g>
              <rect
                x={FIGURE.x}
                y={FIGURE.y}
                width={FIGURE.w}
                height={FIGURE.h}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.2"
                strokeDasharray="6 5"
              />
              <g stroke="var(--accent)" strokeWidth="1.6" fill="none">
                <path d={`M${FIGURE.x} ${FIGURE.y + 20}V${FIGURE.y}h20`} />
                <path d={`M${FIGURE.x + FIGURE.w - 20} ${FIGURE.y}h20v20`} />
                <path d={`M${FIGURE.x} ${FIGURE.y + FIGURE.h - 20}v20h20`} />
                <path d={`M${FIGURE.x + FIGURE.w} ${FIGURE.y + FIGURE.h - 20}v20h-20`} />
              </g>
            </g>
          )}

          {figure.panels.map((axis, i) => (
            <Axis key={i} axis={axis} box={boxes[i] ?? SINGLE} id={`p${i}`} />
          ))}

          {figure.call && (
            <text x="56" y="428" fontSize="11" fill="var(--faint)">
              {figure.call}
            </text>
          )}
        </svg>
      </div>

      <CanvasTimeline steps={workflow.steps} stepIndex={stepIndex} onSelectStep={onSelectStep} />
    </section>
  )
}
