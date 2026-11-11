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

export const getJobs = (limit: number, offset = 0) =>
  request<ListResponse<Job>>(`/jobs?limit=${limit}&offset=${offset}`)

export const getJob = (id: string) => request<Job>(`/jobs/${id}`)

export const getAllJobIds = async () => {
  const ids: string[] = []
  for (let offset = 0; ; offset += API_LIMIT) {
    const { contents, totalCount } = await request<
      ListResponse<Pick<Job, 'id'>>
    >(`/jobs?limit=${API_LIMIT}&offset=${offset}&fields=id`)
    ids.push(...contents.map(({ id }) => id))
    if (ids.length >= totalCount) return ids
  }
}
