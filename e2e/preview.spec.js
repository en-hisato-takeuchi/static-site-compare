// 求人原稿のプレビュー（Phase 3、CSR 版）の受け入れ条件を、3構成で同じように確かめる。
// プレビューのページ自体は静的な HTML で、ブラウザが疑似 CMS（spec/cms/drafts.json）から下書きを取って組み立てる。
// E2E の間は疑似 CMS が起動している
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

test('プレビューのページ自体は静的な HTML で、下書きの本文は入っていない', async ({
  request,
}) => {
  const response = await request.get(VALID_URL)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).not.toContain(DRAFT.title)
  expect(html).not.toContain(MOCK_CMS.apiKey)
})

test('ブラウザが使うキーは、サーバー版のキーとは別のものになっている', async ({
  page,
}) => {
  const keys = []
  page.on('request', (request) => {
    if (request.url().startsWith(MOCK_CMS.endpoint)) {
      keys.push(request.headers()['x-microcms-api-key'])
    }
  })
  await page.goto(VALID_URL)
  await expect(page.locator('h1.job-detail__title')).toHaveText(DRAFT.title)
  expect(keys.length).toBeGreaterThan(0)
  expect(new Set(keys)).toEqual(new Set([MOCK_CMS.browserApiKey]))
  expect(await page.content()).not.toContain(MOCK_CMS.apiKey)
})

test.describe('ブラウザに出ているキーの権限', () => {
  const headers = { 'X-MICROCMS-API-KEY': MOCK_CMS.browserApiKey }

  test('下書きの取得はできる', async ({ request }) => {
    const response = await request.get(
      `${MOCK_CMS.endpoint}/jobs/${DRAFT_PREVIEW.id}?draftKey=${DRAFT_PREVIEW.draftKey}`,
      { headers },
    )
    expect(response.status()).toBe(200)
  })

  test('書き込みは拒否される', async ({ request }) => {
    for (const method of ['post', 'put', 'patch', 'delete']) {
      const response = await request[method](`${MOCK_CMS.endpoint}/jobs`, {
        headers,
        data: { title: 'x' },
      })
      expect(response.status(), method).toBe(403)
    }
  })

  test('下書きの一覧取得は拒否される', async ({ request }) => {
    const response = await request.get(
      `${MOCK_CMS.endpoint}/jobs?draftKey=${DRAFT_PREVIEW.draftKey}`,
      { headers },
    )
    expect(response.status()).toBe(403)
  })
})
