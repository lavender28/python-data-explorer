import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { Step, Workflow } from '../data/types'

/** 所有画布共享的交互契约 */
export interface CanvasProps {
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

interface ToolbarProps {
  title: string
  badge: string
  call?: string
  hint?: string
  playing: boolean
  speed: number
  onTogglePlay: () => void
  onSpeed: (s: number) => void
  onPrev: () => void
  onNext: () => void
  onReset: () => void
}

export function CanvasToolbar({
  title,
  badge,
  call,
  hint,
  playing,
  speed,
  onTogglePlay,
  onSpeed,
  onPrev,
  onNext,
  onReset,
}: ToolbarProps) {
  return (
    <div className="canvas-toolbar">
      <div className="canvas-title">
        <span className="panel-title">{title}</span>
        <span className="live-chip">
          <span className="live-dot" /> {badge}
        </span>
      </div>

      {call && <span className="canvas-call">{call}</span>}

      {hint && <div className="canvas-hint">{hint}</div>}

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
  )
}

interface TimelineProps {
  steps: Step[]
  stepIndex: number
  onSelectStep: (i: number) => void
  label?: string
}

export function CanvasTimeline({ steps, stepIndex, onSelectStep, label = 'SEQ' }: TimelineProps) {
  return (
    <div className="canvas-timeline" role="tablist" aria-label="步骤时间线">
      <span className="tl-label">{label}</span>
      <div className="tl-segments">
        {steps.map((s, i) => (
          <button
            key={`${i}-${s.title}`}
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
        {String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
      </span>
    </div>
  )
}
