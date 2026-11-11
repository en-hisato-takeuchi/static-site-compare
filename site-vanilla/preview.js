// プレビューのリクエストを処理する Node の関数。
// /jobs/preview/?id={CONTENT_ID}&draftKey={DRAFT_KEY} のたびに、CMS から下書きを取って HTML を返す。
// API キーはこのサーバーの環境変数にだけ置き、ブラウザには出さない。
import { renderJobDetail, renderPreviewNotFound } from './job-page.js'

export const PREVIEW_PATH = '/jobs/preview/'

process.loadEnvFile(new URL('./.env', import.meta.url))
const { MICROCMS_API_ENDPOINT, MICROCMS_API_KEY } = process.env

const fetchDraft = async (id, draftKey) => {
  const url = `${MICROCMS_API_ENDPOINT}/jobs/${encodeURIComponent(id)}?draftKey=${encodeURIComponent(draftKey)}`
  const response = await fetch(url, {
    headers: { 'X-MICROCMS-API-KEY': MICROCMS_API_KEY },
  })
  if (response.status === 404) return null
  if (!response.ok)
    throw new Error(`下書きの取得に失敗しました（${response.status}）`)
  return response.json()
}

export const handlePreview = async (req, res) => {
  const { searchParams } = new URL(req.url ?? '/', 'http://localhost')
  const id = searchParams.get('id')
  const draftKey = searchParams.get('draftKey')
  const draft = id && draftKey ? await fetchDraft(id, draftKey) : null
  const html = draft
    ? await renderJobDetail(draft, { preview: true })
    : await renderPreviewNotFound()
  res.writeHead(draft ? 200 : 404, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  res.end(html)
}
