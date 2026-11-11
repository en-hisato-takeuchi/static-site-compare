// ビルド時間を、初回（キャッシュなし）とキャッシュありで5回ずつ測り、中央値を出す。
// 使い方：node tools/measure/build-time.js [構成の名前...] [--runs 5]
// pnpm を経由すると起動の時間が混ざるので、package.json の build スクリプトをシェルで直接動かす
import { spawn } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { delimiter, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { parseArgs } from 'node:util'
import { ROOT } from '../stacks.js'
import {
  formatMs,
  markdownTable,
  median,
  stacksFromArgs,
  writeReport,
} from './lib.js'

const DEFAULT_RUNS = 5

const { values, positionals } = parseArgs({
  options: { runs: { type: 'string', default: String(DEFAULT_RUNS) } },
  allowPositionals: true,
})
const runs = Number(values.runs)

const run = (command, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: {
        ...process.env,
        PATH: [join(cwd, 'node_modules', '.bin'), process.env.PATH].join(
          delimiter,
        ),
      },
    })
    let stderr = ''
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`ビルドに失敗しました（${cwd}）\n${stderr}`)),
    )
  })

const timeBuild = async (command, cwd) => {
  const start = performance.now()
  await run(command, cwd)
  return performance.now() - start
}

const results = {}
for (const stack of stacksFromArgs(positionals)) {
  const packageDir = join(ROOT, stack.package)
  const { scripts = {} } = JSON.parse(
    await readFile(join(packageDir, 'package.json'), 'utf-8'),
  )
  if (!scripts.build) {
    results[stack.name] = { hasBuild: false, cold: [], cached: [] }
    console.error(`${stack.name}：ビルドがないので測りません`)
    continue
  }

  const cold = []
  const cached = []
  for (let i = 0; i < runs; i++) {
    for (const path of [stack.outDir, ...stack.cachePaths]) {
      await rm(join(ROOT, path), { recursive: true, force: true })
    }
    cold.push(await timeBuild(scripts.build, packageDir))
    cached.push(await timeBuild(scripts.build, packageDir))
    console.error(
      `${stack.name}：${i + 1}/${runs} 回目 初回 ${formatMs(cold.at(-1))}、キャッシュあり ${formatMs(cached.at(-1))}`,
    )
  }
  results[stack.name] = {
    hasBuild: true,
    cold,
    cached,
    coldMedian: median(cold),
    cachedMedian: median(cached),
  }
}

console.log(
  markdownTable(
    [
      '構成',
      'ビルド',
      `初回（${runs}回の中央値）`,
      `キャッシュあり（${runs}回の中央値）`,
    ],
    Object.entries(results).map(([name, result]) => [
      name,
      result.hasBuild ? 'あり' : 'なし',
      result.hasBuild ? formatMs(result.coldMedian) : '-',
      result.hasBuild ? formatMs(result.cachedMedian) : '-',
    ]),
  ),
)
console.log(`\n${await writeReport('build-time', results)} に保存しました`)
