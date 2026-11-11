import { type CollectionEntry, getCollection } from 'astro:content'

export const PER_PAGE = 10

export const CATEGORY_LABELS = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
} as const

// 新しい順に並べる
export const getJobs = async () =>
  (await getCollection('jobs')).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  )

export type Category = keyof typeof CATEGORY_LABELS

// 求人詳細に出す項目。公開済みの求人（コンテンツコレクション）も、プレビューの下書きも、この形にそろえる
export interface JobContent {
  title: string
  category: Category[]
  location: string[]
  employmentType: string[]
  salary: string
  body: string
  requirements: string
  publishedAt: Date
}

export const jobUrl = (job: CollectionEntry<'jobs'>) =>
  `/jobs/${job.data.category[0]}/${job.id}/`

// category を渡さないときは、すべての職種の一覧
export const listUrl = (category?: Category) =>
  category ? `/jobs/${category}/` : '/jobs/'

export const pageUrl = (page: number, category?: Category) =>
  page === 1 ? listUrl(category) : `${listUrl(category)}page/${page}/`

const DESCRIPTION_LENGTH = 120

// 仕事内容の HTML から、先頭の文字だけを取り出して description にする
export const toDescription = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)
