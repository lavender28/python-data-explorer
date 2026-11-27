import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import ChartCanvas from './components/ChartCanvas'
import RuntimeCanvas from './components/RuntimeCanvas'
import TableCanvas from './components/TableCanvas'
import ModelCanvas from './components/ModelCanvas'
import SceneCanvas from './components/SceneCanvas'
import StepPanel from './components/StepPanel'
import DataPanel from './components/DataPanel'
import RunPanel from './components/RunPanel'
import OverviewPanel from './components/OverviewPanel'
import SearchPalette from './components/SearchPalette'
import ScriptDrawer from './components/ScriptDrawer'
import { FOCUSED_WORKFLOWS, TOTAL_STEPS, getWorkflow, stepKey } from './data'
import { stagesOf } from './data/types'
import type { Tab } from './data/types'

const PROGRESS_KEY = 'data-explorer:progress:v1'
const THEME_KEY = 'data-explorer:theme:v1'
const SCHEME_KEY = 'data-explorer:scheme:v1'

export type Scheme = 'a' | 'b' | 'c'

export const SCHEME_NAME: Record<Scheme, string> = {
  a: '宣纸墨绿',
  b: '暖灯琥珀',
  c: '晨雾靛紫',
}

function loadScheme(): Scheme {
  try {
    const raw = localStorage.getItem(SCHEME_KEY)
    return raw === 'a' || raw === 'c' ? raw : 'b'
  } catch {
    return 'b'
  }
}

function loadProgress(): Record<string, true> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, true>) : {}
  } catch {
    return {}
  }
}

function loadTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const [workflowId, setWorkflowId] = useState(FOCUSED_WORKFLOWS[0].id)
  const [stepIndex, setStepIndex] = useState(0)
  const [completed, setCompleted] = useState<Record<string, true>>(loadProgress)
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme)
  const [scheme, setScheme] = useState<Scheme>(loadScheme)
  const [tab, setTab] = useState<Tab>('snapshot')
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [scriptOpen, setScriptOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stageScrollRef = useRef<HTMLDivElement>(null)
  const dataPanelRef = useRef<HTMLDivElement>(null)

  const workflow = useMemo(() => getWorkflow(workflowId), [workflowId])
  const step = workflow.steps[stepIndex] ?? workflow.steps[0]
  const totalSteps = TOTAL_STEPS
  const completedCount = Object.keys(completed).length
  const completedWorkflows = FOCUSED_WORKFLOWS.filter((w) =>
    w.steps.every((_, i) => completed[`${w.id}:${i}`]),
  ).length

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', scheme)
    try {
      localStorage.setItem(SCHEME_KEY, scheme)
    } catch {
      /* ignore */
    }
  }, [scheme])

  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed))
    } catch {
      /* ignore */
    }
  }, [completed])

  useEffect(() => {
    document.title = `${workflow.name} · Data Explorer`
  }, [workflow.name])

  useEffect(() => {
    if (!playing) return
    if (stepIndex >= workflow.steps.length - 1) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => {
      setStepIndex((i) => Math.min(i + 1, workflow.steps.length - 1))
    }, 2600 / speed)
    return () => window.clearTimeout(id)
  }, [playing, stepIndex, speed, workflow.steps.length])

  function selectWorkflow(id: string) {
    setWorkflowId(id)
    setStepIndex(0)
    setPlaying(false)
    setTab('snapshot')
    setSidebarOpen(false)
    stageScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function selectStep(id: string, index: number) {
    if (id !== workflowId) {
      setWorkflowId(id)
      setPlaying(false)
      setTab('snapshot')
    }
    setStepIndex(index)
    setSidebarOpen(false)
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, workflow.steps.length - 1))
  }

  function goPrev() {
    setStepIndex((i) => Math.max(i - 1, 0))
  }

  function replay() {
    setStepIndex(0)
    setPlaying(true)
  }

  function toggleDone() {
    const key = stepKey(workflow.id, stepIndex)
    setCompleted((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      return next
    })
  }

  function resetProgress() {
    if (window.confirm('确定清空全部学习进度吗？该操作不可撤销。')) {
      setCompleted({})
      setPlaying(false)
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (paletteOpen || scriptOpen) return
      const t = e.target as HTMLElement | null
      const tag = t?.tagName ?? ''
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable
      if (typing) return

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
        return
      }
      if (tag === 'BUTTON' || tag === 'A') return

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setPlaying(false)
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setPlaying(false)
        goPrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        setPlaying((p) => !p)
      } else if (e.key === 'Escape') {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const isDone = !!completed[stepKey(workflow.id, stepIndex)]

  const canvasProps = {
    workflow,
    stepIndex,
    playing,
    speed,
    onTogglePlay: () => setPlaying((p) => !p),
    onSpeed: setSpeed,
    onPrev: () => {
      setPlaying(false)
      goPrev()
    },
    onNext: () => {
      setPlaying(false)
      goNext()
    },
    onReset: () => {
      setPlaying(false)
      setStepIndex(0)
    },
    onSelectStep: (i: number) => {
      setPlaying(false)
      setStepIndex(i)
    },
  }

  const canvas =
    (step.canvas ?? workflow.canvasKind) === 'runtime' ? (
      <RuntimeCanvas {...canvasProps} />
    ) : (step.canvas ?? workflow.canvasKind) === 'table' ? (
      <TableCanvas {...canvasProps} />
    ) : (step.canvas ?? workflow.canvasKind) === 'model' ? (
      <ModelCanvas {...canvasProps} />
    ) : (step.canvas ?? workflow.canvasKind) === 'scene' ? (
      <SceneCanvas {...canvasProps} />
    ) : (
      <ChartCanvas {...canvasProps} />
    )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-stage">
        跳到主内容
      </a>

      <Header
        workflow={workflow}
        stepIndex={stepIndex}
        completedCount={completedCount}
        totalSteps={totalSteps}
        theme={theme}
        scheme={scheme}
        onCycleScheme={() => setScheme(scheme === 'a' ? 'b' : scheme === 'b' ? 'c' : 'a')}
        onSearch={() => setPaletteOpen(true)}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        onMenu={() => setSidebarOpen(true)}
      />

      <main className="workspace">
        <Sidebar
          workflows={FOCUSED_WORKFLOWS}
          activeId={workflow.id}
          stepIndex={stepIndex}
          onSelectWorkflow={selectWorkflow}
          onSelectStep={selectStep}
          completed={completed}
          open={sidebarOpen}
        />

        <div className="stage-scroll" id="main-stage" ref={stageScrollRef}>
          {canvas}

          <StepPanel
            workflow={workflow}
            stepIndex={stepIndex}
            isDone={isDone}
            onPrev={() => {
              setPlaying(false)
              goPrev()
            }}
            onNext={() => {
              setPlaying(false)
              goNext()
            }}
            onReplay={replay}
            onToggleDone={toggleDone}
            onShowSnapshot={() => {
              setTab('snapshot')
              dataPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
          />

          <div ref={dataPanelRef}>
            {(step.canvas ?? workflow.canvasKind) === 'chart' || !workflow.canvasKind ? (
              <DataPanel workflow={workflow} stepIndex={stepIndex} tab={tab} onTab={setTab} />
            ) : (
              <RunPanel workflow={workflow} stepIndex={stepIndex} tab={tab} onTab={setTab} />
            )}
          </div>

          <footer className="stage-foot">
            <span>
              当前步骤 · <strong>{step.en}</strong> {step.title}
            </span>
            <span className="foot-sep">/</span>
            <span>{workflow.en}</span>
            <span className="foot-sep">/</span>
            <span>
              {workflow.canvasKind === 'runtime' ? '执行链路：' : '绘制链路：'}
              {stagesOf(workflow)
                .map((st) => st.en)
                .join(' → ')}
            </span>
          </footer>
        </div>

        <OverviewPanel
          workflow={workflow}
          stepIndex={stepIndex}
          completed={completed}
          completedWorkflows={completedWorkflows}
          totalWorkflows={FOCUSED_WORKFLOWS.length}
          totalSteps={totalSteps}
          onOpenScript={() => setScriptOpen(true)}
          onReset={resetProgress}
        />
      </main>

      {sidebarOpen && (
        <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="关闭目录" />
      )}

      <SearchPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={(id, idx) => {
          setWorkflowId(id)
          setStepIndex(idx ?? 0)
          setPlaying(false)
          setTab('snapshot')
          stageScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />

      <ScriptDrawer workflow={workflow} open={scriptOpen} onClose={() => setScriptOpen(false)} />
    </div>
  )
}
