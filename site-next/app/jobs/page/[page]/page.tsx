// 求人一覧の2ページ目以降。1ページ目は /jobs/
import type { Metadata } from 'next'
import { JobListPage } from '../../../components/JobListPage'
import { getJobs } from '../../../lib/cms'
import { notFound } from 'next/navigation'
import { PER_PAGE, PLACEHOLDER_PARAM } from '../../../lib/jobs'

type Params = { page: string }

// ビルドで作ったページ以外は 404 にする
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  const { totalCount } = await getJobs(0)
  const lastPage = Math.ceil(totalCount / PER_PAGE)
  const params = Array.from({ length: Math.max(0, lastPage - 1) }, (_, i) => ({
    page: String(i + 2),
  }))
  return params.length > 0 ? params : [{ page: PLACEHOLDER_PARAM }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { page } = await params
  return {
    title: `求人一覧（${page}ページ目）`,
    description: `ロウリュ研究所で募集している職種の一覧です（${page}ページ目）。`,
  }
}

export default async function JobsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { page } = await params
  if (page === PLACEHOLDER_PARAM) notFound()
  return <JobListPage page={Number(page)} />
}
