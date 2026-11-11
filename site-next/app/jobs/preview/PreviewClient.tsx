'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { JobDetail, type JobContent } from '../../components/JobDetail'

// ブラウザに置くキーは GET 権限だけのもの（サーバー用のキーではない）
const endpoint = process.env.NEXT_PUBLIC_MICROCMS_BROWSER_API_ENDPOINT
const apiKey = process.env.NEXT_PUBLIC_MICROCMS_BROWSER_API_KEY ?? ''

const NOT_FOUND_TITLE = 'プレビューできる求人が見つかりません'

type State = { status: 'loading' } | { status: 'done'; job: JobContent | null }

const fetchDraft = async (id: string, draftKey: string) => {
  const response = await fetch(
    `${endpoint}/jobs/${encodeURIComponent(id)}?draftKey=${encodeURIComponent(draftKey)}`,
    { headers: { 'X-MICROCMS-API-KEY': apiKey } },
  )
  if (response.status === 404) return null
  if (!response.ok) {
    throw new Error(`下書きの取得に失敗しました（${response.status}）`)
  }
  const draft: JobContent = await response.json()
  return draft
}

// 下書きを、ブラウザが CMS から取って組み立てる。本文は公開用のページと同じ JobDetail を使う
export function PreviewClient() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const draftKey = searchParams.get('draftKey')
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    const load =
      id && draftKey ? fetchDraft(id, draftKey) : Promise.resolve(null)
    load.catch(() => null).then((job) => setState({ status: 'done', job }))
  }, [id, draftKey])

  if (state.status === 'loading') {
    return (
      <div className="container">
        <p className="empty-state">下書きを読み込んでいます。</p>
      </div>
    )
  }
  if (!state.job) {
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
      <JobDetail job={state.job} />
    </>
  )
}
