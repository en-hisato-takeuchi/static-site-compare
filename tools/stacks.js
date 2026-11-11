// 3構成の、配信するディレクトリと、ローカルで配るポート。E2E と計測で同じ値を使う。
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const STACKS = {
  vanilla: {
    package: 'site-vanilla',
    // 乗り換えの分岐（#8）では Astro でビルドする
    outDir: 'site-vanilla/dist',
    port: 4001,
    // ビルドのキャッシュとして、初回のビルドの前に消すもの
    cachePaths: [
      'site-vanilla/.astro',
      'site-vanilla/node_modules/.astro',
      'site-vanilla/node_modules/.vite',
    ],
  },
  astro: {
    package: 'site-astro',
    outDir: 'site-astro/dist',
    port: 4002,
    cachePaths: [
      'site-astro/.astro',
      'site-astro/node_modules/.astro',
      'site-astro/node_modules/.vite',
    ],
  },
  next: {
    package: 'site-next',
    outDir: 'site-next/out',
    port: 4003,
    cachePaths: ['site-next/.next', 'site-next/tsconfig.tsbuildinfo'],
  },
}

// ビルドに使った求人のデータ（pnpm generate:jobs で作ったもの）。E2E の期待値に使う
const JOBS_PATH = join(ROOT, 'spec', 'cms', 'data', 'jobs.json')
export const JOBS = existsSync(JOBS_PATH)
  ? JSON.parse(readFileSync(JOBS_PATH, 'utf-8'))
  : []

// 計測するページ。フェーズが進むたびに足す。求人詳細は、いちばん新しい求人で代表させる
export const PAGES = [
  '/',
  '/about/',
  '/workplace/',
  '/process/',
  '/jobs/',
  ...(JOBS.length > 0 ? [`/jobs/${JOBS[0].id}/`] : []),
]

export const stackNames = Object.keys(STACKS)

export const getStack = (name) => {
  const stack = STACKS[name]
  if (!stack) {
    throw new Error(
      `構成の名前は ${stackNames.join(' / ')} のどれかにしてください（指定：${name}）`,
    )
  }
  return { name, ...stack, outPath: join(ROOT, stack.outDir) }
}
