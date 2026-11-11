import type { JobContent } from './jobs'

// CMS から下書きの求人を取る。id か draftKey が合わないとき（CMS が 404 を返すとき）は null。
// API キーはサーバーの環境変数にだけ置き、ブラウザには出さない
export const fetchDraft = async (
  id: string,
  draftKey: string,
): Promise<JobContent | null> => {
  const endpoint = import.meta.env.MICROCMS_API_ENDPOINT
  const apiKey = import.meta.env.MICROCMS_API_KEY
  const url = `${endpoint}/jobs/${encodeURIComponent(id)}?draftKey=${encodeURIComponent(draftKey)}`
  const response = await fetch(url, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  })
  if (response.status === 404) return null
  if (!response.ok)
    throw new Error(`下書きの取得に失敗しました（${response.status}）`)
  const draft: Omit<JobContent, 'publishedAt'> & { publishedAt: string } =
    await response.json()
  return { ...draft, publishedAt: new Date(draft.publishedAt) }
}
