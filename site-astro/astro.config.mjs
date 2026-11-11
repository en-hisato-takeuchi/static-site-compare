import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

export default defineConfig({
  // 公開先はまだないので仮の値。OGP の og:url に使う
  site: 'https://example.com',
  // 静的な出力のまま、プレビューのページだけをサーバーで動かす（dist/client が静的なファイル、dist/server がプレビュー）
  adapter: node({ mode: 'middleware' }),
})
