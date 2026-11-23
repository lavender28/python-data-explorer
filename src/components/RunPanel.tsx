import { Activity, TerminalSquare } from 'lucide-react'
import type { Tab, Workflow } from '../data/types'

interface Props {
  workflow: Workflow
  stepIndex: number
  tab: Tab
  onTab: (t: Tab) => void
}

interface VarRow {
  name: string
  type: string
  value: string
  step: number
}

export default function RunPanel({ workflow, stepIndex, tab, onTab }: Props) {
  const steps = workflow.steps.slice(0, stepIndex + 1)

  const outBlocks = steps
    .map((s, i) => ({ step: i, title: s.title, out: s.output }))
    .filter((b) => b.out)

  const outputLines = outBlocks.reduce(
    (n, b) =>
      n +
      (b.out?.kind === 'text' ? b.out.lines.length : b.out?.kind === 'table' ? b.out.rows.length : 0),
    0,
  )

  const varMap = new Map<string, VarRow>()
  steps.forEach((s, i) => {
    s.memory?.forEach((v) => {
      varMap.set(v.name, { name: v.name, type: v.type, value: v.value, step: i + 1 })
    })
  })
  const vars = Array.from(varMap.values())

  return (
    <section className="data-panel" aria-label="运行输出与变量变化">
      <div className="data-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'snapshot'}
          className={`data-tab ${tab === 'snapshot' ? 'is-active' : ''}`}
          onClick={() => onTab('snapshot')}
        >
          <TerminalSquare size={13} />
          运行输出
          <span className="tab-count">{outputLines}</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === 'trace'}
          className={`data-tab ${tab === 'trace' ? 'is-active' : ''}`}
          onClick={() => onTab('trace')}
        >
          <Activity size={13} />
          变量变化
          <span className="tab-count">{vars.length}</span>
        </button>
        <div className="data-meta">
          {tab === 'snapshot' ? 'STDOUT' : 'VARIABLES'} ·{' '}
          {tab === 'snapshot' ? `STEP 01–${String(stepIndex + 1).padStart(2, '0')}` : 'LATEST VALUE'}
        </div>
      </div>

      <div className="data-body">
        {tab === 'snapshot' ? (
          outBlocks.length === 0 ? (
            <div className="empty-state">
              <TerminalSquare size={18} />
              <div>
                <div className="empty-title">还没有任何输出</div>
                <p>前面的步骤只定义变量或做判断，print 之后才会在这里出现内容。</p>
              </div>
            </div>
          ) : (
            <div className="run-log">
              {outBlocks.map((b) => (
                <div className="run-block" key={b.step}>
                  <div className="run-block-head">
                    <span>STEP {String(b.step + 1).padStart(2, '0')}</span>
                    <span className="run-block-title">{b.title}</span>
                  </div>
                  {b.out?.kind === 'text' && (
                    <pre className="console">
                      {b.out.lines.map((line, i) => (
                        <span className="console-line" key={i}>
                          <span className="console-prompt">›</span>
                          {line || ' '}
                        </span>
                      ))}
                    </pre>
                  )}
                  {b.out?.kind === 'table' && (
                    <div className="table-scroll">
                      <table className="data-table snapshot-table">
                        <thead>
                          <tr>
                            {b.out.columns.map((c) => (
                              <th key={c.key} className={c.align === 'right' ? 'align-right' : ''}>
                                {c.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {b.out.rows.map((row, i) => (
                            <tr key={i}>
                              {b.out!.kind === 'table' &&
                                b.out!.columns.map((c) => (
                                  <td
                                    key={c.key}
                                    className={c.align === 'right' ? 'align-right mono' : ''}
                                  >
                                    {row[c.key] ?? ''}
                                  </td>
                                ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {b.out?.kind === 'metrics' && (
                    <div className="metric-grid">
                      {b.out.items.map((m) => (
                        <div className="metric" key={m.label}>
                          <div className="metric-label">{m.label}</div>
                          <div className="metric-value">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <table className="data-table trace-table">
            <thead>
              <tr>
                <th>变量</th>
                <th>类型</th>
                <th>当前值</th>
                <th className="align-right">更新于</th>
              </tr>
            </thead>
            <tbody>
              {vars.map((v) => (
                <tr key={v.name} className={v.step === stepIndex + 1 ? 'is-current' : ''}>
                  <td className="strong">{v.name}</td>
                  <td className="mono-muted">{v.type}</td>
                  <td className="muted">{v.value}</td>
                  <td className="align-right strong">{String(v.step).padStart(2, '0')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
