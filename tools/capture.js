// スライド用に、3構成の各ページをスマホと PC で撮る。
// 使い方：node tools/capture.js <書き出し先> [構成の名前...]
// 書き出し先の下に {構成}/{ページ}-{mobile|desktop}.png で保存する。ビルドしてから実行する
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, devices } from '@playwright/test'
import { startServer } from './serve.js'
import { PAGES, getStack, stackNames } from './stacks.js'

const VIEWPORTS = {
  mobile: devices['Pixel 7'],
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
}

const [outDir, ...names] = process.argv.slice(2)
if (!outDir) {
  console.error(
    '書き出し先を指定してください（例：../astro-talk/captures/phase1）',
  )
  process.exit(1)
}

const NOT_FOUND_PATH = '/this-page-does-not-exist/'
const toFileName = (path) =>
  path === '/'
    ? 'top'
    : path === NOT_FOUND_PATH
      ? '404'
      : path.split('/').filter(Boolean).join('-')

// ページの下まで送って、遅延読み込みの画像をすべて読み込ませる
const loadAllImages = (page) =>
  page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    await Promise.all(
      [...document.images].map((img) => img.decode().catch(() => {})),
    )
    window.scrollTo(0, 0)
  })

const browser = await chromium.launch()
try {
  for (const name of names.length > 0 ? names : stackNames) {
    const stack = getStack(name)
    const { server, url } = await startServer(name)
    try {
      await mkdir(join(outDir, name), { recursive: true })
      for (const [viewportName, options] of Object.entries(VIEWPORTS)) {
        const context = await browser.newContext(options)
        const page = await context.newPage()
        for (const path of [...PAGES, NOT_FOUND_PATH]) {
          await page.goto(`${url}${path}`)
          await loadAllImages(page)
          const file = join(
            outDir,
            name,
            `${toFileName(path)}-${viewportName}.png`,
          )
          await page.screenshot({ path: file, fullPage: true })
        }
        await context.close()
      }
      console.log(`${stack.name} を撮りました`)
    } finally {
      server.close()
    }
  }
} finally {
  await browser.close()
}
