# デザインと HTML の約束

このディレクトリの見本 HTML と共通 CSS が、サイトのデザインになる。3構成は `styles.css` と `menu.js` をそのまま使い、このページに書いたクラス名と構造に合わせて HTML を出す。見本はブラウザで直接開ける（リンク先は見本のファイル名にしてある。実際のパスは `spec/requirements.md` のページ一覧に従う）。

| 見本 | ひな形 | 実際のページ |
|---|---|---|
| `index.html` | トップ | `/` |
| `about.html`、`workplace.html`、`process.html` | 文章ページ | `/about/`、`/workplace/`、`/process/` |
| `jobs.html`、`jobs-empty.html` | 求人一覧（0件のとき） | `/jobs/` ほか |
| `job.html` | 求人詳細 | `/jobs/{id}/` ほか |
| `preview.html` | 求人詳細（プレビュー） | `/jobs/preview/` |
| `404.html` | 404 | 存在しないパス |

写真は `placeholder.svg` で仮置きしている。#4（素材）で差し替える。写真の枠は、ヒーロー1、トップの組み写真3、職種カテゴリ3、社員の声3、研究棟5、文章ページの帯2、選考の流れ1、求人詳細1（カテゴリごとに3）の、合わせて20枚前後。

## 見た目の決めごと

- 色は湯気の白（`--steam`）を地にし、熱い側の杉の茶色（`--cedar`）と、冷たい側の水風呂の青（`--cold`）を差し色にする。茶色は応募ボタンとサウナ室の温度、青はリンクと水風呂の温度に使う
- 見出しは明朝、本文はゴシック。どちらも OS に入っているフォントを使い、Web フォントは読み込まない。構成ごとのフォント最適化の差が性能の比較に混ざらないようにするため
- 目立たせるのはトップの「温度で見るロウリュ研究所」の目盛りだけにして、ほかは控えめにする
- 写真を多く使う。トップは大1枚と小2枚の組み写真、職種カテゴリの写真、社員の声の顔写真で、文章ページは幅いっぱいの写真の帯で、雰囲気を伝える

## 全ページ共通

### `<head>`

```html
<script>
  document.documentElement.classList.add('js')
</script>
<link rel="stylesheet" href="styles.css" />
<script src="menu.js" defer></script>
```

`<html>` に `js` クラスを付ける処理は、`<head>` のインラインスクリプトで行う。`menu.js` の中で付けると、スマホで一度開いたメニューが閉じ直して、表示がずれる（CLS）。

### ヘッダー

```html
<a class="skip-link" href="#main">本文へ移動</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__logo" href="/">株式会社ロウリュ研究所<small>採用サイト</small></a>
    <a class="button button--small site-header__apply" href="/process/">応募する</a>
    <button class="site-nav__toggle" type="button" aria-expanded="false" aria-controls="site-nav">メニュー</button>
    <nav class="site-nav" id="site-nav" data-open="false" aria-label="サイト内">
      <ul class="site-nav__list">
        <li><a class="site-nav__link" href="/about/">私たちについて</a></li>
        <!-- 今いるページのリンクに aria-current="page" -->
      </ul>
    </nav>
  </div>
</header>
```

- 要素の順番は「ロゴ、応募ボタン、メニューボタン、ナビゲーション」に固定する。並び替えは CSS の `order` で行っている
- メニューボタンは JS が動くときだけ表示される。JS がないときはメニューが開いたまま出る

### フッター

`footer.site-footer` > `div.container` の中に、`p.site-footer__tagline`、`ul.site-footer__nav`、`p.site-footer__note` を順に置く。

### 本文の入れ物

`<main id="main">` の中に各ひな形の中身を置く。横幅は `.container` でそろえる。

### 応募の案内

各ページの末尾（求人詳細と 404 を除く）に置く。

```html
<section class="container">
  <div class="apply-cta">
    <p class="apply-cta__text">…</p>
    <a class="button" href="/process/">応募する</a>
  </div>
</section>
```

