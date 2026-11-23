import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { FOCUSED_WORKFLOWS, TOTAL_STEPS, searchWorkflows, type SearchHit } from '../data'
import { CATEGORY_META } from '../data/types'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (workflowId: string, stepIndex: number | null) => void
}

const SUGGESTIONS = ['列表推导式', 'try', 'lambda', 'with open', '字典', 'groupby']

export default function SearchPalette({ open, onClose, onPick }: Props) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const hits: SearchHit[] = useMemo(
    () => (query.trim() ? searchWorkflows(query) : []),
    [query],
  )

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    const t = window.setTimeout(() => inputRef.current?.focus(), 30)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    setCursor(0)
  }, [query])

  if (!open) return null

  function pick(hit: SearchHit) {
    onPick(hit.workflow.id, hit.stepIndex)
    onClose()
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hits.length) setCursor((c) => Math.min(c + 1, hits.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (hits.length) setCursor((c) => Math.max(c - 1, 0))
    } else if (e.key === 'Enter' && hits[cursor]) {
      e.preventDefault()
      pick(hits[cursor])
    }
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="搜索工作流"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="palette-input">
          <Search size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索主题、步骤、函数或概念…"
            aria-label="搜索"
            spellCheck={false}
          />
          <kbd>ESC</kbd>
        </div>

        <div className="palette-results">
          {!query.trim() && (
            <div className="palette-start">
              <div className="palette-label">快速开始</div>
              <div className="quick-grid">
                {FOCUSED_WORKFLOWS.slice(0, 4).map((w) => (
                  <button
                    key={w.id}
                    className="quick-item"
                    onClick={() => {
                      onPick(w.id, null)
                      onClose()
                    }}
                  >
                    <span className="quick-cat">{CATEGORY_META[w.category].zh}</span>
                    <span className="quick-name">{w.name}</span>
                    <ArrowRight size={13} />
                  </button>
                ))}
              </div>
              <div className="palette-label" style={{ marginTop: 18 }}>
                试试搜索
              </div>
              <div className="suggestion-row">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="suggestion" onClick={() => setQuery(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {query.trim() && hits.length === 0 && (
            <div className="palette-empty">
              <div className="empty-title">没有匹配的结果</div>
              <p>试试更短的关键词，例如 “merge”、“P90”、“histplot”。</p>
            </div>
          )}

          {hits.map((hit, i) => (
            <button
              key={`${hit.workflow.id}-${hit.stepIndex ?? 'overview'}`}
              className={`palette-row ${i === cursor ? 'is-active' : ''}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => pick(hit)}
            >
              <span className="palette-index">
                {String(FOCUSED_WORKFLOWS.indexOf(hit.workflow) + 1).padStart(2, '0')}
              </span>
              <span className="palette-main">
                <span className="palette-title">
                  {hit.workflow.name}
                  {hit.stepTitle && (
                    <>
                      <span className="palette-slash">/</span>
                      {hit.stepTitle}
                    </>
                  )}
                </span>
                <span className="palette-sub">
                  {hit.stepIndex === null
                    ? `主题总览 · ${hit.workflow.steps.length} 个步骤`
                    : `步骤 ${String(hit.stepIndex + 1).padStart(2, '0')} · ${hit.stepSubtitle}`}
                </span>
              </span>
              <span className={`chip chip-${CATEGORY_META[hit.workflow.category].tone}`}>
                {CATEGORY_META[hit.workflow.category].zh}
              </span>
              {i === cursor && <CornerDownLeft size={13} className="palette-enter" />}
            </button>
          ))}
        </div>

        <div className="palette-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 移动
          </span>
          <span>
            <kbd>↵</kbd> 打开
          </span>
          <span className="palette-total">
            {query.trim() ? `${hits.length} 个结果` : `${FOCUSED_WORKFLOWS.length} 个主题 · ${TOTAL_STEPS} 个步骤`}
          </span>
        </div>
      </div>
    </div>
  )
}
