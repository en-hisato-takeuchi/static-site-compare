// /jobs/{slug}/ は2つの役目を持つ。
// - slug が職種カテゴリ：その職種の求人一覧の1ページ目
// - slug が求人の ID：旧 URL。新 URL（/jobs/{category}/{id}/）へ転送する。対応は CMS のデータから作る
// Next.js では同じ階層に [category] と [id] を並べられないので、1つのページで分ける
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { JobListPage } from '../../components/JobListPage'
import { getAllJobKeys, getJob } from '../../lib/cms'
import { CATEGORIES, CATEGORY_LABELS, isCategory, jobUrl } from '../../lib/jobs'

type Params = { slug: string }

// ビルドで作ったページ以外は 404 にする
export const dynamicParams = false

export async function generateStaticParams(): Promise<Params[]> {
  const keys = await getAllJobKeys()
  return [
    ...CATEGORIES.map((slug) => ({ slug })),
    ...keys.map(({ id }) => ({ slug: id })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  if (!isCategory(slug)) return { robots: { index: false } }
  return {
    title: `${CATEGORY_LABELS[slug]}の求人`,
    description: `${CATEGORY_LABELS[slug]}の、ロウリュ研究所で募集している職種の一覧です。`,
  }
}

export default async function JobsBySlug({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  if (isCategory(slug)) return <JobListPage page={1} category={slug} />
  // static export では 301 を返せない。redirect() は meta refresh で転送する HTML になる
  redirect(jobUrl(await getJob(slug)))
}
