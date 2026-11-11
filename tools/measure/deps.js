// 各構成の依存パッケージの数を数える。
// 使い方：node tools/measure/deps.js [構成の名前...]
// 「直接」は package.json に書いたもの。「全体」は、それらが使うパッケージまで含めて数えた、重ならない数
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ROOT } from '../stacks.js'
import { markdownTable, stacksFromArgs, writeReport } from './lib.js'

const collectNames = (dependencies = {}, names = new Set()) => {
  for (const [name, info] of Object.entries(dependencies)) {
    const key = `${name}@${info.version}`
    if (names.has(key)) continue
    names.add(key)
    collectNames(info.dependencies, names)
  }
  return names
}

const results = {}
for (const stack of stacksFromArgs()) {
  const manifest = JSON.parse(
    await readFile(join(ROOT, stack.package, 'package.json'), 'utf-8'),
  )
  const count = (field) => Object.keys(manifest[field] ?? {}).length
  const tree = JSON.parse(
    execFileSync(
      'pnpm',
      ['--filter', stack.package, 'list', '--depth', 'Infinity', '--json'],
      {
        cwd: ROOT,
        maxBuffer: 64 * 1024 * 1024,
      },
    ),
  )[0]
  results[stack.name] = {
    dependencies: count('dependencies'),
    devDependencies: count('devDependencies'),
    total: collectNames({ ...tree?.dependencies, ...tree?.devDependencies })
      .size,
  }
}

console.log(
  markdownTable(
    ['構成', '直接（dependencies / devDependencies）', '全体'],
    Object.entries(results).map(([name, r]) => [
      name,
      `${r.dependencies} / ${r.devDependencies}`,
      String(r.total),
    ]),
  ),
)
console.log(`\n${await writeReport('deps', results)} に保存しました`)
