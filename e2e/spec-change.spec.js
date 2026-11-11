// 仕様変更（#9）の受け入れ条件を、3構成で同じように確かめる。
// 期待値は、ビルドに使った求人のデータ（spec/cms/data/jobs.json）から決める
import { expect, test } from '@playwright/test'
import { JOBS } from '../tools/stacks.js'
import { APPLY_BUTTON, jobUrl } from './current-spec.js'

const PER_PAGE = 10
const CATEGORY_LABELS = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
}

test('ヘッダーに「職種から探す」があり、求人一覧の職種カテゴリの切り替えへ飛ぶ', async ({
  page,
}) => {
  await page.goto('/')
  const link = page.locator('.site-nav__link', { hasText: '職種から探す' })
  await expect(link).toHaveAttribute('href', '/jobs/#category-nav')
  await page.goto('/jobs/')
  await expect(page.locator('#category-nav')).toBeVisible()
})

test('応募ボタンが新しい文言とリンク先になっている', async ({ page }) => {
  await page.goto('/')
  const header = page.locator('.site-header__apply')
  await expect(header).toHaveText(APPLY_BUTTON.text)
  await expect(header).toHaveAttribute('href', APPLY_BUTTON.href)
  await expect(page.locator('a.button', { hasText: '応募する' })).toHaveCount(0)
})

for (const [category, label] of Object.entries(CATEGORY_LABELS)) {
  test(`職種カテゴリ別の一覧（${category}）に、その職種の求人だけが出る`, async ({
    page,
  }) => {
    const jobs = JOBS.filter((job) => job.category[0] === category)
    const lastPage = Math.max(1, Math.ceil(jobs.length / PER_PAGE))
    const response = await page.goto(`/jobs/${category}/`)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveText(`${label}の求人`)
    await expect(
      page.locator(`.category-nav__link[aria-current="page"]`),
    ).toHaveText(label)
    if (jobs.length === 0) {
      await expect(page.locator('.empty-state')).toBeVisible()
      return
    }
    await expect(page.locator('.job-count')).toHaveText(`全${jobs.length}件`)
    await expect(page.locator('.job-list__item .category-tag')).toHaveText(
      Array(Math.min(PER_PAGE, jobs.length)).fill(label),
    )
    if (lastPage > 1) {
      const last = await page.goto(`/jobs/${category}/page/${lastPage}/`)
      expect(last?.status()).toBe(200)
      await expect(page.locator('.job-list__item')).toHaveCount(
        jobs.length - (lastPage - 1) * PER_PAGE,
      )
    }
  })
}

test('求人詳細が新しい URL にあり、パンくずに職種カテゴリが入る', async ({
  page,
}) => {
  test.skip(JOBS.length === 0, '求人がないので詳細ページはない')
  const [job] = JOBS
  const response = await page.goto(jobUrl(job))
  expect(response?.status()).toBe(200)
  await expect(page.locator('h1')).toHaveText(job.title)
  await expect(page.locator('.breadcrumb__item').nth(2)).toHaveText(
    CATEGORY_LABELS[job.category[0]],
  )
})

test('旧 URL（/jobs/{id}/）を開くと、新 URL にたどり着く', async ({ page }) => {
  test.skip(JOBS.length === 0, '求人がないので旧 URL もない')
  for (const job of [JOBS[0], JOBS.at(-1)]) {
    await page.goto(`/jobs/${job.id}/`)
    await page.waitForURL(`**${jobUrl(job)}`)
    await expect(page.locator('h1')).toHaveText(job.title)
  }
})
