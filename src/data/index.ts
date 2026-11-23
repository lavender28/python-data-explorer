import type { Category, Workflow } from './types'
import { basicEnvWorkflow, basicNumStrWorkflow, basicVarsWorkflow } from './workflows-basic-a'
import {
  basicBranchWorkflow,
  basicDictWorkflow,
  basicListWorkflow,
  basicTupleSetWorkflow,
} from './workflows-basic-b'
import {
  basicExceptionWorkflow,
  basicFunctionalWorkflow,
  basicFunctionWorkflow,
  basicLoopWorkflow,
} from './workflows-basic-c'
import {
  basicFileWorkflow,
  basicOopWorkflow,
  basicSqlWorkflow,
} from './workflows-basic-d'
import { npArrayWorkflow, npMathWorkflow } from './workflows-np'
import { pdFrameWorkflow, pdSelectWorkflow } from './workflows-pd-basic'
import { pdCleanWorkflow, pdMergeWorkflow } from './workflows-pd-clean'
import { pdGroupWorkflow, pdPivotWorkflow } from './workflows-pd-group'
import { matplotlibWorkflow } from './workflows-viz'
import { mlClusterWorkflow, mlFlowWorkflow, mlRegWorkflow, mlTreeWorkflow } from './workflows-ml'
import { crawlHttpWorkflow, crawlParseWorkflow } from './workflows-crawl'

const basicWorkflows: Workflow[] = [
  basicEnvWorkflow,
  basicVarsWorkflow,
  basicNumStrWorkflow,
  basicListWorkflow,
  basicTupleSetWorkflow,
  basicDictWorkflow,
  basicBranchWorkflow,
  basicLoopWorkflow,
  basicExceptionWorkflow,
  basicFunctionWorkflow,
  basicFunctionalWorkflow,
  basicOopWorkflow,
  basicFileWorkflow,
  basicSqlWorkflow,
]

/** 数据分析篇：NumPy → Pandas → 预处理 → 分组 → 可视化 → 建模 → 采集 */
const analysisWorkflows: Workflow[] = [
  npArrayWorkflow,
  npMathWorkflow,
  pdFrameWorkflow,
  pdSelectWorkflow,
  pdMergeWorkflow,
  pdCleanWorkflow,
  pdGroupWorkflow,
  pdPivotWorkflow,
  matplotlibWorkflow,
  mlFlowWorkflow,
  mlClusterWorkflow,
  mlRegWorkflow,
  mlTreeWorkflow,
  crawlHttpWorkflow,
  crawlParseWorkflow,
]

export const WORKFLOWS: Workflow[] = [...basicWorkflows, ...analysisWorkflows]

/** 侧栏顺序：基础语法 → 数据分析，按学习路径排列 */
export const CATEGORY_ORDER: Category[] = [
  'basics',
  'container',
  'flow',
  'func',
  'io',
  'numpy',
  'core',
  'clean',
  'group',
  'viz',
  'ml',
  'crawl',
]

const byOrder = (list: Workflow[]) =>
  [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category))

export const FOCUSED_WORKFLOWS: Workflow[] = byOrder(WORKFLOWS)

export const TOTAL_STEPS = FOCUSED_WORKFLOWS.reduce((n, w) => n + w.steps.length, 0)

export function categoryCount(category: Category | 'all'): number {
  if (category === 'all') return FOCUSED_WORKFLOWS.length
  return FOCUSED_WORKFLOWS.filter((w) => w.category === category).length
}

export function getWorkflow(id: string): Workflow {
  return FOCUSED_WORKFLOWS.find((w) => w.id === id) ?? FOCUSED_WORKFLOWS[0]
}

export function stepKey(workflowId: string, index: number): string {
  return `${workflowId}:${index}`
}

export interface SearchHit {
  workflow: Workflow
  stepIndex: number | null
  stepTitle?: string
  stepSubtitle?: string
}

export function searchWorkflows(query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const hits: SearchHit[] = []

  for (const workflow of FOCUSED_WORKFLOWS) {
    const inMeta = [workflow.name, workflow.en, workflow.subtitle, workflow.description]
      .join(' ')
      .toLowerCase()
      .includes(q)
    if (inMeta) {
      hits.push({ workflow, stepIndex: null })
    }
    workflow.steps.forEach((step, i) => {
      const haystack = [step.title, step.en, step.subtitle, step.code, ...step.body]
        .join(' ')
        .toLowerCase()
      if (haystack.includes(q)) {
        hits.push({
          workflow,
          stepIndex: i,
          stepTitle: step.title,
          stepSubtitle: step.subtitle,
        })
      }
    })
  }
  return hits.slice(0, 16)
}
