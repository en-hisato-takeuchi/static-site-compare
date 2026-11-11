// Phase 2 の受け入れ条件（spec/requirements.md）を、3構成で同じように確かめる。
// 期待値は、ビルドに使った求人のデータ（spec/cms/data/jobs.json）から決める
import { expect, test } from '@playwright/test'
import { JOBS } from '../tools/stacks.js'

const PER_PAGE = 10
const LATEST_COUNT = 3
const EMPTY_MESSAGE = '現在募集している職種はありません。'
const lastPage = Math.max(1, Math.ceil(JOBS.length / PER_PAGE))

test(`求人一覧の1ページ目に、求人${JOBS.length}件の分が出る`, async ({
  page,
}) => {
  await page.goto('/jobs/')
  if (JOBS.length === 0) {
    await expect(page.locator('.empty-state')).toHaveText(EMPTY_MESSAGE)
    await expect(page.locator('.pagination')).toHaveCount(0)
    return
  }
  await expect(page.locator('.job-count')).toHaveText(`全${JOBS.length}件`)
  await expect(page.locator('.job-list__item')).toHaveCount(
    Math.min(PER_PAGE, JOBS.length),
  )
  await expect(page.locator('h2.job-list__title').first()).toHaveText(
    JOBS[0].title,
  )
  await expect(page.locator('.pagination')).toHaveCount(lastPage > 1 ? 1 : 0)
})

test('トップに新着の求人が出る', async ({ page }) => {
  await page.goto('/')
  if (JOBS.length === 0) {
    await expect(page.locator('.empty-state')).toHaveText(EMPTY_MESSAGE)
    return
  }
  const titles = page.locator('h3.job-list__title')
  await expect(titles).toHaveText(
    JOBS.slice(0, LATEST_COUNT).map((job) => job.title),
  )
})

test('ページ送りの最後のページまであり、その先は 404 になる', async ({
  page,
}) => {
  test.skip(lastPage < 2, '1ページで収まるので、2ページ目はない')
  const last = await page.goto(`/jobs/page/${lastPage}/`)
  expect(last?.status()).toBe(200)
  await expect(page.locator('.job-list__item')).toHaveCount(
    JOBS.length - (lastPage - 1) * PER_PAGE,
  )
  await expect(
    page.locator('.pagination__link[aria-current="page"]'),
  ).toHaveText(String(lastPage))
  const beyond = await page.goto(`/jobs/page/${lastPage + 1}/`)
  expect(beyond?.status()).toBe(404)
})

test('求人詳細の本文、<title>、OGP が最初の HTML に入っている', async ({
  request,
}) => {
  test.skip(JOBS.length === 0, '求人がないので詳細ページはない')
  const [job] = JOBS
  // JS を動かさずに、サーバーから返ってきた HTML だけを見る
  const response = await request.get(`/jobs/${job.id}/`)
  expect(response.status()).toBe(200)
  const html = await response.text()
  const firstSentence = job.body.match(/<p>(.+?)<\/p>/)[1]
  expect(html).toContain(
    `<title>${job.title} | 株式会社ロウリュ研究所 採用サイト</title>`,
  )
  expect(html).toContain(firstSentence)
  for (const property of ['og:title', 'og:description', 'og:url', 'og:type']) {
    expect(html, property).toMatch(
      new RegExp(`<meta property="${property}" content="[^"]+"`),
    )
  }
  expect(html).toContain(`content="https://example.com/jobs/${job.id}/"`)
})

test('存在しない ID の求人詳細は 404 になる', async ({ page }) => {
  const response = await page.goto('/jobs/this-job-does-not-exist/')
  expect(response?.status()).toBe(404)
})
