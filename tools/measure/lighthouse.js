// Lighthouse CI で各ページを5回ずつ測り、指標ごとの中央値を出す。
// 使い方：node tools/measure/lighthouse.js [構成の名前...] [--runs 5] [--pages /jobs/,/jobs/store/]
// --pages を付けないときは、tools/stacks.js の PAGES をすべて測る
// 設定は Lighthouse の既定（モバイルの画面サイズと、通信・CPU の速度を落とした想定）のまま使う。
// 配信は E2E と同じ tools/serve.js。Chrome は PC に入っているものを使う（CHROME_PATH で変えられる）
import { spawn } from 'node:child_process'
import { readFile, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { startServer } from '../serve.js'
import { PAGES, ROOT } from '../stacks.js'
import {
  formatBytes,
  formatMs,
  markdownTable,
  median,
  stacksFromArgs,
  writeReport,
} from './lib.js'

const DEFAULT_RUNS = 5
const LHCI_DIR = join(ROOT, '.lighthouseci')
const LHCI_BIN = join(ROOT, 'node_modules', '.bin', 'lhci')

const { values, positionals } = parseArgs({
  options: {
    runs: { type: 'string', default: String(DEFAULT_RUNS) },
    pages: { type: 'string' },
  },
  allowPositionals: true,
})
const runs = Number(values.runs)
const pages = values.pages ? values.pages.split(',') : PAGES

const collect = (urls) =>
  new Promise((resolve, reject) => {
    const args = [
      'collect',
      ...urls.map((url) => `--url=${url}`),
      `--numberOfRuns=${runs}`,
      '--settings.chromeFlags=--headless=new',
    ]
    const child = spawn(LHCI_BIN, args, {
      cwd: ROOT,
      stdio: ['ignore', 'ignore', 'inherit'],
    })
    child.on('error', reject)
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error('lhci collect に失敗しました')),
    )
  })

const readResults = async () => {
  const files = (await readdir(LHCI_DIR)).filter(
    (file) => file.startsWith('lhr-') && file.endsWith('.json'),
  )
  return Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(join(LHCI_DIR, file), 'utf-8')),
    ),
  )
}

const transferSize = (lhr, resourceType) =>
  lhr.audits['resource-summary'].details.items.find(
    (item) => item.resourceType === resourceType,
  )?.transferSize ?? 0

// 1ページ分（5回）の結果から、指標ごとの中央値を出す
const summarize = (lhrs) => ({
  runs: lhrs.length,
  performance: median(
    lhrs.map((lhr) => lhr.categories.performance.score * 100),
  ),
  lcp: median(
    lhrs.map((lhr) => lhr.audits['largest-contentful-paint'].numericValue),
  ),
  cls: median(
    lhrs.map((lhr) => lhr.audits['cumulative-layout-shift'].numericValue),
  ),
  tbt: median(
    lhrs.map((lhr) => lhr.audits['total-blocking-time'].numericValue),
  ),
  jsBytes: median(lhrs.map((lhr) => transferSize(lhr, 'script'))),
  cssBytes: median(lhrs.map((lhr) => transferSize(lhr, 'stylesheet'))),
  imageBytes: median(lhrs.map((lhr) => transferSize(lhr, 'image'))),
  totalBytes: median(
    lhrs.map((lhr) => lhr.audits['total-byte-weight'].numericValue),
  ),
})

const results = {}
for (const stack of stacksFromArgs(positionals)) {
  await rm(LHCI_DIR, { recursive: true, force: true })
  const { server, url } = await startServer(stack.name)
  try {
    await collect(pages.map((path) => `${url}${path}`))
  } finally {
    server.close()
  }
  const lhrs = await readResults()
  results[stack.name] = Object.fromEntries(
    pages.map((path) => [
      path,
      summarize(
        lhrs.filter((lhr) => new URL(lhr.requestedUrl).pathname === path),
      ),
    ]),
  )
}

console.log(
  markdownTable(
    [
      '構成',
      'ページ',
      '性能',
      'LCP',
      'CLS',
      'TBT',
      'JS',
      'CSS',
      '画像',
      '合計',
    ],
    Object.entries(results).flatMap(([name, pages]) =>
      Object.entries(pages).map(([path, s]) => [
        name,
        path,
        String(Math.round(s.performance)),
        formatMs(s.lcp),
        s.cls.toFixed(3),
        `${Math.round(s.tbt)} ms`,
        formatBytes(s.jsBytes),
        formatBytes(s.cssBytes),
        formatBytes(s.imageBytes),
        formatBytes(s.totalBytes),
      ]),
    ),
  ),
)
console.log(`\n各指標は${runs}回の中央値。転送量は圧縮後の値`)
console.log(`${await writeReport('lighthouse', results)} に保存しました`)
