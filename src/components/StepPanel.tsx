import { ArrowLeft, ArrowRight, Check, Lightbulb, RotateCcw, Table2 } from 'lucide-react'
import type { Workflow } from '../data/types'
import { stageIndex, stagesOf } from '../data/types'
import CodeBlock from './CodeBlock'

interface Props {
  workflow: Workflow
  stepIndex: number
  isDone: boolean
  onPrev: () => void
  onNext: () => void
  onReplay: () => void
  onToggleDone: () => void
  onShowSnapshot: () => void
}

export default function StepPanel({
  workflow,
  stepIndex,
  isDone,
  onPrev,
  onNext,
  onReplay,
  onToggleDone,
  onShowSnapshot,
}: Props) {
  const step = workflow.steps[stepIndex]
  const stagePos = stageIndex(workflow, step.stage)
  const stage = stagesOf(workflow)[stagePos]
  const runtime = (step.canvas ?? workflow.canvasKind) === 'runtime'
  const last = stepIndex === workflow.steps.length - 1
  const out = step.output

  const outputSummary = out
    ? out.kind === 'table'
      ? `${out.rows.length} 行 × ${out.columns.length} 列`
      : out.kind === 'metrics'
        ? `${out.items.length} 个指标`
        : `${out.lines.length} 行输出`
    : null

  return (
    <article className="step-card" key={`${workflow.id}-${stepIndex}`}>
      <div className="step-head">
        <div className="step-eyebrow">
          <span>
            STEP {String(stepIndex + 1).padStart(2, '0')} /{' '}
            {String(workflow.steps.length).padStart(2, '0')}
          </span>
          <span className="dot-sep">·</span>
          <span className={`stage-chip stage-tone-${stagePos}`}>
            {stage?.en} · {stage?.zh}
          </span>
          {isDone && (
            <span className="done-chip">
              <Check size={11} /> 已完成
            </span>
          )}
        </div>

        <div className="step-title-row">
          <h2 className="step-title">{step.title}</h2>
          <span className="step-en">{step.en}</span>
        </div>
        <p className="step-sub">{step.subtitle}</p>
      </div>

      <div className={`step-grid ${runtime ? 'is-single' : ''}`}>
        <div className="step-prose">
          {step.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {step.tip && (
            <aside className="tip">
              <Lightbulb size={14} className="tip-icon" />
              <div>
                <div className="tip-label">实践提示</div>
                <p>{step.tip}</p>
              </div>
            </aside>
          )}

          {runtime && outputSummary && (
            <button className="snapshot-link is-inline" onClick={onShowSnapshot} type="button">
              <Table2 size={13} />
              查看运行输出 · {outputSummary}
              <ArrowRight size={13} />
            </button>
          )}
        </div>

        {!runtime && (
          <div className="step-code">
            <CodeBlock
              code={step.code}
              title={`${workflow.id}.py · step ${String(stepIndex + 1).padStart(2, '0')}`}
            />
            {outputSummary && (
              <button className="snapshot-link" onClick={onShowSnapshot} type="button">
                <Table2 size={13} />
                查看数据快照 · {outputSummary}
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="step-actions">
        <span className="kbd-hint">
          <kbd>←</kbd> <kbd>→</kbd> 切换步骤 · <kbd>空格</kbd> 播放
        </span>
        <div className="step-btns">
          <button className="btn btn-ghost" onClick={onPrev} disabled={stepIndex === 0}>
            <ArrowLeft size={14} /> 上一步
          </button>
          <button
            className={`btn ${isDone ? 'btn-soft' : 'btn-ghost'}`}
            onClick={onToggleDone}
            aria-pressed={isDone}
          >
            <Check size={14} /> {isDone ? '取消完成' : '标记完成'}
          </button>
          {last ? (
            <button className="btn btn-primary" onClick={onReplay}>
              <RotateCcw size={14} /> 重播主题
            </button>
          ) : (
            <button className="btn btn-primary" onClick={onNext}>
              下一步 <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
