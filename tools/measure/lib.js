import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ROOT, getStack, stackNames } from '../stacks.js'

// 引数に構成の名前があればそれだけ、なければ3構成すべて
export const stacksFromArgs = (args = process.argv.slice(2)) =>
  (args.length > 0 ? args : stackNames).map((name) => getStack(name))

export const median = (values) => {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 1
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

export const formatBytes = (bytes) =>
  bytes === null ? '-' : `${(bytes / 1024).toFixed(1)} KB`

export const formatMs = (ms) =>
  ms === null ? '-' : `${(ms / 1000).toFixed(2)} s`

export const markdownTable = (header, rows) =>
  [
    `| ${header.join(' | ')} |`,
    `|${header.map(() => '---').join('|')}|`,
    ...rows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')

// 結果を reports/ に JSON で残す。PR に貼る表は標準出力に出す
export const writeReport = async (name, data) => {
  const dir = join(ROOT, 'reports')
  await mkdir(dir, { recursive: true })
  const path = join(dir, `${name}.json`)
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`)
  return path
}
