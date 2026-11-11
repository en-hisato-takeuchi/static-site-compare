# static-site-compare

Vanilla・Astro・Next.js で同じ採用サイトを作り比べるデモ。仕様と素材は [`spec/`](spec/README.md) にある。

| ディレクトリ | 中身 |
|---|---|
| `spec/` | 要件書、画面設計、見本の HTML と CSS、素材、疑似 CMS |
| `site-vanilla/` | フレームワークなし（`public/` をそのまま配る） |
| `site-astro/` | Astro（`.astro` だけ、静的出力） |
| `site-next/` | Next.js（App Router、`output: 'export'`） |
| `tools/` | 3構成に共通の静的サーバーと、計測スクリプト |
| `e2e/` | 3構成に共通の E2E（Playwright） |

## 使い方

Node.js 24 以上と pnpm 10 を使う。

```bash
pnpm install
pnpm generate:jobs --count 10   # 求人のダミーデータを作る（0 / 10 / 100 / 500）
pnpm cms                        # 疑似 CMS を http://127.0.0.1:4100 で起動する
pnpm build                      # Astro と Next.js をビルドする（Vanilla はビルドなし）
pnpm serve astro                # ビルド結果を配る（vanilla は 4001、astro は 4002、next は 4003）
```

## 確かめる・測る

どれも3構成のビルド結果を `tools/serve.js` で配り、同じ条件で動かす。構成の名前を付けると、その構成だけを対象にする。

```bash
pnpm e2e                    # E2E。STACKS=astro pnpm e2e で絞れる
pnpm measure:lighthouse     # Lighthouse（モバイル設定、各ページ5回の中央値）
pnpm measure:size           # 出力ファイルの大きさ（種類ごと、圧縮後）
pnpm measure:build          # ビルド時間（初回とキャッシュあり、5回ずつの中央値）
```

結果は表で表示し、JSON を `reports/` に残す。Lighthouse は PC に入っている Chrome を使う。

疑似 CMS は microCMS と同じ形（`contents` / `totalCount` / `offset` / `limit`）で返し、1リクエストごとに50ms待たせる。API キーは `spec/cms/config.js` のダミーの値で、ヘッダーがないリクエストは 401 で拒否する。
