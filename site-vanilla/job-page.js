// 求人のページを組み立てる処理。ビルド（build.js）とプレビュー（preview.js）で共有する。
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const TEMPLATES = join(
  dirname(fileURLToPath(import.meta.url)),
  'src',
  '_templates',
)
const DESCRIPTION_LENGTH = 120

// 公開先はまだないので仮の値。OGP の og:url に使う
export const SITE_URL = 'https://example.com'
export const SITE_NAME = '株式会社ロウリュ研究所 採用サイト'

export const CATEGORY_LABELS = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
}
export const CATEGORY_PHOTOS = {
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
export const PHOTO_WIDTHS = [640, 1280]
export const PHOTO_SIZES = '(min-width: 50rem) 46rem, 100vw'

export const escapeHtml = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ],
  )

// %%名前%% を値で置き換える。値はあらかじめエスケープしておく。
// 値が空で、ひな形の1行がその %%名前%% だけのときは、その行ごと消す（公開用のページの HTML を変えないため）
export const render = (template, values) =>
  template
    .replace(/^[ \t]*%%(\w+)%%[ \t]*\n/gm, (line, key) =>
      values[key] === '' ? '' : line,
    )
    .replace(/%%(\w+)%%/g, (_, key) => {
      if (!(key in values))
        throw new Error(`ひな形の %%${key}%% に入れる値がありません`)
      return values[key]
    })

export const formatDate = (iso) => {
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

export const toDescription = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)

export const picture = ({ name, alt, width, height }) => {
  const srcset = (format) =>
    PHOTO_WIDTHS.map((w) => `/images/${name}-${w}.${format} ${w}w`).join(', ')
  return `<picture>
<source type="image/avif" srcset="${srcset('avif')}" sizes="${PHOTO_SIZES}" />
<source type="image/webp" srcset="${srcset('webp')}" sizes="${PHOTO_SIZES}" />
<img class="job-detail__image" src="/images/${name}-${PHOTO_WIDTHS.at(-1)}.jpg" srcset="${srcset('jpg')}" sizes="${PHOTO_SIZES}" width="${width}" height="${height}" alt="${alt}" loading="eager" decoding="async" />
</picture>`
}

export const jobUrl = (job) => `/jobs/${job.category[0]}/${job.id}/`

const PREVIEW_ROBOTS = '<meta name="robots" content="noindex" />'
const PREVIEW_BANNER =
  '<p class="preview-banner">プレビュー中：この求人はまだ公開されていません</p>'

// 求人詳細のページ。プレビューのときは noindex と帯を足す（公開用のページには何も足さない）
export const renderJobDetail = async (job, { preview = false } = {}) => {
  const category = job.category[0]
  const template = await readFile(join(TEMPLATES, 'job.html'), 'utf-8')
  return render(template, {
    title: escapeHtml(`${job.title} | ${SITE_NAME}`),
    description: escapeHtml(toDescription(job.body)),
    url: `${SITE_URL}${jobUrl(job)}`,
    robots: preview ? PREVIEW_ROBOTS : '',
    previewBanner: preview ? PREVIEW_BANNER : '',
    jobTitle: escapeHtml(job.title),
    image: picture(CATEGORY_PHOTOS[category]),
    category: CATEGORY_LABELS[category],
    categorySlug: category,
    location: escapeHtml(job.location[0]),
    employmentType: escapeHtml(job.employmentType[0]),
    salary: escapeHtml(job.salary),
    publishedAt: formatDate(job.publishedAt),
    // CMS のリッチエディタの HTML をそのまま入れる
    body: job.body,
    requirements: escapeHtml(job.requirements),
  })
}

// プレビューできる求人がないときのページ（求人一覧のひな形を使う）
export const renderPreviewNotFound = async () => {
  const template = await readFile(join(TEMPLATES, 'jobs.html'), 'utf-8')
  return render(template, {
    title: `プレビューできる求人が見つかりません | ${SITE_NAME}`,
    description: 'プレビューできる求人が見つかりません。',
    robots: PREVIEW_ROBOTS,
    heading: 'プレビューできる求人が見つかりません',
    categoryNav: '',
    content:
      '<p class="empty-state">プレビューの URL が正しいか、CMS の画面から開き直してください。</p>',
  })
}
