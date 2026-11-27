import { Menu, Moon, Search, Sun } from 'lucide-react'
import type { Workflow } from '../data/types'
import { stageIndex, stagesOf } from '../data/types'
import Logo from './Logo'

interface Props {
  workflow: Workflow
  stepIndex: number
  completedCount: number
  totalSteps: number
  theme: 'light' | 'dark'
  scheme: 'a' | 'b' | 'c'
  onCycleScheme: () => void
  onSearch: () => void
  onToggleTheme: () => void
  onMenu: () => void
}

// 配色方案：同一套版式，三种气质
const SCHEME_LABEL: Record<'a' | 'b' | 'c', string> = {
  a: '宣纸墨绿',
  b: '暖灯琥珀',
  c: '晨雾靛紫',
}

export default function Header({
  workflow,
  stepIndex,
  completedCount,
  totalSteps,
  theme,
  scheme,
  onCycleScheme,
  onSearch,
  onToggleTheme,
  onMenu,
}: Props) {
  const stages = stagesOf(workflow)
  const stage = workflow.steps[stepIndex]?.stage ?? stages[0].key
  const activeStage = stageIndex(workflow, stage)
  const percent = Math.round((completedCount / totalSteps) * 100)

  return (
    <header className="topbar">
      <div className="brand">
        <button className="icon-btn menu-btn" onClick={onMenu} aria-label="打开工作流列表">
          <Menu size={18} />
        </button>
        <Logo />
        <div className="brand-text">
          <div className="brand-title">
            DATA<span className="brand-slash">/</span>EXPLORER
          </div>
          <div className="brand-sub">用 PYTHON 读懂数据</div>
        </div>
      </div>

      <div className="topbar-mid">
        <div className="now-learning">
          <div className="eyebrow">
            <span className="live-dot" />
            正在学习 · NOW LEARNING
          </div>
          <div className="now-line">
            <span className="now-name">{workflow.name}</span>
            <span className="now-meta">
              步骤 {String(stepIndex + 1).padStart(2, '0')} /{' '}
              {String(workflow.steps.length).padStart(2, '0')}
            </span>
          </div>
          <div className="now-sub">{workflow.en} · {workflow.subtitle}</div>
        </div>

        <div className="stage-rail" aria-label="数据处理阶段">
          <span className="rail-label">STAGE</span>
          {stages.map((s, i) => (
            <div
              key={s.key}
              className={`rail-step ${i === activeStage ? 'is-active' : ''} ${
                i < activeStage ? 'is-past' : ''
              }`}
              title={`${s.zh} · ${s.en}`}
            >
              <span className="rail-num">{i + 1}</span>
              <span className="rail-zh">{s.zh}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="topbar-right">
        <button className="search-trigger" onClick={onSearch} type="button">
          <Search size={15} />
          <span className="search-placeholder">搜索工作流</span>
          <kbd>⌘ K</kbd>
        </button>

        <div className="progress-block" title={`已完成 ${completedCount} / ${totalSteps} 步`}>
          <div className="progress-head">
            <span className="eyebrow">学习进度</span>
            <span className="progress-pct">{percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-sub">
            {completedCount} / {totalSteps} 步已完成
          </div>
        </div>

        <button
          className="scheme-btn"
          onClick={onCycleScheme}
          aria-label={`配色：${SCHEME_LABEL[scheme]}，点击切换`}
          title={`配色：${SCHEME_LABEL[scheme]}（点击切换）`}
        >
          <span className={`scheme-dot scheme-${scheme}`} />
          <span className="scheme-code">{scheme.toUpperCase()}</span>
        </button>

        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
          title={theme === 'light' ? '深色蓝图' : '浅色蓝图'}
        >
          {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  )
}
