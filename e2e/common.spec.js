// すべてのフェーズに共通する受け入れ条件（spec/requirements.md）を、3構成で同じように確かめる
import { expect, test } from '@playwright/test'
import { PAGES } from '../tools/stacks.js'

for (const path of PAGES) {
  test(`${path} が日本語のページとして表示される`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
    await expect(page.locator('h1')).toHaveCount(1)
  })
}

test('<title> と description がページごとに違う', async ({ page }) => {
  const seen = new Map()
  for (const path of [...PAGES, '/this-page-does-not-exist/']) {
    await page.goto(path)
    const title = await page.title()
    const description = await page
      .locator('meta[name="description"]')
      .getAttribute('content')
    expect(title, `${path} の <title> が空`).not.toBe('')
    expect(description, `${path} の description が空`).toBeTruthy()
    for (const [otherPath, other] of seen) {
      expect(title, `${path} と ${otherPath} の <title> が同じ`).not.toBe(
        other.title,
      )
      expect(
        description,
        `${path} と ${otherPath} の description が同じ`,
      ).not.toBe(other.description)
    }
    seen.set(path, { title, description })
  }
})

test('存在しないパスでは 404 のページが 404 のステータスで返る', async ({
  page,
}) => {
  const response = await page.goto('/this-page-does-not-exist/')
  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle(/ページが見つかりません/)
})
