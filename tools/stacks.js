// 3構成の、配信するディレクトリと、ローカルで配るポート。E2E と計測で同じ値を使う。
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export const STACKS = {
  vanilla: {
    package: 'site-vanilla',
    // Phase 1 はビルドしない。書いた HTML をそのまま配る
    outDir: 'site-vanilla/public',
    port: 4001,
    // ビルドのキャッシュとして、初回のビルドの前に消すもの
    cachePaths: [],
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

// 計測するページ。フェーズが進むたびに足す
export const PAGES = ['/']

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
