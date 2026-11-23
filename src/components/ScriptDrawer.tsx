import { useEffect } from 'react'
import { Download, FileCode2, X } from 'lucide-react'
import type { Workflow } from '../data/types'
import { buildScript, downloadText } from '../lib/script'
import CodeBlock from './CodeBlock'

interface Props {
  workflow: Workflow
  open: boolean
  onClose: () => void
}

export default function ScriptDrawer({ workflow, open, onClose }: Props) {
  const script = buildScript(workflow)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const lines = script.split('\n').length

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${workflow.name} 完整脚本`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="drawer-head">
          <div className="drawer-heading">
            <span className="drawer-icon">
              <FileCode2 size={18} />
            </span>
            <div>
              <div className="panel-title">完整脚本</div>
              <div className="panel-sub">FULL SCRIPT · {workflow.en}</div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-meta">
          <span className="chip chip-ghost">{workflow.steps.length} STEPS</span>
          <span className="chip chip-ghost">PYTHON 3.12</span>
          <span className="chip chip-ghost">
            {workflow.canvasKind === 'runtime' ? 'STANDARD LIB' : 'PANDAS 2.2'}
          </span>
          <span className="drawer-note">{lines} 行 · 由步骤代码自动拼接</span>
        </div>

        <div className="drawer-body">
          <CodeBlock code={script} title={`${workflow.id}.py`} dense />
        </div>

        <div className="drawer-foot">
          <p>
            {workflow.canvasKind === 'runtime'
              ? '按顺序执行即可复现全部输出；文件相关步骤会在当前目录生成示例文件，SQL 步骤需要本地 MySQL。'
              : '脚本以示例数据 data/orders.csv 为输入。替换路径与列名后即可用于你的数据；绘图步骤需要额外安装 matplotlib / seaborn。'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => downloadText(`${workflow.id}.py`, script)}
          >
            <Download size={14} /> 下载 .py
          </button>
        </div>
      </div>
    </div>
  )
}
