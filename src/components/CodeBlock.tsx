import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { highlightLine } from '../lib/highlight'
import { copyText } from '../lib/script'

interface Props {
  code: string
  title?: string
  showLineNumbers?: boolean
  copyable?: boolean
  dense?: boolean
}

export default function CodeBlock({
  code,
  title,
  showLineNumbers = true,
  copyable = true,
  dense = false,
}: Props) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  const lines = code.replace(/\n$/, '').split('\n')

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  async function onCopy() {
    const ok = await copyText(code)
    if (!ok) return
    setCopied(true)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className={`code ${dense ? 'code-dense' : ''}`}>
      <div className="code-bar">
        <span className="code-title">
          <span className="code-dot" />
          {title ?? 'python'}
        </span>
        {copyable && (
          <button className="code-copy" onClick={onCopy} type="button">
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? '已复制' : '复制'}
          </button>
        )}
      </div>
      <pre className="code-body" tabIndex={0}>
        <code>
          {lines.map((line, i) => (
            <span className="code-line" key={i}>
              {showLineNumbers && (
                <span className="code-ln" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              )}
              <span className="code-src">{highlightLine(line, `c${i}`)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
