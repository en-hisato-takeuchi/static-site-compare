// 職種カテゴリ別の一覧の2ページ目以降。slug は職種カテゴリ
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JobListPage } from '../../../../components/JobListPage'
import { getJobs } from '../../../../lib/cms'
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PER_PAGE,
  PLACEHOLDER_PARAM,
  isCategory,
} from '../../../../lib/jobs'

type Params = { slug: string; page: string }

// ビルドで作ったページ以外は 404 にする
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  const params = (
    await Promise.all(
      CATEGORIES.map(async (slug) => {
        const { totalCount } = await getJobs(0, 0, slug)
        const lastPage = Math.ceil(totalCount / PER_PAGE)
        return Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) => ({
          slug,
          page: String(i + 2),
        }))
      }),
    )
  ).flat()
  return params.length > 0
    ? params
    : [{ slug: PLACEHOLDER_PARAM, page: PLACEHOLDER_PARAM }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug, page } = await params
  if (!isCategory(slug)) return {}
  return {
    title: `${CATEGORY_LABELS[slug]}の求人（${page}ページ目）`,
    description: `${CATEGORY_LABELS[slug]}の、ロウリュ研究所で募集している職種の一覧です（${page}ページ目）。`,
  }
}

export default async function JobsBySlugPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug, page } = await params
  if (!isCategory(slug)) notFound()
  return <JobListPage page={Number(page)} category={slug} />
}
