import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PreviewClient } from './PreviewClient'

// CMS の「プレビュー」から開く、公開前の求人原稿。ページ自体は静的に書き出し、下書きはブラウザが取る
export const metadata: Metadata = {
  title: 'プレビュー',
  description: 'CMS の下書きの求人をプレビューするページです。',
  robots: 'noindex',
}

export default function Preview() {
  // useSearchParams を使う Client Component は、静的な書き出しのとき Suspense で包む必要がある
  return (
    <Suspense>
      <PreviewClient />
    </Suspense>
  )
}
