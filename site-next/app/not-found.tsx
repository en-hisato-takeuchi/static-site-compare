import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  description: 'お探しのページは見つかりませんでした。',
}

export default function NotFound() {
  return (
    <div className="container not-found">
      <h1 className="not-found__title">
        このページは、ととのいすぎて消えてしまいました。
      </h1>
      <p>URL が間違っているか、募集が終わったページです。</p>
      <ul className="not-found__links">
        <li>
          <a href="/">トップに戻る</a>
        </li>
      </ul>
    </div>
  )
}
