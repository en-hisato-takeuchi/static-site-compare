// プレビューで、ブラウザが求人詳細の本文を組み立てる処理。
// .astro のコンポーネントはブラウザで動かないので、[category]/[id].astro と同じ構造を、ここでもう一度書いている。
// 写真だけは、ビルドで最適化した <picture> を preview.astro が <template> に入れておき、それを使う。
export type JobContent = {
  title: string
  category: ('store' | 'facility' | 'office')[]
  location: string[]
  employmentType: string[]
  salary: string
  body: string
  requirements: string
  publishedAt: string
}

const CATEGORY_LABELS = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
}
const TIME_ZONE = 'Asia/Tokyo'

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        char
      ] ?? char,
  )

const formatDate = (iso: string) => {
  const date = new Date(iso)
  const label = new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: TIME_ZONE,
  }).format(date)
  const datetime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIME_ZONE,
  }).format(date)
  return `<time datetime="${datetime}">${label}</time>`
}

export const renderJobContent = (job: JobContent, photoHtml: string) => {
  const category = job.category[0]
  return `<div class="container">
  <nav class="breadcrumb" aria-label="パンくず">
    <ol class="breadcrumb__list">
      <li class="breadcrumb__item"><a href="/">トップ</a></li>
      <li class="breadcrumb__item"><a href="/jobs/">求人一覧</a></li>
      <li class="breadcrumb__item"><a href="/jobs/${category}/">${CATEGORY_LABELS[category]}</a></li>
      <li class="breadcrumb__item" aria-current="page">${escapeHtml(job.title)}</li>
    </ol>
  </nav>
  <article class="job-detail">
    <h1 class="job-detail__title">${escapeHtml(job.title)}</h1>
    ${photoHtml}
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
      <div class="section__body"><p>${escapeHtml(job.requirements)}</p></div>
    </section>
    <div class="job-detail__actions">
      <a class="button" href="/process/#visit">まずはサウナ見学から</a>
      <a href="/jobs/">求人一覧に戻る</a>
    </div>
  </article>
</div>`
}

export const renderNotFound = (title: string) =>
  `<div class="container"><h1>${escapeHtml(title)}</h1><p class="empty-state">プレビューの URL が正しいか、CMS の画面から開き直してください。</p></div>`
