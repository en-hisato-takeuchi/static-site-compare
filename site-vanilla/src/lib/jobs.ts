// build.js にあった、求人まわりの決めごと
import { getCollection } from 'astro:content'

export const SITE_NAME = '株式会社ロウリュ研究所 採用サイト'
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

export const toDescription = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)

const TIME_ZONE = 'Asia/Tokyo'
export const formatDate = (date: Date) => ({
  label: new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'long',
    timeZone: TIME_ZONE,
  }).format(date),
  // sv-SE の書式は YYYY-MM-DD になる
  datetime: new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(
    date,
  ),
})
