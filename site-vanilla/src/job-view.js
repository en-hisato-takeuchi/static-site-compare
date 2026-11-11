// 求人詳細の本文を組み立てる処理。ビルド（build.js）とブラウザ（preview.js、プレビュー）で共有する。
// ブラウザでも動くように、Node の機能は使わない。
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

// 求人詳細の <main> の中身（パンくずと本文）。CMS のリッチエディタの HTML（body）はそのまま入れる
export const renderJobContent = (job) => {
  const category = job.category[0]
  return `      <div class="container">
        <nav class="breadcrumb" aria-label="パンくず">
          <ol class="breadcrumb__list">
            <li class="breadcrumb__item"><a href="/">トップ</a></li>
            <li class="breadcrumb__item"><a href="/jobs/">求人一覧</a></li>
            <li class="breadcrumb__item">
              <a href="/jobs/${category}/">${CATEGORY_LABELS[category]}</a>
            </li>
            <li class="breadcrumb__item" aria-current="page">${escapeHtml(job.title)}</li>
          </ol>
        </nav>
        <article class="job-detail">
          <h1 class="job-detail__title">${escapeHtml(job.title)}</h1>
          ${picture(CATEGORY_PHOTOS[category])}
          <dl class="job-summary">
            <dt>職種カテゴリ</dt>
            <dd><span class="category-tag">${CATEGORY_LABELS[category]}</span></dd>
            <dt>勤務地</dt>
            <dd>${escapeHtml(job.location[0])}</dd>
            <dt>雇用形態</dt>
            <dd>${escapeHtml(job.employmentType[0])}</dd>
            <dt>給与</dt>
            <dd>${escapeHtml(job.salary)}</dd>
            <dt>公開日</dt>
            <dd>${formatDate(job.publishedAt)}</dd>
          </dl>
          <section class="job-detail__section">
            <h2 class="job-detail__heading">仕事内容</h2>
            <div class="rich-text">${job.body}</div>
          </section>
          <section class="job-detail__section">
            <h2 class="job-detail__heading">応募の条件</h2>
            <div class="section__body">
              <p>${escapeHtml(job.requirements)}</p>
            </div>
          </section>
          <div class="job-detail__actions">
            <a class="button" href="/process/#visit">まずはサウナ見学から</a>
            <a href="/jobs/">求人一覧に戻る</a>
          </div>
        </article>
      </div>`
}
