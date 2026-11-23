import type { TableSpec } from '../data/types'
import { CanvasTimeline, CanvasToolbar, type CanvasProps } from './CanvasChrome'

function fmt(n: number): string {
  return n.toLocaleString('en-US')
}

function Cell({ v, tone }: { v: string | number | null; tone?: string }) {
  if (v === null || v === undefined) {
    return <span className="tb-na">NaN</span>
  }
  return <span className={tone ? `tb-v t-${tone}` : 'tb-v'}>{v}</span>
}

export default function TableCanvas({
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
  const spec: TableSpec | undefined = step.table
  const [rows, cols] = spec?.shape ?? [0, 0]
  const hlCols = spec?.hlCols ?? []
  const hlRows = spec?.hlRows ?? []

  return (
    <section className="canvas-card table-card" aria-label="表格画布">
      <CanvasToolbar
        title="表格画布"
        badge="DF"
        call={step.en}
        hint="每切一步，表格的行、列与单元格就跟着变一次"
        playing={playing}
        speed={speed}
        onTogglePlay={onTogglePlay}
        onSpeed={onSpeed}
        onPrev={onPrev}
        onNext={onNext}
        onReset={onReset}
      />

      <div className="tb-body">
        <div className="tb-head">
          <div className="tb-head-left">
            <span className="tb-name">{spec?.name ?? 'df'}</span>
            <span className="tb-shape">
              {fmt(rows)} × {cols}
            </span>
          </div>
          <div className="tb-head-right">
            {spec?.op && <span className="tb-op">{spec.op}</span>}
            {spec?.delta && <span className="tb-delta">{spec.delta}</span>}
          </div>
        </div>

        {spec ? (
          <div className="tb-scroll">
            <table className="tb-table">
              <thead>
                <tr>
                  <th className="tb-ix-th">{spec.indexName ?? ''}</th>
                  {spec.columns.map((c, ci) => (
                    <th
                      key={c.label}
                      className={`${c.align === 'right' ? 'is-right' : ''} ${
                        hlCols.includes(ci) ? 'is-hl' : ''
                      } ${c.tone ? `c-${c.tone}` : ''}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spec.rows.map((row, ri) => (
                  <tr key={ri} className={hlRows.includes(ri) ? 'is-hl' : ''}>
                    <td className="tb-ix">{spec.index?.[ri] ?? ri}</td>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`${spec.columns[ci]?.align === 'right' ? 'is-right' : ''} ${
                          hlCols.includes(ci) ? 'is-hl' : ''
                        } ${cell.tone ? `k-${cell.tone}` : ''}`}
                      >
                        <Cell v={cell.v} tone={cell.tone} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="tb-empty">这一步没有表格快照，变化在右侧变量里。</div>
        )}

        <div className="tb-foot">
          {spec?.caption && <span className="tb-caption">{spec.caption}</span>}
          {spec?.footnote && <span className="tb-note">{spec.footnote}</span>}
        </div>
      </div>

      <CanvasTimeline steps={workflow.steps} stepIndex={stepIndex} onSelectStep={onSelectStep} />
    </section>
  )
}
