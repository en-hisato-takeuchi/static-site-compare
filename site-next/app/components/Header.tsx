import { SiteNav } from './SiteNav'

export function Header() {
  return (
    <>
      <a className="skip-link" href="#main">
        本文へ移動
      </a>
      <header className="site-header">
        <div className="container site-header__inner">
          <a className="site-header__logo" href="/">
            株式会社ロウリュ研究所
            <small>採用サイト</small>
          </a>
          <a
            className="button button--small site-header__apply"
            href="/process/"
          >
            応募する
          </a>
          <SiteNav />
        </div>
      </header>
    </>
  )
}
