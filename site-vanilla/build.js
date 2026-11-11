// 求人のページを CMS のデータから書き出すビルドスクリプト。
// src/ を dist/ に写したうえで、次の3つを作る。
// - 求人一覧（/jobs/、/jobs/page/{n}/）：src/_templates/jobs.html を使う
// - 求人詳細（/jobs/{id}/）：src/_templates/job.html を使う
// - トップの新着求人：src/index.html の <!-- build:latest-jobs --> を置き換える
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SRC = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')
const TEMPLATES = join(SRC, '_templates')

// 公開先はまだないので仮の値。OGP の og:url に使う
const SITE_URL = 'https://example.com'
const SITE_NAME = '株式会社ロウリュ研究所 採用サイト'
const PER_PAGE = 10
const LATEST_COUNT = 3
const API_LIMIT = 100
const DESCRIPTION_LENGTH = 120

const CATEGORY_LABELS = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
}
const CATEGORY_PHOTOS = {
  store: {
    name: 'category-store',
    alt: 'サウナストーンにひしゃくで水をかけるところ',
    width: 1280,
    height: 1920,
  },
  facility: {
    name: 'category-facility',
    alt: '窓辺に置いたサウナストーブ',
    width: 1920,
    height: 1280,
  },
  office: {
    name: 'category-office',
    alt: 'ノートパソコンで仕事をする社員の手元',
    width: 1280,
    height: 1920,
  },
}
const PHOTO_WIDTHS = [640, 1280]
const PHOTO_SIZES = '(min-width: 50rem) 46rem, 100vw'

const { MICROCMS_API_ENDPOINT, MICROCMS_API_KEY } = process.env
if (!MICROCMS_API_ENDPOINT || !MICROCMS_API_KEY) {
  throw new Error(
    'MICROCMS_API_ENDPOINT と MICROCMS_API_KEY を .env に書いてください',
  )
}

const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )

// %%名前%% を値で置き換える。値はあらかじめエスケープしておく
const render = (template, values) =>
  template.replace(/%%(\w+)%%/g, (_, key) => {
    if (!(key in values))
      throw new Error(`ひな形の %%${key}%% に入れる値がありません`)
    return values[key]
  })

const formatDate = (iso) => {
  const date = new Date(iso)
  const label = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: 'Asia/Tokyo',
  }).format(date)
  const datetime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
  }).format(date)
  return `<time datetime="${datetime}">${label}</time>`
}

const toDescription = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)

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
  <h${level} class="job-list__title"><a href="/jobs/${job.id}/">${escapeHtml(job.title)}</a></h${level}>
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

const pageUrl = (page) => (page === 1 ? '/jobs/' : `/jobs/page/${page}/`)

const pagination = (current, last) => {
  if (last <= 1) return ''
  const link = (page, label, isCurrent = false) =>
    `<li><a class="pagination__link" href="${pageUrl(page)}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a></li>`
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

const picture = ({ name, alt, width, height }) => {
  const srcset = (format) =>
    PHOTO_WIDTHS.map((w) => `/images/${name}-${w}.${format} ${w}w`).join(', ')
  return `<picture>
<source type="image/avif" srcset="${srcset('avif')}" sizes="${PHOTO_SIZES}" />
<source type="image/webp" srcset="${srcset('webp')}" sizes="${PHOTO_SIZES}" />
<img class="job-detail__image" src="/images/${name}-${PHOTO_WIDTHS.at(-1)}.jpg" srcset="${srcset('jpg')}" sizes="${PHOTO_SIZES}" width="${width}" height="${height}" alt="${alt}" loading="eager" decoding="async" />
</picture>`
}

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

// 求人一覧。0件のときも1ページ目は作る
const listTemplate = await readFile(join(TEMPLATES, 'jobs.html'), 'utf-8')
const lastPage = Math.max(1, Math.ceil(jobs.length / PER_PAGE))
for (let page = 1; page <= lastPage; page++) {
  const pageJobs = jobs.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const content =
    jobs.length === 0
      ? EMPTY_STATE
      : `<p class="job-count">全${jobs.length}件</p>\n${jobList(pageJobs, 2)}\n${pagination(page, lastPage)}`
  const title = page === 1 ? '求人一覧' : `求人一覧（${page}ページ目）`
  await writePage(
    pageUrl(page),
    render(listTemplate, {
      title: `${title} | ${SITE_NAME}`,
      description: escapeHtml(
        page === 1
          ? 'ロウリュ研究所で募集している職種の一覧です。'
          : `ロウリュ研究所で募集している職種の一覧です（${page}ページ目）。`,
      ),
      content,
    }),
  )
}

// 求人詳細
const detailTemplate = await readFile(join(TEMPLATES, 'job.html'), 'utf-8')
for (const job of jobs) {
  const category = job.category[0]
  await writePage(
    `/jobs/${job.id}/`,
    render(detailTemplate, {
      title: escapeHtml(`${job.title} | ${SITE_NAME}`),
      description: escapeHtml(toDescription(job.body)),
      url: `${SITE_URL}/jobs/${job.id}/`,
      jobTitle: escapeHtml(job.title),
      image: picture(CATEGORY_PHOTOS[category]),
      category: CATEGORY_LABELS[category],
      location: escapeHtml(job.location[0]),
      employmentType: escapeHtml(job.employmentType[0]),
      salary: escapeHtml(job.salary),
      publishedAt: formatDate(job.publishedAt),
      // CMS のリッチエディタの HTML をそのまま入れる
      body: job.body,
      requirements: escapeHtml(job.requirements),
    }),
  )
}

console.log(
  `求人${jobs.length}件から、一覧${lastPage}ページと詳細${jobs.length}ページを書き出しました`,
)
