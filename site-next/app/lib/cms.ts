// 疑似 CMS（microCMS と同じ形）から求人を取る。各ページが、自分に要る分だけを取りに行く
export type Category = 'store' | 'facility' | 'office'

export type Job = {
  id: string
  title: string
  category: [Category]
  location: [string]
  employmentType: [string]
  salary: string
  body: string
  requirements: string
  publishedAt: string
}

type ListResponse<T> = {
  contents: T[]
  totalCount: number
  offset: number
  limit: number
}

const API_LIMIT = 100

const request = async <T>(path: string): Promise<T> => {
  const endpoint = process.env.MICROCMS_API_ENDPOINT
  const apiKey = process.env.MICROCMS_API_KEY
  if (!endpoint || !apiKey) {
    throw new Error(
      'MICROCMS_API_ENDPOINT と MICROCMS_API_KEY を .env に書いてください',
    )
  }
  const response = await fetch(`${endpoint}${path}`, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
  })
  if (!response.ok) {
    throw new Error(`求人の取得に失敗しました（${response.status} ${path}）`)
  }
  return response.json()
}

// category を渡すと、その職種カテゴリの求人だけを取る
export const getJobs = (limit: number, offset = 0, category?: Category) =>
  request<ListResponse<Job>>(
    `/jobs?limit=${limit}&offset=${offset}${category ? `&filters=category[contains]${category}` : ''}`,
  )

export const getJob = (id: string) => request<Job>(`/jobs/${id}`)

// 新しい URL（/jobs/{category}/{id}/）を作るのに要る、ID と職種カテゴリだけを全件取る
export const getAllJobKeys = async () => {
  const keys: Pick<Job, 'id' | 'category'>[] = []
  for (let offset = 0; ; offset += API_LIMIT) {
    const { contents, totalCount } = await request<
      ListResponse<Pick<Job, 'id' | 'category'>>
    >(`/jobs?limit=${API_LIMIT}&offset=${offset}&fields=id,category`)
    keys.push(...contents)
    if (keys.length >= totalCount) return keys
  }
}

// CMS から下書きの求人を取る。id か draftKey が合わないとき（CMS が 404 を返すとき）は null。
// プレビューは毎回取り直す。API キーはサーバーの環境変数にだけ置き、ブラウザには出さない
export const getDraft = async (id: string, draftKey: string) => {
  const endpoint = process.env.MICROCMS_API_ENDPOINT
  const apiKey = process.env.MICROCMS_API_KEY
  if (!endpoint || !apiKey) {
    throw new Error(
      'MICROCMS_API_ENDPOINT と MICROCMS_API_KEY を .env に書いてください',
    )
  }
  const response = await fetch(
    `${endpoint}/jobs/${encodeURIComponent(id)}?draftKey=${encodeURIComponent(draftKey)}`,
    { headers: { 'X-MICROCMS-API-KEY': apiKey }, cache: 'no-store' },
  )
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`下書きの取得に失敗しました（${response.status}）`)
  }
  const draft: Job = await response.json()
  return draft
}
