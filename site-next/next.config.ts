import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  // /about/ を about/index.html に書き出し、ほかの2構成と URL の形をそろえる
  trailingSlash: true,
}

export default nextConfig
