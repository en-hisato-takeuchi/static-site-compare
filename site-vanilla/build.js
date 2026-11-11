// 求人のページを CMS のデータから書き出すビルドスクリプト。
// src/ を dist/ に写したうえで、次の3つを作る。
// - 求人一覧（/jobs/、/jobs/page/{n}/）と職種カテゴリ別の一覧（/jobs/{category}/ ほか）：src/_templates/jobs.html を使う
// - 求人詳細（/jobs/{category}/{id}/）：src/_templates/job.html を使う
// - 旧 URL（/jobs/{id}/）から新 URL へ転送するページ
// - トップの新着求人：src/index.html の <!-- build:latest-jobs --> を置き換える
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CATEGORY_LABELS,
  SITE_NAME,
  SITE_URL,
  escapeHtml,
  formatDate,
  jobUrl,
  render,
  renderJobDetail,
} from './job-page.js'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SRC = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')
const TEMPLATES = join(SRC, '_templates')

const PER_PAGE = 10
const LATEST_COUNT = 3
const API_LIMIT = 100

const { MICROCMS_API_ENDPOINT, MICROCMS_API_KEY } = process.env
if (!MICROCMS_API_ENDPOINT || !MICROCMS_API_KEY) {
  throw new Error(
    'MICROCMS_API_ENDPOINT と MICROCMS_API_KEY を .env に書いてください',
  )
}

const fetchAllJobs = async () => {
  const jobs = []
  for (let offset = 0; ; offset += API_LIMIT) {
    const url = `${MICROCMS_API_ENDPOINT}/jobs?limit=${API_LIMIT}&offset=${offset}`
    const response = await fetch(url, {
      headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY },
    })
    if (!response.ok)
      throw new Error(`求人の取得に失敗しました（${response.status} ${url}）`)
    const { contents, totalCount } = await response.json()
    jobs.push(...contents)
    if (jobs.length >= totalCount) return jobs
  }
}

const jobList = (jobs, level) => `<ul class="job-list">
${jobs
  .map(
    (job) => `<li class="job-list__item">
  <h${level} class="job-list__title"><a href="${jobUrl(job)}">${escapeHtml(job.title)}</a></h${level}>
  <dl class="job-list__meta">
    <dt>職種カテゴリ</dt>
    <dd><span class="category-tag">${CATEGORY_LABELS[job.category[0]]}</span></dd>
    <dt>勤務地</dt>
    <dd>${escapeHtml(job.location[0])}</dd>
    <dt>雇用形態</dt>
    <dd>${escapeHtml(job.employmentType[0])}</dd>
    <dt>給与</dt>
    <dd>${escapeHtml(job.salary)}</dd>
  </dl>
  <p class="job-list__date">公開日 ${formatDate(job.publishedAt)}</p>
</li>`,
  )
  .join('\n')}
</ul>`

const EMPTY_STATE =
  '<p class="empty-state">現在募集している職種はありません。</p>'

// category が null のときは、すべての職種の一覧
const listUrl = (category) => (category ? `/jobs/${category}/` : '/jobs/')
const pageUrl = (page, category = null) =>
  page === 1 ? listUrl(category) : `${listUrl(category)}page/${page}/`

const pagination = (current, last, category) => {
  if (last <= 1) return ''
  const link = (page, label, isCurrent = false) =>
    `<li><a class="pagination__link" href="${pageUrl(page, category)}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a></li>`
  const items = [
    current > 1 ? link(current - 1, '前へ') : '',
    ...Array.from({ length: last }, (_, i) =>
      link(i + 1, String(i + 1), i + 1 === current),
    ),
    current < last ? link(current + 1, '次へ') : '',
  ]
  return `<nav class="pagination" aria-label="ページ送り">
<ul class="pagination__list">
${items.filter(Boolean).join('\n')}
</ul>
</nav>`
}

const categoryNav = (current) => {
  const link = (category, label) =>
    `<li><a class="category-nav__link" href="${listUrl(category)}"${category === current ? ' aria-current="page"' : ''}>${label}</a></li>`
  return `<nav class="category-nav" id="category-nav" aria-label="職種カテゴリ">
<ul class="category-nav__list">
${[link(null, 'すべて'), ...Object.entries(CATEGORY_LABELS).map(([slug, label]) => link(slug, label))].join('\n')}
</ul>
</nav>`
}

// 旧 URL のページ。静的なファイルだけでは 301 を返せないので、meta refresh で新 URL へ送る
const redirectPage = (to) => `<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>移動しました | ${SITE_NAME}</title>
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${SITE_URL}${to}" />
    <meta http-equiv="refresh" content="0; url=${to}" />
  </head>
  <body>
    <p><a href="${to}">このページは移動しました</a></p>
  </body>
</html>
`

const writePage = async (path, html) => {
  const file = join(DIST, path, 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
}

const jobs = await fetchAllJobs()

await rm(DIST, { recursive: true, force: true })
await cp(SRC, DIST, {
  recursive: true,
  filter: (source) => source !== TEMPLATES,
})

// トップの新着求人
const indexPath = join(DIST, 'index.html')
const index = await readFile(indexPath, 'utf-8')
const latest =
  jobs.length > 0 ? jobList(jobs.slice(0, LATEST_COUNT), 3) : EMPTY_STATE
await writeFile(
  indexPath,
  index.replace(/<!-- build:latest-jobs[^>]*-->/, latest),
)

// 求人一覧と、職種カテゴリ別の一覧。0件のときも1ページ目は作る
const listTemplate = await readFile(join(TEMPLATES, 'jobs.html'), 'utf-8')
const DESCRIPTION = 'ロウリュ研究所で募集している職種の一覧です'
let listPages = 0
for (const category of [null, ...Object.keys(CATEGORY_LABELS)]) {
  const listJobs = category
    ? jobs.filter((job) => job.category[0] === category)
    : jobs
  const heading = category ? `${CATEGORY_LABELS[category]}の求人` : '求人一覧'
  const lastPage = Math.max(1, Math.ceil(listJobs.length / PER_PAGE))
  for (let page = 1; page <= lastPage; page++) {
    const pageJobs = listJobs.slice((page - 1) * PER_PAGE, page * PER_PAGE)
    const content =
      listJobs.length === 0
        ? EMPTY_STATE
        : `<p class="job-count">全${listJobs.length}件</p>\n${jobList(pageJobs, 2)}\n${pagination(page, lastPage, category)}`
    const suffix = page === 1 ? '' : `（${page}ページ目）`
    await writePage(
      pageUrl(page, category),
      render(listTemplate, {
        title: `${heading}${suffix} | ${SITE_NAME}`,
        description: escapeHtml(
          `${category ? `${CATEGORY_LABELS[category]}の、` : ''}${DESCRIPTION}${suffix}。`,
        ),
        robots: '',
        heading,
        categoryNav: categoryNav(category),
        content,
      }),
    )
    listPages += 1
  }
}

// 求人詳細
for (const job of jobs) {
  await writePage(jobUrl(job), await renderJobDetail(job))
  // 旧 URL（/jobs/{id}/）。対応表は CMS のデータから作る
  await writePage(`/jobs/${job.id}/`, redirectPage(jobUrl(job)))
}

console.log(
  `求人${jobs.length}件から、一覧${listPages}ページと詳細${jobs.length}ページ、旧 URL の転送${jobs.length}ページを書き出しました`,
)
