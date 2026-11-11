// 疑似 CMS の接続先。3構成のビルドと E2E はここの値を使う。
// API キーはダミーの値。本物の microCMS のキーはリポジトリに置かない。
export const MOCK_CMS = {
  port: 4100,
  endpoint: 'http://127.0.0.1:4100/api/v1',
  apiKey: 'dummy-api-key',
  // ブラウザに置く GET 権限だけのキー（CSR 版のプレビュー用）。書き込みと、下書きの一覧取得は拒否される
  browserApiKey: 'dummy-browser-api-key',
  // 1リクエストごとに待たせる時間。ネットワークの遅さを3構成で同じにする
  latencyMs: 50,
}

// 公開前の求人（spec/cms/drafts.json）を返すための値。プレビューの URL に付ける
export const DRAFT_PREVIEW = {
  id: 'dr4ftsample',
  draftKey: 'dummy-draft-key',
}

// ビルドに渡す、ブラウザに置く値（GET 権限だけのキーと、疑似 CMS の接続先）。公開してよい値。
// 構成ごとの「ブラウザに出す環境変数」の名前で渡す（Vanilla は接頭辞なし）
export const BROWSER_ENV = Object.fromEntries(
  ['', 'PUBLIC_', 'NEXT_PUBLIC_'].flatMap((prefix) => [
    [`${prefix}MICROCMS_BROWSER_API_ENDPOINT`, MOCK_CMS.endpoint],
    [`${prefix}MICROCMS_BROWSER_API_KEY`, MOCK_CMS.browserApiKey],
  ]),
)
