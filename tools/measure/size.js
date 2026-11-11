// 出力ファイルの大きさを、種類ごとに合計する。
// 使い方：node tools/measure/size.js [構成の名前...]
// 「圧縮後」は tools/serve.js が返すのと同じ brotli で縮めた大きさ。画像とフォントはもともと圧縮済みなので、そのまま数える
import { readFile, readdir } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { brotliCompressSync } from 'node:zlib'
import {
  formatBytes,
  markdownTable,
  stacksFromArgs,
  writeReport,
} from './lib.js'

const KINDS = {
  html: ['.html'],
  js: ['.js', '.mjs'],
  css: ['.css'],
  image: ['.avif', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico'],
  font: ['.woff', '.woff2'],
}
const COMPRESSED_KINDS = new Set(['html', 'js', 'css'])

const kindOf = (file) => {
  const ext = extname(file).toLowerCase()
  return (
    Object.entries(KINDS).find(([, exts]) => exts.includes(ext))?.[0] ?? 'other'
  )
}

const listFiles = async (dir) => {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name))
}

const measure = async (stack) => {
  const totals = Object.fromEntries(
    [...Object.keys(KINDS), 'other'].map((kind) => [
      kind,
      { files: 0, raw: 0, compressed: 0 },
    ]),
  )
  for (const file of await listFiles(stack.outPath)) {
    const kind = kindOf(file)
    const content = await readFile(file)
    const compressed =
      COMPRESSED_KINDS.has(kind) || extname(file) === '.svg'
        ? brotliCompressSync(content).length
        : content.length
    totals[kind].files += 1
    totals[kind].raw += content.length
    totals[kind].compressed += compressed
  }
  return totals
}

const results = {}
for (const stack of stacksFromArgs()) {
  results[stack.name] = await measure(stack)
}

const kinds = [...Object.keys(KINDS), 'other']
console.log(
  markdownTable(
    ['構成', ...kinds.map((kind) => `${kind}（圧縮後）`)],
    Object.entries(results).map(([name, totals]) => [
      name,
      ...kinds.map(
        (kind) =>
          `${formatBytes(totals[kind].compressed)}（${totals[kind].files}件）`,
      ),
    ]),
  ),
)
console.log(`\n${await writeReport('size', results)} に保存しました`)
