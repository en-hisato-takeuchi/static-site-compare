import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '../../spec/design/styles.css'
import { Footer } from './components/Footer'
import { Header } from './components/Header'

const SITE_NAME = '株式会社ロウリュ研究所 採用サイト'

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // <head> のスクリプトが js クラスを足すので、<html> の属性の食い違いは警告しない
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
      </head>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
