// 求人原稿のプレビュー（Phase 3）の受け入れ条件を、3構成で同じように確かめる。
// 下書きは疑似 CMS（spec/cms/drafts.json）にあり、E2E の間は疑似 CMS が起動している
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { DRAFT_PREVIEW, MOCK_CMS } from '../spec/cms/config.js'

const DRAFT = JSON.parse(
  readFileSync(new URL('../spec/cms/drafts.json', import.meta.url), 'utf-8'),
).find((item) => item.id === DRAFT_PREVIEW.id)
const previewUrl = (id, draftKey) =>
  `/jobs/preview/?${new URLSearchParams({ ...(id && { id }), ...(draftKey && { draftKey }) })}`
const VALID_URL = previewUrl(DRAFT_PREVIEW.id, DRAFT_PREVIEW.draftKey)

test('下書きの本文が、求人詳細と同じレイアウトで表示される', async ({
  page,
}) => {
  const response = await page.goto(VALID_URL)
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1.job-detail__title')).toHaveText(DRAFT.title)
  await expect(page.locator('.job-summary')).toContainText(DRAFT.salary)
  await expect(page.locator('.job-detail__heading')).toHaveText([
    '仕事内容',
    '応募の条件',
  ])
  await expect(page.locator('.rich-text li')).toHaveCount(3)
  await expect(page.locator('.job-detail__actions a.button')).toHaveText(
    'まずはサウナ見学から',
  )
  await expect(page.locator('.preview-banner')).toHaveText(
    'プレビュー中：この求人はまだ公開されていません',
  )
})

test('プレビューのページに noindex が付いている', async ({ page }) => {
  await page.goto(VALID_URL)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex',
  )
})

for (const [name, url] of [
  ['draftKey がない', previewUrl(DRAFT_PREVIEW.id, null)],
  ['draftKey が違う', previewUrl(DRAFT_PREVIEW.id, 'wrong-key')],
  ['id がない', previewUrl(null, DRAFT_PREVIEW.draftKey)],
  ['id が違う', previewUrl('unknownid1', DRAFT_PREVIEW.draftKey)],
]) {
  test(`${name}ときは、求人を表示しない`, async ({ page }) => {
    await page.goto(url)
    await expect(page.locator('h1')).toHaveText(
      'プレビューできる求人が見つかりません',
    )
    await expect(page.locator('body')).not.toContainText(DRAFT.title)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex',
    )
  })
}

test('API キーがブラウザに出ない', async ({ page }) => {
  const cmsRequests = []
  page.on('request', (request) => {
    if (request.url().startsWith(MOCK_CMS.endpoint)) {
      cmsRequests.push(request.url())
    }
  })
  const response = await page.goto(VALID_URL)
  await page.waitForLoadState('networkidle')
  expect(cmsRequests).toEqual([])
  expect(await response?.text()).not.toContain(MOCK_CMS.apiKey)
  expect(await page.content()).not.toContain(MOCK_CMS.apiKey)
})
