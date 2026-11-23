import { Activity, Table2 } from 'lucide-react'
import type { Tab, Workflow } from '../data/types'

interface Props {
  workflow: Workflow
  stepIndex: number
  tab: Tab
  onTab: (t: Tab) => void
}

export default function DataPanel({ workflow, stepIndex, tab, onTab }: Props) {
  const step = workflow.steps[stepIndex]
  const rows: {
    no: number
    time: string
    object: string
    action: string
    result: string
    rows: string
    current: boolean
  }[] = []

  let acc = 0
  workflow.steps.slice(0, stepIndex + 1).forEach((s, i) => {
    const trace = s.trace
    if (!trace) return
    acc += trace.ms
    rows.push({
      no: rows.length + 1,
      time: `${(acc / 1000).toFixed(3)}s`,
      object: trace.object,
      action: trace.action,
      result: trace.result,
      rows: trace.rows,
      current: i === stepIndex,
    })
  })

  const out = step.output

  return (
    <section className="data-panel" aria-label="数据快照与操作轨迹">
      <div className="data-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'snapshot'}
          className={`data-tab ${tab === 'snapshot' ? 'is-active' : ''}`}
          onClick={() => onTab('snapshot')}
        >
          <Table2 size={13} />
          数据快照
          {out && (
            <span className="tab-count">
              {out.kind === 'table' ? out.rows.length : out.kind === 'metrics' ? out.items.length : out.lines.length}
            </span>
          )}
        </button>
        <button
          role="tab"
          aria-selected={tab === 'trace'}
          className={`data-tab ${tab === 'trace' ? 'is-active' : ''}`}
          onClick={() => onTab('trace')}
        >
          <Activity size={13} />
          操作轨迹
          <span className="tab-count">{rows.length}</span>
        </button>
        <div className="data-meta">
          {tab === 'snapshot' ? 'OUTPUT SNAPSHOT' : 'PIPELINE TRACE'} ·{' '}
          {tab === 'snapshot' ? `STEP ${String(stepIndex + 1).padStart(2, '0')}` : 'CUMULATIVE'}
        </div>
      </div>

      <div className="data-body">
        {tab === 'trace' ? (
          <table className="data-table trace-table">
            <thead>
              <tr>
                <th className="col-no">#</th>
                <th>时间</th>
                <th>对象</th>
                <th>操作</th>
                <th>结果</th>
                <th className="align-right">行数</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.no} className={r.current ? 'is-current' : ''}>
                  <td className="col-no">{String(r.no).padStart(2, '0')}</td>
                  <td className="mono-muted">{r.time}</td>
                  <td className="strong">{r.object}</td>
                  <td>{r.action}</td>
                  <td className="muted">{r.result}</td>
                  <td className="align-right strong">{r.rows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : out ? (
          <div className="snapshot">
            {out.caption && <div className="snapshot-caption">{out.caption}</div>}

            {out.kind === 'table' && (
              <div className="table-scroll">
                <table className="data-table snapshot-table">
                  <thead>
                    <tr>
                      {out.columns.map((col) => (
                        <th key={col.key} className={col.align === 'right' ? 'align-right' : ''}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {out.rows.map((row, i) => (
                      <tr key={i}>
                        {out.columns.map((col) => {
                          const v = row[col.key]
                          return (
                            <td
                              key={col.key}
                              className={col.align === 'right' ? 'align-right mono' : ''}
                            >
                              {v === null || v === undefined ? (
                                <span className="null">NaN</span>
                              ) : (
                                v
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {out.kind === 'text' && (
              <pre className="console">
                {out.lines.map((line, i) => (
                  <span className="console-line" key={i}>
                    <span className="console-prompt">›</span>
                    {line || ' '}
                  </span>
                ))}
              </pre>
            )}

            {out.kind === 'metrics' && (
              <div className="metric-grid">
                {out.items.map((m) => (
                  <div className="metric" key={m.label}>
                    <div className="metric-label">{m.label}</div>
                    <div className="metric-value">{m.value}</div>
                    {m.note && <div className="metric-note">{m.note}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Table2 size={18} />
            <div>
              <div className="empty-title">这一步没有表格输出</div>
              <p>它只做结构检查或绘图设置，执行结果体现在下一步的数据快照里。</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
