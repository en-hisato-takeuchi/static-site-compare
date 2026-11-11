import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ページが見つかりません | 株式会社ロウリュ研究所 採用サイト',
  description: 'お探しのページは見つかりませんでした。',
}

export default function NotFound() {
  return (
    <main id="main">
      <h1>ページが見つかりません</h1>
    </main>
  )
}
