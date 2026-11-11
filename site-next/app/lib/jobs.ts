import type { Category } from './cms'

export const PER_PAGE = 10

export const CATEGORY_LABELS: Record<Category, string> = {
  store: '店舗スタッフ',
  facility: '施設管理',
  office: '本社',
}

export const pageUrl = (page: number) =>
  page === 1 ? '/jobs/' : `/jobs/page/${page}/`

// output: 'export' では generateStaticParams が空の配列を返すとビルドが止まる。
// 作るページがないときはこの仮の値を1つ返し、ページ側で notFound() にする
export const PLACEHOLDER_PARAM = '_'

const DESCRIPTION_LENGTH = 120

// 仕事内容の HTML から、先頭の文字だけを取り出して description にする
export const toDescription = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, DESCRIPTION_LENGTH)
