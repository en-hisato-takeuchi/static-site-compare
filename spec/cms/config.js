// 疑似 CMS の接続先。3構成のビルドと E2E はここの値を使う。
// API キーはダミーの値。本物の microCMS のキーはリポジトリに置かない。
export const MOCK_CMS = {
  port: 4100,
  endpoint: 'http://127.0.0.1:4100/api/v1',
  apiKey: 'dummy-api-key',
  // 1リクエストごとに待たせる時間。ネットワークの遅さを3構成で同じにする
  latencyMs: 50,
}
