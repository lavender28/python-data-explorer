import { Check, ChevronRight, Database } from 'lucide-react'
import type { Workflow } from '../data/types'
import { CATEGORY_META } from '../data/types'
import { CATEGORY_ORDER } from '../data'

interface Props {
  workflows: Workflow[]
  activeId: string
  stepIndex: number
  onSelectWorkflow: (id: string) => void
  onSelectStep: (id: string, index: number) => void
  completed: Record<string, true>
  open: boolean
}

export default function Sidebar({
  workflows,
  activeId,
  stepIndex,
  onSelectWorkflow,
  onSelectStep,
  completed,
  open,
}: Props) {
  const groups = CATEGORY_ORDER.map((c) => ({
    category: c,
    items: workflows.filter((w) => w.category === c),
  })).filter((g) => g.items.length > 0)

  return (
    <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="课程目录">
      <div className="sidebar-head">
        <div>
          <div className="panel-title">课程目录</div>
          <div className="panel-sub">TOPICS · {workflows.length} CHAPTERS</div>
        </div>
        <span className="count-badge">{workflows.length}</span>
      </div>

      <div className="workflow-list">
        {groups.map((group) => {
          const meta = CATEGORY_META[group.category]
          return (
            <div className="wf-group" key={group.category}>
              <div className="wf-group-head">
                <span className={`chip chip-${meta.tone}`}>{meta.zh}</span>
                <span className="wf-group-label">{meta.label}</span>
                <span className="wf-group-count">{String(group.items.length).padStart(2, '0')}</span>
              </div>

              {group.items.map((w) => {
                const done = w.steps.filter((_, i) => completed[`${w.id}:${i}`]).length
                const active = w.id === activeId
                return (
                  <div className={`workflow ${active ? 'is-active' : ''}`} key={w.id}>
                    <button
                      className="workflow-head"
                      onClick={() => onSelectWorkflow(w.id)}
                      aria-expanded={active}
                    >
                      <span className="wf-index">
                        {String(workflows.indexOf(w) + 1).padStart(2, '0')}
                      </span>
                      <span className="wf-main">
                        <span className="wf-top">
                          <span className="wf-name">{w.name}</span>
                        </span>
                        <span className="wf-sub">{w.subtitle}</span>
                      </span>
                      <span className="wf-side">
                        {done > 0 ? (
                          <span className={`wf-count ${done === w.steps.length ? 'is-done' : ''}`}>
                            {done === w.steps.length ? <Check size={12} /> : `${done}/${w.steps.length}`}
                          </span>
                        ) : (
                          <ChevronRight size={14} className="wf-chevron" />
                        )}
                      </span>
                    </button>

                    {active && (
                      <ol className="step-list">
                        {w.steps.map((step, i) => {
                          const isDone = !!completed[`${w.id}:${i}`]
                          const isCurrent = i === stepIndex
                          return (
                            <li key={step.title}>
                              <button
                                className={`step-item ${isCurrent ? 'is-current' : ''} ${
                                  isDone ? 'is-done' : ''
                                }`}
                                onClick={() => onSelectStep(w.id, i)}
                              >
                                <span className="step-marker">
                                  {isDone ? <Check size={10} /> : String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="step-text">
                                  <span className="step-title">{step.title}</span>
                                  <span className="step-sub">{step.subtitle}</span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ol>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="sidebar-foot">
        <div className="foot-title">
          <Database size={13} /> 关于示例代码
        </div>
        <p>
          每段代码都可以直接运行，控制台里的输出是真实执行结果。基础语法章节只用标准库，
          文件章节会在当前目录生成示例文件。
        </p>
        <div className="foot-meta">
          <span>Python 3.12</span>
          <span>·</span>
          <span>标准库</span>
        </div>
      </div>
    </aside>
  )
}
