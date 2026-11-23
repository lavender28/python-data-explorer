import type { Workflow } from '../data/types'

/** 第三方包探测：决定脚本头部提示「先装什么」 */
const PACKAGES: [string, string][] = [
  ['import numpy', 'numpy'],
  ['import pandas', 'pandas'],
  ['import matplotlib', 'matplotlib'],
  ['import sklearn', 'scikit-learn'],
  ['from sklearn', 'scikit-learn'],
  ['import requests', 'requests'],
  ['import bs4', 'beautifulsoup4'],
  ['from bs4', 'beautifulsoup4'],
  ['import lxml', 'lxml'],
  ['from lxml', 'lxml'],
  ['import pymysql', 'pymysql'],
]

export function buildScript(workflow: Workflow): string {
  const all = workflow.steps.map((s) => s.code).join('\n')
  const usesCsv = all.includes('data/orders.csv') || all.includes('read_csv')
  const usesNet = Boolean(workflow.setup) && all.includes('requests.get')

  const pkgs = PACKAGES.filter(([sig]) => all.includes(sig)).map(([, name]) => name)
  const installNote = pkgs.length
    ? `# 依赖第三方包：${[...new Set(pkgs)].join(' · ')}，先 pip install ${[...new Set(pkgs)].join(' ')}`
    : '# 本章只依赖 Python 标准库，无需额外安装。'

  const header = [
    `# ${workflow.name} — ${workflow.en}`,
    `# ${workflow.subtitle}`,
    '#',
    '# 由 Data Explorer 的步骤代码自动拼接，可直接运行。',
    installNote,
    ...(usesCsv ? ['# 示例数据 data/orders.csv 为虚构零售订单，字段说明见网站页脚。'] : []),
    ...(usesNet ? ['# setup 段会在本机 8765 端口起一个回环服务，所有请求都打向它，不联网也能跑通。'] : []),
    '',
    workflow.imports,
    '',
  ].join('\n')

  const setup = workflow.setup ? `${workflow.setup}\n` : ''

  const body = workflow.steps
    .map((step, i) =>
      [
        `# ── 步骤 ${String(i + 1).padStart(2, '0')} · ${step.title} / ${step.en} ──`,
        step.code.trim(),
      ].join('\n'),
    )
    .join('\n\n')

  return `${header}${setup}\n${body}\n`
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/x-python;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}
