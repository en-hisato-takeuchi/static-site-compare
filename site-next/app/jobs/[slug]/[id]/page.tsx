import type { Metadata } from 'next'
import { JobDetail } from '../../../components/JobDetail'
import { getAllJobKeys, getJob } from '../../../lib/cms'
import { notFound } from 'next/navigation'
import { PLACEHOLDER_PARAM, jobUrl, toDescription } from '../../../lib/jobs'

// Next.js では、同じ階層の動的なセグメントに別の名前を付けられない。
// /jobs/{category}/ と旧 URL の /jobs/{id}/ が同じ [slug] を使うので、ここでも slug が職種カテゴリになる
type Params = { slug: string; id: string }

const SITE_NAME = '株式会社ロウリュ研究所 採用サイト'

// ビルドで作ったページ以外は 404 にする
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  const keys = await getAllJobKeys()
  return keys.length > 0
    ? keys.map((job) => ({ slug: job.category[0], id: job.id }))
    : [{ slug: PLACEHOLDER_PARAM, id: PLACEHOLDER_PARAM }]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { id } = await params
  if (id === PLACEHOLDER_PARAM) return {}
  const job = await getJob(id)
  const description = toDescription(job.body)
  return {
    title: job.title,
    description,
    openGraph: {
      title: `${job.title} | ${SITE_NAME}`,
      description,
      url: jobUrl(job),
      type: 'article',
    },
  }
}

export default async function JobPage({ params }: { params: Promise<Params> }) {
  const { id } = await params
  if (id === PLACEHOLDER_PARAM) notFound()
  return <JobDetail job={await getJob(id)} />
}
