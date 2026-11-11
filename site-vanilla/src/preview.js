// プレビューのページで、下書きの求人をブラウザが CMS から取って組み立てる。
// 組み立ては、ビルドと同じ job-view.js を使う。
// ここで使うキーは GET 権限だけのもの（サーバー用のキーではない）。
import { SITE_NAME, escapeHtml, renderJobContent } from './job-view.js'

const NOT_FOUND_TITLE = 'プレビューできる求人が見つかりません'

const root = document.getElementById('preview-root')
const { endpoint, apiKey } = root.dataset
const params = new URLSearchParams(location.search)
const id = params.get('id')
const draftKey = params.get('draftKey')

const fetchDraft = async () => {
  if (!id || !draftKey) return null
  const url = `${endpoint}/jobs/${encodeURIComponent(id)}?draftKey=${encodeURIComponent(draftKey)}`
  const response = await fetch(url, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  })
  if (response.status === 404) return null
  if (!response.ok)
    throw new Error(`下書きの取得に失敗しました（${response.status}）`)
  return response.json()
}

const draft = await fetchDraft().catch(() => null)
if (draft) {
  document.title = `${draft.title} | ${SITE_NAME}`
  root.innerHTML = `<p class="preview-banner">プレビュー中：この求人はまだ公開されていません</p>\n${renderJobContent(draft)}`
} else {
  document.title = `${NOT_FOUND_TITLE} | ${SITE_NAME}`
  root.innerHTML = `<div class="container"><h1>${escapeHtml(NOT_FOUND_TITLE)}</h1><p class="empty-state">プレビューの URL が正しいか、CMS の画面から開き直してください。</p></div>`
}
