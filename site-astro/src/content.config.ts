// 求人は CMS からビルド時に取り込み、コンテンツコレクションとして扱う
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

const API_LIMIT = 100

type ListResponse = { contents: { id: string }[]; totalCount: number }

const jobs = defineCollection({
  loader: async () => {
    const endpoint = import.meta.env.MICROCMS_API_ENDPOINT
    const apiKey = import.meta.env.MICROCMS_API_KEY
    if (!endpoint || !apiKey) {
      throw new Error(
        'MICROCMS_API_ENDPOINT と MICROCMS_API_KEY を .env に書いてください',
      )
    }
    const contents: ListResponse['contents'] = []
    for (let offset = 0; ; offset += API_LIMIT) {
      const url = `${endpoint}/jobs?limit=${API_LIMIT}&offset=${offset}`
      const response = await fetch(url, {
        headers: { 'X-MICROCMS-API-KEY': apiKey },
      })
      if (!response.ok)
        throw new Error(`求人の取得に失敗しました（${response.status} ${url}）`)
      const data: ListResponse = await response.json()
      contents.push(...data.contents)
      if (contents.length >= data.totalCount) return contents
    }
  },
  schema: z.object({
    title: z.string(),
    category: z.array(z.enum(['store', 'facility', 'office'])),
    location: z.array(z.string()),
    employmentType: z.array(z.string()),
    salary: z.string(),
    body: z.string(),
    requirements: z.string(),
    publishedAt: z.coerce.date(),
  }),
})

export const collections = { jobs }
