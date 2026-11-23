import { CheckCircle2, Download, RotateCcw } from 'lucide-react'
import type { Workflow } from '../data/types'
import { CATEGORY_META } from '../data/types'

interface Props {
  workflow: Workflow
  stepIndex: number
  completed: Record<string, true>
  completedWorkflows: number
  totalWorkflows: number
  totalSteps: number
  onOpenScript: () => void
  onReset: () => void
}

export default function OverviewPanel({
  workflow,
  stepIndex,
  completed,
  completedWorkflows,
  totalWorkflows,
  totalSteps,
  onOpenScript,
  onReset,
}: Props) {
  const done = workflow.steps.filter((_, i) => completed[`${workflow.id}:${i}`]).length
  const percent = Math.round((done / workflow.steps.length) * 100)
  const allDone = done === workflow.steps.length

  return (
    <aside className="overview" aria-label="主题总览">
      <div className="overview-head">
        <div>
          <div className="panel-title">主题总览</div>
          <div className="panel-sub">TOPIC OVERVIEW</div>
        </div>
        <span className={`status-badge ${allDone ? 'is-done' : ''}`}>
          <span className="status-dot" />
          {allDone ? 'DONE' : 'ACTIVE'}
        </span>
      </div>

      <div className="overview-body">
        <div className="ov-chips">
          <span className={`chip chip-${CATEGORY_META[workflow.category].tone}`}>
            {CATEGORY_META[workflow.category].label} · {CATEGORY_META[workflow.category].zh}
          </span>
          <span className="chip chip-ghost">
            {workflow.steps.length} STEPS
          </span>
        </div>

        <h1 className="ov-title">{workflow.name}</h1>
        <div className="ov-en">{workflow.en}</div>
        <p className="ov-sub">{workflow.subtitle}</p>
        <p className="ov-desc">{workflow.description}</p>

        <dl className="attr-table">
          {workflow.attrs.map((a) => (
            <div className="attr-row" key={a.label}>
              <dt>{a.label}</dt>
              <dd>{a.value}</dd>
            </div>
          ))}
        </dl>

        <div className="ov-divider" />

        <div className="ov-progress">
          <div className="ov-progress-head">
            <span className="eyebrow">本主题进度</span>
            <span className="ov-progress-pct">{percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="ov-progress-meta">
            <span>
              <CheckCircle2 size={12} /> {done} / {workflow.steps.length} 步
            </span>
            <span>
              已完成主题 {completedWorkflows} / {totalWorkflows}
            </span>
          </div>
          <p className="ov-progress-note">
            当前第 {stepIndex + 1} 步 · 全站累计 {Object.keys(completed).length} / {totalSteps} 步
          </p>
        </div>

        <button className="btn btn-primary btn-block" onClick={onOpenScript}>
          <Download size={14} /> 查看并导出完整脚本
        </button>

        <div className="shortcut-card">
          <div className="shortcut-title">键盘快捷键</div>
          <div className="shortcut-row">
            <span>搜索工作流</span>
            <span>
              <kbd>⌘</kbd> <kbd>K</kbd>
            </span>
          </div>
          <div className="shortcut-row">
            <span>上一步 / 下一步</span>
            <span>
              <kbd>←</kbd> <kbd>→</kbd>
            </span>
          </div>
          <div className="shortcut-row">
            <span>自动播放</span>
            <span>
              <kbd>空格</kbd>
            </span>
          </div>
          <div className="shortcut-row">
            <span>关闭弹层</span>
            <span>
              <kbd>Esc</kbd>
            </span>
          </div>
        </div>

        <button className="reset-link" onClick={onReset} type="button">
          <RotateCcw size={12} /> 重置全部学习进度
        </button>

        <div className="ov-foot">
          <p>
            {workflow.canvasKind === 'runtime'
              ? '代码只用标准库，控制台输出为真实执行结果。'
              : '数据集为虚构示例，代码按 pandas 2.2 / Python 3.12 编写。'}
          </p>
          <p className="ov-sign">DESIGNED FOR DATA LEARNERS · 2024</p>
        </div>
      </div>
    </aside>
  )
}
