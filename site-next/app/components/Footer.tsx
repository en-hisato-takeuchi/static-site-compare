import { NAV } from '../nav'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <p className="site-footer__tagline">
          今日も、どこかの研究棟で誰かがととのっている。
        </p>
        <ul className="site-footer__nav">
          {NAV.map(({ href, label }) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <p className="site-footer__note">
          このサイトは架空の会社の採用サイトです。実在の会社・施設・人物とは関係ありません。
          <br />
          <a href="https://github.com/en-hisato-takeuchi/static-site-compare/blob/main/spec/README.md">
            写真のクレジット（GitHub）
          </a>
          <br />© 株式会社ロウリュ研究所
        </p>
      </div>
    </footer>
  )
}