## ひな形ごとの部品

| 部品 | クラス | 使う場所 |
|---|---|---|
| ヒーロー | `section.hero` > `img.hero__image` と `div.hero__body` > `div.container` > `h1.hero__title`、`p.hero__lead`、`a.button` | トップ |
| 節 | `section.section` > `h2.section__title` と `div.section__body` | トップ、文章ページ |
| 温度の目盛り | `div.thermo` > `div.thermo__scale`（`aria-hidden`）と `dl.thermo__list` | トップ |
| 組み写真 | `div.photo-mosaic` > `figure.photo-mosaic__main` と `figure.photo-mosaic__sub` ×2 > `img.photo-mosaic__image`、`figcaption` | トップ |
| 職種カテゴリの紹介 | `ul.category-cards` > `li.category-cards__item` > `img.category-cards__image` と `div.category-cards__body` > `h3.category-cards__title` > `a`、`p.category-cards__text` | トップ |
| 写真の帯 | `img.photo-band` | 私たちについて、働く環境 |
| 本文の写真 | `img.prose-image` | 選考の流れ |
| 研究棟の一覧 | `ul.lab-list` > `li.lab-list__item` > `img.lab-list__image`、`h3.lab-list__name`、`p.lab-list__text` | 私たちについて |
| ページの見出し | `header.page-head` > `h1.page-head__title`、`p.page-head__lead` | 文章ページ、求人一覧 |
| 選考のステップ | `ol.step-list` > `li.step-list__item` > `h3.step-list__title`、`p` | 選考の流れ |
| 社員の声 | `ul.voice-list` > `li.voice-list__item` > `img.voice-list__photo`、`p.voice-list__quote`、`p.voice-list__person` | トップ、働く環境 |
| よくある質問 | `dl.faq` | 選考の流れ |
| 職種カテゴリの切り替え | `nav.category-nav#category-nav` > `ul.category-nav__list` > `a.category-nav__link` | 求人一覧（仕様変更から） |
| 件数 | `p.job-count` | 求人一覧 |
| 求人のリスト | `ul.job-list` > `li.job-list__item` > `h3.job-list__title`、`dl.job-list__meta`、`p.job-list__date` | トップの新着、求人一覧 |
| 0件の表示 | `p.empty-state` | トップの新着、求人一覧 |
| ページ送り | `nav.pagination` > `ul.pagination__list` > `a.pagination__link` | 求人一覧 |
| パンくず | `nav.breadcrumb` > `ol.breadcrumb__list` > `li.breadcrumb__item` | 求人詳細 |
| 求人詳細 | `article.job-detail` > `h1.job-detail__title`、`img.job-detail__image`（職種カテゴリの写真）、`dl.job-summary`、`section.job-detail__section` | 求人詳細 |
| 仕事内容 | `div.rich-text`（CMS のリッチエディタの HTML をそのまま入れる） | 求人詳細 |
| プレビューの帯 | `p.preview-banner` > `span.container` | プレビュー |
| 職種カテゴリの札 | `span.category-tag` | 求人のリスト、求人詳細 |

- 今いるカテゴリ、今いるページ番号には `aria-current="page"` を付ける。見た目もこの属性で切り替わる
- 求人のタイトル（`.job-list__title`）の見出しレベルは、置く場所に合わせる。トップの新着（`h2` の節の中）では `h3`、求人一覧（ページの `h1` の直下）では `h2`
- 日付は `<time datetime="2026-11-08">2026年11月8日</time>` の形にする。表示用の文字列は `Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' })` で作る
- 写真はすべて `width` と `height` を付ける。ヒーロー画像以外は `loading="lazy"` にする（求人詳細の写真は1画面目に入るので付けない）
- 求人のリストの `dl.job-list__meta` の `dt` は画面には出さず、読み上げ用に残す
- ヒーロー画像は Phase 1 で `<picture>` に入れてよい。CSS は `img.hero__image` に当たる
