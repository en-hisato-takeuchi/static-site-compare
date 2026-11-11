// Phase 1 の受け入れ条件（spec/requirements.md）を、3構成で同じように確かめる
import { devices, expect, test } from '@playwright/test'
import { PAGES } from '../tools/stacks.js'

const HERO_WIDTHS = ['640w', '1280w', '1920w']
// スマホの画面。defaultBrowserType は describe の中で変えられないので外す
const MOBILE = { ...devices['Pixel 7'] }
delete MOBILE.defaultBrowserType

// ヘッダーとフッターの中身を、今いるページの印（aria-current）を除いて取り出す
const chrome = (page) =>
  page.evaluate(() => {
    const pick = (selector) => {
      const element = document.querySelector(selector)?.cloneNode(true)
      element
        ?.querySelectorAll('[aria-current]')
        .forEach((link) => link.removeAttribute('aria-current'))
      return {
        text: element?.textContent?.replace(/\s+/g, ' ').trim(),
        links: [...(element?.querySelectorAll('a') ?? [])].map((link) =>
          link.getAttribute('href'),
        ),
      }
    }
    return { header: pick('.site-header'), footer: pick('.site-footer') }
  })

test('4ページすべてで、ヘッダーとフッターの内容が同じ', async ({ page }) => {
  await page.goto(PAGES[0])
  const first = await chrome(page)
  expect(first.header.links).toContain('/process/')
  for (const path of PAGES.slice(1)) {
    await page.goto(path)
    expect(await chrome(page), path).toEqual(first)
  }
})

test('ヒーロー画像は AVIF と WebP を出し分け、640 / 1280 / 1920 の srcset を持ち、すぐに読み込まれる', async ({
  page,
}) => {
  await page.goto('/')
  const picture = page.locator('.hero picture')
  for (const type of ['image/avif', 'image/webp']) {
    const srcset = await picture
      .locator(`source[type="${type}"]`)
      .getAttribute('srcset')
    for (const width of HERO_WIDTHS) expect(srcset, type).toContain(width)
  }
  const image = picture.locator('img.hero__image')
  await expect(image).toHaveAttribute('fetchpriority', 'high')
  expect(await image.getAttribute('loading')).not.toBe('lazy')
})

for (const path of PAGES) {
  test(`${path}：すべての画像に width と height があり、CLS が 0.1 未満`, async ({
    page,
  }) => {
    await page.goto(path)
    const images = await page.locator('img').evaluateAll((elements) =>
      elements.map((img) => ({
        src: img.currentSrc || img.src,
        width: img.getAttribute('width'),
        height: img.getAttribute('height'),
      })),
    )
    for (const image of images) {
      expect(image.width, image.src).toBeTruthy()
      expect(image.height, image.src).toBeTruthy()
    }

    // ページの下まで送って遅延読み込みの画像も出し、その間のレイアウトのずれを足し合わせる
    const cls = await page.evaluate(async () => {
      let total = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput) total += entry.value
      }).observe({ type: 'layout-shift', buffered: true })
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
        window.scrollTo(0, y)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      await Promise.all(
        [...document.images].map((img) => img.decode().catch(() => {})),
      )
      return total
    })
    expect(cls).toBeLessThan(0.1)
  })

  test(`${path}：応募ボタンがヘッダーとページの中にある`, async ({ page }) => {
    await page.goto(path)
    const buttons = page.locator('a.button', { hasText: '応募する' })
    expect(await buttons.count()).toBeGreaterThanOrEqual(2)
    for (const href of await buttons.evaluateAll((links) =>
      links.map((link) => link.getAttribute('href')),
    )) {
      expect(href).toBe('/process/')
    }
  })
}

test.describe('JS を切ったとき', () => {
  test.use({ javaScriptEnabled: false, ...MOBILE })

  for (const path of PAGES) {
    test(`${path}：スマホでも本文とナビゲーションが読める`, async ({
      page,
    }) => {
      await page.goto(path)
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('.site-nav__link').first()).toBeVisible()
      await expect(page.locator('.site-nav__toggle')).toBeHidden()
    })
  }
})

test.describe('スマホのメニュー', () => {
  test.use(MOBILE)

  test('メニューボタンで開閉できる', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('.site-nav__toggle')
    const link = page.locator('.site-nav__link').first()
    await expect(link).toBeHidden()
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(link).toBeVisible()
    await toggle.click()
    await expect(link).toBeHidden()
  })
})
