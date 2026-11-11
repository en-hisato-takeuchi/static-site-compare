import { getCollection } from 'astro:content'

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

export const pageUrl = (page: number) =>
  page === 1 ? '/jobs/' : `/jobs/page/${page}/`

const DESCRIPTION_LENGTH = 120

// 仕事内容の HTML から、先頭の文字だけを取り出して description にする
export const toDescription = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)
