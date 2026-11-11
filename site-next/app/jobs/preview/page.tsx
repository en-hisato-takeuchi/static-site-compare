import type { Metadata } from 'next'
import { JobDetail } from '../../components/JobDetail'
import { getDraft } from '../../lib/cms'
import { toDescription } from '../../lib/jobs'

// CMS の「プレビュー」から開く、公開前の求人原稿。このページだけ、リクエストのたびにサーバーで組み立てる。
// searchParams を読むので、Next.js は自動でこのページを動的にする
type SearchParams = Promise<{ id?: string; draftKey?: string }>

const NOT_FOUND_TITLE = 'プレビューできる求人が見つかりません'

const loadDraft = async (searchParams: SearchParams) => {
  const { id, draftKey } = await searchParams
  return id && draftKey ? getDraft(id, draftKey) : null
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const job = await loadDraft(searchParams)
  return {
    robots: 'noindex',
    ...(job
      ? { title: job.title, description: toDescription(job.body) }
      : { title: NOT_FOUND_TITLE, description: `${NOT_FOUND_TITLE}。` }),
  }
}

export default async function Preview({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const job = await loadDraft(searchParams)
  if (!job) {
    return (
      <div className="container">
        <h1>{NOT_FOUND_TITLE}</h1>
        <p className="empty-state">
          プレビューの URL が正しいか、CMS の画面から開き直してください。
        </p>
      </div>
    )
  }
  return (
    <>
      <p className="preview-banner">
        プレビュー中：この求人はまだ公開されていません
      </p>
      <JobDetail job={job} />
    </>
  )
}
