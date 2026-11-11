// 3構成の、配信するディレクトリと、ローカルで配るポート。E2E と計測で同じ値を使う。
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const STACKS = {
  vanilla: {
    package: 'site-vanilla',
    // Phase 2 から、build.js で求人のページを書き出す
    outDir: 'site-vanilla/dist',
    port: 4001,
    // プレビュー（/jobs/preview/）だけ、リクエストのたびにこの関数が HTML を返す
    preview: { module: 'site-vanilla/preview.js', export: 'handlePreview' },
    // ビルドのキャッシュとして、初回のビルドの前に消すもの
    cachePaths: [],
  },
  astro: {
    package: 'site-astro',
    // Node アダプターを入れたので、静的なファイルは dist/client に出る（dist/server はプレビュー用）
    outDir: 'site-astro/dist/client',
    port: 4002,
    preview: { module: 'site-astro/dist/server/entry.mjs', export: 'handler' },
    cachePaths: [
      'site-astro/.astro',
      'site-astro/node_modules/.astro',
      'site-astro/node_modules/.vite',
    ],
  },
  next: {
    package: 'site-next',
    // output: 'export' をやめたので、静的な書き出しはない。ビルドの結果は .next にあり、next start で配る
    outDir: 'site-next/.next',
    port: 4003,
    start: {
      cwd: 'site-next',
      args: ['node_modules/next/dist/bin/next', 'start', '-p', '4003'],
    },
    // 利用者に届くファイル（サイズの計測の対象）。サーバー側のコードは含めない
    served: [
      { dir: 'site-next/.next/static' },
      { dir: 'site-next/public' },
      {
        dir: 'site-next/.next/server/app',
        include: (file) => file.endsWith('.html') || file.endsWith('.rsc'),
      },
    ],
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
  '/jobs/store/',
  ...(JOBS.length > 0 ? [`/jobs/${JOBS[0].category[0]}/${JOBS[0].id}/`] : []),
]

// プレビューのページの URL。静的な HTML では作れず、リクエストのたびにサーバーで組み立てる
export const PREVIEW_PATH = '/jobs/preview/'

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
