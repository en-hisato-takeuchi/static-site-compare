import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 静的な書き出し（output: 'export'）をやめた。プレビューのページだけ、リクエストのたびにサーバーで組み立てる
  // /about/ を about/index.html に書き出し、ほかの2構成と URL の形をそろえる
  trailingSlash: true,
  // 画像はビルドで変換しない。tools/convert-images.js で変換したものを public/images に置いている
  images: { unoptimized: true },
}

export default nextConfig
