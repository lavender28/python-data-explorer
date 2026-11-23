// 校验器：打包 src/data，逐步骤跑 python3，比对 stdout 与声明的 output.lines
import { build } from 'esbuild'
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const out = join(mkdtempSync(join(tmpdir(), 'vfy-')), 'data.mjs')
await build({
  entryPoints: ['src/data/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: out,
  logLevel: 'error',
})

const mod = await import(`file://${out}`)
const workflows = mod.FOCUSED_WORKFLOWS ?? mod.WORKFLOWS

const only = process.argv[2]
const verbose = process.argv.includes('-v')

let checked = 0
let skipped = 0
let failed = 0
const failures = []

for (const wf of workflows) {
  if (only && !wf.id.startsWith(only) && wf.id !== only) continue
  for (let i = 0; i < wf.steps.length; i += 1) {
    const s = wf.steps[i]
    if (!s.code || !s.code.trim()) continue
    // 标了 verify: false 的步骤跳过：SQL、依赖外部服务、输出随机器变化
    if (s.verify === false) {
      skipped += 1
      continue
    }
    const tag = `${wf.id}[${i}] ${s.title}`
    const file = join(tmpdir(), `step-${wf.id}-${i}.py`)
    // 有 setup 的工作流（如本地回环服务）先执行 setup，再跑步骤代码
    const src = wf.setup ? `${wf.setup}\n\n# ---- step ----\n${s.code}` : s.code
    writeFileSync(file, src, 'utf8')
    let stdout = ''
    let ok = true
    try {
      stdout = execFileSync('python3', [file], {
        encoding: 'utf8',
        timeout: 90000,
        stdio: ['ignore', 'pipe', 'pipe'],
        // 在临时目录里跑，避免「文件读写」类步骤把产物落到项目根目录
        cwd: tmpdir(),
        env: { ...process.env, PYTHONWARNINGS: 'ignore' },
      })
    } catch (e) {
      ok = false
      failures.push(`${tag}\n  运行失败: ${String(e.stderr || e.message).split('\n').slice(0, 3).join(' / ')}`)
      failed += 1
      continue
    }
    checked += 1

    if (s.output && s.output.kind === 'text') {
      const actual = stdout.replace(/\s+$/, '').split('\n').map((l) => l.replace(/\s+$/, ''))
      const expected = s.output.lines.map((l) => String(l).replace(/\s+$/, ''))
      const same = actual.length === expected.length && actual.every((l, k) => l === expected[k])
      if (!same) {
        failed += 1
        failures.push(
          `${tag}\n  期望: ${JSON.stringify(expected)}\n  实际: ${JSON.stringify(actual)}`,
        )
      }
    } else if (verbose) {
      console.log(`· ${tag} (无 text 输出，仅验证可运行)`)
    }
  }
}

console.log(`\nchecked=${checked} skipped=${skipped} failed=${failed}`)
if (failures.length) {
  console.log('\n' + failures.join('\n\n'))
  process.exitCode = 1
}
