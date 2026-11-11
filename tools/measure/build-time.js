// ビルド時間を、初回（キャッシュなし）とキャッシュありで測り、中央値を出す。
// 使い方：node tools/measure/build-time.js [構成の名前...] [--runs 5] [--jobs 0,10,100,500]
// --jobs を付けると、求人のダミーデータを件数ごとに作り直して測る。付けないときは今あるデータで測る。
// 疑似 CMS はこのスクリプトが起動する。
// pnpm を経由すると起動の時間が混ざるので、package.json の build スクリプトをシェルで直接動かす
import { execFileSync, spawn } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { delimiter, join } from 'node:path'
import { performance } from 'node:perf_hooks'
import { parseArgs } from 'node:util'
import { BROWSER_ENV } from '../../spec/cms/config.js'
import { startMockCms } from '../../spec/cms/server.js'
import { ROOT } from '../stacks.js'
import {
  formatMs,
  markdownTable,
  median,
  stacksFromArgs,
  writeReport,
} from './lib.js'

const DEFAULT_RUNS = 5
const CURRENT_DATA = 'current'

const { values, positionals } = parseArgs({
  options: {
    runs: { type: 'string', default: String(DEFAULT_RUNS) },
    jobs: { type: 'string' },
  },
  allowPositionals: true,
})
const runs = Number(values.runs)
const jobCounts = values.jobs ? values.jobs.split(',') : [CURRENT_DATA]

const run = (command, cwd) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, {
      cwd,
      shell: true,
      stdio: ['ignore', 'ignore', 'pipe'],
      env: {
        ...process.env,
        ...BROWSER_ENV,
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

const stacks = await Promise.all(
  stacksFromArgs(positionals).map(async (stack) => {
    const packageDir = join(ROOT, stack.package)
    const { scripts = {} } = JSON.parse(
      await readFile(join(packageDir, 'package.json'), 'utf-8'),
    )
    return { ...stack, packageDir, build: scripts.build }
  }),
)

const results = {}
for (const count of jobCounts) {
  if (count !== CURRENT_DATA) {
    execFileSync(
      'node',
      [join(ROOT, 'spec', 'cms', 'generate-jobs.js'), '--count', count],
      { stdio: 'ignore' },
    )
  }
  const { server } = await startMockCms()
  try {
    for (const stack of stacks) {
      if (!stack.build) {
        console.error(`${stack.name}：ビルドがないので測りません`)
        continue
      }
      const cold = []
      const cached = []
      for (let i = 0; i < runs; i++) {
        for (const path of [stack.outDir, ...stack.cachePaths]) {
          await rm(join(ROOT, path), { recursive: true, force: true })
        }
        cold.push(await timeBuild(stack.build, stack.packageDir))
        cached.push(await timeBuild(stack.build, stack.packageDir))
        console.error(
          `${stack.name}（求人${count}）：${i + 1}/${runs} 回目 初回 ${formatMs(cold.at(-1))}、キャッシュあり ${formatMs(cached.at(-1))}`,
        )
      }
      results[stack.name] ??= {}
      results[stack.name][count] = {
        cold,
        cached,
        coldMedian: median(cold),
        cachedMedian: median(cached),
      }
    }
  } finally {
    server.close()
  }
}

console.log(
  markdownTable(
    [
      '構成',
      '求人',
      `初回（${runs}回の中央値）`,
      `キャッシュあり（${runs}回の中央値）`,
    ],
    stacks.flatMap((stack) =>
      jobCounts.map((count) => {
        const result = results[stack.name]?.[count]
        return [
          stack.name,
          count === CURRENT_DATA ? '今のデータ' : `${count}件`,
          result ? formatMs(result.coldMedian) : 'ビルドなし',
          result ? formatMs(result.cachedMedian) : 'ビルドなし',
        ]
      }),
    ),
  ),
)
console.log(`\n${await writeReport('build-time', results)} に保存しました`)
