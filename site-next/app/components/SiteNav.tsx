'use client'

// スマホのメニューの開閉。開閉の状態を React で持つため、メニューボタンとナビゲーションをまとめて Client Component にする
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { NAV } from '../nav'

const withSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`)

export function SiteNav() {
  const [isOpen, setIsOpen] = useState(false)
  const current = withSlash(usePathname())

  return (
    <>
      <button
        className="site-nav__toggle"
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-nav"
        onClick={() => setIsOpen(!isOpen)}
      >
        メニュー
      </button>
      <nav
        className="site-nav"
        id="site-nav"
        data-open={String(isOpen)}
        aria-label="サイト内"
      >
        <ul className="site-nav__list">
          {NAV.map(({ href, label }) => (
            <li key={href}>
              <a
                className="site-nav__link"
                href={href}
                aria-current={href === current ? 'page' : undefined}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
